import type { ReactNode } from "react";
import type { User } from "./auth-context";

import { db } from "../firebase/config";
import { collection, addDoc, doc } from "firebase/firestore";
import { createContext, useContext, useState, useEffect } from "react";
import { query, orderBy, onSnapshot, deleteDoc, updateDoc } from "firebase/firestore";

export interface Message extends User {
	id: string;
	message: string;
	createdAt: number;
	editedAt?: number;
}
interface ChatContextType {
	loading: boolean;
	messages: Message[];
	isEditing: null | { id: string; message: string };
	sendMessage: (message: string, user: User) => void;
	editMessage: (id: string, message: string) => void | Promise<void>;
	deleteMessage: (messageId: string) => void;
	startEdit: (id: string, message: string) => void;
	cancelEdit: () => void;
}

const ChatContext = createContext<ChatContextType>({
	loading: true,
	messages: [],
	isEditing: null,
	sendMessage: () => {},
	editMessage: () => {},
	deleteMessage: () => {},
	startEdit: () => {},
	cancelEdit: () => {}
});

export function ChatProvider({ children }: { children: ReactNode }) {
	const [loading, setLoading] = useState(true);
	const [messages, setMessages] = useState<Message[]>([]);
	const [isEditing, setIsEditing] = useState<null | { id: string; message: string }>(null);

	const messagesRef = collection(db, "messages");

	useEffect(() => {
		const messageQuery = query(messagesRef, orderBy("createdAt", "desc"));
		onSnapshot(messageQuery, (snapShot) => {
			const newMessage = snapShot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Message[];
			console.log(newMessage);
			setMessages(newMessage);
			setLoading(false);
		});
	}, []);

	const sendMessage = (message: string, user: User) => {
		try {
			addDoc(messagesRef, {
				message,
				...user,
				createdAt: Date.now()
			});
		} catch (error) {
			console.log("Error occurred on sending message", error);
		}
	};

	const editMessage = async (id: string, message: string) => {
		const docRef = doc(db, "messages", id);
		try {
			updateDoc(docRef, {
				message,
				editedAt: Date.now()
			});
			cancelEdit();
		} catch (error) {
			console.log("error occurred on editing message", error);
		}
	};

	const startEdit = (id: string, message: string) => {
		setIsEditing({ id, message });
	};

	const cancelEdit = () => {
		setIsEditing(null);
	};

	const deleteMessage = (messageId: string) => {
		console.log(messageId);
		deleteDoc(doc(db, "messages", messageId));
	};

	const contextValue = {
		loading,
		messages,
		isEditing,
		sendMessage,
		editMessage,
		deleteMessage,
		startEdit,
		cancelEdit
	};

	return <ChatContext.Provider value={contextValue}>{children}</ChatContext.Provider>;
}

export const useChat = (): ChatContextType => {
	return useContext(ChatContext);
};
