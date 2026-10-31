import { onAuthStateChanged } from "firebase/auth";
import { signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { createContext, useContext, useState, useEffect } from "react";

import { auth } from "@/firebase/config";

export type User = {
	uid: string;
	photoURL: string;
	displayName: string;
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
				const { photoURL, uid, displayName } = isUser as User;
				setUser({ photoURL, uid, displayName });
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
