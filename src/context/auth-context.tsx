import { type ReactNode } from "react";
import { auth } from "../firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { createContext, useContext, useState, useEffect } from "react";
import { signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";

export interface User {
	uid: string;
	photoURL: string;
	displayName: string;
}

interface Auth {
	user: User | null;
	logoutUser: () => void;
	googleLogin: () => void;
}

const AuthContext = createContext<Auth>({
	user: null,
	logoutUser: () => {},
	googleLogin: () => {}
});

export function AuthProvider({ children }: { children: ReactNode }) {
	const [loading, setLoading] = useState(true);
	const [user, setUser] = useState<User | null>(null);

	useEffect(() => {
		getUser();
	}, []);

	const getUser = async () => {
		onAuthStateChanged(auth, (isUser) => {
			if (isUser) {
				const { photoURL, uid, displayName } = isUser as User;
				setUser({ photoURL, uid, displayName });
				setLoading(false);
			} else {
				setUser(null);
				setLoading(false);
			}
		});
	};

	const googleLogin = async () => {
		const googleProvider = new GoogleAuthProvider();
		await signInWithPopup(auth, googleProvider);
		await getUser();
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
