
const config = require('../config');
require('babel-polyfill');
const mongoose = require('mongoose');
const { CarverAddressType, CarverMovementType, CarverTxType } = require('../lib/carver2d');
const { CarverAddress, CarverMovement } = require('../model/carver2d');
const { UTXO } = require('../model/utxo');

//@todo Move this file to lib/carver2d

/**
 * Is this a POS transaction?
 */
const isPosTx = (tx) => {

  return tx.vin.length === 1 &&
    tx.vin[0].txid !== undefined &&
    tx.vin[0].vout !== undefined &&
    tx.vout[0].value !== undefined &&
    tx.vout[0].value === 0 &&
    tx.vout[0].n === 0 &&
    tx.vout[0].scriptPubKey &&
    tx.vout[0].scriptPubKey.type === 'nonstandard';
}

const getVinUtxos = async (rpctx) => {
  const utxoLabels = [];

  for (let vinIndex = 0; vinIndex < rpctx.vin.length; vinIndex++) {
    const vin = rpctx.vin[vinIndex];

    if (vin.txid) {
      if (vin.vout === undefined) {
        console.log(vin);
        throw 'VIN TXID WITHOUT VOUT?';
      }

      const label = `${vin.txid}:${vin.vout}`;
      utxoLabels.push(label);
    }
  }


  const utxos = await UTXO.find({ label: { $in: utxoLabels } }, { label: 1, addressLabel: 1 });
  if (utxos.length !== utxoLabels.length) {
    throw 'UTXO count mismatch'
  }

  return utxos;
}


/**
 * Get or Initialize a new carver address
 * usedAddresses = Map<addressLabel,CarverAddressType>
 */
const fillAddressCache = async (params, usedAddresses) => {

  const isCarverAddressCached = (label) => {
    const commonAddressFromCache = params.commonAddressCache.get(label);
    if (commonAddressFromCache) {
      return commonAddressFromCache;
    }
    const normalAddressFromCache = params.normalAddressCache.get(label);
    if (normalAddressFromCache) {
      return normalAddressFromCache;
    }
    return null;
  }
  /*
    const getCarverAddressFromCache = async (label) => {
      const commonAddressFromCache = params.commonAddressCache.get(label);
      if (commonAddressFromCache) {
        return commonAddressFromCache;
      }
      const normalAddressFromCache = params.normalAddressCache.get(label);
      if (normalAddressFromCache) {
        return normalAddressFromCache;
      }
      return null;
    }*/

  const createCarverAddress = (carverAddressType, label) => {
    const blockDate = new Date(params.rpcblock.time * 1000);

    let newCarverAddress = new CarverAddress({
      _id: null, // Notice how the _id is null here. This is on purpose to identify which addresses are new (and will need to be inserted). 
      label,
      balance: 0,

      blockHeight: params.rpcblock.height,
      date: blockDate,
      carverAddressType,

      // for stats
      valueOut: 0,
      valueIn: 0,
      countIn: 0,
      countOut: 0,

      sequence: 0
    });

    switch (carverAddressType) {
      case CarverAddressType.Address:
        //@todo these will all be moved to address-specific rewards
        newCarverAddress.posCountIn = 0;
        newCarverAddress.posValueIn = 0;
        newCarverAddress.mnCountIn = 0;
        newCarverAddress.mnValueIn = 0;
        newCarverAddress.powCountIn = 0;
        newCarverAddress.powValueIn = 0;
        break;
    }

    return newCarverAddress;
  }

  const addAddressToCache = (carverAddress) => {

    switch (carverAddress.carverAddressType) {
      case CarverAddressType.Address:
        params.normalAddressCache.set(carverAddress.label, carverAddress);
        break;

      // We don't need to store txs in cache (as they're only used once per sync)
      case CarverAddressType.Tx:
      case CarverAddressType.RewardTx:
        break;
      default:
        params.commonAddressCache.set(carverAddress.label, carverAddress);
        break;
    }
  }

  // Figure out which addresses are already cached. If they are not cached we'll fetch them from db
  const addressesToFetch = new Set();
  usedAddresses.forEach((carverAddressType, label) => {
    if (!isCarverAddressCached(label)) {
      addressesToFetch.add(label);
    }
  });

  // Fetch uncached addresses from db
  const allAddressesToFetch = Array.from(addressesToFetch);
  const carverAddresses = await CarverAddress.find({ label: { $in: allAddressesToFetch } });

  // Find the cache with results (or make new addresses)
  allAddressesToFetch.forEach(label => {
    const carverAddress = carverAddresses.find(carverResult => carverResult.label === label);

    // Carver address was not in cache, add it to cache
    if (!carverAddress) {
      const carverAddressType = usedAddresses[label];
      const newCarverAddress = createCarverAddress(carverAddressType, label)

      addAddressToCache(newCarverAddress);
    }
  })
}


/**
 * Create address->tx movement for all inputs in a tx
 */
const getRequiredMovements = (params) => {


  const rpctx = params.rpctx;
  const vinUtxos = params.vinUtxos;

  let requiredMovements = [];

  var carverTxType = CarverTxType.BasicTx;
  var consolidatedAddressAmounts = new Map();

  const addToAddress = (addressLabel, addressType, amount) => {
    if (!consolidatedAddressAmounts.has(addressLabel)) {
      consolidatedAddressAmounts.set(addressLabel, 0);
    }
    const consolidatedAddressAmount = consolidatedAddressAmounts.get(addressLabel);
    consolidatedAddressAmounts.set(addressLabel, consolidatedAddressAmount + amount);
  }

  let newUtxos = [];
  let posAddressLabel = null; // This will be filled with the 

  for (let vinIndex = 0; vinIndex < rpctx.vin.length; vinIndex++) {
    const vin = rpctx.vin[vinIndex];

    if (vin.value) {
      throw 'VIN WITH VALUE?';
    }

    //const label = `${vinIndex}:${txid}`;

    if (vin.coinbase) {
      if (rpctx.vin.length != 1) {
        console.log(tx);
        throw "COINBASE WITH >1 VIN?";
      }

      // Identify that this is a POW or POW/MN tx
      carverTxType = CarverTxType.Coinbase;

      //requiredMovements.push({ movementType: CarverMovementType.CoinbaseToTx, label });

    } else if (vin.scriptSig && vin.scriptSig.asm == 'OP_ZEROCOINSPEND') {
      carverTxType = CarverTxType.ZerocoinSpend;
      //requiredMovements.push({ movementType: CarverMovementType.ZerocoinToTx, label });
    } else if (vin.txid) {
      if (vin.vout === undefined) {
        console.log(vin);
        throw 'VIN TXID WITHOUT VOUT?';
      }


      const utxoLabel = `${vin.txid}:${vin.vout}`;

      const vinUtxo = vinUtxos.find(vinUtxo => vinUtxo.label === utxoLabel);
      if (!vinUtxo) {
        throw `UTXO not found: ${utxoLabel}`;
      }
      if (isPosTx(rpctx)) {
        carverTxType = CarverTxType.ProofOfStake;
        posAddressLabel = vinUtxo.addressLabel;
        //  requiredMovements.push({ movementType: CarverMovementType.PosTxIdVoutToTx, label, txid: vin.txid, vout: vin.vout });
      }

      //addToAddress(vinUtxo.addressLabel, -vinUtxo.amount);

      /*else {
        const movementType = CarverMovementType.TxIdVoutToTx;
        requiredMovements.push({ movementType, label, txid: vin.txid, vout: vin.vout });
      }*/
    } else {
      console.log(vin);
      throw 'UNSUPPORTED VIN (NOT COINBASE OR TX)';
    }
  }


  for (let voutIndex = 0; voutIndex < rpctx.vout.length; voutIndex++) {
    const vout = rpctx.vout[voutIndex];
    //const label = `${rpctx.txid}:${vout.n}`; //use txid+vout as identifier for these transactions

    if (vout.scriptPubKey) {
      switch (vout.scriptPubKey.type) {
        case 'pubkey':
        case 'pubkeyhash':
        case 'scripthash':

          const addresses = vout.scriptPubKey.addresses;
          if (addresses.length !== 1) {
            throw 'ONLY PUBKEYS WITH 1 ADDRESS ARE SUPPORTED FOR NOW';
          }
          if (vout.value === undefined) {
            console.log(vout);
            console.log(tx);
            throw 'VOUT WITHOUT VALUE?';
          }

          /*let movementType = CarverMovementType.TxToAddress;

          if (isPosTx(rpctx)) {
            movementType = CarverMovementType.TxToPosOutputAddress;
          }
          if (rpctx.vin.length === 1 && rpctx.vin[0].coinbase) {
            movementType = voutIndex === 0 ? CarverMovementType.PowAddressReward : CarverMovementType.TxToMnAddress;
          }
          */

          const addressLabel = addresses[0];

          newUtxos.push(new UTXO({
            label: `${rpctx.txid}:${vout.n}`,
            blockHeight: params.rpcblock.height,
            amount: vout.value,
            addressLabel
          }));

          switch (carverTxType) {
            case CarverTxType.BasicTx:
              addToAddress(addressLabel, CarverAddressType.Address, vout.value);
              break;
            case CarverTxType.Coinbase:
              if (rpctx.vout.length > 2) {
                console.log(rpctx.vout);
                throw 'coinbase tx with >2 outputs?';
              }

              if (voutIndex === 0) {
                // Proof of Work Reward / Premine 
                //@todo right now premine will count as POW reward
                requiredMovements.push({ movementType: CarverMovementType.PowAddressReward, from: { addressLabel: `${addressLabel}:POW`, }, to: { addressLabel } });
              } else {
                // Masternode Reward / Governance 
                requiredMovements.push({ movementType: CarverMovementType.MasternodeReward, from: { addressLabel: `${addressLabel}:MN` }, to: { addressLabel } });
              }
              /*
              let sourceLabel = voutIndex === 0 ? 'POW' : 'MN';
              let sourceCarverAddressType = voutIndex === 0 ? CarverAddressType.ProofOfWork : CarverAddressType.Masternode;

              if (params.rpcblock.height === 1) {
                sourceLabel = 'PREMINE';
                sourceCarverAddressType = CarverAddressType.Premine;
              }

              addToAddress(sourceLabel, sourceCarverAddressType, -vout.value);
              addToAddress(addressLabel, vout.value);*/
              break;
            default:
              console.log(carverTxType)
              throw 'Unhandled carverTxType!';
            //               
            ///addToAddress(addressLabel, vout.value);
            // break;
          }

          //@todo reward breakout
          /*
          if (rpctx.vin.length === 1 && rpctx.vin[0].coinbase) {
            if (voutIndex === 0) {
              addToAddress('POW', -vout.value);
              addToAddress(addressLabel, vout.value);
            } else {
              addToAddress('MN', -vout.value);
            }
          } else if (isPosTx(rpctx)) {
            addToAddress('POW', -vout.value);
          } else {
            addToAddress(addressLabel, vout.value);
          }*/

          //requiredMovements.push({ movementType, label, amount: vout.value, addressLabel });
          break;
        case 'nonstandard':
          // Don't need to do any movements for this
          break;
        case 'zerocoinmint':
          {
            if (vout.value === undefined) {
              console.log(vout);
              console.log(tx);
              throw 'ZEROCOIN WITHOUT VALUE?';
            }
            addToAddress('ZEROCOIN', vout.value);

            //@todo

            //requiredMovements.push({ movementType: CarverMovementType.TxToZerocoin, label, amount: vout.value });
          }
          break
        case 'nulldata':
          {
            if (vout.value === undefined) {
              console.log(vout);
              console.log(tx);
              throw 'BURN WITHOUT VALUE?';
            }
            addToAddress('BURN', vout.value);

            //@todo
            // requiredMovements.push({ movementType: CarverMovementType.Burn, label, amount: vout.value });
          }
          break
        default:
          console.log(vout);
          console.log(tx);
          throw `UNSUPPORTED VOUT SCRIPTPUBKEY TYPE: ${vout.scriptPubKey.type}`;
      }
    } else {
      console.log(vout);
      throw `UNSUPPORTED VOUT!`;
    }
  }

  switch (carverTxType) {
    case CarverTxType.BasicTx:
      break;
  }

  const usedAddresses = Array.from(consolidatedAddressAmounts.keys());
  if (usedAddresses.length > 0) {
    console.log('addresses:', usedAddresses);
    console.log('utxos:', newUtxos);
    console.log('requiredMovements:', requiredMovements);
    throw 'xx'
  }

  /*
  
    const finalConsolidatedAddressAmounts = Array.from(consolidatedAddressAmounts);
  
    finalConsolidatedAddressAmounts.forEach((finalConsolidatedAddressAmount, index) => {
      const address = finalConsolidatedAddressAmount[0];
      const amount = finalConsolidatedAddressAmount[1];
  
      const label = `${index}:${rpctx.txid}`;
      switch (carverTxType) {
        case CarverTxType.BasicTx:
          requiredMovements.push({ movementType: finalConsolidatedAddressAmount < 0 ? CarverMovementType.AddressToTx : CarverMovementType.TxToAddress, label, amount: finalConsolidatedAddressAmount });
          break;
        case CarverTxType.Coinbase:
          requiredMovements.push({ movementType: index > 0 ? CarverMovementType.TxToMnAddress : CarverMovementType.PowAddressReward, label, amount: finalConsolidatedAddressAmount });
          break;
        case CarverTxType.ProofOfStake:
          break;
        case CarverTxType.ZerocoinSpend:
          break;
      }
    })
  
    console.log("test:", carverTxType, finalConsolidatedAddressAmounts, requiredMovements);
    throw 'yy';*/

  return requiredMovements;
}


const parseNewRequiredMovements = async (params, requiredMovements) => {

  // Find all addresses that are used in a movement. We'll want to fill the address cache with these addresses
  const usedAddresses = new Map();
  requiredMovements.forEach(requiredMovement => {
    switch (requiredMovement.movementType) {
      case CarverMovementType.PowAddressReward:
        usedAddresses.set(requiredMovement.from.addressLabel, CarverAddressType.ProofOfWork);
        usedAddresses.set(requiredMovement.to.addressLabel, CarverAddressType.Address);
        break;
    }
  });

  // Now that we know all used address, let's ensure they're in cache. We'll go through cache, find any addresses not in cache and then fill them from db.
  // If these adddresses do not exist in db create them and fill the cache with new entries. This ensures the addresses used in the movements are all ready to be fetched from cache.
  await fillAddressCache(params, usedAddresses);

  console.log('requiredMovements:', requiredMovements, allUsedAddresses);

  throw 'xx';
}

/**
 * Create tx->address movement for all outputs in a tx
 */
const getVoutRequiredMovements = (rpctx) => {
  const requiredMovements = [];
  return requiredMovements;

  for (let voutIndex = 0; voutIndex < rpctx.vout.length; voutIndex++) {
    const vout = rpctx.vout[voutIndex];

    const label = `${rpctx.txid}:${vout.n}`; //use txid+vout as identifier for these transactions

    if (vout.scriptPubKey) {
      switch (vout.scriptPubKey.type) {
        case 'pubkey':
        case 'pubkeyhash':
        case 'scripthash':
          const addresses = vout.scriptPubKey.addresses;
          if (addresses.length !== 1) {
            throw 'ONLY PUBKEYS WITH 1 ADDRESS ARE SUPPORTED FOR NOW';
          }
          if (vout.value === undefined) {
            console.log(vout);
            console.log(tx);
            throw 'VOUT WITHOUT VALUE?';
          }

          let movementType = CarverMovementType.TxToAddress;

          if (isPosTx(rpctx)) {
            movementType = CarverMovementType.TxToPosOutputAddress;
          }
          if (rpctx.vin.length === 1 && rpctx.vin[0].coinbase) {
            movementType = voutIndex === 0 ? CarverMovementType.PowAddressReward : CarverMovementType.TxToMnAddress;
          }

          const addressLabel = addresses[0];
          requiredMovements.push({ movementType, label, amount: vout.value, addressLabel });
          break;
        case 'nonstandard':
          // Don't need to do any movements for this
          break;
        case 'zerocoinmint':
          {
            if (vout.value === undefined) {
              console.log(vout);
              console.log(tx);
              throw 'ZEROCOIN WITHOUT VALUE?';
            }

            requiredMovements.push({ movementType: CarverMovementType.TxToZerocoin, label, amount: vout.value });
          }
          break
        case 'nulldata':
          {
            if (vout.value === undefined) {
              console.log(vout);
              console.log(tx);
              throw 'BURN WITHOUT VALUE?';
            }

            requiredMovements.push({ movementType: CarverMovementType.Burn, label, amount: vout.value });
          }
          break
        default:
          console.log(vout);
          console.log(tx);
          throw `UNSUPPORTED VOUT SCRIPTPUBKEY TYPE: ${vout.scriptPubKey.type}`;
      }
    } else {
      console.log(vout);
      throw `UNSUPPORTED VOUT!`;
    }
  }

  return requiredMovements;
}


const getVinVoutMovements = async (requiredMovements) => {
  const vinVoutMovements = new Map();

  const movementsToTx = requiredMovements.filter(requiredMovement =>
    requiredMovement.movementType == CarverMovementType.TxIdVoutToTx ||
    requiredMovement.movementType == CarverMovementType.PosTxIdVoutToTx);
  const vinVouts = movementsToTx.map(movementToTx => `${movementToTx.txid}:${movementToTx.vout}`);

  if (vinVouts.length > 0) {
    const vinMovements = await CarverMovement.find({ label: { $in: vinVouts } }).populate('to');
    vinMovements.forEach(vinMovements => {
      vinVoutMovements.set(vinMovements.label, vinMovements);
    })
  }

  return vinVoutMovements;
}

/**
 * Convert required movements into parsed movements
 */
async function parseRequiredMovements(params) {
  const blockDate = new Date(params.rpcblock.time * 1000);

  /**
   * Get or Initialize a new carver address
   */
  const getCarverAddressFromCache = async (carverAddressType, label) => {
    const commonAddressFromCache = params.commonAddressCache.get(label);
    if (commonAddressFromCache) {
      return commonAddressFromCache;
    }

    const existingCarverAddress = await CarverAddress.findOne({ label });
    if (existingCarverAddress) {
      params.commonAddressCache.set(label, existingCarverAddress);
      return existingCarverAddress;
    }
    let newCarverAddress = new CarverAddress({
      _id: new mongoose.Types.ObjectId(),
      label,
      balance: 0,

      blockHeight: params.rpcblock.height,
      date: blockDate,
      carverAddressType,

      // for stats
      valueOut: 0,
      valueIn: 0,
      countIn: 0,
      countOut: 0,

      sequence: 0
    });

    switch (carverAddressType) {
      case CarverAddressType.Address:
        //@todo these will all be moved to address-specific rewards
        newCarverAddress.posCountIn = 0;
        newCarverAddress.posValueIn = 0;
        newCarverAddress.mnCountIn = 0;
        newCarverAddress.mnValueIn = 0;
        newCarverAddress.powCountIn = 0;
        newCarverAddress.powValueIn = 0;
        break;
      case CarverAddressType.Tx:
        break;
      default:
        break;
    }
    if (carverAddressType != CarverAddressType.Tx) {
      params.commonAddressCache.set(label, existingCarverAddress);
    }

    return newCarverAddress;
  }

  /**
   * Gets all addresses used in required movements (these are vout addresses[0])
   */
  const getVoutAddresses = async (requiredMovements) => {
    const voutAddresses = new Map();

    const movementsWithAddress = requiredMovements.filter(requiredMovement =>
      requiredMovement.movementType == CarverMovementType.TxToAddress ||
      requiredMovement.movementType == CarverMovementType.TxToPosOutputAddress ||
      requiredMovement.movementType == CarverMovementType.PowAddressReward ||
      requiredMovement.movementType == CarverMovementType.TxToMnAddress);

    const addressLabels = Array.from(new Set(movementsWithAddress.map(movement => movement.addressLabel))); // Select distinct address labels
    const exisingAddresses = await CarverAddress.find({ label: { $in: addressLabels } });

    for (let i = 0; i < addressLabels.length; i++) {
      const addressLabel = addressLabels[i];

      // Try to find this address from existing ones (otherwise create if it's a new address)
      const existingAddress = exisingAddresses.find(exisingAddress => exisingAddress.label === addressLabel);
      if (existingAddress) {
        voutAddresses[addressLabel] = existingAddress;
      } else {
        voutAddresses[addressLabel] = await getCarverAddressFromCache(CarverAddressType.Address, addressLabel);
      }
    }

    return voutAddresses;
  }

  // Figure out what txid+vout we need to fetch 
  const vinVoutMovements = await getVinVoutMovements(params.requiredMovements);
  const voutAddresses = await getVoutAddresses(params.requiredMovements);


  const sumTxVoutAmount = params.rpctx.vout.map(vout => vout.value).reduce((prev, curr) => prev + curr, 0);

  const txAddress = await getCarverAddressFromCache(CarverAddressType.Tx, params.rpctx.txid);

  // We'll want to preserve order of vins followed by vouts so they'll be added to their own arrays and them merged together
  let newVinMovements = [];
  let newVoutMovements = [];

  let hasZerocoinInput = false;

  let totalInput = 0;
  let totalOutput = 0;
  let totalPosRewards = 0;
  let totalMnRewards = 0;
  let totalPowRewards = 0;
  let totalGovernanceRewards = 0;
  let vinVoutMovement = null; // We'll use this for POS & GOVERNANCE identification as well 
  let powRewardAddress = null;
  let posRewardAddress = null;
  let mnRewardAddress = null;

  for (let i = 0; i < params.requiredMovements.length; i++) {
    const requiredMovement = params.requiredMovements[i];

    const carverMovementType = requiredMovement.movementType;

    switch (carverMovementType) {
      // VIN -> TX
      case CarverMovementType.CoinbaseToTx:
        totalInput = sumTxVoutAmount;
        break;
      case CarverMovementType.ZerocoinToTx:
        // Zerocoin might have multiple inputs in the same tx (ex: tx "d1be21c38e922091e9b4c2c2250be6d4c0d0d801aa3baf984d0351fe4fb39534" on Bulwark Coin)
        if (!hasZerocoinInput) {
          const fromZerocoinAddress = await getCarverAddressFromCache(CarverAddressType.Zerocoin, 'ZEROCOIN');
          newVinMovements.push({ carverMovementType, label: requiredMovement.label, from: fromZerocoinAddress, to: txAddress, amount: sumTxVoutAmount });

          hasZerocoinInput = true;
          totalInput = sumTxVoutAmount;
        }
        break;
      case CarverMovementType.TxIdVoutToTx:
      case CarverMovementType.PosTxIdVoutToTx:
        const vinVoutKey = `${requiredMovement.txid}:${requiredMovement.vout}`;
        vinVoutMovement = vinVoutMovements.get(vinVoutKey);

        if (!vinVoutMovement) {
          console.log(vinVoutKey);
          throw `INVALID VIN+VOUT MOVEMENT ON BLOCK ${params.rpcblock.height}`;
        }

        totalInput += vinVoutMovement.amount;
        newVinMovements.push({ carverMovementType, label: requiredMovement.label, from: vinVoutMovement.to, to: txAddress, amount: vinVoutMovement.amount });
        break;

      // TX -> VOUT
      case CarverMovementType.TxToAddress:
      case CarverMovementType.PowAddressReward:
      case CarverMovementType.TxToMnAddress:
      case CarverMovementType.TxToPosOutputAddress:
        if (!requiredMovement.addressLabel) {
          console.log(requiredMovement);
          throw 'REQUIREDMOVEMENT WITHOUT ADDRESS?';
        }

        const voutAddress = voutAddresses[requiredMovement.addressLabel];
        if (!voutAddress) {
          console.log(requiredMovement.addressLabel);
          throw 'VOUT WITHOUT ADDRESS?'
        }

        let addressMovementType = carverMovementType;

        if (isPosTx(params.rpctx)) {
          const posAddressLabel = vinVoutMovement.to.label;

          addressMovementType = CarverMovementType.TxToPosAddress;
          if (requiredMovement.addressLabel !== posAddressLabel) {
            if (!config.community.governanceAddresses.find(governanceAddressLabel => governanceAddressLabel === requiredMovement.addressLabel)) {
              addressMovementType = CarverMovementType.TxToMnAddress;
              totalMnRewards += requiredMovement.amount;
            } else {
              addressMovementType = CarverMovementType.TxToGovernanceRewardAddress;
              totalGovernanceRewards += requiredMovement.amount;
            }
            mnRewardAddress = vinVoutMovement.to;
          } else {
            totalPosRewards += requiredMovement.amount;
            posRewardAddress = vinVoutMovement.to;
          }
        } else {
          // MN/POW
          if (carverMovementType === CarverMovementType.PowAddressReward) {
            totalPowRewards += requiredMovement.amount;
            powRewardAddress = voutAddress;
          } else if (carverMovementType === CarverMovementType.TxToMnAddress) {
            totalMnRewards += requiredMovement.amount;
          }
        }

        newVoutMovements.push({ carverMovementType: addressMovementType, label: requiredMovement.label, from: txAddress, to: voutAddress, amount: requiredMovement.amount });

        totalOutput += requiredMovement.amount;
        break;
      case CarverMovementType.TxToZerocoin:
        const toZerocoinAddress = await getCarverAddressFromCache(CarverAddressType.Zerocoin, 'ZEROCOIN');
        newVoutMovements.push({ carverMovementType, label: requiredMovement.label, from: txAddress, to: toZerocoinAddress, amount: requiredMovement.amount });

        totalOutput += requiredMovement.amount;
        break;
      case CarverMovementType.Burn:
        const toBurnAddress = await getCarverAddressFromCache(CarverAddressType.Burn, 'BURN');
        newVoutMovements.push({ carverMovementType, label: requiredMovement.label, from: txAddress, to: toBurnAddress, amount: requiredMovement.amount });

        totalOutput += requiredMovement.amount;
        break;
      default:
        throw `Unhandled movement type: ${carverMovementType}`;
    }
  }

  // POW REWARD -> TX
  if (totalPowRewards > 0) {
    const addressLabel = 'COINBASE';
    const fromAddress = await getCarverAddressFromCache(CarverAddressType.Coinbase, addressLabel);
    newVinMovements.push({ carverMovementType: CarverMovementType.CoinbaseToTx, label: `${addressLabel}:${params.rpctx.txid}`, from: fromAddress, to: txAddress, amount: totalPowRewards, destinationAddress: powRewardAddress });
  }

  // MN REWARD -> TX
  if (totalMnRewards > 0) {
    const addressLabel = 'MN';
    const fromAddress = await getCarverAddressFromCache(CarverAddressType.Masternode, addressLabel);
    //const roi = totalMnRewards / config.coinDetails.masternodeCollateral;
    newVinMovements.push({ carverMovementType: CarverMovementType.MasternodeRewardToTx, label: `${addressLabel}:${params.rpctx.txid}`, from: fromAddress, to: txAddress, amount: totalMnRewards, destinationAddress: mnRewardAddress });
  }

  // GOVERNANCE REWARD -> TX
  if (totalGovernanceRewards > 0) {
    const addressLabel = 'GOVERNANCE';
    const fromAddress = await getCarverAddressFromCache(CarverAddressType.Governance, addressLabel);
    newVinMovements.push({ carverMovementType: CarverMovementType.GovernanceRewardToTx, label: `${addressLabel}:${params.rpctx.txid}`, from: fromAddress, to: txAddress, amount: totalGovernanceRewards, destinationAddress: mnRewardAddress });
  }

  // POS REWARD -> TX
  if (totalPosRewards > 0) {
    const addressLabel = 'POS';
    const fromAddress = await getCarverAddressFromCache(CarverAddressType.ProofOfStake, addressLabel);
    newVinMovements.push({
      carverMovementType: CarverMovementType.PosRewardToTx,
      label: `${addressLabel}:${params.rpctx.txid}`,
      from: fromAddress,
      to: txAddress,
      amount: totalPosRewards - vinVoutMovement.amount,
      destinationAddress: posRewardAddress,
      posInputAmount: vinVoutMovement.amount,
      posInputBlockHeightDiff: params.rpcblock.height - vinVoutMovement.blockHeight
    });

  }

  // TX - > Fee
  if (totalInput - totalOutput > 0) {
    const addressLabel = 'FEE';
    const toAddress = await getCarverAddressFromCache(CarverAddressType.Fee, addressLabel);
    newVoutMovements.push({ carverMovementType: CarverMovementType.TxToFee, label: `${params.rpctx.txid}:${addressLabel}`, from: txAddress, to: toAddress, amount: totalInput - totalOutput });
  }

  return [...newVinMovements, ...newVoutMovements];
}

module.exports = {
  getRequiredMovements,
  getVoutRequiredMovements,
  parseRequiredMovements,
  parseNewRequiredMovements,
  getVinUtxos
};