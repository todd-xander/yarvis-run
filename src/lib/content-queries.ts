import { CONTENT_DIMENSIONS } from "@/lib/content-constants";
import type { DimensionItem, Post } from "@/lib/content-types";
import {
	ANONYMOUS_AUTHOR,
	normalizeDimensionValue,
} from "@/lib/content-repository-scan";

export function resolvePostsWithRelations(
	sourcePosts: Post[],
	dimsMap: Record<string, DimensionItem[]>,
): (Post & { dims: Record<string, DimensionItem> })[] {
	const dimFields = Object.keys(dimsMap);
	return sourcePosts.map((post) => {
		const dims: Record<string, DimensionItem> = {};
		for (const field of dimFields) {
			const items = dimsMap[field];
			const normalizedValue = normalizeDimensionValue(post, field);
			if (normalizedValue && items) {
				const matched = items.find((item) => item.id === normalizedValue);
				if (matched) dims[field] = matched;
			}
		}
		if (!dims[CONTENT_DIMENSIONS.author]) {
			dims[CONTENT_DIMENSIONS.author] = ANONYMOUS_AUTHOR;
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
