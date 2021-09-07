import * as functions from "firebase-functions";
import {
  tweetAllLanguagesTrends,
  updateAllLanguagesTrends,
} from "../core/allLanguages";
import { tweetFrontendTrends, updateFrontendTrends } from "../core/frontend";

export const scrappingGitHubTrends = functions.https.onRequest(
  async (_req, res) => {
    try {
      await Promise.all([updateAllLanguagesTrends(), updateFrontendTrends()]);
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
      await Promise.all([tweetAllLanguagesTrends(), tweetFrontendTrends()]);
    } catch (e) {
      console.error(e);
      res.send(`error: ${JSON.stringify(e)}`);
      return;
    }
    res.send("success");
  }
);
