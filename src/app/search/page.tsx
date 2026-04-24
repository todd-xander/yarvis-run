import { SearchPageClient } from "@/components/search-page-client";
import { PageTopBar } from "@/components/page-top-bar";
import { listSearchablePosts } from "@/lib/content-repository";
import { getDimensionRoutesMap, getMenuLabel } from "@/lib/site-config";

export default function SearchPage() {
	return (
		<section className="layout-content">
			<PageTopBar title={getMenuLabel("search", "搜索")} />
			<SearchPageClient
				posts={listSearchablePosts()}
				dimRoutes={getDimensionRoutesMap()}
			/>
		</section>
	);
}
