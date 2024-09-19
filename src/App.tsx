import Form from "./components/form";
import Header from "./components/header";
import ChatBox from "./components/chat-box";
import Edit from "./components/edit-indicator";

export default function App() {
	return (
		<main className="flex size-full max-w-5xl flex-col gap-y-2 overflow-y-auto rounded-2xl border border-zinc-800 bg-[#111] p-2 shadow-2xl md:gap-y-4 md:p-4">
			<header className="relative flex items-center justify-between">
				<Header />
			</header>
			<ChatBox />
			<Edit />
			<section className="w-full">
				<Form />
			</section>
		</main>
	);
}
