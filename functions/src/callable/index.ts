import * as functions from "firebase-functions";
import {
  tweetAllLanguagesTrends,
  updateAllLanguagesTrends,
} from "../core/allLanguages";
import { tweetFrontendTrends, updateFrontendTrends } from "../core/frontend";
import { tweetPythonTrends, updatePythonTrends } from "../core/python";
import { tweetRustTrends, updateRustTrends } from "../core/rust";

const runtimeOpts = {
  timeoutSeconds: 180,
  memory: "512MB" as const,
};

export const scrappingGitHubTrends = functions
  .runWith(runtimeOpts)
  .https.onRequest(async (_req, res) => {
    const errorHandler = (e: unknown, type: string) => {
      console.error(`${type} tweet scrapping error`);
      console.error(e);
    };

    // NOTE: Run in series to prevent stop in case of rejects
    await updateAllLanguagesTrends().catch((e) =>
      errorHandler(e, "All languages")
    );
    await updateFrontendTrends().catch((e) => errorHandler(e, "JS & TS"));
    await updatePythonTrends().catch((e) => errorHandler(e, "Python"));
    await updateRustTrends().catch((e) => errorHandler(e, "Rust"));

    res.send("success");
  });

export const tweetGitHubTrends = functions
  .runWith(runtimeOpts)
  .https.onRequest(async (_req, res) => {
    const errorHandler = (e: unknown, type: string) => {
      console.error(`${type} tweet error`);
      console.error(e);
    };

    // NOTE: Run in series to prevent stop in case of rejects
    await tweetAllLanguagesTrends().catch((e) =>
      errorHandler(e, "All languages")
    );
    await tweetFrontendTrends().catch((e) => errorHandler(e, "JS & TS"));
    await tweetPythonTrends().catch((e) => errorHandler(e, "Python"));
    await tweetRustTrends().catch((e) => errorHandler(e, "Rust"));

    res.send("success");
  });
