import * as functions from "firebase-functions";
import { tweetAllLanguagesTrends } from "../core/allLanguages";
import { tweetFrontendTrends } from "../core/frontend";
import { tweetPythonTrends } from "../core/python";
import { tweetRustTrends } from "../core/rust";

const runtimeOpts = {
  timeoutSeconds: 180,
  memory: "512MB" as const,
};

export const tweetTrend = functions
  .runWith(runtimeOpts)
  .pubsub.schedule("every 1 hours")
  .onRun(async (_context) => {
    try {
      await Promise.all([
        tweetAllLanguagesTrends(),
        tweetFrontendTrends(),
        tweetPythonTrends(),
        tweetRustTrends(),
      ]);
    } catch (e) {
      console.error(e);
    }
  });
