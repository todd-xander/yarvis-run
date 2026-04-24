import Image from "next/image";
import { RemixIcon } from "@/components/ui/remix-icon";
import { PostMarkdown } from "@/components/post-markdown";
import { GiscusComments } from "@/components/giscus-comments";
import type { Badge, MetaItem } from "@/lib/content-types";

const badgeTypeClassName = {
	neutral: "bg-surface-subtle text-secondary",
	success: "bg-emerald-100 text-emerald-700",
	warning: "bg-amber-100 text-amber-700",
	danger: "bg-red-100 text-red-700",
} as const;

type ShowpieceLayoutProps = {
	title: string;
	subtitle?: string;
	image?: string;
	badges: Badge[];
	meta: MetaItem[];
	body: string;
};

export function ShowpieceLayout({
	title,
	subtitle,
	image,
	badges,
	meta,
	body,
}: ShowpieceLayoutProps) {
	return (
		<div className="space-y-6">
			<div className="flex gap-6">
				{image && (
					<div className="relative size-48 shrink-0 overflow-hidden rounded-xl bg-surface-subtle">
						<Image
							src={image}
							alt={title}
							fill
							sizes="192px"
							className="object-contain p-4"
						/>
					</div>
				)}
				<div className="min-w-0 flex-1 space-y-3">
					<h1 className="text-2xl font-semibold">{title}</h1>
					{badges.length > 0 && (
						<div className="flex flex-wrap gap-1.5">
							{badges.map((badge) => (
								<span
									key={`${badge.type || "neutral"}-${badge.icon || "none"}-${badge.label}`}
									className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${badgeTypeClassName[badge.type || "neutral"]}`}
								>
									<RemixIcon name={badge.icon} className="size-3.5" />
									{badge.label}
								</span>
							))}
						</div>
					)}
					{subtitle && (
						<p className="text-sm text-muted">{subtitle}</p>
					)}
					{meta.length > 0 && (
						<div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
							{meta.map((item) => (
								<div
									key={`${item.label}-${item.value}`}
									className="flex items-center justify-between gap-3"
								>
									<span className="inline-flex items-center gap-1.5 text-muted">
										<RemixIcon name={item.icon} className="size-4" />
										{item.label}
									</span>
									<span className="font-medium">{item.value}</span>
								</div>
							))}
						</div>
					)}
				</div>
			</div>
			<article className="bg-card px-1 py-2 sm:px-0">
				<div className="pt-1">
					<PostMarkdown content={body} />
				</div>
			</article>
			<GiscusComments />
		</div>
	);
}
