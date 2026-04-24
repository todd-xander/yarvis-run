"use client";

import Link from "next/link";
import { AuthorAvatar } from "@/components/ui/author-avatar";
import { EmptyStateCard } from "@/components/ui/empty-state-card";
import { Pill } from "@/components/ui/pill";
import type { CatalogDimension, DimensionItemWithPostCount } from "@/lib/content-types";

type CatalogPageClientProps = {
	dimensions: CatalogDimension[];
	dimItems: Record<string, DimensionItemWithPostCount[]>;
};

function SectionHeader({ label }: { label: string }) {
	return (
		<div className="flex items-center">
			<span className="inline-flex h-12 min-w-24 items-center justify-center border-b-[3px] border-jike-yellow px-4 py-2.5 text-base font-medium leading-6">
				{label}
			</span>
		</div>
	);
}

function DimItemList({
	basePath,
	items,
	display,
	emptyLabel,
}: {
	basePath: string;
	items: DimensionItemWithPostCount[];
	display: "list" | "pill";
	emptyLabel: string;
}) {
	if (display === "pill") {
		if (items.length === 0) {
			return <EmptyStateCard>{emptyLabel} 暂无内容</EmptyStateCard>;
		}
		return (
			<div className="flex flex-wrap gap-2 px-2 py-4">
				{items.map((item) => (
					<Pill
						key={item.id}
						variant="topic"
						href={`/${basePath}/${item.id}`}
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
		);
	}

	if (items.length === 0) {
		return <EmptyStateCard>{emptyLabel} 暂无内容</EmptyStateCard>;
	}

	return (
		<div className="divide-y divide-border">
			{items.map((item) => (
				<Link
					key={item.id}
					href={`/${basePath}/${item.id}`}
					className="flex items-center gap-3 px-2 py-3 border-border/50"
				>
					<AuthorAvatar author={item} size="md" shape="square" />
					<div className="min-w-0 flex-1">
						<p className="text-sm font-semibold leading-5">{item.name}</p>
						<p className="text-xs leading-4 text-muted">{item.description}</p>
					</div>
					<span className="shrink-0 text-xs text-muted">
						{item.postCount}
					</span>
				</Link>
			))}
		</div>
	);
}

export function CatalogPageClient({ dimensions, dimItems }: CatalogPageClientProps) {
	if (dimensions.length === 0) {
		return (
			<section className="layout-content">
				<div className="pt-4">
					<EmptyStateCard>暂无分类内容</EmptyStateCard>
				</div>
			</section>
		);
	}

	return (
		<section className="layout-content">
			<div className="space-y-6 pt-4">
				{dimensions.map((dim) => (
					<div key={dim.postField}>
						<SectionHeader label={dim.label} />
						<DimItemList
							basePath={dim.dir || dim.postField}
							items={dimItems[dim.postField] || []}
							display={dim.display}
							emptyLabel={dim.label}
						/>
					</div>
				))}
			</div>
		</section>
	);
}
