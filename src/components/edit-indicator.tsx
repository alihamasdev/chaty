import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";

import { useChat } from "@/context/chat-context";

export default function Edit() {
	const { isEditing, cancelEdit } = useChat();

	useEffect(() => {
		if (!isEditing) return;

		const handleEscapePress = (e: KeyboardEvent) => {
			if (e.code === "Escape") {
				cancelEdit();
			}
		};

		window.addEventListener("keydown", handleEscapePress);
		return () => {
			window.removeEventListener("keydown", handleEscapePress);
		};
	}, [isEditing, cancelEdit]);

	return (
		<AnimatePresence>
			{isEditing && (
				<motion.div
					initial={{ opacity: 0, height: 0, marginBottom: 0 }}
					animate={{ opacity: 1, height: "auto", marginBottom: 4 }}
					exit={{ opacity: 0, height: 0, marginBottom: 0 }}
					transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
					className="flex items-center gap-2 overflow-hidden text-xs md:gap-3 md:text-sm"
				>
					<div className="font-semibold text-zinc-50">Editing Mode</div>
					<div className="h-3 border-r border-zinc-500" />
					<div>
						<button className="cursor-pointer text-blue-400 hover:underline" onClick={cancelEdit}>
							escape
						</button>{" "}
						to cancel
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
