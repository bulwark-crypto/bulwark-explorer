
const { secretsConfig } = require('../../../config.server');
const config = require('../../../config');


const snoowrap = require('snoowrap');

/**
 * Gets most reddit posts and stores them in db for later use
 */
const getRedditSubmissions = async ({ subreddit, query, after }) => {

  // For more information go to https://github.com/not-an-aardvark/snoowrap
  // You will need to register your app on reddit: https://www.reddit.com/prefs/apps
  // You can generate these credentials via web interface: https://not-an-aardvark.github.io/reddit-oauth-helper/ 
  const r = new snoowrap({
    userAgent: 'Carver2D', // You can optionally override this in the social reddit config

    ...secretsConfig.social.reddit
  });

  const submissionOptions = {
    query,
    sort: 'new',
    restrict_sr: true,
    ...(after && { after }) // This is .name for socialRedditSubmissions table
  };

  const submissions = await r.getSubreddit(subreddit).search(submissionOptions);
  return submissions;
}

/**
 * Gets any new submissions after the last submission
 */
const getNewSocialReddit = async ({ lastSubmission, widget }) => { //@todo lastSubmission
  const { subreddit, query } = widget.options;

  const redditSubmissions = await getRedditSubmissions({ subreddit, query, after: null });

  return redditSubmissions.reduce((submissions, redditSubmission) => {
    // Skip any posts that don't contain any text
    if (!redditSubmission.selftext) {
      return submissions;
    }

    const { name, type, group } = widget;
    return [
      ...submissions,
      {
        name,
        type,
        group,

        intervalNumber: redditSubmission.created,

        title: redditSubmission.title,
        description: redditSubmission.selftext,
        points: redditSubmission.ups,

        url: redditSubmission.url,
        thumbnail: redditSubmission.thumbnail,
        tag: redditSubmission.link_flair_text,
      }
    ]
  }, []);
}

module.exports = {
  getNewSocialReddit
}