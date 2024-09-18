import type { ReactNode } from "react";
import type { User } from "./auth-context";

import { db } from "../firebase/config";
import { collection, addDoc } from "firebase/firestore";
import { query, orderBy, onSnapshot } from "firebase/firestore";
import { createContext, useContext, useState, useEffect } from "react";

export interface Message extends User {
	id: string;
	message: string;
	createdAt: number;
}
interface ChatContextType {
	loading: boolean;
	messages: Message[];
	sendMessage: (message: string, user: User) => void;
}

const ChatContext = createContext<ChatContextType>({
	loading: true,
	messages: [],
	sendMessage: () => {}
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

	const contextValue = { loading, messages, sendMessage };

	return <ChatContext.Provider value={contextValue}>{children}</ChatContext.Provider>;
}

export const useChat = (): ChatContextType => {
	return useContext(ChatContext);
};
