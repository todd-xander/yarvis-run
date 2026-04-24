import { PageTopBar } from "@/components/page-top-bar";
import { PostCard } from "@/components/post-card";
import { ShowpieceCard } from "@/components/showpiece-card";
import { EmptyStateCard } from "@/components/ui/empty-state-card";
import { AuthorAvatar } from "@/components/ui/author-avatar";
import { Pill } from "@/components/ui/pill";
import { CONTENT_DIMENSIONS } from "@/lib/content-constants";
import type { DimensionItem, FeedItem } from "@/lib/content-types";

type FeedLayoutProps = {
	title: string;
	description?: string;
	cover?: string;
	avatar?: DimensionItem;
	tags?: string[];
	items: FeedItem[];
	hideTopBar?: boolean;
	dimRoutes?: Record<string, string>;
};

function FeedTab() {
	return (
		<div className="mt-4">
			<span
				className="inline-flex h-12 min-w-24 items-center justify-center border-b-[3px] border-jike-yellow px-4 py-2.5 text-base font-medium leading-6"
			>
				动态
			</span>
		</div>
	);
}

export function FeedLayout({
	title,
	description,
	cover,
	avatar,
	tags,
	items,
	hideTopBar,
	dimRoutes,
}: FeedLayoutProps) {
	const hasCover = !!cover;
	const hasAvatar = !!avatar;
	const showTopBar = !hideTopBar && !hasCover;
	const showCompactHeader = !hasCover && hasAvatar;

	const feedList = (
		<section className="layout-content">
			{items.length > 0 ? (
				items.map((item) => {
					if (item.type === "showpiece") {
						return (
							<ShowpieceCard
								key={item.id}
								item={item}
								authorDimDir={dimRoutes?.[CONTENT_DIMENSIONS.author]}
							/>
						);
					}
					return (
						<PostCard
							key={item.id}
							post={item}
							dimRoutes={dimRoutes}
						/>
					);
				})
			) : (
				<EmptyStateCard>暂无内容</EmptyStateCard>
			)}
		</section>
	);

	if (hasCover) {
		return (
			<>
				<PageTopBar title={title} cover={cover} />
				<div className="relative z-10 bg-card px-2 pb-4">
					{hasAvatar && (
						<div className="flex items-end justify-between">
							<AuthorAvatar
								author={avatar}
								shape="circle"
								size="xl"
								className="-mt-26 ml-4 border-4 border-solid-white font-bold"
							/>
						</div>
					)}
					<h1
						className={`text-4xl font-semibold ${hasAvatar ? "mt-2" : "mt-6"} mb-4`}
					>
						{title}
					</h1>
					{description && (
						<p className="mt-1 text-md leading-5 text-muted">{description}</p>
					)}
					{tags && tags.length > 0 && (
						<div className="mt-2.5 flex flex-wrap gap-1.5">
							{tags.map((tag) => (
								<Pill key={tag} variant="outline">
									{tag}
								</Pill>
							))}
						</div>
					)}
				</div>
				<FeedTab />
				{feedList}
			</>
		);
	}

	return (
		<>
			{showTopBar && (
				<PageTopBar title={title} />
			)}

			{showCompactHeader && (
				<header className="flex gap-3 px-4 pt-4">
					<AuthorAvatar author={avatar} size="lg" shape="square" />
					<div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5">
						<h1 className="text-2xl font-semibold">{title}</h1>
						{description && <p className="text-sm text-muted">{description}</p>}
					</div>
				</header>
			)}
			<FeedTab />
			{feedList}
		</>
	);
}
