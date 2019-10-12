
require('babel-polyfill');
const config = require('../../config');
const { exit, rpc } = require('../../lib/cron');
const locker = require('../../lib/locker');
const { getNewSocialReddit } = require('./reddit/cronRedditSubmissions');
const { SocialType } = require('./data');
const { SocialSubmission } = require('./model');


const syncSocial = async () => {

  const { social } = config;

  const getNewSocialSubmissions = async (lastSubmission, widget) => {
    switch (widget.type) {
      case SocialType.Reddit:
        return await getNewSocialReddit({ lastSubmission, widget });
    }
  }


  for (let widgetIndex = 0; widgetIndex < social.length; widgetIndex++) {
    const widget = social[widgetIndex];
    const newSubmissions = await getNewSocialSubmissions({/*@todo pass last synced submission */ }, widget);

    for (let newSubmissionIndex = 0; newSubmissionIndex < newSubmissions.length; newSubmissionIndex++) {
      const newSubmission = newSubmissions[newSubmissionIndex];
      const socialSubmission = new SocialSubmission(newSubmission);

      await socialSubmission.save();
    }
  }
}

/**
 * Handle locking.
 */
async function update() {
  const type = 'social_reddit';
  let code = 0;

  try {
    locker.lock(type);

    console.log('Syncing social...');
    await syncSocial();
    console.log('Syncing complete!');

  } catch (err) {
    console.log(err);
    code = 1;
  } finally {
    try {
      locker.unlock(type);
    } catch (err) {
      console.log(err);
      code = 1;
    }
    exit(code);
  }
}

update();
