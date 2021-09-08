import TwitterApi from "twitter-api-v2";
import * as functions from "firebase-functions";
import { GHTrendScraper } from "../lib/ghTrendScraper";
import { bulkInsertTrends } from "../lib/firestore";
import { isUpdateTime, shuffle } from "../lib/utils";
import { tweetRepository } from "../lib/twitter";
import * as admin from "firebase-admin";
import * as dayjs from "dayjs";

const twitterClient = new TwitterApi({
  appKey: functions.config().twitter.python_app_key,
  appSecret: functions.config().twitter.python_app_secret,
  accessToken: functions.config().twitter.python_access_token,
  accessSecret: functions.config().twitter.python_access_secret,
});

const db = admin.firestore();
const collectionRef = db.collection("v1").doc("trends").collection("python");

export const updatePythonTrends = async (): Promise<void> => {
  const trends = await GHTrendScraper.scraping("/python");
  await bulkInsertTrends(collectionRef, shuffle(trends));
};

export const tweetPythonTrends = async (): Promise<void> => {
  // update trends data at several times a day.
  if (isUpdateTime()) {
    await updatePythonTrends();
    console.info("Update frontend repositories collections");
  }

  if (dayjs().minute() <= 30) {
    // tweet trends repository with a bot
    await tweetRepository(collectionRef, twitterClient);
  }
};
