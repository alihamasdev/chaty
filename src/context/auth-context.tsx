import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { createContext, useContext, useState, useEffect } from "react";

import { auth, db } from "@/firebase/config";

export type User = {
	uid: string;
	photoURL: string | null;
	displayName: string | null;
};

type Auth = {
	user: User | null;
	logoutUser: () => void;
	googleLogin: () => void;
};

const AuthContext = createContext<Auth>({
	user: null,
	logoutUser: () => {},
	googleLogin: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [loading, setLoading] = useState(true);
	const [user, setUser] = useState<User | null>(null);

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (isUser) => {
			if (isUser) {
				const { photoURL, uid, displayName } = isUser;
				const userData: User = {
					uid,
					displayName: displayName || "Anonymous",
					photoURL: photoURL || null,
				};
				setUser(userData);

				// Sync normalized user profile to Firestore /users/{uid}
				setDoc(
					doc(db, "users", uid),
					{
						uid,
						displayName: userData.displayName,
						photoURL: userData.photoURL,
						updatedAt: Date.now(),
					},
					{ merge: true },
				).catch((err) => {
					console.error("Failed to sync user profile to Firestore:", err);
				});
			} else {
				setUser(null);
			}
			setLoading(false);
		});

		return () => unsubscribe();
	}, []);

	const googleLogin = async () => {
		const googleProvider = new GoogleAuthProvider();
		await signInWithPopup(auth, googleProvider);
	};

	const logoutUser = async () => {
		await signOut(auth);
		setUser(null);
	};

	const contextValue = { user, googleLogin, logoutUser };

	return (
		<AuthContext.Provider value={contextValue}>
			{loading ? (
				<div className="flex h-dvh w-full items-center justify-center">
					<img src="/logo.png" className="size-20" />
				</div>
			) : (
				children
			)}
		</AuthContext.Provider>
	);
}

export const useAuth = (): Auth => {
	return useContext(AuthContext);
};
