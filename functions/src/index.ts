import * as functions from "firebase-functions";
import {GHTrendScraper} from "./lib/ghTrendScraper";
import * as admin from "firebase-admin";
import {tweetFromTrend} from "./lib/twitter";
import {
  bulkInsertTrends,
  getTodaysUntweetedTrend,
  updateTweetedFlag,
} from "./lib/firestore";
import {GHTrend} from "./types/types";
import dayjs = require("dayjs");
import {shuffle} from "./lib/shuffle";

admin.initializeApp();
const db = admin.firestore();

export const tweetTrend = functions.pubsub
    .schedule("every 30 minutes")
    .onRun(async (_context) => {
      const collectionRef = db.collection("v1").doc("trends").collection("all");

      // update trends data at midnight daily
      if (dayjs().hour() === 0) {
        const trends = await new GHTrendScraper().scrapping();
        await bulkInsertTrends(collectionRef, shuffle(trends));
      }

      // tweet trends repository with a bot
      const snapshot = await getTodaysUntweetedTrend(collectionRef);
      if (snapshot.empty) {
        console.log("No matching documents.");
        return;
      }
      for (const doc of snapshot.docs) {
        await tweetFromTrend(doc.data() as GHTrend);
        await updateTweetedFlag(doc, true);
      }
      return;
    });

export const scrappingGitHubTrends = functions.https.onRequest(
    async (_req, res) => {
      const collectionRef = db.collection("v1").doc("trends").collection("all");
      const trends = await new GHTrendScraper().scrapping();
      await bulkInsertTrends(collectionRef, shuffle(trends));

      res.send(`${trends.length} trends repositories inserted.`);
    }
);
