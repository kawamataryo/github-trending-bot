import * as functions from "firebase-functions";
import { tweetAllLanguagesTrends } from "../core/allLanguages";
import { tweetFrontendTrends } from "../core/frontend";

export const tweetTrend = functions.pubsub
  .schedule("every 30 minutes")
  .onRun(async (_context) => {
    try {
      await Promise.all([tweetAllLanguagesTrends(), tweetFrontendTrends()]);
    } catch (e) {
      console.error(e);
    }
  });
