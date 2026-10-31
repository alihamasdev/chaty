import { SquarePenIcon, Trash2Icon } from "lucide-react";

import { useChat } from "@/context/chat-context";

export default function Options({ id, message }: { id: string; message: string }) {
	const { deleteMessage, startEdit } = useChat();
	return (
		<div className="flex min-w-6 translate-x-2 flex-col overflow-hidden rounded-md bg-message opacity-0 transition-[transform,opacity] duration-150 ease-out group-hover/message:translate-x-0 group-hover/message:opacity-100 md:min-w-7">
			<button
				onClick={() => startEdit(id, message)}
				aria-label="Edit message"
				title="Edit message"
				className="flex size-6 cursor-pointer items-center justify-center bg-blue-400 text-zinc-50 transition-colors hover:bg-blue-400 hover:text-zinc-50 md:size-7 md:bg-message md:text-zinc-400"
			>
				<SquarePenIcon className="size-2.5 md:size-3" />
			</button>
			<button
				onClick={() => deleteMessage(id)}
				aria-label="Delete message"
				title="Delete message"
				className="flex size-6 cursor-pointer items-center justify-center bg-red-400 text-zinc-50 transition-colors hover:bg-red-400 hover:text-zinc-50 md:size-7 md:bg-message md:text-zinc-400"
			>
				<Trash2Icon className="size-2.5 md:size-3" />
			</button>
		</div>
	);
}
