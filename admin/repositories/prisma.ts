import { PrismaClient } from "@prisma/client";

export const initializeData = (client: PrismaClient) => {
  client.trend_log.deleteMany({});
  client.repository.deleteMany({});
  client.owner.deleteMany({});
  client.language.deleteMany({});
};

export const selectOrCreateOwner = async (
  client: PrismaClient,
  params: {
    name: string;
    twitterAccount?: string;
  }
) => {
  const result = await client.owner.findUnique({
    where: { name: params.name },
  });
  if (result) {
    return result;
  }

  return await client.owner.create({
    data: {
      name: params.name,
      twitter_account: params.twitterAccount,
    },
  });
};

export const selectOrCreateLanguage = async (
  client: PrismaClient,
  params: { name: string }
) => {
  const result = await client.language.findUnique({
    where: { name: params.name },
  });
  if (result) {
    return result;
  }

  return await client.language.create({ data: { name: params.name } });
};

export const selectOrCreateRepository = async (
  client: PrismaClient,
  params: {
    name: string;
    description: string;
    url: string;
    ownerId: number;
  }
) => {
  const result = await client.repository.findUnique({
    where: { url: params.url },
  });
  if (result) {
    return result;
  }

  return await client.repository.create({
    data: {
      name: params.name,
      description: params.description,
      url: params.url,
      owner_id: params.ownerId,
    },
  });
};

export const selectOrCreateTrendType = async (
  client: PrismaClient,
  params: {
    name: string;
  }
) => {
  const result = await client.trend_type.findUnique({
    where: { name: params.name },
  });
  if (result) {
    return result;
  }

  return await client.trend_type.create({
    data: {
      name: params.name,
    },
  });
};

export const isExistTrendLog = async (
  client: PrismaClient,
  params: {
    id: string;
  }
) => {
  const count = await client.trend_log.count({
    where: {
      id: params.id,
    },
  });
  if (count !== 0) {
    return true;
  }

  return false;
};

export const createTrendLog = async (
  client: PrismaClient,
  params: {
    id: string;
    repositoryId: number;
    starCount: number;
    forkCount: number;
    todayStarCount: number;
    timestamp: number;
    trendTypeId: number;
    languageId: number
  }
) => {
  return await client.trend_log.create({
    data: {
      id: params.id,
      repository_id: params.repositoryId,
      star_count: params.starCount,
      fork_count: params.forkCount,
      created_unix_time: params.timestamp,
      today_star_count: params.todayStarCount,
      trend_type_id: params.trendTypeId,
      language_id: params.languageId,
    },
  });
};
