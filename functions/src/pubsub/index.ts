import * as functions from "firebase-functions";
import { tweetAllLanguagesTrends } from "../core/allLanguages";
import { tweetFrontendTrends } from "../core/frontend";

const runtimeOpts = {
  timeoutSeconds: 300,
  memory: "512MB" as const,
};

export const tweetTrend = functions
  .runWith(runtimeOpts)
  .pubsub.schedule("every 30 minutes")
  .onRun(async (_context) => {
    try {
      await Promise.all([tweetAllLanguagesTrends(), tweetFrontendTrends()]);
    } catch (e) {
      console.error(e);
    }
  });
