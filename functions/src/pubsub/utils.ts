import {getTodaysUntweetedTrend, updateTweetedFlag} from "../lib/firestore";
import {tweetFromTrend} from "../lib/twitter";
import {GHTrend} from "../types/types";
import TwitterApi from "twitter-api-v2";
import * as dayjs from "dayjs";

export const tweetRepository = async (
    collectionRef: FirebaseFirestore.CollectionReference,
    twitterClient: TwitterApi
): Promise<void> => {
  const snapshot = await getTodaysUntweetedTrend(collectionRef);
  if (snapshot.empty) {
    console.log("No matching documents.");
    return;
  }
  for (const doc of snapshot.docs) {
    await tweetFromTrend(twitterClient, doc.data() as GHTrend);
    await updateTweetedFlag(doc, true);
  }
};

export const isUpdateTime = (): boolean => {
  const datetime = dayjs();
  return [0, 6, 12, 18].includes(datetime.hour()) && datetime.minute() <= 30;
};
