"use client";

import { RiSearchLine } from "@remixicon/react";
import { useMemo, useState } from "react";
import { PostCard } from "@/components/post-card";
import { EmptyStateCard } from "@/components/ui/empty-state-card";
import type { Post } from "@/lib/content-types";

type SearchPageClientProps = {
	posts: (Post & { searchText: string; dims: Record<string, import("@/lib/content-types").DimensionItem> })[];
	dimRoutes?: Record<string, string>;
};

export function SearchPageClient({
	posts,
	dimRoutes,
}: SearchPageClientProps) {
	const [query, setQuery] = useState("");
	const results = useMemo(() => {
		const trimmed = query.trim().toLowerCase();
		if (!trimmed) return posts;
		return posts.filter((post) => post.searchText.includes(trimmed));
	}, [posts, query]);

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

			{results.length === 0 ? (
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
