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

const selectOrCreateOwner = async (args: {
  name: string;
  twitterAccount?: string;
}) => {
  const result = await prisma.owner.findUnique({ where: { name: args.name } });
  if (result) {
    return result;
  }
  return await prisma.owner.create({
    data: {
      name: args.name,
      twitter_account: args.twitterAccount,
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

const selectOrCreateRepository = async (args: {
  name: string;
  description: string;
  url: string;
  ownerId: number;
  languageId: number;
}) => {
  const result = await prisma.repository.findUnique({
    where: { url: args.url },
  });
  if (result) {
    return result;
  }
  return await prisma.repository.create({
    data: {
      name: args.name,
      description: args.description,
      url: args.url,
      owner_id: args.ownerId,
      language_id: args.languageId,
    },
  });
};

const createTrendLog = async (args: {
  repositoryId: number;
  starCount: number;
  forkCount: number;
  todayStarCount: number;
  timestamp: number;
}) => {
  return await prisma.trend_log.create({
    data: {
      repository_id: args.repositoryId,
      star_count: args.starCount,
      fork_count: args.forkCount,
      created_unix_time: args.timestamp,
      today_star_count: args.todayStarCount,
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
