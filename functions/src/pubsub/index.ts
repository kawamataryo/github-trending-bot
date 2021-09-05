import * as functions from "firebase-functions";
import {GHTrendScraper} from "../lib/ghTrendScraper";
import {
  bulkInsertTrends,
  getTodaysUntweetedTrend,
  updateTweetedFlag,
} from "../lib/firestore";
import {shuffle} from "../lib/shuffle";
import {tweetFromTrend} from "../lib/twitter";
import {GHTrend} from "../types/types";
import * as admin from "firebase-admin";
import * as dayjs from "dayjs";
import TwitterApi from "twitter-api-v2";

const db = admin.firestore();

const tweetAllLanguagesTrends = async () => {
  const collectionRef = db.collection("v1").doc("trends").collection("all");
  const twitterClient = new TwitterApi({
    appKey: functions.config().twitter.app_key,
    appSecret: functions.config().twitter.app_secret,
    accessToken: functions.config().twitter.access_token,
    accessSecret: functions.config().twitter.access_secret,
  });

  // update trends data at midnight daily
  if (dayjs().hour() === 0) {
    const trends = await GHTrendScraper.scraping();
    await bulkInsertTrends(collectionRef, shuffle(trends));
  }

  // tweet trends repository with a bot
  const snapshot = await getTodaysUntweetedTrend(collectionRef);
  if (snapshot.empty) {
    console.log("No matching documents.");
    return;
  }
  for (const doc of snapshot.docs) {
    await tweetFromTrend(twitterClient, doc.data() as GHTrend);
    await updateTweetedFlag(doc, true);
  }
};

const tweetFrontendTrends = async () => {
  const collectionRef = db
      .collection("v1")
      .doc("trends")
      .collection("frontend");
  const twitterClient = new TwitterApi({
    appKey: functions.config().twitter.frontend_app_key,
    appSecret: functions.config().twitter.frontend_app_secret,
    accessToken: functions.config().twitter.frontend_access_token,
    accessSecret: functions.config().twitter.frontend_access_secret,
  });

  // update trends data at midnight daily
  if (dayjs().hour() === 0) {
    const jsTrends = await GHTrendScraper.scraping("/javascript");
    const tsTrends = await GHTrendScraper.scraping("/typescript");
    await bulkInsertTrends(collectionRef, shuffle([...jsTrends, ...tsTrends]));
  }

  // tweet trends repository with a bot
  const snapshot = await getTodaysUntweetedTrend(collectionRef);
  if (snapshot.empty) {
    console.log("No matching documents.");
    return;
  }
  for (const doc of snapshot.docs) {
    await tweetFromTrend(twitterClient, doc.data() as GHTrend);
    await updateTweetedFlag(doc, true);
  }
};

export const tweetTrend = functions.pubsub
    .schedule("every 30 minutes")
    .onRun(async (_context) => {
      try {
        await tweetAllLanguagesTrends();
        await tweetFrontendTrends();
      } catch (e) {
        console.log(e)
      }
    });
