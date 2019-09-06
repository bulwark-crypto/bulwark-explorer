
const config = require('../config');
require('babel-polyfill');
const mongoose = require('mongoose');
const { CarverAddressType, CarverMovementType, CarverTxType } = require('../lib/carver2d');
const { CarverAddress, CarverMovement, CarverAddressMovement } = require('../model/carver2d');
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

    // Zerocoin doesn't need any vins
    if (vin.scriptSig && vin.scriptSig.asm == 'OP_ZEROCOINSPEND') {
      return utxoLabels;
    }

    if (vin.txid) {
      if (vin.vout === undefined) {
        console.log(vin);
        throw 'VIN TXID WITHOUT VOUT?';
      }

      const label = `${vin.txid}:${vin.vout}`;
      utxoLabels.push(label);
    }
  }


  const utxos = await UTXO.find({ label: { $in: utxoLabels } }, { label: 1, addressLabel: 1, amount: 1 });
  if (utxos.length !== utxoLabels.length) {
    console.log(utxoLabels);
    console.log(utxos);
    console.log(rpctx);
    throw 'UTXO count mismatch'
  }

  return utxos;
}

/**
 * Get or Initialize a new carver address
 * usedAddresses = Map<addressLabel,CarverAddressType>
 */
const fillAddressCache = async (params, usedAddresses) => {
  const createCarverAddress = (carverAddressType, label, date) => {

    let newCarverAddress = new CarverAddress({
      _id: null, // Notice how the _id is null here. This is on purpose to identify which addresses are new (and will need to be inserted). 
      label,
      balance: 0,

      blockHeight: params.rpcblock.height,
      date,
      carverAddressType,

      // for stats
      valueOut: 0,
      valueIn: 0,
      countIn: 0,
      countOut: 0,

      sequence: 0
    });

    return newCarverAddress;
  }

  const isCarverAddressCached = (addressLabel) => {
    const commonAddressFromCache = params.commonAddressCache.get(addressLabel);
    if (commonAddressFromCache) {
      return commonAddressFromCache;
    }
    const normalAddressFromCache = params.normalAddressCache.get(addressLabel);
    if (normalAddressFromCache) {
      return normalAddressFromCache;
    }
    return null;
  }

  const addAddressToCache = (carverAddress) => {

    switch (carverAddress.carverAddressType) {
      case CarverAddressType.Address:
      case CarverAddressType.ProofOfWork:
      case CarverAddressType.ProofOfStake:
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
  usedAddresses.forEach(usedAddress => {
    if (!isCarverAddressCached(usedAddress.label)) {
      addressesToFetch.add(usedAddress.label);
    }
  });

  // Fetch uncached addresses from db
  const allAddressesToFetch = Array.from(addressesToFetch);
  const carverAddresses = await CarverAddress.find({ label: { $in: allAddressesToFetch } });

  // Find the cache with results (or make new addresses)
  const blockDate = new Date(params.rpcblock.time * 1000);
  allAddressesToFetch.forEach(label => {
    const carverAddress = carverAddresses.find(carverResult => carverResult.label === label);


    // Carver address was not in db, add it to cache
    if (!carverAddress) {
      const carverAddressMovement = usedAddresses.get(label);
      const newCarverAddress = createCarverAddress(carverAddressMovement.addressType, label, blockDate)

      addAddressToCache(newCarverAddress);
    } else {
      addAddressToCache(carverAddress);
    }
  })
}


/**
 * Analyze a tx and return raw CarverMovement object data (to be finalized after)
 */
const getRequiredMovement = async (params) => {
  const blockDate = new Date(params.rpcblock.time * 1000);

  const rpctx = params.rpctx;
  const vinUtxos = params.vinUtxos;

  var carverTxType = null; // By default we don't know the tx type

  // We'll keep a tally of all inputs/outputs summed by address
  var consolidatedAddressAmounts = new Map();
  const addToAddress = (addressType, label, amount) => {
    if (!consolidatedAddressAmounts.has(label)) {
      consolidatedAddressAmounts.set(label, { label, addressType, amountIn: 0, amountOut: 0, amount: 0 });
    }

    let consolidatedAddressAmount = consolidatedAddressAmounts.get(label);
    consolidatedAddressAmount.amount += amount;

    if (amount < 0) {
      consolidatedAddressAmount.amountOut += -amount;
    }
    if (amount > 0) {
      consolidatedAddressAmount.amountIn += amount;
    }
  }


  let newUtxos = [];

  // These address labels will be filled during vin/vout scan
  let posAddressLabel = null;
  let powAddressLabel = null;
  let mnAddressLabel = null;
  let zerocoinOutAmount = 0;

  for (let vinIndex = 0; vinIndex < rpctx.vin.length; vinIndex++) {
    const vin = rpctx.vin[vinIndex];

    if (vin.value) {
      throw 'VIN WITH VALUE?';
    }

    if (vin.coinbase) {
      if (rpctx.vin.length != 1) {
        console.log(tx);
        throw "COINBASE WITH >1 VIN?";
      }

      // Identify that this is a POW or POW/MN tx
      carverTxType = CarverTxType.ProofOfWork;
    } else if (vin.scriptSig && vin.scriptSig.asm == 'OP_ZEROCOINSPEND') {
      carverTxType = CarverTxType.Zerocoin;
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
      addToAddress(CarverAddressType.Address, vinUtxo.addressLabel, -vinUtxo.amount);

      if (isPosTx(rpctx)) {
        carverTxType = CarverTxType.ProofOfStake;
        posAddressLabel = vinUtxo.addressLabel;
      }
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

          const addressLabel = addresses[0];
          addToAddress(CarverAddressType.Address, addressLabel, vout.value);

          if (carverTxType) {
            switch (carverTxType) {
              case CarverTxType.ProofOfWork:
                if (rpctx.vout.length === 1) {
                  // Proof of Work Reward / Premine 
                  powAddressLabel = addressLabel;
                } else {
                  if (voutIndex === rpctx.vout.length - 1) { // Assume last tx is always POW reward
                    // Proof of Work Reward
                    powAddressLabel = addressLabel;
                  } else {
                    // Masternode Reward / Governance 
                    mnAddressLabel = addressLabel;
                  }
                }
                break;
              case CarverTxType.ProofOfStake:
                if (voutIndex === rpctx.vout.length - 1) { // Assume last tx is always masternode reward
                  // Masternode Reward / Governance 
                  mnAddressLabel = addressLabel;
                } else {
                  // Proof of Stake Reward
                  posAddressLabel = addressLabel;
                }
                break;
              case CarverTxType.Zerocoin:
                zerocoinOutAmount += vout.value;
                break;
              default:
                console.log(carverTxType);
                throw 'Unhandled carverTxType!';
            }
          }
          if (vout.value > 0) {
            newUtxos.push(new UTXO({
              label: `${rpctx.txid}:${vout.n}`,
              blockHeight: params.rpcblock.height,
              amount: vout.value,
              addressLabel
            }));
          }
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
            addToAddress(CarverAddressType.Zerocoin, 'ZEROCOIN', vout.value);
          }
          break
        case 'nulldata':
          {
            if (vout.value === undefined) {
              console.log(vout);
              console.log(tx);
              throw 'BURN WITHOUT VALUE?';
            }
            addToAddress(CarverAddressType.Burn, 'BURN', vout.value);
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

  // If we haven't figured out what carver tx type this is yet then it's basic movements (we'll jsut need to figure out if it's one to one, one to many, many to one or many to many based on number of used from/to addresses)
  if (!carverTxType) {

    // For now hardcode all addresses as many to many
    carverTxType = CarverTxType.TransferManyToMany;
  }

  switch (carverTxType) {
    case CarverTxType.ProofOfStake:
      const posAddressAmount = consolidatedAddressAmounts.get(posAddressLabel);
      if (!posAddressAmount) {
        throw 'POS reward not found?';
      }
      addToAddress(CarverAddressType.ProofOfStake, `${posAddressLabel}:POS`, -posAddressAmount.amount);
      break;
    case CarverTxType.ProofOfWork:
      const powRewardAmount = consolidatedAddressAmounts.get(powAddressLabel);
      if (!powRewardAmount) {
        throw 'POW reward not found?';
      }
      addToAddress(CarverAddressType.ProofOfWork, `${powAddressLabel}:POW`, -powRewardAmount.amount);
      break;
    case CarverTxType.TransferManyToMany:
      break;
    case CarverTxType.Zerocoin:
      addToAddress(CarverAddressType.Zerocoin, `ZEROCOIN`, -zerocoinOutAmount);
      break;
    default:
      console.log(carverTxType);
      throw 'carverTxType not found'
  }

  if (carverTxType === CarverTxType.ProofOfStake || carverTxType === CarverTxType.ProofOfWork) {
    if (mnAddressLabel) {
      const mnRewardAmount = consolidatedAddressAmounts.get(mnAddressLabel);
      if (!mnRewardAmount) {
        throw 'MN reward not found?';
      }
      addToAddress(CarverAddressType.Masternode, `${mnAddressLabel}:MN`, -mnRewardAmount.amount);
    }
  }


  const consolidatedAddresses = Array.from(consolidatedAddressAmounts.values());

  // Finally create our new movement
  const totalAmountOut = consolidatedAddresses.filter(consolidatedAddressAmount => consolidatedAddressAmount.amount > 0).reduce((total, consolidatedAddressAmount) => total + consolidatedAddressAmount.amount, 0);
  return {
    txId: params.rpctx.txid,
    txType: carverTxType,
    amount: totalAmountOut,
    blockHeight: params.rpcblock.height,
    date: blockDate,
    carverAddressMovements: [],

    // Store the temporary movements here. We'll fill the from/to CarverAddressMovements outside of this method
    consolidatedAddressMovements: consolidatedAddressAmounts,
    newUtxos
  };
}

module.exports = {
  getRequiredMovement,
  getVinUtxos,
  fillAddressCache
};