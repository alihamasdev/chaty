import Button from "./ui/button";
import { useAuth } from "../context/auth-context";
import { useChat } from "../context/chat-context";
import { useEffect, useState, type FormEvent } from "react";

export default function Form() {
	const { user } = useAuth();
	const { sendMessage } = useChat();
	const [formValue, setFormValue] = useState("");
	const [isSending, setIsSending] = useState(false);

	useEffect(() => {
		!user && setFormValue("");
	}, [user]);

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();
		if (user) {
			setIsSending(true);
			sendMessage(formValue, user);
			setFormValue("");
			setIsSending(false);
		}
	};

	return (
		<form className="flex w-full items-center gap-3" onSubmit={handleSubmit}>
			<input
				type="text"
				disabled={!user || isSending}
				value={user ? formValue : ""}
				onChange={(e) => setFormValue(e.target.value)}
				placeholder={user ? "Send a message" : "Sign in to send a message"}
				className="h-10 w-full rounded-lg bg-zinc-800 px-3 py-2 text-zinc-300 outline-0 transition-colors placeholder:text-zinc-500 focus:text-zinc-50 disabled:opacity-70"
			/>
			<Button size="icon" disabled={!user || formValue.length === 0 || isSending}>
				<svg viewBox="0 0 24 24" className="size-4 fill-zinc-50">
					<path d="M1.101,21.757L23.8,12.028L1.101,2.3l0.011,7.912l13.623,1.816L1.112,13.845 L1.101,21.757z" />
				</svg>
			</Button>
		</form>
	);
}
