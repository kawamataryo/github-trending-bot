import * as functions from "firebase-functions";
import { tweetAllLanguagesTrends } from "../usecase/allLanguages";
import { tweetFrontendTrends } from "../usecase/frontend";

export const tweetTrend = functions.pubsub
  .schedule("every 30 minutes")
  .onRun(async (_context) => {
    try {
      await tweetAllLanguagesTrends();
      await tweetFrontendTrends();
    } catch (e) {
      console.error(e);
    }
  });
