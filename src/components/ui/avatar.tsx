import { cn } from "cn";
import { useState } from "react";

type AvatarProps = {
	src?: string | null;
	alt?: string;
	className?: string;
};

export default function Avatar({ src, alt, className }: AvatarProps) {
	const [prevSrc, setPrevSrc] = useState(src);
	const [imageError, setImageError] = useState(false);

	if (prevSrc !== src) {
		setPrevSrc(src);
		setImageError(false);
	}

	const initial = alt && alt.trim().length > 0 ? alt.trim().charAt(0).toUpperCase() : "?";

	if (!src || imageError) {
		return (
			<div
				className={cn("flex items-center justify-center rounded-full bg-zinc-700 font-semibold text-zinc-200 select-none", className)}
				title={alt || "User"}
				aria-label={alt || "User avatar"}
			>
				{initial}
			</div>
		);
	}

	return (
		<img
			referrerPolicy="no-referrer"
			loading="lazy"
			src={src}
			alt={alt || "Avatar"}
			title={alt}
			onError={() => setImageError(true)}
			className={cn("rounded-full bg-zinc-950 object-cover", className)}
		/>
	);
}
