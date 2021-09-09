import TwitterApi from "twitter-api-v2";
import * as functions from "firebase-functions";
import { GHTrendScraper } from "../lib/ghTrendScraper";
import { bulkInsertTrends } from "../lib/firestore";
import { isUpdateTime, shuffle } from "../lib/utils";
import { tweetRepository } from "../lib/twitter";
import * as admin from "firebase-admin";
import * as dayjs from "dayjs";

const twitterClient = new TwitterApi({
  appKey: functions.config().twitter.frontend_app_key,
  appSecret: functions.config().twitter.frontend_app_secret,
  accessToken: functions.config().twitter.frontend_access_token,
  accessSecret: functions.config().twitter.frontend_access_secret,
});

const db = admin.firestore();
const collectionRef = db.collection("v1").doc("trends").collection("frontend");

export const updateFrontendTrends = async (): Promise<void> => {
  const jsTrends = await GHTrendScraper.scraping("/javascript");
  const tsTrends = await GHTrendScraper.scraping("/typescript");
  await bulkInsertTrends(collectionRef, shuffle([...jsTrends, ...tsTrends]));
};

export const tweetFrontendTrends = async (): Promise<void> => {
  // update trends data at several times a day.
  if (isUpdateTime()) {
    await updateFrontendTrends();
    console.info("Update frontend repositories collections");
  }

  // tweet trends repository with a bot
  if (dayjs().minute() <= 30) {
    await tweetRepository(collectionRef, twitterClient);
  }
};
