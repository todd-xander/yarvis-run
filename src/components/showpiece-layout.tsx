import { PostMarkdown } from "@/components/post-markdown";
import { GiscusComments } from "@/components/giscus-comments";

type ShowpieceLayoutProps = {
	body: string;
};

export function ShowpieceLayout({
	body,
}: ShowpieceLayoutProps) {
	return (
		<div className="space-y-6">
			<article className="bg-card px-2 py-2">
				<div className="pt-1">
					<PostMarkdown content={body} />
				</div>
			</article>
			<GiscusComments />
		</div>
	);
}
