import {
	collection,
	addDoc,
	doc,
	query,
	orderBy,
	onSnapshot,
	deleteDoc,
	updateDoc,
	limit,
	startAfter,
	getDocs,
	where,
	documentId,
	type QueryDocumentSnapshot,
	type DocumentData,
} from "firebase/firestore";
import { createContext, useContext, useState, useEffect, useRef } from "react";

import { useAuth, type User } from "@/context/auth-context";
import { db } from "@/firebase/config";

export type Message = {
	id: string;
	uid: string;
	message: string;
	createdAt: number;
	editedAt?: number;
	// Legacy fallback fields for backward compatibility with older messages
	displayName?: string | null;
	photoURL?: string | null;
};

type ChatContextType = {
	loading: boolean;
	loadingMore: boolean;
	hasMore: boolean;
	error: string | null;
	messages: Message[];
	loadMoreMessages: () => Promise<void>;
	isEditing: null | { id: string; message: string };
	sendMessage: (message: string, user: User) => Promise<void>;
	editMessage: (id: string, message: string) => Promise<void>;
	deleteMessage: (messageId: string) => Promise<void>;
	startEdit: (id: string, message: string) => void;
	cancelEdit: () => void;
	userProfiles: Record<string, User>;
	getUserProfile: (uid: string) => User | undefined;
};

const ChatContext = createContext<ChatContextType>({
	loading: true,
	loadingMore: false,
	hasMore: true,
	error: null,
	messages: [],
	loadMoreMessages: async () => {},
	isEditing: null,
	sendMessage: async () => {},
	editMessage: async () => {},
	deleteMessage: async () => {},
	startEdit: () => {},
	cancelEdit: () => {},
	userProfiles: {},
	getUserProfile: () => undefined,
});

function parseDocToMessage(docSnapshot: QueryDocumentSnapshot<DocumentData>): Message {
	const data = docSnapshot.data();
	let createdAt = data.createdAt;
	if (createdAt && typeof createdAt.toMillis === "function") {
		createdAt = createdAt.toMillis();
	} else if (createdAt && typeof createdAt.seconds === "number") {
		createdAt = createdAt.seconds * 1000;
	}

	let editedAt = data.editedAt;
	if (editedAt && typeof editedAt.toMillis === "function") {
		editedAt = editedAt.toMillis();
	} else if (editedAt && typeof editedAt.seconds === "number") {
		editedAt = editedAt.seconds * 1000;
	}

	return {
		id: docSnapshot.id,
		uid: data.uid,
		message: data.message,
		displayName: data.displayName,
		photoURL: data.photoURL,
		createdAt: typeof createdAt === "number" ? createdAt : Date.now(),
		editedAt: typeof editedAt === "number" ? editedAt : undefined,
	};
}

function getTimestamp(): number {
	return Date.now();
}

export function ChatProvider({ children }: { children: React.ReactNode }) {
	const { user } = useAuth();
	const [loading, setLoading] = useState(true);
	const [loadingMore, setLoadingMore] = useState(false);
	const [hasMore, setHasMore] = useState(true);
	const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [realtimeMessages, setRealtimeMessages] = useState<Message[]>([]);
	const [olderMessages, setOlderMessages] = useState<Message[]>([]);
	const [isEditing, setIsEditing] = useState<null | { id: string; message: string }>(null);
	const [userProfiles, setUserProfiles] = useState<Record<string, User>>({});
	const fetchedUidsRef = useRef<Set<string>>(new Set());

	// Fetch user profiles for any messages whose authors aren't cached yet
	useEffect(() => {
		const allUids = new Set<string>();
		for (const m of realtimeMessages) {
			if (m.uid) allUids.add(m.uid);
		}
		for (const m of olderMessages) {
			if (m.uid) allUids.add(m.uid);
		}

		const missingUids: string[] = [];
		for (const uid of allUids) {
			if (user?.uid === uid) continue;
			if (!fetchedUidsRef.current.has(uid)) {
				missingUids.push(uid);
				fetchedUidsRef.current.add(uid);
			}
		}

		if (missingUids.length === 0) return;

		const fetchProfiles = async () => {
			try {
				// Firestore 'in' query supports at most 30 items per query
				const chunks: string[][] = [];
				for (let i = 0; i < missingUids.length; i += 30) {
					chunks.push(missingUids.slice(i, i + 30));
				}

				const newProfiles: Record<string, User> = {};
				await Promise.all(
					chunks.map(async (chunk) => {
						const usersQuery = query(collection(db, "users"), where(documentId(), "in", chunk));
						const snap = await getDocs(usersQuery);
						snap.docs.forEach((d) => {
							const data = d.data();
							newProfiles[d.id] = {
								uid: d.id,
								displayName: data.displayName || "Anonymous",
								photoURL: data.photoURL || null,
							};
						});
					}),
				);

				if (Object.keys(newProfiles).length > 0) {
					setUserProfiles((prev) => ({ ...prev, ...newProfiles }));
				}
			} catch (err) {
				console.error("Failed to fetch user profiles:", err);
			}
		};

		fetchProfiles();
	}, [realtimeMessages, olderMessages, user?.uid]);

	useEffect(() => {
		const messagesRef = collection(db, "messages");
		const messageQuery = query(messagesRef, orderBy("createdAt", "desc"), limit(50));

		const unsubscribe = onSnapshot(
			messageQuery,
			(snapShot) => {
				if (snapShot.docs.length < 50) {
					setHasMore(false);
				}
				if (snapShot.docs.length > 0) {
					setLastDoc((prev) => prev ?? snapShot.docs[snapShot.docs.length - 1]);
				}

				const newMessages = snapShot.docs.map(parseDocToMessage);
				setRealtimeMessages(newMessages);

				const removedDocIds = new Set(
					snapShot
						.docChanges()
						.filter((c) => c.type === "removed")
						.map((c) => c.doc.id),
				);
				if (removedDocIds.size > 0) {
					setOlderMessages((prev) => prev.filter((m) => !removedDocIds.has(m.id)));
				}

				setLoading(false);
				setError(null);
			},
			(err) => {
				console.error("Firestore onSnapshot error:", err);
				if (err.code === "permission-denied") {
					setError("Missing or insufficient permissions. Your Firebase Firestore Security Rules may have expired in the Firebase Console.");
				} else {
					setError(err.message || "Failed to load messages from Firestore.");
				}
				setLoading(false);
			},
		);

		return () => unsubscribe();
	}, []);

	const loadMoreMessages = async () => {
		if (!lastDoc || loadingMore || !hasMore) return;
		setLoadingMore(true);
		try {
			const messagesRef = collection(db, "messages");
			const nextQuery = query(messagesRef, orderBy("createdAt", "desc"), startAfter(lastDoc), limit(50));
			const nextSnap = await getDocs(nextQuery);
			if (nextSnap.empty || nextSnap.docs.length < 50) {
				setHasMore(false);
			}
			if (!nextSnap.empty) {
				setLastDoc(nextSnap.docs[nextSnap.docs.length - 1]);
				const fetchedBatch = nextSnap.docs.map(parseDocToMessage);
				setOlderMessages((prev) => {
					const existingIds = new Set(prev.map((m) => m.id));
					const uniqueOlder = fetchedBatch.filter((m) => !existingIds.has(m.id));
					return [...prev, ...uniqueOlder];
				});
			}
		} catch (err) {
			console.error("Error loading earlier messages:", err);
		} finally {
			setLoadingMore(false);
		}
	};

	const sendMessage = async (message: string, user: User) => {
		try {
			const messagesRef = collection(db, "messages");
			const createdAt = getTimestamp();
			// Normalized: only store uid, message, and createdAt (no author metadata)
			await addDoc(messagesRef, { message, uid: user.uid, createdAt });
		} catch (err) {
			console.error("Error occurred on sending message:", err);
			throw err;
		}
	};

	const editMessage = async (id: string, message: string) => {
		const editedAt = getTimestamp();
		setRealtimeMessages((prev) => prev.map((m) => (m.id === id ? { ...m, message, editedAt } : m)));
		setOlderMessages((prev) => prev.map((m) => (m.id === id ? { ...m, message, editedAt } : m)));
		cancelEdit();

		try {
			const docRef = doc(db, "messages", id);
			await updateDoc(docRef, { message, editedAt });
		} catch (err) {
			console.error("Error occurred on editing message:", err);
			throw err;
		}
	};

	const startEdit = (id: string, message: string) => {
		setIsEditing({ id, message });
	};

	const cancelEdit = () => {
		setIsEditing(null);
	};

	const deleteMessage = async (messageId: string) => {
		setRealtimeMessages((prev) => prev.filter((m) => m.id !== messageId));
		setOlderMessages((prev) => prev.filter((m) => m.id !== messageId));

		try {
			const docRef = doc(db, "messages", messageId);
			await deleteDoc(docRef);
		} catch (err) {
			console.error("Error occurred on deleting message:", err);
		}
	};

	const getUserProfile = (uid: string): User | undefined => {
		if (user && user.uid === uid) {
			return user;
		}
		return userProfiles[uid];
	};

	const realtimeIds = new Set(realtimeMessages.map((m) => m.id));
	const messages = [...realtimeMessages, ...olderMessages.filter((m) => !realtimeIds.has(m.id))];

	const contextValue = {
		loading,
		loadingMore,
		hasMore,
		error,
		messages,
		loadMoreMessages,
		isEditing,
		sendMessage,
		editMessage,
		deleteMessage,
		startEdit,
		cancelEdit,
		userProfiles,
		getUserProfile,
	};

	return <ChatContext.Provider value={contextValue}>{children}</ChatContext.Provider>;
}

export const useChat = (): ChatContextType => {
	return useContext(ChatContext);
};
