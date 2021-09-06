import TwitterApi from "twitter-api-v2";
import {GHTrend} from "../types/types";

const truncateText = (description: string, maxLength: number) => {
  return description.length > maxLength ?
    description.substr(0, maxLength) + "..." :
    description;
};

const createTweetText = (trend: GHTrend): string => {
  return `
📦 ${trend.repository}${
    trend.ownersTwitterAccount ? `\n👤 ${trend.ownersTwitterAccount}` : ""
}
⭐ ${trend.starCount} (+${trend.todayStarCount})
🗒 ${trend.language}
${trend.description ? `\n${truncateText(trend.description, 85)}\n` : ""}
${trend.url}
`.trim();
};

export const tweetFromTrend = async (
    client: TwitterApi,
    trend: GHTrend
): Promise<void> => {
  await client.v1.tweet(createTweetText(trend));
};
