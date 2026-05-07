import { CardLayout } from "@/components/card-layout";
import { CollectionList, getFeedItemHref, toCollectionCardItems } from "@/components/collection-list";
import { FeedLayout } from "@/components/feed-layout";
import { PageFrame } from "@/components/page-frame";
import { APP_NAME } from "@/lib/app-config";
import { readPageViewModel } from "@/lib/content-page-data";
import type { AsyncSearchPageProps } from "@/lib/page-route-types";
import { CONTENT_ROOT, getDimensionRoutesMap } from "@/lib/site-config";
import { listFeedItems } from "@/lib/content-repository";
import type { ContentFrontmatter, ListlikeFrontmatter } from "@/lib/content-types";
import { paginate, parsePageNumber } from "@/lib/pagination";
import type { PageViewModel } from "@/lib/page-view-model";
import { applySortConfig } from "@/lib/sort-utils";

function isListlikeFrontmatter(frontmatter: ContentFrontmatter | undefined): frontmatter is ListlikeFrontmatter {
	return frontmatter?.layout === "feed"
		|| frontmatter?.layout === "list"
		|| frontmatter?.layout === "card"
		|| frontmatter?.layout === "catalog";
}

export default async function Home({ searchParams }: AsyncSearchPageProps) {
	const indexFm = readPageViewModel(CONTENT_ROOT)?.frontmatter;
	const search = searchParams ? await searchParams : undefined;
	const page = parsePageNumber(search?.page);
	const layout = indexFm?.layout || "feed";
	const listlikeFrontmatter = isListlikeFrontmatter(indexFm) ? indexFm : undefined;
	const items = applySortConfig(listFeedItems(), listlikeFrontmatter?.sort);
	const { items: pageItems, state } = paginate(
		items,
		layout === "feed" || layout === "list" || layout === "card" ? listlikeFrontmatter?.pagination?.pageSize : undefined,
		page,
	);
	const frontmatter = indexFm || {
		layout: "feed",
		title: APP_NAME,
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

	if (layout === "list") {
		return (
			<PageFrame page={pageViewModel}>
				<CollectionList posts={pageItems} getHref={getFeedItemHref} />
			</PageFrame>
		);
	}

	if (layout === "card") {
		return (
			<PageFrame page={pageViewModel} innerClassName="p-4">
				<CardLayout
					items={toCollectionCardItems(pageItems)}
					basePath=""
					getHref={(item) => getFeedItemHref(item.frontmatter as typeof pageItems[number])}
				/>
			</PageFrame>
		);
	}

	return (
		<FeedLayout
			page={pageViewModel}
			items={pageItems}
			dimRoutes={getDimensionRoutesMap()}
		/>
	);
}
