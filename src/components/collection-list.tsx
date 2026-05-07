import Link from "next/link";
import { EmptyStateCard } from "@/components/ui/empty-state-card";
import type { FeedItem } from "@/lib/content-types";
import type { PageViewModel } from "@/lib/page-view-model";

function groupByDate(posts: FeedItem[]) {
	const groups: { year: number; month: number; items: typeof posts }[] = [];
	for (const post of posts) {
		const year = post.publishedAt.getFullYear();
		const month = post.publishedAt.getMonth() + 1;
		let group = groups.find((g) => g.year === year && g.month === month);
		if (!group) {
			group = { year, month, items: [] };
			groups.push(group);
		}
		group.items.push(post);
	}
	return groups;
}

export function getFeedItemHref(item: FeedItem) {
	return `/${item.id}`;
}

export function toCollectionCardItems(posts: FeedItem[]): PageViewModel[] {
	return posts.map((post) => ({
		frontmatter: post,
		wordCount: post.wordCount,
		body: post.content,
		assetPrefix: "",
	}));
}

export function CollectionList({
	posts,
	getHref,
}: {
	posts: FeedItem[];
	getHref: (item: FeedItem) => string;
}) {
	const groups = groupByDate(posts);

	if (posts.length === 0) {
		return <EmptyStateCard>暂无内容</EmptyStateCard>;
	}

	return (
		<div className="my-8 flex flex-col">
			{groups.map((group) => (
				<div key={`${group.year}-${group.month}`} className="flex border-t border-border/40">
					<div className="ml-4 w-18 shrink-0">
						<div className="overflow-hidden border border-t-0 border-r-0 border-border/40 text-center">
							<div className="bg-jike-yellow/5 p-1 font-mono text-xs font-medium text-muted-soft">
								{group.year}
							</div>
							<div className="rounded-b-lg px-1 py-2 font-mono text-lg font-semibold leading-tight text-muted-soft">
								{String(group.month).padStart(2, "0")}
							</div>
						</div>
					</div>
					<div className="min-w-0 flex-1 border-l border-border/40 pb-8">
						{group.items.map((post) => (
							<Link
								key={post.id}
								href={getHref(post)}
								className="flex items-center justify-between gap-3 border-b border-border/40 border-dashed py-3 pl-4"
							>
								<span className="text-sm">{post.title}</span>
								<span className="shrink-0 text-xs text-muted">
									{post.publishedAt.getDate()}日
								</span>
							</Link>
						))}
					</div>
				</div>
			))}
		</div>
	);
}
