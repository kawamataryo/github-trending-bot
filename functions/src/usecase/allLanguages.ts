import TwitterApi from "twitter-api-v2";
import * as functions from "firebase-functions";
import {GHTrendScraper} from "../lib/ghTrendScraper";
import {bulkInsertTrends} from "../lib/firestore";
import {isUpdateTime, shuffle} from "../lib/utils";
import {tweetRepository} from "../lib/twitter";
import * as admin from "firebase-admin";

const twitterClient = new TwitterApi({
  appKey: functions.config().twitter.app_key,
  appSecret: functions.config().twitter.app_secret,
  accessToken: functions.config().twitter.access_token,
  accessSecret: functions.config().twitter.access_secret,
});

const db = admin.firestore();
const collectionRef = db.collection("v1").doc("trends").collection("all");

export const updateAllLanguagesTrends = async (): Promise<void> => {
  const trends = await GHTrendScraper.scraping();
  await bulkInsertTrends(collectionRef, shuffle(trends));
};

export const tweetAllLanguagesTrends = async (): Promise<void> => {
  // update trends data at several times a day.
  if (isUpdateTime()) {
    await updateAllLanguagesTrends();
    console.info("Update all repositories collections");
  }

  // tweet trends repository with a bot
  await tweetRepository(collectionRef, twitterClient);
};
