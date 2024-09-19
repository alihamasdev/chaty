import { useChat } from "../context/chat-context";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faPenToSquare } from "@fortawesome/free-solid-svg-icons";

export default function Options({ id, message }: { id: string; message: string }) {
	const { deleteMessage, startEdit } = useChat();
	return (
		<div className="flex min-w-6 translate-x-12 flex-col overflow-hidden rounded-md bg-message opacity-0 transition-all duration-200 group-hover/message:translate-x-0 group-hover/message:opacity-100 md:min-w-7">
			<button
				onClick={() => startEdit(id, message)}
				className="size-6 cursor-pointer bg-blue-400 text-zinc-50 transition-colors hover:bg-blue-400 hover:text-zinc-50 md:size-7 md:bg-message md:text-zinc-400"
			>
				<FontAwesomeIcon icon={faPenToSquare} className="mb-0.5 size-2.5 md:size-3" />
			</button>
			<button
				onClick={() => deleteMessage(id)}
				className="size-6 cursor-pointer bg-red-400 text-zinc-50 transition-colors hover:bg-red-400 hover:text-zinc-50 md:size-7 md:bg-message md:text-zinc-400"
			>
				<FontAwesomeIcon icon={faTrash} className="mb-0.5 size-2.5 md:size-3" />
			</button>
		</div>
	);
}
