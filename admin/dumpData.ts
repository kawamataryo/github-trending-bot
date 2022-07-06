import serviceAccount from "../service-account.json";
import * as admin from "firebase-admin";

import { PrismaClient } from "@prisma/client";
import {
  createTrendLog,
  initializeData,
  isExistTrendLog,
  selectOrCreateLanguage,
  selectOrCreateOwner,
  selectOrCreateRepository,
  selectOrCreateTrendType,
} from "./repositories/prisma";
import { toNumber } from "./lib/toNumber";
import { getDocuments } from "./repositories/firestore";
import { TREND_TYPE_LIST } from "./lib/constants";

const dumpDataToSqlite = async (
  documents: Trend[],
  client: PrismaClient,
  trendType: TrendType
) => {

  for (const d of documents) {
    if (
      await isExistTrendLog(client, {
        id: d.id,
      })
    ) {
      continue;
    }

    const trendTypeResult = await selectOrCreateTrendType(client, {
      name: trendType,
    });
    const ownerResult = await selectOrCreateOwner(client, {
      name: d.owner,
      twitterAccount: d.ownersTwitterAccount,
    });
    const languageResult = await selectOrCreateLanguage(client, {
      name: d.language || "",
    });
    const repositoryResult = await selectOrCreateRepository(client, {
      name: d.repository,
      description: d.description,
      ownerId: ownerResult.id,
      url: d.url,
    });
    await createTrendLog(client, {
      id: d.id,
      repositoryId: repositoryResult.id,
      starCount: toNumber(d.starCount),
      forkCount: toNumber(d.forkCount),
      todayStarCount: toNumber(d.todayStarCount),
      timestamp: d.createdAt,
      trendTypeId: trendTypeResult.id,
      languageId: languageResult.id,
    });
  }
};

const main = async () => {
  const app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  const db = app.firestore();

  const client = new PrismaClient();

  try {
    for (const trendType of TREND_TYPE_LIST) {
      console.log(`get ${trendType} documents from firestore...`);
      const documents = await getDocuments(db, trendType);

      console.log(`dump ${documents.length} documents to sqlite...`);
      await dumpDataToSqlite(documents, client, trendType as TrendType);
    }
    console.log("\ncompleted ✨");
  } finally {
    client.$disconnect();
  }
};

main();
