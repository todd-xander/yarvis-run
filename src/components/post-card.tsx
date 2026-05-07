"use client";

import { RiMoreLine, RiQuillPenLine, RiTimerLine } from "@remixicon/react";
import Link from "next/link";
import { PostImageGrid } from "@/components/post-image-grid";
import { FeedCardShell } from "@/components/feed-card-shell";
import { Pill } from "@/components/ui/pill";
import { CONTENT_DIMENSIONS } from "@/lib/content-constants";
import type { DimensionItem, ResolvedPost } from "@/lib/content-types";

type PostCardProps = {
	post: ResolvedPost;
	dimRoutes?: Record<string, string>;
};

export function PostCard({
	post,
	dimRoutes,
}: PostCardProps) {
	const dims = post.dims;
	const authorItem: DimensionItem = dims[CONTENT_DIMENSIONS.author] || { id: "", name: "" };
	const categoryItem: DimensionItem = dims[CONTENT_DIMENSIONS.category] || { id: "", name: "" };
	const authorDimDir = dimRoutes?.[CONTENT_DIMENSIONS.author] || "";
	const categoryDimDir = dimRoutes?.[CONTENT_DIMENSIONS.category] || "";
	const categoryHref = categoryDimDir && categoryItem.id ? `/${categoryDimDir}/${categoryItem.id}` : undefined;
	const postSection = post.id.split("/")[0];

	return (
		<FeedCardShell
			author={authorItem}
			publishedAt={post.publishedAt}
			location={post.location}
			authorDimDir={authorDimDir}
		>
			<div className="flex gap-4">
				<div className="min-w-0 flex-1">
					<p className="overflow-hidden whitespace-break-spaces wrap-anywhere text-base leading-6 text-foreground">
						{post.title}
					</p>
					{post.description && (
						<p className="mt-1 line-clamp-2 text-sm leading-5 text-muted">
							{post.description}
						</p>
					)}
					{postSection && (
						<Link
							href={`/${postSection}/${post.slug}`}
							className="mt-1.5 inline-block text-sm text-jike-blue hover:text-jike-blue/80"
						>
							查看更多
						</Link>
					)}
				</div>
			</div>

			<PostImageGrid images={post.images} />

			{categoryItem.name && (
				<div className="mt-3">
					<Pill
						variant="topic"
						href={categoryHref}
						icon={
							<span className="relative inline-flex size-4 shrink-0 items-center justify-center rounded-full bg-jike-blue">
								<span className="size-2 rounded-full bg-jike-blue-soft" />
							</span>
						}
					>
						{categoryItem.name}
					</Pill>
				</div>
			)}

			<div className="mt-4 flex h-9 items-center justify-between text-sm leading-5 text-muted">
				<div className="flex items-center gap-2">
					<Pill
						variant="action"
						ariaLabel="文章字数"
						icon={<RiQuillPenLine className="size-5" />}
					>
						{post.wordCount} 字
					</Pill>
					<Pill
						variant="action"
						ariaLabel="阅读时长"
						icon={<RiTimerLine className="size-5" />}
					>
						{post.readingMinutes} 分钟
					</Pill>
				</div>
				<Pill
					variant="action"
					href={`/${postSection}/${post.slug}`}
					ariaLabel="查看更多"
					icon={<RiMoreLine className="size-5" />}
				/>
			</div>
		</FeedCardShell>
	);
}
