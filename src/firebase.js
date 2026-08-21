import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBwEG5_F3P7XNmB1xrhQ_Ol2C21m6KNywk",
  authDomain: "environmentalhealthinspection.firebaseapp.com",
  projectId: "environmentalhealthinspection",
  storageBucket: "environmentalhealthinspection.firebasestorage.app",
  messagingSenderId: "1073277314449",
  appId: "1:1073277314449:web:e753e0c213ff8574b4e630"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
