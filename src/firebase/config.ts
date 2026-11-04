import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";
import { ENV } from "varlock/env";

const requiredConfig = {
	appId: ENV.VITE_FIREBASE_APP_ID || import.meta.env.VITE_FIREBASE_APP_ID,
	apiKey: ENV.VITE_FIREBASE_API_KEY || import.meta.env.VITE_FIREBASE_API_KEY,
	projectId: ENV.VITE_FIREBASE_PROJECT_ID || import.meta.env.VITE_FIREBASE_PROJECT_ID,
	authDomain: ENV.VITE_FIREBASE_AUTH_DOMAIN || import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
	storageBucket: ENV.VITE_FIREBASE_STORAGE_BUCKET || import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: ENV.VITE_FIREBASE_MESSAGING_SENDER_ID || import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
};

const missing = Object.entries(requiredConfig)
	.filter(([, value]) => !value || value.trim().length === 0)
	.map(([key]) => key);

if (missing.length > 0) {
	const message = `[Varlock] Missing required Firebase environment variables: ${missing.join(", ")}. The application cannot start without valid configuration.`;
	console.error(message);
	throw new Error(message);
}

export const app = initializeApp(requiredConfig);

export const auth = getAuth(app);

export const db = initializeFirestore(app, {
	localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
});
