import { SendHorizontalIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
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
		<form className="flex w-full items-end gap-2 px-2 md:px-4" onSubmit={handleSubmit}>
			<textarea
				value={formValue}
				disabled={!user}
				onChange={(e) => setFormValue(e.target.value)}
				onKeyDown={handleKeyDown}
				aria-label="Message input"
				rows={1}
				placeholder={user ? "Send a message" : "Sign in to send a message"}
				className="field-sizing-content h-9 max-h-72 min-h-9 w-full resize-none rounded-lg border border-input bg-muted/40 px-3 py-1.5 text-base leading-5 text-foreground transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50 disabled:opacity-50 md:text-sm"
			/>
			<Button
				type="submit"
				size="icon"
				className="shrink-0"
				aria-label="Send message"
				title="Send message"
				disabled={!user || formValue.trim().length === 0 || isSending}
			>
				<SendHorizontalIcon className="size-4" />
			</Button>
		</form>
	);
}
