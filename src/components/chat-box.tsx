import { AlertCircleIcon, MessageSquareDashedIcon } from "lucide-react";
import { Fragment } from "react";

import MessageItem from "@/components/message";
import { Button } from "@/components/ui/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import {
	MessageScroller,
	MessageScrollerButton,
	MessageScrollerContent,
	MessageScrollerItem,
	MessageScrollerProvider,
	MessageScrollerViewport,
} from "@/components/ui/message-scroller";
import { useAuth } from "@/context/auth-context";
import { useChat } from "@/context/chat-context";
import { formatDayDivider, getDayKey } from "@/utils/date-formatter";

export default function ChatBox() {
	const { user } = useAuth();
	const { loading, error, messages, hasMore, loadingMore, loadMoreMessages } = useChat();

	if (loading) {
		return (
			<section role="status" aria-label="Loading messages" className="flex size-full items-center justify-center">
				<div className="size-7 animate-spin rounded-full border-3 border-muted-foreground/30 border-t-foreground" />
				<span className="sr-only">Loading messages...</span>
			</section>
		);
	}

	if (error) {
		return (
			<section className="flex size-full items-center justify-center p-6">
				<Empty>
					<EmptyHeader>
						<EmptyMedia variant="icon" className="bg-destructive/10 text-destructive">
							<AlertCircleIcon className="size-5" />
						</EmptyMedia>
						<EmptyTitle className="text-destructive">Unable to load messages</EmptyTitle>
						<EmptyDescription>{error}</EmptyDescription>
					</EmptyHeader>
				</Empty>
			</section>
		);
	}

	if (!messages || messages.length < 1) {
		return (
			<section className="flex size-full items-center justify-center p-6">
				<Empty>
					<EmptyHeader>
						<EmptyMedia variant="icon">
							<MessageSquareDashedIcon className="size-5 text-muted-foreground" />
						</EmptyMedia>
						<EmptyTitle>No messages to show here</EmptyTitle>
						<EmptyDescription>
							{user ? "Send a message below to start the conversation." : "Sign in with Google to start chatting with everyone."}
						</EmptyDescription>
					</EmptyHeader>
				</Empty>
			</section>
		);
	}

	// Chronologically ordered list (oldest at top, newest at bottom)
	const orderedMessages = [...messages].reverse();

	return (
		<MessageScrollerProvider autoScroll messages={orderedMessages} currentUserId={user?.uid}>
			<MessageScroller className="size-full">
				<MessageScrollerViewport className="size-full px-2 md:px-4">
					<MessageScrollerContent className="gap-3 py-2">
						{hasMore && (
							<div className="flex w-full justify-center pb-2">
								<Button
									size="xs"
									variant="ghost"
									onClick={loadMoreMessages}
									disabled={loadingMore}
									className="text-muted-foreground hover:text-foreground"
								>
									{loadingMore ? "Loading earlier messages..." : "Load earlier messages"}
								</Button>
							</div>
						)}
						{orderedMessages.map((item, index) => {
							const prevItem = index > 0 ? orderedMessages[index - 1] : null;
							const isNewDay = !prevItem || getDayKey(item.createdAt) !== getDayKey(prevItem.createdAt);

							return (
								<Fragment key={item.id}>
									{isNewDay && (
										<div className="pointer-events-none sticky top-2 z-10 my-2 flex w-full justify-center select-none">
											<span className="rounded-md border border-border/40 bg-card/90 px-3 py-1 text-xs font-medium text-muted-foreground shadow-xs backdrop-blur-md">
												{formatDayDivider(item.createdAt)}
											</span>
										</div>
									)}
									<MessageScrollerItem messageId={item.id}>
										<MessageItem data={item} isUser={item.uid === user?.uid} />
									</MessageScrollerItem>
								</Fragment>
							);
						})}
					</MessageScrollerContent>
				</MessageScrollerViewport>
				<MessageScrollerButton />
			</MessageScroller>
		</MessageScrollerProvider>
	);
}
