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
	type QueryDocumentSnapshot,
	type DocumentData,
} from "firebase/firestore";
import { createContext, useContext, useState, useEffect } from "react";

import { type User } from "@/context/auth-context";
import { db } from "@/firebase/config";

export type Message = User & {
	id: string;
	message: string;
	createdAt: number;
	editedAt?: number;
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
		...data,
		createdAt: typeof createdAt === "number" ? createdAt : Date.now(),
		editedAt: typeof editedAt === "number" ? editedAt : undefined,
	} as Message;
}

function getTimestamp(): number {
	return Date.now();
}

export function ChatProvider({ children }: { children: React.ReactNode }) {
	const [loading, setLoading] = useState(true);
	const [loadingMore, setLoadingMore] = useState(false);
	const [hasMore, setHasMore] = useState(true);
	const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [realtimeMessages, setRealtimeMessages] = useState<Message[]>([]);
	const [olderMessages, setOlderMessages] = useState<Message[]>([]);
	const [isEditing, setIsEditing] = useState<null | { id: string; message: string }>(null);

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
			await addDoc(messagesRef, { message, ...user, createdAt });
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
	};

	return <ChatContext.Provider value={contextValue}>{children}</ChatContext.Provider>;
}

export const useChat = (): ChatContextType => {
	return useContext(ChatContext);
};
