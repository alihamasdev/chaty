import type { ReactNode } from "react";
import type { User } from "./auth-context";
import { createContext, useContext, useState, useEffect } from "react";

export interface Message extends User {
	id: string;
	message: string;
}

interface ChatContextType {
	loading: boolean;
	messages: Message[] | null;
}
const ChatContext = createContext<ChatContextType>({
	loading: true,
	messages: null
});

export function ChatProvider({ children }: { children: ReactNode }) {
	const [loading, setLoading] = useState(true);
	const [messages, setMessages] = useState<Message[] | null>(null);

	useEffect(() => {
		setTimeout(() => {
			setLoading(false);
		}, 1000);
	}, []);

	const contextValue = { loading, messages };

	return <ChatContext.Provider value={contextValue}>{children}</ChatContext.Provider>;
}

export const useChat = (): ChatContextType => {
	return useContext(ChatContext);
};
