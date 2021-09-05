import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {tweetAllLanguagesTrends} from "./tweetAllLanguagesTrends";
import {tweetFrontendTrends} from "./tweetFrontendTrends";

const db = admin.firestore();

export const tweetTrend = functions.pubsub
    .schedule("every 30 minutes")
    .onRun(async (_context) => {
      try {
        await tweetAllLanguagesTrends(db);
        await tweetFrontendTrends(db);
      } catch (e) {
        console.error(e);
      }
    });
