
require('babel-polyfill');
const mongoose = require('mongoose');
const config = require('../config');
const { rpc } = require('../lib/cron');
const blockchain = require('../lib/blockchain');
const TX = require('../model/tx');
const UTXO = require('../model/utxo');
const { CarverAddress, CarverMovement, CarverMovementType, VinType, CarverAddressType } = require('../model/carver2d');
const BlockRewardDetails = require('../model/blockRewardDetails');


/**
 * Is this a POS transaction?
 */
async function isPosTx(tx) {
  return tx.vin.length === 1 &&
    tx.vin[0].txid &&
    tx.vin[0].vout !== undefined &&
    tx.vout.length === 3 &&
    tx.vout[0].value === 0 &&
    tx.vout[0].n === 0 &&
    tx.vout[0].scriptPubKey &&
    tx.vout[0].scriptPubKey.type === 'nonstandard';
}

/*
async function getOrCreateCarverAddress(carverAddressType, label, blockDate, sequence) {
  let carverAddress = await CarverAddress.findOne({ label });

  if (!carverAddress) {
    carverAddress = new CarverAddress({
      _id: new mongoose.Types.ObjectId(),
      label,
      balance: 0,

      date: blockDate,
      lastMovementDate: blockDate,
      carverAddressType,

      // for stats
      valueOut: 0,
      valueIn: 0,
      countIn: 0,
      countOut: 0,

      sequence,
    });
    await carverAddress.save();
  }

  return carverAddress;
}*/

/**
 * Go through vouts and return all addresses used in vouts (as well as their amount)
 */
/*
async function getVoutCarverAddresses(rpcblock, rpctx, sequence) {
  let addresses = new Set();
  for (let voutIndex = 0; voutIndex < rpctx.vout.length; voutIndex++) {
    const vout = tx.vout[voutIndex];

    let voutLabel = '';
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

          voutLabel = addresses[0];

          addresses.add(voutLabel);
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

            voutLabel = 'ZEROCOIN';

            addresses.add(voutLabel);
          }
          break
        case 'nulldata':
          {
            if (vout.value === undefined) {
              console.log(vout);
              console.log(tx);
              throw 'BURN WITHOUT VALUE?';
            }

            voutLabel = 'BURN';
            addresses.add(voutLabel);
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

  const txAddress = await getOrCreateCarverAddress(CarverAddressType.Tx, rpctx.txid, blockDate, ++sequence);

  return addresses;
}*/
/**
 * Go through vouts and return all addresses used in vouts (as well as their amount)
 */
//async function getVoutCarverMovements(rpcblock, rpctx, sequence) {
/* */
//}

/**
 * Go through vins and return all addresses used in vins (as well as their amount)
 */
/*
async function getVinCarverAddresses(rpcblock, rpctx, sequence) {
  const blockDate = new Date(rpcblock.time * 1000);

  const vinAddresses = new Map();
  const vinTxInputs = new Set();

  const sumVoutAmount = rpctx.vout.map(vout => vout.value).reduce((prev, curr) => prev + curr, 0);

  const txAddress = await getOrCreateCarverAddress(CarverAddressType.Tx, rpctx.txid, blockDate, ++sequence);
  vinAddresses.set(rpctx.txid, { address: txAddress, amount: sumVoutAmount });

  for (let vinIndex = 0; vinIndex < rpctx.vin.length; vinIndex++) {
    const vin = rpctx.vin[vinIndex];

    if (vin.coinbase) {
      const label = 'COINBASE';
      if (!vinAddresses.has(label)) {
        const address = await getOrCreateCarverAddress(CarverAddressType.Coinbase, label, blockDate, ++sequence);
        vinAddresses.set(label, { address, amount: sumVoutAmount });
      }
    } else if (vin.scriptSig && vin.scriptSig.asm == 'OP_ZEROCOINSPEND') {
      const label = 'ZEROCOIN';
      if (!vinAddresses.has(label)) {
        const address = await getOrCreateCarverAddress(CarverAddressType.Zerocoin, label, blockDate, ++sequence);
        vinAddresses.set(label, { address, amount: sumVoutAmount });
      }
    } else if (vin.txid) {
      const label = `${vin.txid}:${vin.vout}`;
      vinTxInputs.add(label);
    }
  }

  // Vin with txid will point to a specific movement
  const vinMovements = await CarverMovement.find({ label: { $in: Array.from(vinTxInputs) } }).populate('to');
  if (vinMovements.length > 0) {

    vinTxInputs.forEach(txInput => {
      const vinMovement = vinMovements.find(vinMovement => vinMovement.label === txInput);
      console.log(txInput, vinMovement);

      //const movementLabel = `${vinIndex}:${txid}`; //use vin index + txid as identifier
      //const 

      throw 'got vin movements!!!!!!'
    });

    console.log(vinTxInputs);
    throw 'vinTxInputs!'
  }

  return vinAddresses;
}*/

function getVinRequiredMovements(rpctx) {
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
      //const zerocoinAddress = vinAddresses.get('ZEROCOIN').address;
      requiredMovements.push({ movementType: CarverMovementType.ZerocoinToTx, label });
    } else if (vin.txid) {
      if (vin.vout === undefined) {
        console.log(vin);
        throw 'VIN TXID WITHOUT VOUT?';
      }

      let movementType = CarverMovementType.AddressToTx;
      if (isPosTx(rpctx)) {
        movementType = CarverMovementType.PosAddressToTx;
      }

      requiredMovements.push({ movementType, label, txid: vin.txid, vout: vin.vout });
    } else {
      console.log(vin);
      throw 'UNSUPPORTED VIN (NOT COINBASE OR TX)';
    }
  }

  return requiredMovements;
}
function getVoutRequiredMovements(rpctx) {
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
            if (vout.n === 1) {
              movementType = CarverMovementType.TxToPosAddress;
            }
            if (vout.n === 2) {
              movementType = CarverMovementType.TxToMnAddress;
            }
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

            requiredMovements.push({ movementType: MovementType.TxToZerocoin, label, amount: vout.value });
          }
          break
        case 'nulldata':
          {
            if (vout.value === undefined) {
              console.log(vout);
              console.log(tx);
              throw 'BURN WITHOUT VALUE?';
            }

            requiredMovements.push({ movementType: MovementType.Burn, label, amount: vout.value });
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


async function parseRequiredMovements(params) {
  const blockDate = new Date(params.rpcblock.time * 1000);

  const getCarverAddressFromCache = async (carverAddressType, label) => {
    //@todo add caching

    let carverAddress = await CarverAddress.findOne({ label });
    if (!carverAddress) {
      carverAddress = new CarverAddress({
        _id: new mongoose.Types.ObjectId(),
        label,
        balance: 0,

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
      await carverAddress.save();
    }

    params.carverAddressCache.push(carverAddress);

    return carverAddress;
  }

  const getVinVoutMovements = async (requiredMovements) => {
    const vinVoutMovements = new Map();

    const movementsToTx = requiredMovements.filter(requiredMovement =>
      requiredMovement.movementType == CarverMovementType.AddressToTx ||
      requiredMovement.movementType == CarverMovementType.PosAddressToTx);
    const vinVouts = movementsToTx.map(movementToTx => `${movementToTx.txid}:${movementToTx.vout}`);

    if (vinVouts.length > 0) {
      const vinMovements = await CarverMovement.find({ label: { $in: vinVouts } }).populate('to');
      vinMovements.forEach(vinMovements => {
        vinVoutMovements.set(vinMovements.label, vinMovements);
      })
    }
    //requiredMovements.push({ movementType, label, txid: vin.txid, vout: vin.vout });

    return vinVoutMovements;
  }

  /**
   * Gets all addresses used in required movements (these are vout addresses[0])
   */
  const getVoutAddresses = async (requiredMovements) => {
    const voutAddresses = new Map();

    const movementsWithAddress = requiredMovements.filter(requiredMovement =>
      requiredMovement.movementType == CarverMovementType.TxToAddress ||
      requiredMovement.movementType == CarverMovementType.TxToPosAddress ||
      requiredMovement.movementType == CarverMovementType.TxToMnAddress ||
      requiredMovement.movementType == CarverMovementType.TxToCoinbaseRewardAddress);

    const addressLabels = Array.from(new Set(movementsWithAddress.map(movement => movement.addressLabel))); // Select distinct address labels

    for (let i = 0; i < addressLabels.length; i++) {
      const addressLabel = addressLabels[i];

      await getCarverAddressFromCache(CarverAddressType.Address, addressLabel)
    }


    const addresses = await CarverAddress.find({ label: { $in: addressLabels } });
    addresses.forEach(address => {
      voutAddresses[address.label] = address;
    });

    return voutAddresses;
  }

  // Figure out what txid+vout we need to fetch 
  const vinVoutMovements = await getVinVoutMovements(params.requiredMovements);
  const voutAddresses = await getVoutAddresses(params.requiredMovements);

  const sumTxVoutAmount = params.rpctx.vout.map(vout => vout.value).reduce((prev, curr) => prev + curr, 0);

  const txAddress = await getCarverAddressFromCache(CarverAddressType.Tx, params.rpctx.txid);

  let newMovements = [];

  for (let i = 0; i < params.requiredMovements.length; i++) {
    const requiredMovement = params.requiredMovements[i];

    const carverMovementType = requiredMovement.movementType;

    switch (carverMovementType) {
      // VIN -> TX
      case CarverMovementType.CoinbaseToTx:
        const fromCoinbaseAddress = await getCarverAddressFromCache(CarverAddressType.Coinbase, 'COINBASE');
        newMovements.push({ carverMovementType, label: requiredMovement.label, from: fromCoinbaseAddress, to: txAddress, amount: sumTxVoutAmount });
        break;
      case CarverMovementType.ZerocoinToTx:
        const fromZerocoinAddress = await getCarverAddressFromCache(CarverAddressType.Zerocoin, 'ZEROCOIN');
        newMovements.push({ carverMovementType, label: requiredMovement.label, from: fromZerocoinAddress, to: txAddress, amount: sumTxVoutAmount });
        break;
      case CarverMovementType.AddressToTx:
      case CarverMovementType.PosAddressToTx:

        //const coinbaseAddress = await getCarverAddressFromCache(CarverAddressType.Coinbase, 'COINBASE');
        //newMovements.push({ carverMovementType, label: requiredMovement.label, from: coinbaseAddress, to: txAddress, amount: requiredMovement });

        const vinVoutKey = `${requiredMovement.txid}:${requiredMovement.vout}`;
        const vinVoutMovement = vinVoutMovements.get(vinVoutKey);

        if (!vinVoutMovement) {
          console.log(vinVoutKey);
          throw 'INVALID VIN+VOUT MOVEMENT?';
        }

        newMovements.push({ carverMovementType, label: requiredMovement.label, from: vinVoutMovement.to, to: txAddress, amount: vinVoutMovement.amount });

        break;

      // TX -> VOUT
      case CarverMovementType.TxToAddress:
      case CarverMovementType.TxToPosAddress:
      case CarverMovementType.TxToMnAddress:
      case CarverMovementType.TxToCoinbaseRewardAddress:
        if (!requiredMovement.addressLabel) {
          console.log(requiredMovement);
          throw 'REQUIREDMOVEMENT WITHOUT ADDRESS?';
        }

        const voutAddress = voutAddresses[requiredMovement.addressLabel];
        if (!voutAddress) {
          console.log(requiredMovement.addressLabel);
          throw 'VOUT WITHOUT ADDRESS?'
        }

        //const coinbaseAddress = await getCarverAddressFromCache(CarverAddressType.Coinbase, 'COINBASE');
        //newMovements.push({ carverMovementType, label: requiredMovement.label, from: coinbaseAddress, to: txAddress, amount: requiredMovement });
        newMovements.push({ carverMovementType, label: requiredMovement.label, from: txAddress, to: voutAddress, amount: requiredMovement.amount });
        //requiredMovements.push({ movementType, label, amount: vout.value, address });
        break;
      case CarverMovementType.TxToZerocoin:
        const toZerocoinAddress = await getCarverAddressFromCache(CarverAddressType.Zerocoin, 'ZEROCOIN');
        //newMovements.push({ carverMovementType, label: requiredMovement.label, from: coinbaseAddress, to: txAddress, amount: requiredMovement });
        newMovements.push({ carverMovementType, label: requiredMovement.label, from: txAddress, to: toZerocoinAddress, amount: requiredMovement.amount });
        break;
      case CarverMovementType.Burn:
        const toBurnAddress = await getCarverAddressFromCache(CarverAddressType.Zerocoin, 'BURN');
        //newMovements.push({ carverMovementType, label: requiredMovement.label, from: coinbaseAddress, to: txAddress, amount: requiredMovement });
        newMovements.push({ carverMovementType, label: requiredMovement.label, from: txAddress, to: toBurnAddress, amount: requiredMovement.amount });
        break;
    }
  }

  return newMovements
}

module.exports = {
  //getVinMovements,
  getVinRequiredMovements,
  getVoutRequiredMovements,
  parseRequiredMovements,
  //getMovements
};
