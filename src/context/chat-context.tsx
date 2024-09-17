import type { ReactNode } from "react";
import type { User } from "./auth-context";

import { db } from "../firebase/config";
import { createContext, useContext, useState, useEffect } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export interface Message extends User {
	id: string;
	message: string;
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
		setLoading(false);
	}, []);

	const sendMessage = (message: string, user: User) => {
		try {
			const newMessage = { id: String(Date.now()), message, ...user };
			setMessages((prevState) => [newMessage, ...prevState]);
			addDoc(messagesRef, {
				message,
				...user,
				createdAt: serverTimestamp()
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
