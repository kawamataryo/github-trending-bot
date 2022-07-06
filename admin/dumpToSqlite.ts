import serviceAccount from "../service-account.json";
import * as admin from "firebase-admin";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type Trend = {
  id: string;
  description: string;
  starCount: string;
  ownersTwitterAccount: string;
  createdAt: number;
  tweeted: boolean;
  todayStarCount: string;
  repository: string;
  url: string;
  language: string;
  forkCount: string;
  owner: string;
};

const toNumber = (maybeNumber?: string): number => {
  if (!maybeNumber) return 0;
  const removed = maybeNumber.replace(/,/g, "").replace(/\s/g, "");
  return parseInt(removed, 10);
};

type CollectionName = "all" | "frontend" | "python" | "rust";

const initializeData = () => {
  prisma.trend_log.deleteMany({});
  prisma.repository.deleteMany({});
  prisma.owner.deleteMany({});
  prisma.language.deleteMany({});
};

const selectOrCreateOwner = async (params: {
  name: string;
  twitterAccount?: string;
}) => {
  const result = await prisma.owner.findUnique({ where: { name: params.name } });
  if (result) {
    return result;
  }
  return await prisma.owner.create({
    data: {
      name: params.name,
      twitter_account: params.twitterAccount,
    },
  });
};

const selectOrCreateLanguage = async (name: string) => {
  const result = await prisma.language.findUnique({ where: { name } });
  if (result) {
    return result;
  }
  return await prisma.language.create({ data: { name } });
};

const selectOrCreateRepository = async (params: {
  name: string;
  description: string;
  url: string;
  ownerId: number;
  languageId: number;
}) => {
  const result = await prisma.repository.findUnique({
    where: { url: params.url },
  });
  if (result) {
    return result;
  }
  return await prisma.repository.create({
    data: {
      name: params.name,
      description: params.description,
      url: params.url,
      owner_id: params.ownerId,
      language_id: params.languageId,
    },
  });
};

const createTrendLog = async (params: {
  repositoryId: number;
  starCount: number;
  forkCount: number;
  todayStarCount: number;
  timestamp: number;
}) => {
  return await prisma.trend_log.create({
    data: {
      repository_id: params.repositoryId,
      star_count: params.starCount,
      fork_count: params.forkCount,
      created_unix_time: params.timestamp,
      today_star_count: params.todayStarCount,
    },
  });
};

const dumpDataFromFirestore = async (db: admin.firestore.Firestore) => {
  const collectionRef = db.collection("v1").doc("trends").collection("all");

  const snapshot = await collectionRef.get();
  if (snapshot.empty) {
    console.log("No matching documents.");
    return;
  }

  const documents: Trend[] = [];
  snapshot.forEach((doc) => {
    documents.push({
      id: doc.id,
      ...doc.data(),
    } as Trend);
  });

  for (const d of documents) {
    const owner = await selectOrCreateOwner({
      name: d.owner,
      twitterAccount: d.ownersTwitterAccount,
    });
    const language = await selectOrCreateLanguage(d.language || "");
    const repository = await selectOrCreateRepository({
      name: d.repository,
      description: d.description,
      ownerId: owner.id,
      languageId: language.id,
      url: d.url,
    });
    await createTrendLog({
      repositoryId: repository.id,
      starCount: toNumber(d.starCount),
      forkCount: toNumber(d.forkCount),
      todayStarCount: toNumber(d.todayStarCount),
      timestamp: d.createdAt,
    });
  }
};

const main = async () => {
  initializeData();

  const app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  const db = app.firestore();

  dumpDataFromFirestore(db);
};

try {
  main();
} finally {
  prisma.$disconnect();
}
