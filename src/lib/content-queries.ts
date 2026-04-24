import type { DimensionItem, Post } from "@/lib/content-types";

export function resolvePostsWithRelations(
	sourcePosts: Post[],
	dimsMap: Record<string, DimensionItem[]>,
): (Post & { dims: Record<string, DimensionItem> })[] {
	const dimFields = Object.keys(dimsMap);
	return sourcePosts.map((post) => {
		const dims: Record<string, DimensionItem> = {};
		for (const field of dimFields) {
			const items = dimsMap[field];
			const rawValue = (post as Record<string, unknown>)[field];
			if (typeof rawValue === "string" && items) {
				const matched = items.find((item) => item.id === rawValue);
				if (matched) dims[field] = matched;
			}
		}
		return { ...post, dims };
	});
}

export function getPostBySlug(posts: Post[], slug: string) {
	return posts.find((post) => post.slug === slug);
}

export function getAdjacentPosts<T extends Post>(posts: T[], slug: string) {
	const index = posts.findIndex((post) => post.slug === slug);
	if (index === -1) return { prev: undefined, next: undefined };
	return {
		prev: index > 0 ? posts[index - 1] : undefined,
		next: index < posts.length - 1 ? posts[index + 1] : undefined,
	};
}
