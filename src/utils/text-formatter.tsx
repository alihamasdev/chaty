import Linkify from "linkify-react";

type RenderLinkProps = {
	attributes: React.AnchorHTMLAttributes<HTMLAnchorElement>;
	content: React.ReactNode;
};

export function formatText(content: string) {
	const renderLink = ({ attributes, content }: RenderLinkProps) => {
		const { href, ...props } = attributes;
		return (
			<a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline" {...props}>
				{content}
			</a>
		);
	};
	return <Linkify options={{ render: renderLink }}>{content}</Linkify>;
}

export default formatText;
