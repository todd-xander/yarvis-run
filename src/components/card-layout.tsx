import Link from "next/link";
import { CardCover } from "@/components/card-cover";
import { RemixIcon } from "@/components/ui/remix-icon";
import { resolveCoverImage } from "@/lib/folder-content";
import type { ShowpieceFrontmatter } from "@/lib/content-types";
import type { FolderDocument } from "@/lib/folder-content";

type CardLayoutProps = {
	items: FolderDocument[];
	basePath: string;
};

const badgeTypeClassName = {
	neutral: "bg-surface-subtle text-secondary",
	success: "bg-emerald-100 text-emerald-700",
	warning: "bg-amber-100 text-amber-700",
	danger: "bg-red-100 text-red-700",
} as const;

export function CardLayout({ items, basePath }: CardLayoutProps) {
	return (
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
			{items.map((doc) => {
				const { frontmatter } = doc;
				const fm = frontmatter.layout === "showpiece" ? frontmatter as ShowpieceFrontmatter : undefined;
				const image = resolveCoverImage(doc);
				const badges = fm?.badge || [];
				const meta = fm?.meta || [];
				const href = `${basePath}/${doc.slug}`;

				return (
					<Link
						key={doc.slug}
						href={href}
						className="group overflow-hidden rounded-xl border border-border/40 bg-card transition-transform duration-200 hover:-translate-y-0.5 hover:border-border/80"
					>
						<CardCover
							title={frontmatter.title}
							image={image}
							className="aspect-4/3"
							titleClassName="text-[clamp(1.5rem,2.8vw,2rem)]"
						/>
						<div className="space-y-3 p-4">
							<div className="flex items-start justify-between gap-2">
								<p className="text-base font-semibold">{frontmatter.title}</p>
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
								<p className="line-clamp-2 text-sm leading-6 text-muted">
									{frontmatter.description}
								</p>
							)}
							{meta.length > 0 && (
								<div className="space-y-2">
									{meta.slice(0, 2).map((item) => (
										<div
											key={`${item.label}-${item.value}`}
											className="flex items-center justify-between gap-3 text-xs text-muted"
										>
											<span className="inline-flex items-center gap-1.5">
												<RemixIcon name={item.icon} className="size-3.5" />
												{item.label}
											</span>
											<span className="text-foreground">{item.value}</span>
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
