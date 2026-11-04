import Linkify from "linkify-react";

type RenderLinkProps = {
	attributes: React.AnchorHTMLAttributes<HTMLAnchorElement>;
	content: React.ReactNode;
};

export function formatText(content: string) {
	const renderLink = ({ attributes, content }: RenderLinkProps) => {
		const { href, ...props } = attributes;
		return (
			<a
				href={href}
				target="_blank"
				rel="noopener noreferrer"
				className="text-primary underline underline-offset-4 hover:opacity-80"
				{...props}
			>
				{content}
			</a>
		);
	};
	return <Linkify options={{ render: renderLink }}>{content}</Linkify>;
}

export default formatText;
