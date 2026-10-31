import "./index.css";
import { createRoot } from "react-dom/client";

import App from "@/App";
import { AuthProvider } from "@/context/auth-context";
import { ChatProvider } from "@/context/chat-context";

createRoot(document.getElementById("root")!).render(
	<AuthProvider>
		<ChatProvider>
			<App />
		</ChatProvider>
	</AuthProvider>,
);
