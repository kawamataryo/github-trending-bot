import TwitterApi from "twitter-api-v2";
import { GHTrend } from "../types/types";
import { getUntweetedTrend, updateTweetedFlag } from "./firestore";

const truncateText = (text: string, maxLength: number) => {
  return text.length > maxLength ? text.substr(0, maxLength) + "..." : text;
};

export const createTweetText = (trend: GHTrend): string => {
  const contentText = `
📦 ${trend.repository}${
    trend.ownersTwitterAccount ? `\n👤 ${trend.ownersTwitterAccount}` : ""
  }
⭐ ${trend.starCount} (+${trend.todayStarCount})${
    trend.language ? `\n🗒 ${trend.language}` : ""
  }
${trend.description ? `\n${trend.description}` : ""}
`.trim();

  // The url will be a 30-character shortened URL, so the content will be truncate to 105 characters.
  return truncateText(contentText, 103) + `\n${trend.url}`;
};

const tweetFromTrend = async (
  client: TwitterApi,
  trend: GHTrend
): Promise<void> => {
  await client.v1.tweet(createTweetText(trend));
};

export const tweetRepository = async (
  collectionRef: FirebaseFirestore.CollectionReference,
  twitterClient: TwitterApi
): Promise<void> => {
  const snapshot = await getUntweetedTrend(collectionRef);
  if (snapshot.empty) {
    console.log("No matching documents.");
    return;
  }
  for (const doc of snapshot.docs) {
    await tweetFromTrend(twitterClient, doc.data() as GHTrend);
    await updateTweetedFlag(doc, true);
  }
};
