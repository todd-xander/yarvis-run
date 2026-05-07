import { DEFAULT_CATALOG_DIMENSIONS } from "@/lib/app-config";
import { RiArrowLeftSLine, RiArrowRightSLine } from "@remixicon/react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CollectionList, getFeedItemHref, toCollectionCardItems } from "@/components/collection-list";
import { PageFrame } from "@/components/page-frame";
import { PostMarkdown } from "@/components/post-markdown";
import { Pill } from "@/components/ui/pill";
import { FeedLayout } from "@/components/feed-layout";
import { CardLayout } from "@/components/card-layout";
import { ShowpieceLayout } from "@/components/showpiece-layout";
import { CatalogPageClient } from "@/components/catalog-page-client";
import { CatalogGalleryPage } from "@/components/catalog-gallery-page";
import { GiscusComments } from "@/components/giscus-comments";
import { CONTENT_DIMENSIONS } from "@/lib/content-constants";
import {
	getDimensionPageDataWithCover,
	getPostDetailPageData,
	readPageViewModel,
	getSectionDetailPageData,
} from "@/lib/content-page-data";
import {
	buildCatalogViewModel,
	listGalleryImages,
	listDimensionFeedItems,
	listSectionFeedItems,
	listFeedItems,
	listUncategorizedFeedItems,
} from "@/lib/content-repository";
import { listFolderDocuments } from "@/lib/folder-content";
import type { AsyncDynamicPathPageProps } from "@/lib/page-route-types";
import type { PageViewModel } from "@/lib/page-view-model";
import { CONTENT_ROOT, getMenuLabel, getSiteConfig, getDimensionRoutesMap, type SectionEntry } from "@/lib/site-config";
import type { CatalogDimension, ContentFrontmatter, FeedItem, ResolvedPost } from "@/lib/content-types";
import { applySortConfig } from "@/lib/sort-utils";
import { generatePathStaticParams, resolvePathTarget } from "@/lib/path-routing";
import { paginate, parsePageNumber } from "@/lib/pagination";
import { getSectionContentPath } from "@/lib/content-paths";

function CollectionTab({ label }: { label: string }) {
	return (
		<div className="mt-4">
			<span className="inline-flex h-12 min-w-24 items-center justify-center border-b-[3px] border-jike-yellow px-4 py-2.5 text-base font-medium leading-6">
				{label}
			</span>
		</div>
	);
}

export async function generateStaticParams() {
	return generatePathStaticParams();
}

export default async function DynamicPathPage({ params, searchParams }: AsyncDynamicPathPageProps) {
	const { path: urlParts } = await params;
	const search = searchParams ? await searchParams : undefined;
	const page = parsePageNumber(search?.page);
	const target = resolvePathTarget(urlParts);

	switch (target.kind) {
		case "home":
			return renderHome(page);
		case "section-index":
			return renderSectionIndex(target.section, page);
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
			return renderDimensionPage(target.dimension, target.itemId, page);
		}
		case "catalog":
			return renderAllDimensionsCatalog();
		case "catalog-gallery":
			return renderCatalogGalleryPage();
		case "catalog-uncategorized":
			return renderUncategorizedPage(page);
		default:
			notFound();
	}
}

function renderHome(page: number) {
	const indexFm = readPageViewModel(CONTENT_ROOT)?.frontmatter;
	const feedSort = indexFm?.layout === "feed" ? indexFm.sort : undefined;
	const items = applySortConfig(listFeedItems(), feedSort);
	const { items: pageItems, state } = paginate(
		items,
		indexFm?.layout === "feed" ? indexFm.pagination?.pageSize : undefined,
		page,
	);
	const frontmatter = indexFm || {
		layout: "feed",
		title: getMenuLabel("home", "主页"),
		slug: "home",
		publishedAt: new Date(0),
	} satisfies ContentFrontmatter;
	const pageViewModel: PageViewModel = {
		frontmatter,
		paginationState: state,
		paginationBasePath: "/",
		wordCount: 0,
		body: "",
		assetPrefix: "",
	};
	return renderFeedPage({
		page: pageViewModel,
		items: pageItems,
		dimRoutes: getDimensionRoutesMap(),
	});
}

function renderFeedPage({
	page,
	items,
	dimRoutes,
}: {
	page: PageViewModel;
	items: Array<(ResolvedPost & { type: "post" }) | (ResolvedPost & { type: "showpiece" })>;
	dimRoutes?: Record<string, string>;
}) {
	return (
		<FeedLayout
			page={page}
			items={items}
			dimRoutes={dimRoutes}
		/>
	);
}

function renderListPage(section: SectionEntry, page: number) {
	const index = readPageViewModel(getSectionContentPath(CONTENT_ROOT, section.slug))?.frontmatter;
	const frontmatter = index || {
		layout: "list",
		title: section.title,
		slug: section.slug,
		publishedAt: new Date(0),
		cover: section.cover,
		description: section.description,
	} satisfies ContentFrontmatter;
	const items = applySortConfig(listSectionFeedItems(section.slug), section.sort);
	const { items: pageItems, state } = paginate(items, section.pagination?.pageSize, page);
	const pageViewModel: PageViewModel = {
		frontmatter,
		paginationState: state,
		paginationBasePath: `/${section.route}`,
		wordCount: 0,
		body: "",
		assetPrefix: "",
	};

	return (
		<PageFrame page={pageViewModel}>
			<CollectionList posts={pageItems} getHref={getFeedItemHref} />
		</PageFrame>
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
	const pageViewModel: PageViewModel = {
		frontmatter: post,
		topBarAuthor: author ? {
			name: author.name,
			avatar: author.avatar,
			description: author.description,
			href: `/${authorDir}/${author.id}`,
		} : undefined,
		wordCount: post.wordCount,
		body: post.content,
		assetPrefix: "",
	};

	return (
		<PageFrame page={pageViewModel} as="article" className="layout-content space-y-5 bg-card p-4">
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
		</PageFrame>
	);
}

function renderSectionIndex(section: SectionEntry, page: number) {
	if (section.layout === "catalog") {
		return renderCatalogPage(section);
	}
	if (section.layout === "list") {
		return renderListPage(section, page);
	}
	if (section.layout === "card") {
		return renderSectionList(section, page);
	}
	if (section.layout === "feed") {
		return renderFeedSection(section, page);
	}
	notFound();
}

function renderFeedSection(section: SectionEntry, page: number) {
	const index = readPageViewModel(getSectionContentPath(CONTENT_ROOT, section.slug))?.frontmatter;
	const items = applySortConfig(listSectionFeedItems(section.slug), section.sort);
	const { items: pageItems, state } = paginate(items, section.pagination?.pageSize, page);
	const pageViewModel: PageViewModel = {
		frontmatter: index || {
			layout: "feed",
			title: section.title,
			slug: section.slug,
			publishedAt: new Date(0),
			cover: section.cover,
			description: section.description,
		} satisfies ContentFrontmatter,
		paginationState: state,
		paginationBasePath: `/${section.route}`,
		wordCount: 0,
		body: "",
		assetPrefix: "",
	};
	return renderFeedPage({
		page: pageViewModel,
		items: pageItems,
		dimRoutes: getDimensionRoutesMap(),
	});
}

function renderPostCollectionPage({
	page,
	posts,
	getHref = getFeedItemHref,
}: {
	page: PageViewModel;
	posts: FeedItem[];
	getHref?: (item: FeedItem) => string;
}) {
	const layout = page.frontmatter.layout;

	if (layout === "card") {
		return (
			<PageFrame page={page} innerClassName="p-4">
				<CardLayout items={toCollectionCardItems(posts)} basePath="" getHref={(item) => getHref(item.frontmatter as FeedItem)} />
			</PageFrame>
		);
	}

	if (layout === "list") {
		return (
			<PageFrame page={page}>
				<CollectionList posts={posts} getHref={getHref} />
			</PageFrame>
		);
	}

	return renderFeedPage({
		page,
		items: posts,
		dimRoutes: getDimensionRoutesMap(),
	});
}

function renderDimensionPage(dimension: CatalogDimension, childId: string, page = 1) {
	const pageData = getDimensionPageDataWithCover(dimension.postField, childId);
	if (!pageData) notFound();

	const { page: pageModel } = pageData;
	const posts = applySortConfig(listDimensionFeedItems(dimension.postField, childId), "sort" in pageModel.frontmatter ? pageModel.frontmatter.sort : undefined);
	const dimRoutes = getDimensionRoutesMap();
	const pageSize = "pagination" in pageModel.frontmatter ? pageModel.frontmatter.pagination?.pageSize : undefined;
	const { items: pageItems, state } = paginate(posts, pageSize, page);
	const pageViewModel: PageViewModel = {
		...pageModel,
		paginationState: state,
		paginationBasePath: `/${dimRoutes[dimension.postField]}/${pageModel.frontmatter.slug}`,
	};

	return renderPostCollectionPage({
		page: pageViewModel,
		posts: pageItems,
	});
}

function renderCatalogPage(section: SectionEntry) {
	const dims = section.dimensions || getSiteConfig().dimensions || DEFAULT_CATALOG_DIMENSIONS;
	const index = readPageViewModel(getSectionContentPath(CONTENT_ROOT, section.slug))?.frontmatter;
	const frontmatter = index || {
		layout: "catalog",
		title: section.title,
		slug: section.slug,
		publishedAt: new Date(0),
		cover: section.cover,
		description: section.description,
	} satisfies ContentFrontmatter;
	const pageViewModel: PageViewModel = {
		frontmatter,
		wordCount: 0,
		body: "",
		assetPrefix: "",
	};

	return (
		<PageFrame page={pageViewModel} className="">
			<CatalogPageClient catalog={buildCatalogViewModel(dims)} />
		</PageFrame>
	);
}

function renderDimensionCatalog(dim: CatalogDimension) {
	const frontmatter = {
		layout: "catalog",
		title: dim.label,
		slug: dim.dir || dim.postField,
		publishedAt: new Date(0),
	} satisfies ContentFrontmatter;
	const pageViewModel: PageViewModel = {
		frontmatter,
		wordCount: 0,
		body: "",
		assetPrefix: "",
	};

	return (
		<PageFrame page={pageViewModel} className="">
			<CatalogPageClient catalog={buildCatalogViewModel([dim])} />
		</PageFrame>
	);
}

function renderAllDimensionsCatalog() {
	const frontmatter = {
		layout: "catalog",
		title: getMenuLabel("catalog", "目录"),
		slug: "catalog",
		publishedAt: new Date(0),
	} satisfies ContentFrontmatter;
	const dims = getSiteConfig().dimensions.length > 0 ? getSiteConfig().dimensions : DEFAULT_CATALOG_DIMENSIONS;
	const pageViewModel: PageViewModel = {
		frontmatter,
		wordCount: 0,
		body: "",
		assetPrefix: "",
	};

	return (
		<PageFrame page={pageViewModel} className="">
			<CatalogPageClient catalog={buildCatalogViewModel(dims)} />
		</PageFrame>
	);
}

function renderCatalogGalleryPage() {
	const frontmatter = {
		layout: "catalog",
		title: "相册",
		slug: "gallery",
		description: "以相册形式查看所有文章图片",
		publishedAt: new Date(0),
	} satisfies ContentFrontmatter;
	const pageViewModel: PageViewModel = {
		frontmatter,
		identityAvatarTitle: "相册",
		wordCount: 0,
		body: "",
		assetPrefix: "",
	};

	return (
		<PageFrame page={pageViewModel} contentHeader={<CollectionTab label="相册" />}>
			<CatalogGalleryPage images={listGalleryImages()} />
		</PageFrame>
	);
}

function renderUncategorizedPage(page: number) {
	const items = listUncategorizedFeedItems();
	const { items: pageItems, state } = paginate(items, 10, page);
	const pageViewModel: PageViewModel = {
		frontmatter: {
			layout: "feed",
			title: "未归类",
			slug: "uncategorized",
			description: "缺少作者或分类信息的内容",
			publishedAt: new Date(0),
		} satisfies ContentFrontmatter,
		paginationState: state,
		paginationBasePath: "/catalog/uncategorized",
		identityAvatarTitle: "未归类",
		wordCount: 0,
		body: "",
		assetPrefix: "",
	};

	return renderFeedPage({
		page: pageViewModel,
		items: pageItems,
		dimRoutes: getDimensionRoutesMap(),
	});
}

function renderSectionList(section: SectionEntry, page: number) {
	const index = readPageViewModel(getSectionContentPath(CONTENT_ROOT, section.slug))?.frontmatter;
	const frontmatter = index || {
		layout: "card",
		title: section.title,
		slug: section.slug,
		publishedAt: new Date(0),
		cover: section.cover,
		description: section.description,
	} satisfies ContentFrontmatter;
	const items = applySortConfig(listFolderDocuments(section.slug), section.sort);
	const { items: pageItems, state } = paginate(items, section.pagination?.pageSize, page);
	const pageViewModel: PageViewModel = {
		frontmatter,
		paginationState: state,
		paginationBasePath: `/${section.route}`,
		wordCount: 0,
		body: "",
		assetPrefix: "",
	};

	return (
		<PageFrame page={pageViewModel} innerClassName="p-4">
			<CardLayout items={pageItems} basePath={`/${section.route}`} />
		</PageFrame>
	);
}

function renderSectionDetail(section: SectionEntry, id: string) {
	const pageViewModel = getSectionDetailPageData(section.slug, id);
	if (!pageViewModel) notFound();

	if (pageViewModel.frontmatter.layout === "post") {
		return renderPostDetail(pageViewModel.frontmatter.slug);
	}

	return (
		<PageFrame page={pageViewModel} innerClassName="pt-4">
			<ShowpieceLayout body={pageViewModel.body} />
		</PageFrame>
	);
}
