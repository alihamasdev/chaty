import "./index.css";
import App from "./App.tsx";
import { createRoot } from "react-dom/client";
import { AuthProvider } from "./context/auth-context.tsx";
import { ChatProvider } from "./context/chat-context.tsx";

createRoot(document.getElementById("root")!).render(
	<AuthProvider>
		<ChatProvider>
			<App />
		</ChatProvider>
	</AuthProvider>
);
