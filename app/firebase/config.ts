import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDjqnP1HKZBmlBrrkS36ypGuCDUFAVV9qQ",
  authDomain: "academia-mallone.firebaseapp.com",
  projectId: "academia-mallone",
  storageBucket: "academia-mallone.appspot.com",
  messagingSenderId: "186104935962",
  appId: "1:186104935962:web:b03070ea281b4bdd6d43a3",
  measurementId: "G-532FLG7M21",
};

const app = initializeApp(firebaseConfig);

export const googleProvider = new GoogleAuthProvider();
export const auth = getAuth(app);
export const db = getFirestore(app);

const training: any = import.meta.env.PROD ? "TRAINING__PRODUCTION" : "TRAINING";
const trainingS: any = import.meta.env.PROD ? "TRAINING_SESSION__PRODUCTION" : "TRAINING_SESSION";

export enum Collections {
  TRAINING = training,
  TRAINING_SESSION = trainingS
}
