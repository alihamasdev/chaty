import { useEffect } from "react";
import { useChat } from "../context/chat-context";

export default function Edit() {
	const { isEditing, cancelEdit } = useChat();

	const handleEscapePres = (e: KeyboardEvent) => {
		if (e.code === "Escape") {
			cancelEdit();
		}
	};

	useEffect(() => {
		if (isEditing) {
			window.addEventListener("keydown", handleEscapePres);
		} else {
			window.removeEventListener("keydown", handleEscapePres);
		}

		return () => {
			window.removeEventListener("keydown", handleEscapePres);
		};
	}, [isEditing]);

	return (
		isEditing && (
			<div className="flex items-center gap-2 text-xs md:gap-3 md:text-sm">
				<div className="font-semibold text-zinc-50">Editing Mode</div>
				<div className="h-full border border-zinc-400" />
				<div>
					<button className="cursor-pointer text-blue-400 hover:underline" onClick={cancelEdit}>
						escape
					</button>{" "}
					to cancel
				</div>
			</div>
		)
	);
}
