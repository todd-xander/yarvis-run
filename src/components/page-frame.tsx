import type { PropsWithChildren, ReactNode } from "react";
import { PageTopBar } from "@/components/page-top-bar";
import { PaginationNav } from "@/components/pagination-nav";
import type { PageViewModel } from "@/lib/page-view-model";

type PageFrameProps = PropsWithChildren<{
	page: PageViewModel;
	as?: "section" | "article" | "div";
	className?: string;
	innerClassName?: string;
	contentHeader?: ReactNode;
}>;

export function PageFrame({
	page,
	children,
	as = "section",
	className,
	innerClassName,
	contentHeader,
}: PageFrameProps) {
	const Tag = as;
	const hasBody = children !== undefined && children !== null;
	const hasPagination = !!page.paginationState && !!page.paginationBasePath;
	const hasContentHeader = contentHeader !== undefined && contentHeader !== null;

	return (
		<>
			<PageTopBar page={page} />
			{(hasContentHeader || hasBody || hasPagination) && (
				<Tag className={className || "layout-content"}>
					{hasContentHeader ? contentHeader : null}
					{hasBody ? (innerClassName ? <div className={innerClassName}>{children}</div> : children) : null}
					{page.paginationState && page.paginationBasePath && (
						<PaginationNav basePath={page.paginationBasePath} state={page.paginationState} />
					)}
				</Tag>
			)}
		</>
	);
}
