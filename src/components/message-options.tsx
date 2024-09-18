import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useChat } from "../context/chat-context";

export default function Options({ id }: { id: string }) {
	const { deleteMessage } = useChat();
	return (
		<div className="bg-message flex min-w-7 translate-x-12 overflow-hidden rounded-md opacity-0 transition-all duration-200 group-hover/message:translate-x-0 group-hover/message:opacity-100">
			<button
				onClick={() => deleteMessage(id)}
				className="flex-center group/btn md:bg-message size-7 cursor-pointer bg-red-500 text-zinc-50 transition hover:bg-red-500 hover:text-zinc-50 md:text-zinc-400"
			>
				<FontAwesomeIcon icon={faTrash} className="size-3" />
			</button>
		</div>
	);
}
