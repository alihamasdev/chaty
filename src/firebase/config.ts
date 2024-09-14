import { getAuth } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const config = {
	appId: import.meta.env.VITE_FIREBASE_APP_ID,
	apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
	projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
	authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
	storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID
};

export const app = initializeApp(config);
export const db = getFirestore(app);
export const auth = getAuth(app);
