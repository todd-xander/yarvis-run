"use client";

import Image from "next/image";
import Link from "next/link";
import { RiMoreLine, RiQuillPenLine, RiTimerLine } from "@remixicon/react";
import { FeedCardShell } from "@/components/feed-card-shell";
import { Pill } from "@/components/ui/pill";
import { CONTENT_DIMENSIONS } from "@/lib/content-constants";
import type { FeedItem } from "@/lib/content-types";

export function ShowpieceCard({
	item,
	authorDimDir,
}: {
	item: FeedItem;
	authorDimDir?: string;
}) {
	return (
		<FeedCardShell
			author={item.dims[CONTENT_DIMENSIONS.author] || { id: "", name: "" }}
			publishedAt={item.publishedAt}
			authorDimDir={authorDimDir}
		>
			<Link href={`/${item.id}`} className="group block">
				<div className="flex gap-0 rounded-lg border border-border/40 bg-surface-subtle p-1 transition-colors group-hover:border-border/80 group-hover:bg-surface-hover">
					{item.cover && (
						<div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-l-xl">
							<Image
								src={item.cover}
								alt={item.title}
								fill
								sizes="80px"
								className="object-contain p-2"
							/>
						</div>
					)}
					<div className="min-w-0 flex-1 flex flex-col ml-2 divide-y divide-border/30">
						<div className="grow p-2">
							<p className="line-clamp-1 text-sm font-semibold leading-5">
								{item.title}
							</p>
							{item.description && (
								<p className="mt-1 line-clamp-2 text-xs leading-4 text-muted">
									{item.description}
								</p>
							)}
						</div>
						<div className="flex justify-end px-3 py-2 text-xs text-muted">
							{item.dims[CONTENT_DIMENSIONS.category]?.name}
						</div>
					</div>
				</div>
			</Link>

			<div className="mt-4 flex h-9 items-center justify-between text-sm leading-5 text-muted">
				<div className="flex items-center gap-6">
					<Pill
						variant="action"
						icon={<RiQuillPenLine className="size-5" />}
					>
						{item.wordCount}
					</Pill>
					<Pill
						variant="action"
						icon={<RiTimerLine className="size-5" />}
					>
						{item.readingMinutes}分钟
					</Pill>
				</div>
				<Pill
					variant="action"
					href={`/${item.id}`}
					ariaLabel="查看更多"
					icon={<RiMoreLine className="size-5" />}
				/>
			</div>
		</FeedCardShell>
	);
}
