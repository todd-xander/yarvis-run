import { SearchPageClient } from "@/components/search-page-client";
import { CONTENT_DIMENSIONS } from "@/lib/content-constants";
import { listDimensionItemsWithCounts, listSearchablePosts } from "@/lib/content-repository";
import { getDimensionRoutesMap } from "@/lib/site-config";

export default function SearchPage() {
	const dimRoutes = getDimensionRoutesMap();

	return (
		<section className="layout-content">
			<SearchPageClient
				posts={listSearchablePosts()}
				categoryItems={listDimensionItemsWithCounts(CONTENT_DIMENSIONS.category)}
				categoryBasePath={dimRoutes[CONTENT_DIMENSIONS.category] || CONTENT_DIMENSIONS.category}
				dimRoutes={dimRoutes}
			/>
		</section>
	);
}
