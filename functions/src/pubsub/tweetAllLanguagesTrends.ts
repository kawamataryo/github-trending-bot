import TwitterApi from "twitter-api-v2";
import * as functions from "firebase-functions";
import {GHTrendScraper} from "../lib/ghTrendScraper";
import {bulkInsertTrends} from "../lib/firestore";
import {shuffle} from "../lib/shuffle";
import {isUpdateTime, tweetRepository} from "./utils";

const twitterClient = new TwitterApi({
  appKey: functions.config().twitter.app_key,
  appSecret: functions.config().twitter.app_secret,
  accessToken: functions.config().twitter.access_token,
  accessSecret: functions.config().twitter.access_secret,
});

export const tweetAllLanguagesTrends = async (
    db: FirebaseFirestore.Firestore
): Promise<void> => {
  const collectionRef = db.collection("v1").doc("trends").collection("all");

  // update trends data at several times a day.
  if (isUpdateTime()) {
    const trends = await GHTrendScraper.scraping();
    await bulkInsertTrends(collectionRef, shuffle(trends));
    console.info("Update all repositories collections");
  }

  // tweet trends repository with a bot
  await tweetRepository(collectionRef, twitterClient);
};
