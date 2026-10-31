import { useState } from "react";

import Button from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { useChat } from "@/context/chat-context";

export default function Form() {
	const { user } = useAuth();
	const { sendMessage, isEditing, editMessage } = useChat();

	const [formValue, setFormValue] = useState("");
	const [prevEditing, setPrevEditing] = useState(isEditing);
	const [prevUser, setPrevUser] = useState(user);
	const [isSending, setIsSending] = useState(false);

	if (prevEditing !== isEditing) {
		setPrevEditing(isEditing);
		setFormValue(isEditing ? isEditing.message : "");
	}

	if (prevUser !== user) {
		setPrevUser(user);
		if (!user) {
			setFormValue("");
		}
	}

	const handleSubmit = async (e: React.SyntheticEvent) => {
		e.preventDefault();
		const messageToSend = formValue.trim();
		if (!messageToSend || !user || isSending) return;

		setFormValue("");
		setIsSending(true);

		try {
			if (isEditing) {
				await editMessage(isEditing.id, messageToSend);
			} else {
				await sendMessage(messageToSend, user);
			}
		} catch (err) {
			console.error("Failed to send message:", err);
			// Restore typed message if send failed
			setFormValue(messageToSend);
		} finally {
			setIsSending(false);
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			if (formValue.trim().length > 0 && !isSending && user) {
				handleSubmit(e);
			}
		}
	};

	return (
		<form className="flex w-full items-center gap-3" onSubmit={handleSubmit}>
			<textarea
				value={formValue}
				disabled={!user}
				onChange={(e) => setFormValue(e.target.value)}
				onKeyDown={handleKeyDown}
				aria-label="Message input"
				placeholder={user ? "Send a message" : "Sign in to send a message"}
				className="field-sizing-content max-h-80 min-h-10 w-full resize-none rounded-lg bg-zinc-800 px-3 py-2 text-sm text-zinc-300 outline-0 transition-colors placeholder:text-zinc-500 focus:text-zinc-50 disabled:opacity-70 md:text-base"
			/>
			<Button size="icon" aria-label="Send message" title="Send message" disabled={!user || formValue.trim().length === 0 || isSending}>
				<svg viewBox="0 0 24 24" className="size-4 fill-zinc-50">
					<path d="M1.101,21.757L23.8,12.028L1.101,2.3l0.011,7.912l13.623,1.816L1.112,13.845 L1.101,21.757z" />
				</svg>
			</Button>
		</form>
	);
}
