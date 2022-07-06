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
} from "./repositories/prisma";
import { toNumber } from "./lib/toNumber";
import { getDocuments } from "./repositories/firestore";

const dumpDataToSqliteFromFirestore = async (
  db: admin.firestore.Firestore,
  client: PrismaClient
) => {
  const documents = await getDocuments(db, "all");

  for (const d of documents) {
    if (
      await isExistTrendLog(client, {
        id: d.id,
      })
    ) {
      continue;
    }

    const owner = await selectOrCreateOwner(client, {
      name: d.owner,
      twitterAccount: d.ownersTwitterAccount,
    });
    const language = await selectOrCreateLanguage(client, {
      name: d.language || "",
    });
    const repository = await selectOrCreateRepository(client, {
      name: d.repository,
      description: d.description,
      ownerId: owner.id,
      languageId: language.id,
      url: d.url,
    });
    await createTrendLog(client, {
      id: d.id,
      repositoryId: repository.id,
      starCount: toNumber(d.starCount),
      forkCount: toNumber(d.forkCount),
      todayStarCount: toNumber(d.todayStarCount),
      timestamp: d.createdAt,
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
    initializeData(client);
    dumpDataToSqliteFromFirestore(db, client);
  } finally {
    client.$disconnect();
  }
};

main();
