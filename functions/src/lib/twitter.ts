import TwitterApi from "twitter-api-v2";
import * as functions from "firebase-functions";
import {GHTrend} from "../types/types";

const twitterClient = new TwitterApi({
  appKey: functions.config().twitter.app_key,
  appSecret: functions.config().twitter.app_secret,
  accessToken: functions.config().twitter.access_token,
  accessSecret: functions.config().twitter.access_secret,
});

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

export const tweetFromTrend = async (trend: GHTrend): Promise<void> => {
  await twitterClient.v1.tweet(createTweetText(trend));
};
