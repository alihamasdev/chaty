import { useChat } from "../context/chat-context";
import { SquarePen, Trash2 } from "lucide-react";

export default function Options({ id, message }: { id: string; message: string }) {
	const { deleteMessage, startEdit } = useChat();
	return (
		<div className="bg-message flex min-w-6 translate-x-12 flex-col overflow-hidden rounded-md opacity-0 transition-all duration-200 group-hover/message:translate-x-0 group-hover/message:opacity-100 md:min-w-7">
			<button
				onClick={() => startEdit(id, message)}
				className="md:bg-message size-6 cursor-pointer bg-blue-400 text-zinc-50 transition-colors hover:bg-blue-400 hover:text-zinc-50 md:size-7 md:text-zinc-400"
			>
				<SquarePen className="mb-0.5 size-2.5 md:size-3" />
			</button>
			<button
				onClick={() => deleteMessage(id)}
				className="md:bg-message size-6 cursor-pointer bg-red-400 text-zinc-50 transition-colors hover:bg-red-400 hover:text-zinc-50 md:size-7 md:text-zinc-400"
			>
				<Trash2 className="mb-0.5 size-2.5 md:size-3" />
			</button>
		</div>
	);
}
