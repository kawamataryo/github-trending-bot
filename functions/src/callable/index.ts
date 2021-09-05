import * as functions from "firebase-functions";
import {GHTrendScraper} from "../lib/ghTrendScraper";
import {bulkInsertTrends} from "../lib/firestore";
import {shuffle} from "../lib/shuffle";
import * as admin from "firebase-admin";

const db = admin.firestore();

export const scrappingGitHubTrends = functions.https.onRequest(
    async (_req, res) => {
    // All Languages
      const allLanguagesCollectionRef = db
          .collection("v1")
          .doc("trends")
          .collection("all");
      const trends = await GHTrendScraper.scraping();
      await bulkInsertTrends(allLanguagesCollectionRef, shuffle(trends));

      // JavaScript and TypeScript
      const jsAndTsCollectionRef = db
          .collection("v1")
          .doc("trends")
          .collection("frontend");
      const jsTrends = await GHTrendScraper.scraping("/javascript");
      const tsTrends = await GHTrendScraper.scraping("/typescript");
      await bulkInsertTrends(
          jsAndTsCollectionRef,
          shuffle([...jsTrends, ...tsTrends])
      );

      res.send("ok");
    }
);
