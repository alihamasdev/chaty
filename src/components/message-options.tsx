import { ChevronDownIcon, PencilIcon, Trash2Icon } from "lucide-react";

import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useChat } from "@/context/chat-context";

export default function MessageMenu({ id, message }: { id: string; message: string }) {
	const { deleteMessage, startEdit } = useChat();

	return (
		<div className="absolute top-0 right-0 flex h-7 items-center justify-end rounded-tr-xl bg-linear-to-l from-secondary from-60% via-secondary/80 to-transparent pr-1.5 pl-5 opacity-0 transition-opacity duration-150 group-hover/bubble:opacity-100 aria-expanded:opacity-100 data-open:opacity-100 [@media(hover:none)]:opacity-70">
			<DropdownMenu>
				<DropdownMenuTrigger
					render={
						<button
							type="button"
							aria-label="Message options"
							className="inline-flex cursor-pointer items-center justify-center text-foreground/70 transition-colors duration-150 outline-none hover:text-foreground"
						/>
					}
				>
					<ChevronDownIcon className="size-4" />
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" side="bottom" className="w-36 p-1">
					<DropdownMenuGroup>
						<DropdownMenuItem onClick={() => startEdit(id, message)} className="cursor-pointer gap-2">
							<PencilIcon className="size-3.5" />
							<span>Edit</span>
						</DropdownMenuItem>
						<DropdownMenuItem variant="destructive" onClick={() => deleteMessage(id)} className="cursor-pointer gap-2">
							<Trash2Icon className="size-3.5" />
							<span>Delete</span>
						</DropdownMenuItem>
					</DropdownMenuGroup>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
