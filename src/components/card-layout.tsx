import Link from "next/link";
import { CardCover } from "@/components/card-cover";
import { RemixIcon } from "@/components/ui/remix-icon";
import type { DataFrontmatter } from "@/lib/content-types";
import type { PageViewModel } from "@/lib/page-view-model";
import { EmptyStateCard } from "@/components/ui/empty-state-card";

type CardLayoutProps = {
	items: PageViewModel[];
	basePath: string;
	getHref?: (page: PageViewModel) => string;
};

const badgeTypeClassName = {
	neutral: "bg-surface-subtle text-secondary",
	success: "bg-emerald-100 text-emerald-700",
	warning: "bg-amber-100 text-amber-700",
	danger: "bg-red-100 text-red-700",
} as const;

function isDataFrontmatter(frontmatter: PageViewModel["frontmatter"]): frontmatter is DataFrontmatter {
	return frontmatter.layout === "post" || frontmatter.layout === "showpiece";
}

function getCardDataState(page: PageViewModel) {
	const { frontmatter } = page;
	const dataFrontmatter = isDataFrontmatter(frontmatter) ? frontmatter : undefined;
	const rawImage = frontmatter.cover ?? dataFrontmatter?.avatar;
	const imageFit: "cover" | "contain" = frontmatter.layout === "showpiece"
		? "contain"
		: frontmatter.cover
			? "cover"
			: "contain";
	const image = rawImage;
	const resolvedImage = !image
		? undefined
		: image.startsWith("http") || image.startsWith("/")
			? image
			: `${page.assetPrefix}/${image}`;

	return {
		image: resolvedImage,
		imageFit,
		badges: dataFrontmatter?.badge ?? [],
		meta: dataFrontmatter?.meta ?? [],
	};
}

export function CardLayout({ items, basePath, getHref }: CardLayoutProps) {
	if (items.length === 0) {
		return <EmptyStateCard>暂无内容</EmptyStateCard>;
	}

	return (
		<div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
			{items.map((page) => {
				const { frontmatter } = page;
				const { image, imageFit, badges, meta } = getCardDataState(page);
				const href = getHref ? getHref(page) : `${basePath}/${frontmatter.slug}`;

				return (
					<Link
						key={frontmatter.slug}
						href={href}
						className="group overflow-hidden rounded-xl border border-border/40 bg-card transition-transform duration-200 hover:-translate-y-0.5 hover:border-border/80"
					>
						<CardCover
							title={frontmatter.title}
							image={image}
							imageFit={imageFit}
							className="aspect-4/3"
							titleClassName="text-[clamp(1.5rem,2.8vw,2rem)]"
						/>
						<div className="space-y-3 p-4">
							<div className="flex items-start justify-between gap-2">
								<p className="min-w-0 flex-1 truncate text-base font-semibold">
									{frontmatter.title}
								</p>
								{badges.length > 0 && (
									<div className="flex shrink-0 flex-wrap gap-1.5">
										{badges.map((badge) => (
											<span
												key={`${badge.type || "neutral"}-${badge.icon || "none"}-${badge.label}`}
												className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${badgeTypeClassName[badge.type || "neutral"]}`}
											>
												<RemixIcon name={badge.icon} className="size-3.5" />
												{badge.label}
											</span>
										))}
									</div>
								)}
							</div>
							{frontmatter.description && (
								<p className="truncate text-sm leading-6 text-muted">
									{frontmatter.description}
								</p>
							)}
							{meta.length > 0 && (
								<div className="space-y-2">
									{meta.map((item) => (
										<div
											key={`${item.label}-${item.value}`}
											className="flex items-center justify-between gap-3 text-xs text-muted"
										>
											<span className="inline-flex shrink-0 whitespace-nowrap items-center gap-1.5">
												<RemixIcon name={item.icon} className="size-3.5" />
												{item.label}
											</span>
											<span className="min-w-0 flex-1 truncate text-right text-foreground">
												{item.value}
											</span>
										</div>
									))}
								</div>
							)}
						</div>
					</Link>
				);
			})}
		</div>
	);
}
