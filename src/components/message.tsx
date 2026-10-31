import { cn } from "cn";
import { motion, useReducedMotion } from "motion/react";

import Options from "@/components/message-options";
import Avatar from "@/components/ui/avatar";
import { type Message } from "@/context/chat-context";
import { formatDate } from "@/utils/date-formatter";
import { formatText } from "@/utils/text-formatter";

const messageSpring = {
	type: "spring" as const,
	duration: 0.25,
	bounce: 0.15,
};

export default function Message({ data, isUser }: { data: Message; isUser: boolean }) {
	const shouldReduceMotion = useReducedMotion();

	const messageVariant = {
		initial: shouldReduceMotion ? { opacity: 0 } : { y: 8, opacity: 0 },
		animate: { y: 0, opacity: 1 },
		exit: shouldReduceMotion
			? { opacity: 0, transition: { duration: 0.15 } }
			: { opacity: 0, scale: 0.96, transition: { duration: 0.15, ease: [0.23, 1, 0.32, 1] } },
	};

	return (
		<motion.article
			layout
			exit="exit"
			initial="initial"
			animate="animate"
			variants={messageVariant}
			transition={shouldReduceMotion ? { duration: 0.15 } : messageSpring}
			className={cn("flex w-full items-start gap-2 md:max-w-[75%]", isUser && "flex-row-reverse self-end")}
		>
			<Avatar src={data.photoURL} alt={data.displayName} className="mt-0.5 size-8 shrink-0 md:size-10" />
			<div className="group/message flex flex-row items-center gap-1 md:gap-4">
				{isUser && <Options id={data.id} message={data.message} />}
				<div className="relative flex flex-col rounded-lg bg-message px-4 py-2">
					<div className="flex w-full items-center gap-2">
						<p className="truncate text-sm font-semibold text-zinc-200 md:text-base">{data.displayName}</p>
						<p className="line-clamp-1 text-xs text-zinc-400 md:text-sm">{formatDate(data.createdAt)}</p>
					</div>
					<p className="mt-1 text-sm wrap-break-word whitespace-pre-wrap text-zinc-300 md:text-base">{formatText(data.message)}</p>
					{data.editedAt && <p className="mt-0.5 ml-auto text-xss text-zinc-400 md:text-xs">Edited {formatDate(data.editedAt)}</p>}
					<span
						className={cn(
							"absolute top-0 border-8 border-transparent border-t-message border-r-message",
							isUser ? "-right-2 -rotate-90" : "-left-2",
						)}
					/>
				</div>
			</div>
		</motion.article>
	);
}
