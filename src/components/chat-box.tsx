import { AnimatePresence } from "motion/react";

import Message from "@/components/message";
import { useAuth } from "@/context/auth-context";
import { useChat } from "@/context/chat-context";

export default function ChatBox() {
	const { user } = useAuth();
	const { loading, error, messages, hasMore, loadingMore, loadMoreMessages } = useChat();

	if (loading) {
		return (
			<section role="status" aria-label="Loading messages" className="flex size-full items-center justify-center rounded-xl bg-zinc-800">
				<div className="size-8 animate-spin rounded-full border-4 border-zinc-500 border-t-zinc-50" />
				<span className="sr-only">Loading messages...</span>
			</section>
		);
	}

	if (error) {
		return (
			<section className="flex size-full flex-col items-center justify-center gap-3 rounded-xl bg-zinc-800 p-6 text-center">
				<div className="text-base font-semibold text-red-400">Unable to load messages</div>
				<p className="max-w-md text-sm text-zinc-300">{error}</p>
				<p className="max-w-md text-xs text-zinc-400">
					If your Firestore Security Rules have expired in Firebase, update them in the Firebase Console under Firestore Database &gt;
					Rules.
				</p>
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

	return (
		<section className="flex size-full h-dvh flex-col-reverse gap-4 overflow-x-hidden overflow-y-auto rounded-xl bg-zinc-800 px-2 py-4 md:px-6">
			<AnimatePresence initial={false}>
				{messages.map((item) => {
					return <Message key={item.id} data={item} isUser={item.uid === user?.uid} />;
				})}
			</AnimatePresence>
			{hasMore && (
				<div className="flex w-full justify-center py-2">
					<button
						onClick={loadMoreMessages}
						disabled={loadingMore}
						className="cursor-pointer text-xs font-medium text-zinc-400 transition-colors hover:text-zinc-200 disabled:opacity-50"
					>
						{loadingMore ? "Loading earlier messages..." : "Load earlier messages"}
					</button>
				</div>
			)}
		</section>
	);
}
