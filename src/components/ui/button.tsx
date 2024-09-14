import cn from "clsx";
import { type ButtonHTMLAttributes } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: "default" | "ghost";
	size?: "default" | "icon";
}

export default function Button({
	children,
	className,
	onClick,
	disabled,
	variant = "default",
	size = "default"
}: Props) {
	return (
		<AnimatePresence>
			<motion.button
				onClick={onClick}
				disabled={disabled}
				whileTap={{ scale: 0.9 }}
				className={cn(
					"inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800/80 hover:text-zinc-50 disabled:opacity-50",
					variant === "ghost" ? "bg-transparent" : "bg-zinc-800",
					size === "icon" ? "h-10 w-10" : "h-10 px-4 py-2",
					className
				)}
			>
				{children}
			</motion.button>
		</AnimatePresence>
	);
}
