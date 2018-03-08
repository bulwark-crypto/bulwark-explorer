
const moment = require('moment');
const TXOut = require('../../model/txout');

/**
 * Cache
 * Holds a list of top 100 for 1 hour and
 * will try to update the list in the background.
 */
class Cache {
  constructor() {
    this.items = [];
    this.loading = false;
    this.timeout = moment().add(1, 'hour');
  }

  get() {
    if (!this.loading && moment().diff(this.timeout) <= 0) {
      this.loading = true;

      TXOut.aggregate([
          { $match: { spendTx: { $exits: false } } },
          { $group: { _id: '$address', sum: '$value' } },
          { $sort: { sum: -1 } },
          { $limit: 100 }
        ])
        .then((items) => {
          this.items = items;
          this.loading = false;
          this.timeout = moment().add(1, 'hour');
        });
    }

    return this.items;
  }

  set(items) {
    this.items = items;
    this.timeout = moment().add(1, 'hour');
  }
}

module.exports = Cache;
