import { DEFAULT_CATALOG_DIMENSIONS } from "@/lib/app-config";
import { RiArrowLeftSLine, RiArrowRightSLine, RiCalendar2Line, RiQuillPenLine, RiTimerLine } from "@remixicon/react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageTopBar } from "@/components/page-top-bar";
import { PostMarkdown } from "@/components/post-markdown";
import { AuthorAvatar } from "@/components/ui/author-avatar";
import { Pill } from "@/components/ui/pill";
import { FeedLayout } from "@/components/feed-layout";
import { CardLayout } from "@/components/card-layout";
import { ShowpieceLayout } from "@/components/showpiece-layout";
import { CatalogPageClient } from "@/components/catalog-page-client";
import { GiscusComments } from "@/components/giscus-comments";
import { CONTENT_DIMENSIONS } from "@/lib/content-constants";
import {
	getDimensionPageDataWithCover,
	getHomePageData,
	getPostDetailPageData,
	getSectionDetailPageData,
	getSectionIndexData,
} from "@/lib/content-page-data";
import {
	listResolvedPosts,
	listFeedItems,
	listDimensionItemsWithCounts,
} from "@/lib/content-repository";
import { listFolderDocuments } from "@/lib/folder-content";
import { getMenuLabel, getSiteConfig, getDimensionRoutesMap, type SectionMeta } from "@/lib/site-config";
import type { CatalogDimension, DimensionItemWithPostCount, DimensionPostField, FeedItem, SortConfig } from "@/lib/content-types";
import { applySortConfig } from "@/lib/sort-utils";
import { generatePathStaticParams, resolvePathTarget } from "@/lib/path-routing";

type PathPageProps = {
	params: Promise<{ path: string[] }>;
};

function formatDate(value: Date) {
	return value.toLocaleDateString("zh-CN", {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	});
}

function groupByDate(posts: { publishedAt: Date; title: string; id: string }[]) {
	const groups: { year: number; month: number; items: typeof posts }[] = [];
	for (const post of posts) {
		const year = post.publishedAt.getFullYear();
		const month = post.publishedAt.getMonth() + 1;
		let group = groups.find((g) => g.year === year && g.month === month);
		if (!group) {
			group = { year, month, items: [] };
			groups.push(group);
		}
		group.items.push(post);
	}
	return groups;
}

export async function generateStaticParams() {
	return generatePathStaticParams();
}

export default async function DynamicPathPage({ params }: PathPageProps) {
	const { path: urlParts } = await params;
	const target = resolvePathTarget(urlParts);

	switch (target.kind) {
		case "home":
			return renderHome();
		case "section-index":
			return renderSectionIndex(target.section);
		case "section-detail": {
			return renderSectionDetail(target.section, target.id);
		}
		case "post-detail": {
			return renderPostDetail(target.slug);
		}
		case "dimension-index": {
			return renderDimensionCatalog(target.dimension);
		}
		case "dimension-detail": {
			return renderDimensionPage(target.postField, target.itemId);
		}
		case "catalog":
			return renderAllDimensionsCatalog();
		default:
			notFound();
	}
}

function renderHome() {
	const indexFm = getHomePageData();
	if (!indexFm) notFound();
	const feedSort = indexFm.layout === "feed" ? indexFm.sort : undefined;
	return (
		<FeedLayout
			title={indexFm.title}
			description={indexFm.description}
			cover={indexFm.cover}
			items={applySortConfig(listFeedItems(), feedSort)}
			dimRoutes={getDimensionRoutesMap()}
			hideTopBar
		/>
	);
}

function renderPostsList(section: string, sort?: SortConfig) {
	const index = getSectionIndexData(section);
	const posts = applySortConfig(listResolvedPosts(), sort);
	const groups = groupByDate(posts);

	return (
		<>
			<PageTopBar title={index?.title || ""} cover={index?.cover} />
			<section className="layout-content">
				<div className="flex flex-col my-8 space-y-8">
					{groups.map((group) => (
						<div key={`${group.year}-${group.month}`} className="flex border-border/40 border-t">
							<div className="w-18 shrink-0 ml-4 mr-8">
								<div className="overflow-hidden text-center border border-border/40 border-t-0">
									<div className="bg-jike-yellow/5 font-mono p-1 text-xs font-medium text-muted-soft">
										{group.year}
									</div>
									<div className="rounded-b-lg font-mono px-1 py-2 text-lg font-semibold leading-tight text-muted-soft">
										{String(group.month).padStart(2, "0")}
									</div>
								</div>
							</div>
							<div className="min-w-0 flex-1 divide-y divide-border/40">
								{group.items.map((post) => (
									<Link
										key={post.id}
										href={`/${post.id}`}
										className="flex items-center justify-between gap-3 py-3"
									>
										<span className="text-sm">{post.title}</span>
										<span className="shrink-0 text-xs text-muted">
											{post.publishedAt.getDate()}日
										</span>
									</Link>
								))}
							</div>
						</div>
					))}
				</div>
			</section>
		</>
	);
}

async function renderPostDetail(slug: string) {
	const pageData = getPostDetailPageData(slug);
	if (!pageData) notFound();
	const { post, adjacent } = pageData;
	const author = post.dims[CONTENT_DIMENSIONS.author];
	const category = post.dims[CONTENT_DIMENSIONS.category];
	const dimRoutes = getDimensionRoutesMap();
	const authorDir = dimRoutes[CONTENT_DIMENSIONS.author] || "";
	const categoryDir = dimRoutes[CONTENT_DIMENSIONS.category] || "";

	return (
		<>
			<PageTopBar title={post.title} cover={post.cover} />
			<article className="layout-content space-y-5 bg-card p-4">
				<div className="space-y-3 border-b border-border pt-8 pb-4">
					<h1 className="text-3xl font-semibold">{post.title}</h1>
					{post.description && (
						<p className="text-base leading-6 text-muted">{post.description}</p>
					)}
					<div className="flex flex-wrap items-end gap-3">
						<Link
							href={`/${authorDir}/${author.id}`}
							className="inline-flex items-center gap-2.5 rounded-full pl-1 pr-3 py-1 transition-colors hover:bg-interactive-hover"
						>
							<AuthorAvatar author={author} size="md" shape="circle" />
							<div>
								<p className="text-sm font-semibold leading-5">{author.name}</p>
								<p className="text-xs leading-4 text-muted">{author.description}</p>
							</div>
						</Link>
						<div className="flex items-center gap-4 text-sm leading-5 text-muted">
							<Pill variant="action" icon={<RiCalendar2Line className="size-5" />}>
								{formatDate(post.publishedAt)}
							</Pill>
							<Pill variant="action" icon={<RiQuillPenLine className="size-5" />}>
								{post.wordCount}
							</Pill>
							<Pill variant="action" icon={<RiTimerLine className="size-5" />}>
								{post.readingMinutes}分钟
							</Pill>
						</div>
					</div>
				</div>
				<div className="pt-1">
					<PostMarkdown content={post.content} />
				</div>
				<div className="border-b border-border pb-4">
					<Pill
						variant="topic"
						href={`/${categoryDir}/${category.id}`}
						icon={
							<span className="relative inline-flex size-4 shrink-0 items-center justify-center rounded-full bg-jike-blue">
								<span className="size-2 rounded-full bg-jike-blue-soft" />
							</span>
						}
					>
						{category.name}
					</Pill>
				</div>
				<div className="flex gap-2">
					{adjacent.prev ? (
						<Link
							href={`/${adjacent.prev.id.split("/")[0]}/${adjacent.prev.slug}`}
							className="flex min-w-0 flex-1 items-center gap-2 py-3"
						>
							<RiArrowLeftSLine className="size-5 shrink-0 text-muted" />
							<span className="truncate text-sm">{adjacent.prev.title}</span>
						</Link>
					) : <div className="flex-1" />}
					{adjacent.next ? (
						<Link
							href={`/${adjacent.next.id.split("/")[0]}/${adjacent.next.slug}`}
							className="flex min-w-0 flex-1 items-center justify-end gap-2 py-3 text-right"
						>
							<span className="truncate text-sm">{adjacent.next.title}</span>
							<RiArrowRightSLine className="size-5 shrink-0 text-muted" />
						</Link>
					) : <div className="flex-1" />}
				</div>
				<GiscusComments />
			</article>
		</>
	);
}

function renderSectionIndex(section: SectionMeta) {
	if (section.layout === "catalog") {
		return renderCatalogPage(section);
	}
	if (section.layout === "list") {
		return renderPostsList(section.name, section.sort);
	}
	if (section.layout === "card") {
		return renderSectionList(section);
	}
	if (section.layout === "feed") {
		return renderPostsList(section.name, section.sort);
	}
	notFound();
}

function renderDimensionPage(postField: DimensionPostField, childId: string) {
	const pageData = getDimensionPageDataWithCover(postField, childId);
	if (!pageData) notFound();

	const { item, posts, cover } = pageData;
	const dimRoutes = getDimensionRoutesMap();
	const headerAvatar = !cover || item.avatar?.trim()
		? {
			id: item.id,
			name: item.name,
			description: item.description,
			avatar: item.avatar?.trim() || undefined,
		}
		: undefined;

	return (
		<FeedLayout
			title={item.name}
			description={item.description}
			cover={cover}
			avatar={headerAvatar}
			items={posts.map((p): FeedItem => ({ ...p, type: "post" as const }))}
			dimRoutes={dimRoutes}
		/>
	);
}

function renderCatalogPage(section: SectionMeta) {
	const dims = section.dimensions || getSiteConfig().dimensions || DEFAULT_CATALOG_DIMENSIONS;
	const dimItems: Record<string, DimensionItemWithPostCount[]> = {};
	for (const dim of dims) {
		if (dim.postField) {
			dimItems[dim.postField] = listDimensionItemsWithCounts(dim.postField);
		}
	}

	return (
		<>
			<PageTopBar title={section.title} cover={section.cover} />
			<CatalogPageClient dimensions={dims} dimItems={dimItems} />
		</>
	);
}

function renderDimensionCatalog(dim: CatalogDimension) {
	const dims = [dim];
	const dimItems: Record<string, DimensionItemWithPostCount[]> = {};
	if (dim.postField) {
		dimItems[dim.postField] = listDimensionItemsWithCounts(dim.postField);
	}

	return (
		<>
			<PageTopBar title={dim.label} />
			<CatalogPageClient dimensions={dims} dimItems={dimItems} />
		</>
	);
}

function renderAllDimensionsCatalog() {
	const dims = getSiteConfig().dimensions.length > 0 ? getSiteConfig().dimensions : DEFAULT_CATALOG_DIMENSIONS;
	const dimItems: Record<string, DimensionItemWithPostCount[]> = {};
	for (const dim of dims) {
		if (dim.postField) {
			dimItems[dim.postField] = listDimensionItemsWithCounts(dim.postField);
		}
	}

	return (
		<>
			<PageTopBar title={getMenuLabel("catalog", "目录")} />
			<CatalogPageClient dimensions={dims} dimItems={dimItems} />
		</>
	);
}

function renderSectionList(section: SectionMeta) {
	const items = applySortConfig(listFolderDocuments(section.name), section.sort);

	return (
		<>
			<PageTopBar title={section.title} cover={section.cover} />
			<section className="layout-content">
				<div className="p-4">
					<CardLayout items={items} basePath={`/${section.route}`} />
				</div>
			</section>
		</>
	);
}

function renderSectionDetail(section: string, id: string) {
	const pageData = getSectionDetailPageData(section, id);
	if (!pageData) notFound();
	const { title, subtitle, image, body, badges, meta } = pageData;

	return (
		<>
			<PageTopBar title={title} />
			<section className="layout-content">
				<div className="pt-4">
					<ShowpieceLayout
						title={title}
						subtitle={subtitle}
						image={image}
						badges={badges}
						meta={meta}
						body={body}
					/>
				</div>
			</section>
		</>
	);
}
