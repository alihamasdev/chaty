import type { Message } from "../context/chat-context";

import clsx from "clsx";
import { motion } from "framer-motion";
import Options from "./message-options";
import useDate from "../hooks/date-formatter";
import useFormat from "../hooks/text-formatter";

const variant = [
	{
		initial: { x: 100, y: 100, opacity: 0 },
		animate: { x: 0, y: 0, opacity: 1 },
		exit: { x: 100, y: 20, opacity: 0, transition: { duration: 0.2 } }
	},
	{
		initial: { x: -100, y: 100, opacity: 0 },
		animate: { x: 0, y: 0, opacity: 1 },
		exit: { x: -100, y: 20, opacity: 0, transition: { duration: 0.2 } }
	}
];

export default function Message({ data, isUser }: { data: Message; isUser: boolean }) {
	return (
		<motion.article
			layout
			exit="exit"
			initial="initial"
			animate="animate"
			variants={isUser ? variant[0] : variant[1]}
			transition={{ duration: 0.8, type: "spring" }}
			className={clsx(
				"flex w-full items-start gap-2 md:max-w-[75%]",
				isUser && "flex-row-reverse self-end"
			)}
		>
			<img
				loading="lazy"
				src={data.photoURL}
				alt={data.displayName}
				title={data.displayName}
				className="mt-0.5 size-8 rounded-full bg-zinc-950 md:size-10"
			/>
			<div className="group/message flex flex-row items-center gap-1 md:gap-4">
				{isUser && <Options id={data.id} message={data.message} />}
				<div className="relative flex flex-col rounded-lg bg-message px-4 py-2">
					<div className="flex w-full items-center gap-2">
						<p className="truncate text-sm font-semibold text-zinc-200 md:text-base">
							{data.displayName}
						</p>
						<p className="line-clamp-1 text-xs text-zinc-400 md:text-sm">
							{useDate(data.createdAt)}
						</p>
					</div>
					<p className="mt-1 text-sm text-zinc-300 md:text-base">{useFormat(data.message)}</p>
					{data.editedAt && (
						<p className="ml-auto mt-0.5 text-xss text-zinc-400 md:text-xs">
							Edited {useDate(data.editedAt)}
						</p>
					)}
					<span
						className={clsx(
							"absolute top-0 border-8 border-transparent border-r-message border-t-message",
							isUser ? "-right-2 -rotate-90" : "-left-2"
						)}
					/>
				</div>
			</div>
		</motion.article>
	);
}
