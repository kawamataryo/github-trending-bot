import * as dayjs from "dayjs";
import {GHTrend} from "../types/types";

const getTrendDataWithinOneWeek = async (
    collectionRef: FirebaseFirestore.CollectionReference
): Promise<GHTrend[]> => {
  const oneWeekAgo = dayjs().add(-7, "day").unix();
  const querySnapshotFromOneWeekAgo = await collectionRef
      .where("createdAt", ">=", oneWeekAgo)
      .get();
  return querySnapshotFromOneWeekAgo.docs.map((doc) => doc.data() as GHTrend);
};

export const bulkInsertTrends = async (
    collectionRef: FirebaseFirestore.CollectionReference,
    trends: GHTrend[]
): Promise<void> => {
  const trendsFromOneWeekAgo = await getTrendDataWithinOneWeek(collectionRef);

  await Promise.all(
      trends.map(async (trend) => {
      // exclude repositories submitted within a week.
        if (trendsFromOneWeekAgo.some((d) => d.url === trend.url)) {
          return Promise.resolve();
        }
        return await collectionRef.add({
          ...trend,
          createdDate: dayjs().format("YYYY-MM-DD"),
          createdAt: dayjs().unix(),
          tweeted: false,
        });
      })
  );
};

export const getTodaysUntweetedTrend = async (
    collectionRef: FirebaseFirestore.CollectionReference
): Promise<FirebaseFirestore.QuerySnapshot> => {
  const today = dayjs().format("YYYY-MM-DD");
  return await collectionRef
      .where("createdDate", "==", today)
      .where("tweeted", "==", false)
      .limit(1)
      .get();
};

export const updateTweetedFlag = async (
    document: FirebaseFirestore.QueryDocumentSnapshot,
    tweeted: boolean
): Promise<void> => {
  await document.ref.update({tweeted});
};
