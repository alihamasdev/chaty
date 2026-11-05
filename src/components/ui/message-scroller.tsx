import { cn } from "cn";
import { ChevronDownIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from "react";

export type MessageScrollerMessage = {
	id: string;
	uid?: string;
	createdAt?: number;
};

type MessageScrollerContextType = {
	viewportRef: React.RefObject<HTMLDivElement | null>;
	contentRef: React.RefObject<HTMLDivElement | null>;
	scrollToBottom: (options?: { behavior?: ScrollBehavior }) => void;
	scrollToTop: (options?: { behavior?: ScrollBehavior }) => void;
	isAtBottom: boolean;
	showScrollButton: boolean;
	unreadCount: number;
	handleScroll: (e: React.UIEvent<HTMLDivElement>) => void;
};

const MessageScrollerContext = createContext<MessageScrollerContextType | null>(null);

function useMessageScrollerInternal() {
	const context = useContext(MessageScrollerContext);
	if (!context) {
		throw new Error("MessageScroller components must be used within a MessageScrollerProvider");
	}
	return context;
}

interface MessageScrollerProviderProps {
	children: React.ReactNode;
	messages?: MessageScrollerMessage[];
	currentUserId?: string;
	autoScroll?: boolean;
}

function MessageScrollerProvider({ children, messages, currentUserId }: MessageScrollerProviderProps) {
	const viewportRef = useRef<HTMLDivElement | null>(null);
	const contentRef = useRef<HTMLDivElement | null>(null);

	const isInitialMountRef = useRef(true);
	const isNearBottomRef = useRef(true);
	const prevMessagesRef = useRef<MessageScrollerMessage[] | undefined>(messages);
	const prevScrollHeightRef = useRef(0);
	const prevScrollTopRef = useRef(0);

	const [isAtBottom, setIsAtBottom] = useState(true);
	const [showScrollButton, setShowScrollButton] = useState(false);
	const [unreadCount, setUnreadCount] = useState(0);

	const scrollToBottom = useCallback((options?: { behavior?: ScrollBehavior }) => {
		const viewport = viewportRef.current;
		if (!viewport) return;

		viewport.scrollTo({
			top: viewport.scrollHeight,
			behavior: options?.behavior ?? "smooth",
		});
		setUnreadCount(0);
		setShowScrollButton(false);
		isNearBottomRef.current = true;
		setIsAtBottom(true);
	}, []);

	const scrollToTop = useCallback((options?: { behavior?: ScrollBehavior }) => {
		const viewport = viewportRef.current;
		if (!viewport) return;

		viewport.scrollTo({
			top: 0,
			behavior: options?.behavior ?? "smooth",
		});
	}, []);

	const handleScroll = useCallback(() => {
		const viewport = viewportRef.current;
		if (!viewport) return;

		const distanceFromBottom = viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight;
		const nearBottom = distanceFromBottom <= 80;

		isNearBottomRef.current = nearBottom;
		setIsAtBottom(nearBottom);
		setShowScrollButton(distanceFromBottom > 160);

		if (nearBottom) {
			setUnreadCount(0);
		}

		prevScrollHeightRef.current = viewport.scrollHeight;
		prevScrollTopRef.current = viewport.scrollTop;
	}, []);

	// Handle initial mount scroll and message changes (prepend vs append)
	useLayoutEffect(() => {
		const viewport = viewportRef.current;
		if (!viewport) return;

		if (messages && messages.length > 0) {
			if (isInitialMountRef.current) {
				// Instant scroll to bottom on first load
				viewport.scrollTop = viewport.scrollHeight;
				isInitialMountRef.current = false;

				// Verify next frame after image/font layout
				requestAnimationFrame(() => {
					if (viewport) {
						viewport.scrollTop = viewport.scrollHeight;
					}
				});
			} else {
				const prevMessages = prevMessagesRef.current;
				if (prevMessages && prevMessages.length > 0 && messages.length > prevMessages.length) {
					const prevFirstId = prevMessages[0]?.id;
					const currentFirstId = messages[0]?.id;
					const prevLastId = prevMessages[prevMessages.length - 1]?.id;
					const currentLastId = messages[messages.length - 1]?.id;

					// Case 1: Prepend (loading earlier messages at top)
					if (prevFirstId && currentFirstId && prevFirstId !== currentFirstId) {
						const heightDiff = viewport.scrollHeight - prevScrollHeightRef.current;
						if (heightDiff > 0) {
							viewport.scrollTop = prevScrollTopRef.current + heightDiff;
						}
					}
					// Case 2: Append (new message added at bottom)
					else if (currentLastId && currentLastId !== prevLastId) {
						const newLastMessage = messages[messages.length - 1];
						const isOwnMessage = Boolean(currentUserId && newLastMessage?.uid === currentUserId);

						if (isOwnMessage) {
							// User sent a message: smoothly scroll to bottom
							viewport.scrollTo({ top: viewport.scrollHeight, behavior: "smooth" });
							queueMicrotask(() => setUnreadCount(0));
						} else if (isNearBottomRef.current) {
							// Incoming message and user was already at bottom: follow to bottom
							viewport.scrollTo({ top: viewport.scrollHeight, behavior: "smooth" });
						} else {
							// Incoming message and user is reading history: keep place and show unread badge
							queueMicrotask(() => setUnreadCount((c) => c + 1));
						}
					}
				}
			}
		}

		prevMessagesRef.current = messages;
		prevScrollHeightRef.current = viewport.scrollHeight;
		prevScrollTopRef.current = viewport.scrollTop;
	}, [messages, currentUserId]);

	// Keep scrolled to bottom if content dimensions change (e.g., image loads, viewport resize)
	useEffect(() => {
		const content = contentRef.current;
		const viewport = viewportRef.current;
		if (!content || !viewport) return;

		const ro = new ResizeObserver(() => {
			if (isNearBottomRef.current && !isInitialMountRef.current) {
				viewport.scrollTop = viewport.scrollHeight;
			}
		});

		ro.observe(content);
		return () => ro.disconnect();
	}, []);

	const value: MessageScrollerContextType = {
		viewportRef,
		contentRef,
		scrollToBottom,
		scrollToTop,
		isAtBottom,
		showScrollButton,
		unreadCount,
		handleScroll,
	};

	return <MessageScrollerContext.Provider value={value}>{children}</MessageScrollerContext.Provider>;
}

function MessageScroller({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="message-scroller"
			className={cn("group/message-scroller relative flex size-full min-h-0 flex-col overflow-hidden", className)}
			{...props}
		/>
	);
}

function MessageScrollerViewport({ className, onScroll, ...props }: React.ComponentProps<"div">) {
	const { viewportRef, handleScroll } = useMessageScrollerInternal();

	return (
		<div
			ref={viewportRef}
			data-slot="message-scroller-viewport"
			onScroll={(e) => {
				handleScroll(e);
				onScroll?.(e);
			}}
			className={cn("size-full min-h-0 min-w-0 scrollbar-thin overflow-y-auto overscroll-contain", className)}
			{...props}
		/>
	);
}

function MessageScrollerContent({ className, ...props }: React.ComponentProps<"div">) {
	const { contentRef } = useMessageScrollerInternal();

	return (
		<div
			ref={contentRef}
			data-slot="message-scroller-content"
			className={cn("flex min-h-full flex-col justify-start gap-3 py-2", className)}
			{...props}
		/>
	);
}

function MessageScrollerItem({
	className,
	messageId,
	scrollAnchor: _scrollAnchor,
	...props
}: React.ComponentProps<"div"> & { messageId?: string; scrollAnchor?: boolean }) {
	return <div data-slot="message-scroller-item" data-message-id={messageId} className={cn("min-w-0 shrink-0", className)} {...props} />;
}

function MessageScrollerButton({
	className,
	children,
	...props
}: React.ComponentProps<typeof motion.button> & { children?: React.ReactNode }) {
	const { scrollToBottom, showScrollButton, unreadCount } = useMessageScroller();

	return (
		<AnimatePresence>
			{showScrollButton && (
				<motion.button
					type="button"
					initial={{ opacity: 0, scale: 0.8, y: 10 }}
					animate={{ opacity: 1, scale: 1, y: 0 }}
					exit={{ opacity: 0, scale: 0.8, y: 10 }}
					transition={{ duration: 0.18, ease: "easeOut" }}
					onClick={() => scrollToBottom({ behavior: "smooth" })}
					aria-label="Scroll to bottom"
					className={cn(
						"absolute right-3 bottom-3 z-20 flex size-9 cursor-pointer items-center justify-center rounded-full border border-border/70 bg-card/95 text-foreground shadow-lg backdrop-blur-md transition-colors select-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:scale-95 md:right-5 md:bottom-4",
						className,
					)}
					{...props}
				>
					{children ?? <ChevronDownIcon className="size-4.5" />}
					{unreadCount > 0 && (
						<span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-xss font-semibold text-primary-foreground shadow-xs">
							{unreadCount > 99 ? "99+" : unreadCount}
						</span>
					)}
				</motion.button>
			)}
		</AnimatePresence>
	);
}

function useMessageScroller() {
	const context = useContext(MessageScrollerContext);
	if (!context) {
		throw new Error("useMessageScroller must be used within a MessageScrollerProvider");
	}
	return {
		scrollToBottom: context.scrollToBottom,
		scrollToTop: context.scrollToTop,
		isAtBottom: context.isAtBottom,
		showScrollButton: context.showScrollButton,
		unreadCount: context.unreadCount,
	};
}

function useMessageScrollerScrollable() {
	const { isAtBottom } = useMessageScroller();
	return { start: true, end: !isAtBottom };
}

function useMessageScrollerVisibility() {
	return { currentAnchorId: null, visibleMessageIds: [] };
}

export {
	MessageScrollerProvider,
	MessageScroller,
	MessageScrollerViewport,
	MessageScrollerContent,
	MessageScrollerItem,
	MessageScrollerButton,
	useMessageScroller,
	useMessageScrollerScrollable,
	useMessageScrollerVisibility,
};
