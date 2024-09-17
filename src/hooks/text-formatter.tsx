import Linkify from "linkify-react";

export default function useFormat(content: string) {
	const renderLink = ({ attributes, content }: { attributes: any; content: any }) => {
		const { href, ...props } = attributes;
		return (
			<a href={href} target="_blank" className="text-[#60a5fa] hover:underline" {...props}>
				{content}
			</a>
		);
	};
	return (
		<Linkify tagName="p" options={{ render: renderLink }}>
			{content}
		</Linkify>
	);
}
