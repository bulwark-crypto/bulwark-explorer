
require('babel-polyfill');
const mongoose = require('mongoose');
const config = require('../config');
const { rpc } = require('../lib/cron');
const blockchain = require('../lib/blockchain');
const TX = require('../model/tx');
const UTXO = require('../model/utxo');
const { CarverAddress, CarverMovement } = require('../model/carver2d');
const BlockRewardDetails = require('../model/blockRewardDetails');


function getVinTxInputs(rpctx) {
  const addressLabels = new Set();

  for (let vinIndex = 0; vinIndex < rpctx.vin.length; vinIndex++) {
    const vin = rpctx.vin[vinIndex];

    if (vin.txid) {
      if (vin.vout === undefined) {
        console.log(vin);
        throw 'VIN TXID WITHOUT VOUT?';
      }

      addressLabels.add(`${vin.txid}:${vin.vout}`);
    }

  }

  return Array.from(addressLabels);
}

/**
 * Go through vins, find unique addresses and fetch them all at once
 */
async function getVinCarverAddresses(rpctx, vinTxInputs) {
  const addressLabels = new Set();

  // Vin with txid will point to a specific movement
  const vinMovements = await CarverMovement.find({ label: { $in: vinTxInputs } });

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

      addressLabels.add('COINBASE');
    } else if (vin.scriptSig && vin.scriptSig.asm == 'OP_ZEROCOINSPEND') {

      addressLabels.add('ZEROCOIN');
    } else if (vin.txid) {
      if (vin.vout === undefined) {
        console.log(vin);
        throw 'VIN TXID WITHOUT VOUT?';
      }

      const label = `${vin.txid}:${vin.vout}`;
      const vinMovement = vinMovements.findOne(vinMovement => vinMovement.label === label);
      if (!vinMovement) {
        console.log(label);
        console.log(vinMovement);
        throw `COULD NOT FIND VIN MOVEMENT?`
      }

      addressLabels.add(`${vin.txid}:${vin.vout}`);
    }
  }

  return Array.from(addressLabels);
}


module.exports = {
  getVinTxInputs,
  getVinCarverAddresses
};
