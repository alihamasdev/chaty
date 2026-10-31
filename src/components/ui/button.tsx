import { cn } from "cn";

type ButtonProps = React.ComponentProps<"button"> & {
	variant?: "default" | "ghost";
	size?: "default" | "icon";
};

export default function Button({ children, className, onClick, disabled, variant = "default", size = "default", ...props }: ButtonProps) {
	return (
		<button
			onClick={onClick}
			disabled={disabled}
			className={cn(
				"inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg fill-zinc-300 text-sm font-medium text-zinc-300 transition-all duration-150 ease-out hover:bg-zinc-800/80 hover:fill-zinc-50 hover:text-zinc-50 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50",
				variant === "ghost" ? "bg-transparent" : "bg-zinc-800",
				size === "icon" ? "h-10 w-10" : "h-10 px-4 py-2",
				className,
			)}
			{...props}
		>
			{children}
		</button>
	);
}
