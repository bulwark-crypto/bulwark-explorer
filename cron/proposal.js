require('babel-polyfill');
require('../lib/cron');
const config = require('../config');
const { exit, rpc } = require('../lib/cron');
const fetch = require('../lib/fetch');
const { forEach } = require('p-iteration');
const locker = require('../lib/locker');
const moment = require('moment');
// Models.
const Proposal = require('../model/proposal');

async function syncProposal() {
  const date = moment().utc().startOf('minute').toDate();

  await Proposal.remove({});

  // Increase the timeout for Proposals.
  rpc.timeout(10000); // 10 secs

  const pps = await rpc.call('mnbudget', ['getinfo']);
  const mnc = await rpc.call('getmasternodecount');
  const inserts = [];
  await forEach(pps, async (pp) => {
    const proposal = new Proposal({
	  name: pp.Name,	
      created: date,
      status: ((pp.Yeas-pp.Nays)*10>mnc),
	  budgetTotal: pp.TotalPayment,
	  budgetMonthly: pp.MonthlyPayment,
	  budgetPeriod: (pp.TotalPayment/pp.MonthlyPayment),
	  hash: pp.Hash,
	  feehash: pp.FeeHash,
      url: pp.URL
    });

    inserts.push(proposal);
  });

  if (inserts.length) {
    await Proposal.insertMany(inserts);
  }
}

/**
 * Handle locking.
 */
async function update() {
  const type = 'proposal';
  let code = 0;

  try {
    locker.lock(type);
    await syncMasternode();
  } catch(err) {
    console.log(err);
    code = 1;
  } finally {
    try {
      locker.unlock(type);
    } catch(err) {
      console.log(err);
      code = 1;
    }
    exit(code);
  }
}

update();