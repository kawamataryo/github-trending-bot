import { Firestore } from "@google-cloud/firestore";

export const getDocuments = async (db: Firestore, collectionName: string) => {
  const collectionRef = db
    .collection("v1")
    .doc("trends")
    .collection(collectionName);

  const snapshot = await collectionRef.get();
  if (snapshot.empty) {
    console.info("No matching documents.");
    return [];
  }

  const documents: Trend[] = [];
  snapshot.forEach((doc) => {
    documents.push({
      ...doc.data(),
      id: doc.id,
    } as Trend);
  });

  return documents;
};
