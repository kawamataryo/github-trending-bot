import { initializeApp }  from "firebase/app";
import { getFunctions, httpsCallable } from "firebase/functions";
import * as dotenv from "dotenv";
dotenv.config();


const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MESSAGE_SENDER_ID,
  appId: process.env.APP_ID,
};

const app = initializeApp(firebaseConfig);

(async () => {
  const functions = getFunctions(app);
  const scrappingGitHubTrends = httpsCallable(functions, "scrappingGitHubTrends")
  try {
    const result = await scrappingGitHubTrends({data: {}})
    console.log(result);
  } catch (e) {
    console.error(e)
  }
})()
