import type { ReactNode } from "react";
import type { User } from "./auth-context";

import { db } from "../firebase/config";
import { collection, addDoc, doc } from "firebase/firestore";
import { createContext, useContext, useState, useEffect } from "react";
import { query, orderBy, onSnapshot, deleteDoc } from "firebase/firestore";

export interface Message extends User {
	id: string;
	message: string;
	createdAt: number;
}
interface ChatContextType {
	loading: boolean;
	messages: Message[];
	sendMessage: (message: string, user: User) => void;
	deleteMessage: (messageId: string) => void;
}

const ChatContext = createContext<ChatContextType>({
	loading: true,
	messages: [],
	sendMessage: () => {},
	deleteMessage: () => {}
});

export function ChatProvider({ children }: { children: ReactNode }) {
	const [loading, setLoading] = useState(true);
	const [messages, setMessages] = useState<Message[]>([]);

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

	const deleteMessage = (messageId: string) => {
		console.log(messageId);
		deleteDoc(doc(db, "messages", messageId));
	};

	const contextValue = { loading, messages, sendMessage, deleteMessage };

	return <ChatContext.Provider value={contextValue}>{children}</ChatContext.Provider>;
}

export const useChat = (): ChatContextType => {
	return useContext(ChatContext);
};
