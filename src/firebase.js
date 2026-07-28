import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBNqDWwc3sm3kGI_lIOf-gbk9pknlxdAUU",
  authDomain: "environmentalhealthinspection.firebaseapp.com",
  projectId: "environmentalhealthinspection",
  storageBucket: "environmentalhealthinspection.firebasestorage.app",
  messagingSenderId: "1073277314449",
  appId: "1:1073277314449:web:95d1037e4f14389eb4e630"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);