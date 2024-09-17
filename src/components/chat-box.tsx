import { useAuth } from "../context/auth-context";
import { useChat } from "../context/chat-context";

export default function ChatBox() {
	const { user } = useAuth();
	const { loading, messages } = useChat();

	if (loading) {
		return (
			<section className="flex size-full items-center justify-center rounded-xl bg-zinc-800">
				<div className="size-8 animate-spin rounded-full border-4 border-zinc-500 border-t-zinc-50" />
			</section>
		);
	}

	if (!messages || messages.length < 1) {
		return (
			<section className="flex size-full items-center justify-center rounded-xl bg-zinc-800">
				<div className="text-sm font-medium text-zinc-200">No messages to show here</div>
			</section>
		);
	}

	return messages.map((item) => {
		return (
			<section className="flex size-full h-dvh flex-col-reverse gap-4 overflow-y-auto overflow-x-hidden rounded-xl bg-zinc-800 px-2 py-4 md:p-4">
				{/* Message component here */}
			</section>
		);
	});
}
