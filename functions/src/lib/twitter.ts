import TwitterApi from "twitter-api-v2";
import {GHTrend} from "../types/types";

const truncateText = (description: string, maxLength: number) => {
  return description.length > maxLength ?
    description.substr(0, maxLength) + "..." :
    description;
};

const createTweetText = (trend: GHTrend): string => {
  return `
📦 ${trend.owner}/${trend.repository}
⭐ ${trend.starCount} (＋${trend.todayStarCount})
🗒 ${trend.language}
${trend.description ? `\n${truncateText(trend.description, 100)}\n` : ""}
${trend.url}
`.trim();
};

export const tweetFromTrend = async (
    client: TwitterApi,
    trend: GHTrend
): Promise<void> => {
  await client.v1.tweet(createTweetText(trend));
};
