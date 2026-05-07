import Link from "next/link";
import { RiArrowLeftSLine, RiArrowRightSLine } from "@remixicon/react";
import type { PaginationState } from "@/lib/pagination";

type PaginationNavProps = {
	basePath: string;
	state: PaginationState;
};

function pageHref(basePath: string, page: number) {
	return page <= 1 ? basePath : `${basePath}?page=${page}`;
}

export function PaginationNav({ basePath, state }: PaginationNavProps) {
	if (state.totalPages <= 1) return null;

	return (
		<div className="flex items-center justify-between gap-3 border-t border-border/40 px-2 py-4">
			{state.hasPrev ? (
				<Link
					href={pageHref(basePath, state.prevPage || 1)}
					className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-interactive-hover"
				>
					<RiArrowLeftSLine className="size-4" />
					上一页
				</Link>
			) : (
				<span className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm text-muted">
					<RiArrowLeftSLine className="size-4" />
					上一页
				</span>
			)}
			<span className="text-xs text-muted">
				第 {state.page} / {state.totalPages} 页
			</span>
			{state.hasNext ? (
				<Link
					href={pageHref(basePath, state.nextPage || 1)}
					className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-interactive-hover"
				>
					下一页
					<RiArrowRightSLine className="size-4" />
				</Link>
			) : (
				<span className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm text-muted">
					下一页
					<RiArrowRightSLine className="size-4" />
				</span>
			)}
		</div>
	);
}
