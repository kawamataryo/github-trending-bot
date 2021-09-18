import TwitterApi from "twitter-api-v2";
import * as functions from "firebase-functions";
import { GHTrendScraper } from "../lib/ghTrendScraper";
import { bulkInsertTrends } from "../lib/firestore";
import { isUpdateTime, shuffle } from "../lib/utils";
import { tweetRepository } from "../lib/twitter";
import * as admin from "firebase-admin";

const twitterClient = new TwitterApi({
  appKey: functions.config().twitter.ruby_app_key,
  appSecret: functions.config().twitter.ruby_app_secret,
  accessToken: functions.config().twitter.ruby_access_token,
  accessSecret: functions.config().twitter.ruby_access_secret,
});

const db = admin.firestore();
const collectionRef = db.collection("v1").doc("trends").collection("ruby");

export const updateRubyTrends = async (): Promise<void> => {
  const trends = await GHTrendScraper.scraping("/ruby");
  await bulkInsertTrends(collectionRef, shuffle(trends));
};

export const tweetRubyTrends = async (): Promise<void> => {
  // update trends data at several times a day.
  if (isUpdateTime()) {
    await updateRubyTrends();
    console.info("Update ruby repositories collections");
  }

  // tweet trends repository with a bot
  await tweetRepository(collectionRef, twitterClient);
};
