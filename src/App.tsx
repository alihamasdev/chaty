import ChatBox from "@/components/chat-box";
import Edit from "@/components/edit-indicator";
import Form from "@/components/form";
import Header from "@/components/header";

export default function App() {
	return (
		<main className="flex size-full max-w-5xl flex-col gap-y-2 overflow-hidden rounded-2xl border border-border bg-card py-2 text-card-foreground shadow-2xl md:gap-y-4 md:py-4">
			<header className="relative flex items-center justify-between px-2 md:px-4">
				<Header />
			</header>
			<ChatBox />
			<Edit />
			<Form />
		</main>
	);
}
