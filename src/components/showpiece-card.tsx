"use client";

import Link from "next/link";
import { RiMoreLine, RiQuillPenLine, RiTimerLine } from "@remixicon/react";
import { CardCover } from "@/components/card-cover";
import { FeedCardShell } from "@/components/feed-card-shell";
import { Pill } from "@/components/ui/pill";
import { CONTENT_DIMENSIONS } from "@/lib/content-constants";
import type { ShowpieceFeedItem } from "@/lib/content-types";

export function ShowpieceCard({
	item,
	authorDimDir,
}: {
	item: ShowpieceFeedItem;
	authorDimDir?: string;
}) {
	return (
		<FeedCardShell
			author={item.dims[CONTENT_DIMENSIONS.author] || { id: "", name: "" }}
			publishedAt={item.publishedAt}
			location={item.location}
			authorDimDir={authorDimDir}
		>
			<Link href={`/${item.id}`} className="group block">
				<div className="flex gap-0 rounded-lg border border-border/40 bg-surface-subtle p-1 transition-colors group-hover:border-border/80 group-hover:bg-surface-hover">
					<CardCover
						title={item.title}
						image={item.cover}
						className="h-24 w-24 rounded-sm"
						titleClassName="text-xs text-[clamp(0.8rem,1vw,2rem)]"
						variant="compact"
					/>
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
							{item.sectionLabel}
						</div>
					</div>
				</div>
			</Link>

			<div className="mt-4 flex h-9 items-center justify-between text-sm leading-5 text-muted">
				<div className="flex items-center gap-2">
					<Pill
						variant="action"
						ariaLabel="文章字数"
						icon={<RiQuillPenLine className="size-5" />}
					>
						{item.wordCount} 字
					</Pill>
					<Pill
						variant="action"
						ariaLabel="阅读时长"
						icon={<RiTimerLine className="size-5" />}
					>
						{item.readingMinutes} 分钟
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
