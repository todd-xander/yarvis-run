import { PageFrame } from "@/components/page-frame";
import { PostCard } from "@/components/post-card";
import { ShowpieceCard } from "@/components/showpiece-card";
import { EmptyStateCard } from "@/components/ui/empty-state-card";
import { CONTENT_DIMENSIONS } from "@/lib/content-constants";
import type { ResolvedPost } from "@/lib/content-types";
import type { PageViewModel } from "@/lib/page-view-model";

type FeedLayoutProps = {
	page: PageViewModel;
	items: Array<(ResolvedPost & { type: "post" }) | (ResolvedPost & { type: "showpiece" })>;
	dimRoutes?: Record<string, string>;
};

function FeedTab() {
	return (
		<div className="mt-4">
			<span
				className="inline-flex h-12 min-w-24 items-center justify-center border-b-[3px] border-jike-yellow px-4 py-2.5 text-base font-medium leading-6"
			>
				动态
			</span>
		</div>
	);
}

export function FeedLayout({
	page,
	items,
	dimRoutes,
}: FeedLayoutProps) {
	const { frontmatter } = page;
	const { cover } = frontmatter;
	const hasCover = !!cover;
	const hasAvatar = !!frontmatter.avatar;
	const showCompactHeader = !hasCover && hasAvatar;

	const feedList = (
		<>
			{items.length > 0 ? (
				items.map((item) => {
					if (item.type === "showpiece") {
						return (
							<ShowpieceCard
								key={item.id}
								item={item}
								authorDimDir={dimRoutes?.[CONTENT_DIMENSIONS.author]}
							/>
						);
					}
					return (
						<PostCard
							key={item.id}
							post={item}
							dimRoutes={dimRoutes}
						/>
					);
				})
			) : (
				<EmptyStateCard>暂无内容</EmptyStateCard>
			)}
		</>
	);

	return (
		<PageFrame
			page={{
				...page,
				frontmatter: hasCover || showCompactHeader
					? frontmatter
					: {
						...frontmatter,
						avatar: undefined,
					},
			}}
			className="layout-content"
			contentHeader={<FeedTab />}
		>
			{feedList}
		</PageFrame>
	);
}
