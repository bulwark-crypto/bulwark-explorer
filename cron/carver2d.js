
const config = require('../config');
require('babel-polyfill');
const mongoose = require('mongoose');
const { CarverAddress, CarverMovement, CarverMovementType, CarverAddressType } = require('../model/carver2d');


/**
 * Is this a POS transaction?
 */
const isPosTx = (tx) => {

  return tx.vin.length === 1 &&
    tx.vin[0].txid !== undefined &&
    tx.vin[0].vout !== undefined &&
    //tx.vout.length === 3 &&
    tx.vout[0].value !== undefined &&
    tx.vout[0].value === 0 &&
    tx.vout[0].n === 0 &&
    tx.vout[0].scriptPubKey &&
    tx.vout[0].scriptPubKey.type === 'nonstandard';
}

/**
 * Create address->tx movement for all inputs in a tx
 */
const getVinRequiredMovements = (rpctx) => {
  let requiredMovements = [];

  const txid = rpctx.txid;

  for (let vinIndex = 0; vinIndex < rpctx.vin.length; vinIndex++) {
    const vin = rpctx.vin[vinIndex];

    if (vin.value) {
      throw 'VIN WITH VALUE?';
    }

    const label = `${vinIndex}:${txid}`;

    if (vin.coinbase) {
      if (rpctx.vin.length != 1) {
        console.log(tx);
        throw "COINBASE WITH >1 VIN?";
      }

      requiredMovements.push({ movementType: CarverMovementType.CoinbaseToTx, label });
    } else if (vin.scriptSig && vin.scriptSig.asm == 'OP_ZEROCOINSPEND') {
      requiredMovements.push({ movementType: CarverMovementType.ZerocoinToTx, label });
    } else if (vin.txid) {
      if (vin.vout === undefined) {
        console.log(vin);
        throw 'VIN TXID WITHOUT VOUT?';
      }

      if (isPosTx(rpctx)) {
        requiredMovements.push({ movementType: CarverMovementType.PosTxIdVoutToTx, label, txid: vin.txid, vout: vin.vout });
      } else {
        const movementType = CarverMovementType.TxIdVoutToTx;
        requiredMovements.push({ movementType, label, txid: vin.txid, vout: vin.vout });
      }

    } else {
      console.log(vin);
      throw 'UNSUPPORTED VIN (NOT COINBASE OR TX)';
    }
  }

  return requiredMovements;
}

/**
 * Create tx->address movement for all outputs in a tx
 */
const getVoutRequiredMovements = (rpctx) => {
  const requiredMovements = [];

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
            movementType = CarverMovementType.TxToCoinbaseRewardAddress;
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
    //@todo add caching (to speed up fetching of old addresses)

    let carverAddress = await CarverAddress.findOne({ label });
    if (!carverAddress) {
      carverAddress = new CarverAddress({
        _id: new mongoose.Types.ObjectId(),
        label,
        balance: 0,

        blockHeight: params.rpcblock.height,
        date: blockDate,
        lastMovementDate: blockDate,
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
          carverAddress.posCountIn = 0;
          carverAddress.posValueIn = 0;
          carverAddress.mnCountIn = 0;
          carverAddress.mnValueIn = 0;
          carverAddress.powCountIn = 0;
          carverAddress.powValueIn = 0;

          break;
      }
      await carverAddress.save();
    }

    return carverAddress;
  }

  /**
   * Gets all addresses used in required movements (these are vout addresses[0])
   */
  const getVoutAddresses = async (requiredMovements) => {
    const voutAddresses = new Map();

    const movementsWithAddress = requiredMovements.filter(requiredMovement =>
      requiredMovement.movementType == CarverMovementType.TxToAddress ||
      requiredMovement.movementType == CarverMovementType.TxToPosOutputAddress ||
      requiredMovement.movementType == CarverMovementType.TxToCoinbaseRewardAddress);

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
        totalPowRewards = sumTxVoutAmount;
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
          throw 'INVALID VIN+VOUT MOVEMENT?';
        }

        totalInput += vinVoutMovement.amount;
        newVinMovements.push({ carverMovementType, label: requiredMovement.label, from: vinVoutMovement.to, to: txAddress, amount: vinVoutMovement.amount });
        break;

      // TX -> VOUT
      case CarverMovementType.TxToAddress:
      case CarverMovementType.TxToCoinbaseRewardAddress:
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
            if (config.community.governanceAddresses[requiredMovement.addressLabel]) {
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
          // POW
          if (carverMovementType === CarverMovementType.TxToCoinbaseRewardAddress) {
            powRewardAddress = voutAddress;
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
    newVinMovements.push({ carverMovementType: CarverMovementType.PosRewardToTx, label: `${addressLabel}:${params.rpctx.txid}`, from: fromAddress, to: txAddress, amount: totalPosRewards - vinVoutMovement.amount, destinationAddress: posRewardAddress });

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
  getVinRequiredMovements,
  getVoutRequiredMovements,
  parseRequiredMovements,
};