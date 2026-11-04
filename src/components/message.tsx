import { cn } from "cn";

import MessageMenu from "@/components/message-options";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Message as MessageRow, MessageAvatar, MessageContent, MessageHeader } from "@/components/ui/message";
import { useChat, type Message as MessageType } from "@/context/chat-context";
import { formatMessageTime } from "@/utils/date-formatter";
import { formatText } from "@/utils/text-formatter";

export default function MessageItem({ data, isUser }: { data: MessageType; isUser: boolean }) {
	const { getUserProfile } = useChat();

	const author = getUserProfile(data.uid);
	const displayName = author?.displayName ?? data.displayName ?? "User";
	const photoURL = author?.photoURL ?? data.photoURL ?? null;
	const initial = displayName.trim().charAt(0).toUpperCase() || "?";

	return (
		<MessageRow align={isUser ? "end" : "start"}>
			<MessageAvatar>
				<Avatar size="default">
					<AvatarImage src={photoURL ?? undefined} alt={displayName} />
					<AvatarFallback>{initial}</AvatarFallback>
				</Avatar>
			</MessageAvatar>

			<MessageContent>
				{!isUser && (
					<MessageHeader className="px-1">
						<span className="text-xs font-semibold text-foreground/90">{displayName}</span>
					</MessageHeader>
				)}

				<Bubble variant={isUser ? "secondary" : "outline"} align={isUser ? "end" : "start"}>
					<BubbleContent className={cn("group/bubble relative text-sm md:text-base", isUser ? "pr-5" : "")}>
						<div className="flex flex-wrap items-baseline justify-end gap-x-2 gap-y-0.5">
							<span className="flex-1 wrap-break-word whitespace-pre-wrap">{formatText(data.message)}</span>
							<span className="inline-flex shrink-0 items-center gap-1 self-end text-xs leading-none text-muted-foreground select-none">
								{data.editedAt && <span>edited</span>}
								<span>{formatMessageTime(data.createdAt)}</span>
							</span>
						</div>
						{isUser && <MessageMenu id={data.id} message={data.message} />}
					</BubbleContent>
				</Bubble>
			</MessageContent>
		</MessageRow>
	);
}
