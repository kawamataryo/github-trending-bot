import TwitterApi from "twitter-api-v2";
import * as functions from "firebase-functions";
import * as dayjs from "dayjs";
import {GHTrendScraper} from "../lib/ghTrendScraper";
import {bulkInsertTrends} from "../lib/firestore";
import {shuffle} from "../lib/shuffle";
import {tweetRepository} from "./utils";

const twitterClient = new TwitterApi({
  appKey: functions.config().twitter.frontend_app_key,
  appSecret: functions.config().twitter.frontend_app_secret,
  accessToken: functions.config().twitter.frontend_access_token,
  accessSecret: functions.config().twitter.frontend_access_secret,
});

export const tweetFrontendTrends = async (
    db: FirebaseFirestore.Firestore
): Promise<void> => {
  const collectionRef = db
      .collection("v1")
      .doc("trends")
      .collection("frontend");

  // update trends data at midnight daily
  if (dayjs().hour() === 0) {
    const jsTrends = await GHTrendScraper.scraping("/javascript");
    const tsTrends = await GHTrendScraper.scraping("/typescript");
    await bulkInsertTrends(collectionRef, shuffle([...jsTrends, ...tsTrends]));
    console.info("Update frontend repositories collections");
  }

  // tweet trends repository with a bot
  await tweetRepository(collectionRef, twitterClient);
};
