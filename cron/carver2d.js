
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
}

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

  //const sumVoutAmount = rpctx.vout.map(vout => vout.value).reduce((prev, curr) => prev + curr, 0);

  //const txAddress = vinAddresses.get(txid).address;
  //const txAmount = vinAddresses.get(txid).amount;
  /*if (!txAddress) {
    console.log(txid);
    throw 'VIN TX ID NOT FOUND?'
  }*/

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

      // const coinbaseAddress = vinAddresses.get('COINBASE').address;
      requiredMovements.push({ movementType: CarverMovementType.CoinbaseToTx, label });
    } else if (vin.scriptSig && vin.scriptSig.asm == 'OP_ZEROCOINSPEND') {
      //const zerocoinAddress = vinAddresses.get('ZEROCOIN').address;
      requiredMovements.push({ movementType: CarverMovementType.ZerocoinToTx, label });
    } else if (vin.txid) {
      if (vin.vout === undefined) {
        console.log(vin);
        throw 'VIN TXID WITHOUT VOUT?';
      }

      //const txidVout = `${vin.txid}:${vin.vout}`;
      /*
      const vinAddress = vinAddresses.get(label).address;
      const vinAmount = vinAddresses.get(label).amount;

      const movementLabel = `${vinIndex}:${txid}`; //use vin index + txid as identifier
*/
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
  //const blockDate = new Date(rpcblock.time * 1000);

  const requiredMovements = [];

  for (let voutIndex = 0; voutIndex < rpctx.vout.length; voutIndex++) {
    const vout = rpctx.vout[voutIndex];

    const label = `${rpctx.txid}:${vout.n}`; //use txid+vout as identifier for these transactions

    //let voutLabel = '';
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

          let movementType = CarverMovementType.AddressToTx;

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

          const address = addresses[0];
          requiredMovements.push({ movementType, label, amount: vout.value, address });
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

            //voutLabel = 'ZEROCOIN';
            //const address = await getAddressFromCache(AddressType.Zerocoin, voutLabel, block.time, ++sequence, true);

            //movements.push(await addMovement(MovementType.TxToZerocoin, movementLabel, block.time, txAddress, address, vout.value, ++sequence, startMovementSequence)); //use txid as identifier for these transactions
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

            //voutLabel = 'BURN';
            //const address = await getAddressFromCache(AddressType.Burn, voutLabel, block.time, ++sequence, true);

            //movements.push(await addMovement(MovementType.Burn, movementLabel, block.time, txAddress, address, vout.value, ++sequence, startMovementSequence)); //use txid as identifier for these transactions
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

function parseRequiredMovements(params) {
  let sequence = params.sequence;

  let newMovements = [];

  console.log(params);
  throw 'xx';

  return {
    newMovements,
    sequence
  };
}

module.exports = {
  //getVinMovements,
  getVinRequiredMovements,
  getVoutRequiredMovements,
  parseRequiredMovements,
  //getMovements
};
