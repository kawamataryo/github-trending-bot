import * as functions from "firebase-functions";
import {
  tweetAllLanguagesTrends,
  updateAllLanguagesTrends,
} from "../usecase/allLanguages";
import {tweetFrontendTrends, updateFrontendTrends} from "../usecase/frontend";

export const scrappingGitHubTrends = functions.https.onRequest(
    async (_req, res) => {
      try {
        await updateAllLanguagesTrends();
        await updateFrontendTrends();
      } catch (e) {
        console.error(e);
        res.send(`error: ${JSON.stringify(e)}`);
        return;
      }
      res.send("success");
    }
);

export const tweetGitHubTrends = functions.https.onRequest(
    async (_req, res) => {
      try {
        await tweetAllLanguagesTrends();
        await tweetFrontendTrends();
      } catch (e) {
        console.error(e);
        res.send(`error: ${JSON.stringify(e)}`);
        return;
      }
      res.send("success");
    }
);
