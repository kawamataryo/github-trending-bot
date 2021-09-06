import TwitterApi from "twitter-api-v2";
import {GHTrend} from "../types/types";
import {getUntweetedTrend, updateTweetedFlag} from "./firestore";

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
