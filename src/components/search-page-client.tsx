"use client";

import { RiSearchLine } from "@remixicon/react";
import { useMemo, useState } from "react";
import { PostCard } from "@/components/post-card";
import { EmptyStateCard } from "@/components/ui/empty-state-card";
import { Pill } from "@/components/ui/pill";
import type { DimensionItemWithPostCount, SearchablePost } from "@/lib/content-types";

type SearchPageClientProps = {
	posts: SearchablePost[];
	categoryItems: DimensionItemWithPostCount[];
	categoryBasePath: string;
	dimRoutes?: Record<string, string>;
};

export function SearchPageClient({
	posts,
	categoryItems,
	categoryBasePath,
	dimRoutes,
}: SearchPageClientProps) {
	const [query, setQuery] = useState("");
	const trimmedQuery = query.trim().toLowerCase();
	const results = useMemo(() => {
		if (!trimmedQuery) return [];
		return posts.filter((post) => post.searchText.includes(trimmedQuery));
	}, [posts, trimmedQuery]);

	return (
		<div className="space-y-3 mt-5">
			<div className="p-3 sticky top-0 z-3">
				<div className="flex h-10 items-center rounded-full bg-surface-soft px-4 text-muted-soft">
					<RiSearchLine className="mr-3 size-4 shrink-0" />
					<input
						value={query}
						onChange={(event) => setQuery(event.target.value)}
						placeholder="搜索"
						className="h-6 w-full border-0 bg-transparent p-0 text-sm leading-6 text-foreground outline-none placeholder:text-muted-soft"
					/>
				</div>
			</div>

			{!trimmedQuery ? (
				categoryItems.length > 0 ? (
					<div className="flex flex-wrap gap-2 px-3 py-1">
						{categoryItems.map((item) => (
							<Pill
								key={item.id}
								variant="topic"
								href={`/${categoryBasePath}/${item.id}`}
								icon={
									<span className="relative inline-flex size-4 shrink-0 items-center justify-center rounded-full bg-jike-blue">
										<span className="size-2 rounded-full bg-jike-blue-soft" />
									</span>
								}
							>
								{item.name}
							</Pill>
						))}
					</div>
				) : (
					<EmptyStateCard>暂无分类内容</EmptyStateCard>
				)
			) : results.length === 0 ? (
				<EmptyStateCard>没有找到相关文章，请尝试其他关键词</EmptyStateCard>
			) : (
				results.map((item) => (
					<PostCard
						key={item.id}
						post={item}
						dimRoutes={dimRoutes}
					/>
				))
			)}
		</div>
	);
}
