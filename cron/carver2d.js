
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


async function getOrCreateCarverAddress(carverAddressType, label, time, sequence) {
  let carverAddress = await CarverAddress.findOne({ label });

  if (!carverAddress) {
    carverAddress = new CarverAddress({
      _id: new mongoose.Types.ObjectId(),
      label,
      balance: 0,

      time,
      lastMovementTime: time,
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
}

/**
 * Go through vins, find unique addresses and fetch them all at once
 */
async function getVinCarverAddresses(rpcblock, rpctx, sequence) {

  const vinAddresses = new Map();
  const vinTxInputs = new Set();

  const txAddress = await getOrCreateCarverAddress(CarverAddressType.Tx, rpctx.txid, rpcblock.time, ++sequence);
  vinAddresses.set(rpctx.txid, txAddress);

  for (let vinIndex = 0; vinIndex < rpctx.vin.length; vinIndex++) {
    const vin = rpctx.vin[vinIndex];

    if (vin.coinbase) {
      const label = 'COINBASE';
      if (!vinAddresses.has(label)) {
        const address = await getOrCreateCarverAddress(CarverAddressType.Coinbase, label, rpcblock.time, ++sequence);
        vinAddresses.set(label, address);
      }
    } else if (vin.scriptSig && vin.scriptSig.asm == 'OP_ZEROCOINSPEND') {
      const label = 'ZEROCOIN';
      if (!vinAddresses.has(label)) {
        const address = await getOrCreateCarverAddress(CarverAddressType.Zerocoin, label, rpcblock.time, ++sequence);
        vinAddresses.set(label, address);
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
      console.log(vinMovement);
      throw 'got vin movements!!!!!!'
    });

    console.log(vinTxInputs);
    throw 'vinTxInputs!'
  }

  return vinAddresses;
}
function getVinMovements(rpctx, addresses) {
  let movements = [];

  const txAmount = rpctx.vout.map(vout => vout.value).reduce((prev, curr) => prev + curr, 0);

  const txid = rpctx.txid;

  const txAddress = addresses.get(txid);
  if (!txAddress) {
    console.log(txid);
    throw 'VIN TX ID NOT FOUND?'
  }

  for (let vinIndex = 0; vinIndex < rpctx.vin.length; vinIndex++) {
    const vin = rpctx.vin[vinIndex];

    if (vin.value) {
      throw 'VIN WITH VALUE?';
    }

    const movementLabel = `${vinIndex}:${txid}`;

    if (vin.coinbase) {
      if (rpctx.vin.length != 1) {
        console.log(tx);
        throw "COINBASE WITH >1 VIN?";
      }

      const coinbaseAddress = addresses['COINBASE']
      movements.push({ type: CarverMovementType.CoinbaseToTx, label: movementLabel, from: coinbaseAddress, to: txAddress, amount: txAmount });
    } else if (vin.scriptSig && vin.scriptSig.asm == 'OP_ZEROCOINSPEND') {
      const zerocoinAddress = addresses['ZEROCOIN']
      movements.push({ type: CarverMovementType.ZerocoinToTx, label: movementLabel, from: zerocoinAddress, to: txAddress, amount: txAmount });
    } else if (vin.txid) {
      if (vin.vout === undefined) {
        console.log(vin);
        throw 'VIN TXID WITHOUT VOUT?';
      }

      const label = `${vin.txid}:${vin.vout}`;
      const vinAddress = addresses[label];

      const movementLabel = `${vinIndex}:${txid}`; //use vin index + txid as identifier

      let movementType = CarverMovementType.AddressToTx;
      if (isPosTx(tx)) {
        movementType = CarverMovementType.PosAddressToTx;
      }

      movements.push({ type: movementType, label: movementLabel, from: vinAddress, to: txAddress, amount: vinMovement.amount });
    } else {
      console.log(vin);
      throw 'UNSUPPORTED VIN (NOT COINBASE OR TX)';
    }
  }

  return movements;
}

module.exports = {
  getVinCarverAddresses,
  getVinMovements
};
