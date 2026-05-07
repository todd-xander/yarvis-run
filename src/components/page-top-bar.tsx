"use client";

import Image from "next/image";
import Link from "next/link";
import { RiArrowLeftSLine, RiCalendar2Line, RiMapPin2Line, RiQuillPenLine, RiTimerLine } from "@remixicon/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { CardCover } from "@/components/card-cover";
import { AuthorAvatar } from "@/components/ui/author-avatar";
import { Pill } from "@/components/ui/pill";
import { RemixIcon } from "@/components/ui/remix-icon";
import type { Badge, ContentFrontmatter, MetaItem } from "@/lib/content-types";
import type { PageTopBarAuthor, PageViewModel } from "@/lib/page-view-model";

type PageTopBarProps = {
	page: PageViewModel;
};

type ShowpieceHeaderState = {
	image?: string;
	badges: Badge[];
	meta: MetaItem[];
};

const badgeTypeClassName = {
	neutral: "bg-surface-subtle text-secondary",
	success: "bg-emerald-100 text-emerald-700",
	warning: "bg-amber-100 text-amber-700",
	danger: "bg-red-100 text-red-700",
} as const;

function formatDate(value: Date) {
	return value.toLocaleDateString("zh-CN", {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	});
}

function useVisibilityState(targetRef: RefObject<Element | null>, rootMargin: string) {
	const [visible, setVisible] = useState(true);

	useEffect(() => {
		const target = targetRef.current;
		if (!target) return;

		const observer = new IntersectionObserver(
			([entry]) => {
				setVisible(entry.isIntersecting);
			},
			{ threshold: 0, rootMargin },
		);

		observer.observe(target);
		return () => observer.disconnect();
	}, [rootMargin, targetRef]);

	return visible;
}

function getShowpieceHeaderState(frontmatter: ContentFrontmatter): ShowpieceHeaderState | undefined {
	if (frontmatter.layout !== "showpiece") return undefined;
	return {
		image: frontmatter.cover,
		badges: frontmatter.badge ?? [],
		meta: frontmatter.meta ?? [],
	};
}

function renderTagPills(tags: string[] | undefined, className = "") {
	if (!tags || tags.length === 0) return null;

	return (
		<div className={className || "mt-2.5 flex flex-wrap gap-1.5"}>
			{tags.map((tag) => (
				<Pill key={tag} variant="outline">
					{tag}
				</Pill>
			))}
		</div>
	);
}

function StickyBar({
	title,
	rightSlot,
	scrolled,
	showTitle,
	usesCoverHero,
	onBack,
}: {
	title: string;
	rightSlot: PageViewModel["rightSlot"];
	scrolled: boolean;
	showTitle: boolean;
	usesCoverHero: boolean;
	onBack: () => void;
}) {
	return (
		<div
			className={`sticky top-0 z-20 ${usesCoverHero
				? scrolled
					? "bg-background shadow-divider-bottom"
					: "bg-transparent"
				: scrolled
					? "bg-background shadow-divider-bottom"
					: "bg-background"
				}`}
		>
			<div className="flex items-center justify-between p-4">
				<div className="flex min-h-7 min-w-7 items-center justify-start">
					<button
						type="button"
						onClick={onBack}
						className={`inline-flex cursor-pointer items-center rounded-full transition-all duration-300 ${usesCoverHero && !scrolled
							? "gap-1 bg-black/16 px-3.5 py-1 text-white backdrop-blur-[6px]"
							: "size-7 justify-center text-foreground"
							}`}
						aria-label="返回"
					>
						<RiArrowLeftSLine className={usesCoverHero && !scrolled ? "size-5" : "size-8 transition-all duration-300"} />
					</button>
				</div>
				<h1
					className={`min-w-0 truncate px-3 text-xl font-medium leading-7 transition-all duration-300 ${showTitle ? "translate-y-0 opacity-100 text-foreground" : "translate-y-2 opacity-0"}`}
				>
					{title}
				</h1>
				<div className="flex min-h-7 min-w-7 items-center justify-end">
					{rightSlot}
				</div>
			</div>
		</div>
	);
}

function CoverHero({ cover, sentinelRef }: { cover: string; sentinelRef: RefObject<HTMLDivElement | null> }) {
	return (
		<div className="relative -mt-[60px]">
			<div
				className="h-65"
				style={{
					backgroundImage: `url(${cover})`,
					backgroundSize: "cover",
					backgroundPosition: "center",
				}}
				aria-hidden
			/>
			<div ref={sentinelRef} className="absolute bottom-0 inset-x-0" />
		</div>
	);
}

function ShowpieceHeaderContent({
	title,
	description,
	header,
	contentTitleRef,
}: {
	title: string;
	description?: string;
	header: ShowpieceHeaderState;
	contentTitleRef: RefObject<HTMLHeadingElement | null>;
}) {
	return (
		<div className="relative z-10 px-4 pt-4">
			<div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
				<div className="aspect-square w-full max-w-48 shrink-0 overflow-hidden rounded-xl sm:size-48">
					{header.image ? (
						<div className="relative size-full rounded-xl bg-surface-subtle">
							<Image
								src={header.image}
								alt={title}
								fill
								sizes="192px"
								unoptimized={header.image.startsWith("/content/")}
								className="object-contain p-4"
							/>
						</div>
					) : (
						<CardCover
							title={title}
							className="size-full rounded-xl"
							titleClassName="text-[clamp(1rem,2vw,2rem)]"
						/>
					)}
				</div>
				<div className="min-w-0 flex-1 space-y-3 self-auto mb-4 sm:self-end">
					<h1 ref={contentTitleRef} className="flex flex-wrap gap-x-4 text-2xl font-semibold">
						{title}
						{header.badges.length > 0 && (
							<div className="leading-0">
								{header.badges.map((badge) => (
									<span
										key={`${badge.type || "neutral"}-${badge.icon || "none"}-${badge.label}`}
										className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs text-nowrap font-medium ${badgeTypeClassName[badge.type || "neutral"]}`}
									>
										<RemixIcon name={badge.icon} className="size-3.5" />
										{badge.label}
									</span>
								))}
							</div>
						)}
					</h1>
					{description && <p className="text-sm text-muted">{description}</p>}
					{header.meta.length > 0 && (
						<div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
							{header.meta.map((item) => (
								<div
									key={`${item.label}-${item.value}`}
									className="flex min-w-0 flex-1 items-center justify-between gap-3"
								>
									<span className="inline-flex shrink-0 whitespace-nowrap items-center gap-1.5 text-muted">
										<RemixIcon name={item.icon} className="size-4" />
										{item.label}
									</span>
									<span className="truncate text-right font-medium">{item.value}</span>
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

function PostHeaderContent({
	frontmatter,
	wordCount,
	author,
	contentTitleRef,
}: {
	frontmatter: ContentFrontmatter;
	wordCount: number;
	author?: PageTopBarAuthor;
	contentTitleRef: RefObject<HTMLHeadingElement | null>;
}) {
	return (
		<div className="relative z-10 bg-card px-4 pt-8 pb-4">
			<div className="space-y-3 border-b border-border pb-4">
				<h1 ref={contentTitleRef} className="text-3xl font-semibold">{frontmatter.title}</h1>
				{frontmatter.description && (
					<p className="text-base leading-6 text-muted">{frontmatter.description}</p>
				)}
				<div className="flex flex-wrap items-end gap-3">
					{author && (
						<Link
							href={author.href}
							className="inline-flex items-center gap-2.5 rounded-full py-1 pl-1 pr-4 transition-colors hover:bg-interactive-hover"
						>
							<AuthorAvatar
								author={{ title: author.name, avatar: author.avatar }}
								size="md"
								shape="circle"
							/>
							<div>
								<p className="text-sm font-semibold leading-5">{author.name}</p>
								{author.description && (
									<p className="text-xs leading-4 text-muted">{author.description}</p>
								)}
							</div>
						</Link>
					)}
					<div className="flex items-center gap-2 text-sm leading-5 text-muted">
						<Pill variant="action" icon={<RiCalendar2Line className="size-5" />}>
							{formatDate(frontmatter.publishedAt)}
						</Pill>
						{frontmatter.location && (
							<Pill variant="action" icon={<RiMapPin2Line className="size-5" />}>
								{frontmatter.location}
							</Pill>
						)}
						<Pill variant="action" icon={<RiQuillPenLine className="size-5" />}>
							{wordCount}
						</Pill>
						<Pill variant="action" icon={<RiTimerLine className="size-5" />}>
							{Math.max(1, Math.ceil(wordCount / 300))}分钟
						</Pill>
					</div>
				</div>
			</div>
		</div>
	);
}

function CoverIdentityHeader({
	title,
	avatar,
	description,
	tags,
	contentTitleRef,
}: {
	title: string;
	avatar: string;
	description?: string;
	tags?: string[];
	contentTitleRef: RefObject<HTMLHeadingElement | null>;
}) {
	return (
		<div className="relative z-10 bg-card px-2 pb-4">
			<div className="flex items-end justify-between">
				<AuthorAvatar
					author={{ title, avatar }}
					shape="circle"
					size="xl"
					className="-mt-26 ml-4 border-4 border-solid-white font-bold"
				/>
			</div>
			<h1 ref={contentTitleRef} className="mb-4 mt-2 text-4xl font-semibold">{title}</h1>
			{description && <p className="mt-1 text-md leading-5 text-muted">{description}</p>}
			{renderTagPills(tags)}
		</div>
	);
}

function CompactIdentityHeader({
	title,
	avatar,
	showTextAvatar = false,
	description,
	tags,
	contentTitleRef,
}: {
	title: string;
	avatar?: string;
	showTextAvatar?: boolean;
	description?: string;
	tags?: string[];
	contentTitleRef: RefObject<HTMLHeadingElement | null>;
}) {
	return (
		<div className="relative z-10">
			{avatar || description || showTextAvatar ? (
				<header className="flex gap-3 px-4 pt-4">
					{(avatar || showTextAvatar) && (
						<AuthorAvatar
							author={{ title, avatar }}
							size="lg"
							shape="square"
						/>
					)}
					<div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5">
						<h1 ref={contentTitleRef} className="text-2xl font-semibold">{title}</h1>
						{description && <p className="text-sm text-muted">{description}</p>}
					</div>
				</header>
			) : (
				<div className="px-4 pt-4">
					<h1 ref={contentTitleRef} className="text-2xl font-semibold">{title}</h1>
				</div>
			)}
			{renderTagPills(tags, "mt-2.5 flex flex-wrap gap-1.5 px-4")}
		</div>
	);
}

export function PageTopBar({ page }: PageTopBarProps) {
	const { frontmatter, rightSlot, topBarAuthor, identityAvatarTitle, wordCount } = page;
	const router = useRouter();
	const sentinelRef = useRef<HTMLDivElement>(null);
	const contentTitleRef = useRef<HTMLHeadingElement>(null);
	const sentinelVisible = useVisibilityState(sentinelRef, "-84px 0px 0px 0px");
	const titleVisible = useVisibilityState(contentTitleRef, "-84px 0px 0px 0px");

	const handleBack = useCallback(() => {
		router.back();
	}, [router]);

	const showpieceHeader = getShowpieceHeaderState(frontmatter);
	const usesCoverHero = !!frontmatter.cover && !showpieceHeader;
	const shouldShowIdentityAvatar = !!identityAvatarTitle && !frontmatter.cover && !showpieceHeader && frontmatter.layout !== "post";
	const hasHeaderContent = !!frontmatter.cover
		|| !!frontmatter.avatar
		|| !!frontmatter.description
		|| frontmatter.layout === "post"
		|| !!showpieceHeader
		|| shouldShowIdentityAvatar;
	const showTitle = !hasHeaderContent
		? true
		: usesCoverHero
			? !sentinelVisible && !titleVisible
			: !titleVisible;

	return (
		<>
			<StickyBar
				title={frontmatter.title}
				rightSlot={rightSlot}
				scrolled={!sentinelVisible}
				showTitle={showTitle}
				usesCoverHero={usesCoverHero}
				onBack={handleBack}
			/>

			{usesCoverHero ? (
				<CoverHero cover={frontmatter.cover || ""} sentinelRef={sentinelRef} />
			) : (
				<div ref={sentinelRef} />
			)}

			{showpieceHeader ? (
				<ShowpieceHeaderContent
					title={frontmatter.title}
					description={frontmatter.description}
					header={showpieceHeader}
					contentTitleRef={contentTitleRef}
				/>
			) : frontmatter.layout === "post" ? (
				<PostHeaderContent
					frontmatter={frontmatter}
					wordCount={wordCount}
					author={topBarAuthor}
					contentTitleRef={contentTitleRef}
				/>
			) : frontmatter.cover && frontmatter.avatar ? (
				<CoverIdentityHeader
					title={frontmatter.title}
					avatar={frontmatter.avatar}
					description={frontmatter.description}
					tags={frontmatter.tags}
					contentTitleRef={contentTitleRef}
				/>
			) : hasHeaderContent ? (
				<CompactIdentityHeader
					title={frontmatter.title}
					avatar={frontmatter.avatar}
					showTextAvatar={shouldShowIdentityAvatar}
					description={frontmatter.description}
					tags={frontmatter.tags}
					contentTitleRef={contentTitleRef}
				/>
			) : null}
		</>
	);
}
