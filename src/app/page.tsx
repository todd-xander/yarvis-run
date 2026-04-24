import { FeedLayout } from "@/components/feed-layout";
import { APP_NAME } from "@/lib/app-config";
import { listFeedItems } from "@/lib/content-repository";
import { getDimensionRoutesMap } from "@/lib/site-config";
import { applySortConfig } from "@/lib/sort-utils";
import { getHomePageData } from "@/lib/content-page-data";

export default function Home() {
	const indexFm = getHomePageData();
	const feedItems = indexFm?.layout === "feed"
		? applySortConfig(listFeedItems(), indexFm.sort)
		: [];
	const hideTopBar = feedItems.length > 0;

	return (
		<FeedLayout
			title={indexFm?.title || APP_NAME}
			description={indexFm?.description}
			cover={indexFm?.cover}
			items={feedItems}
			dimRoutes={getDimensionRoutesMap()}
			hideTopBar={hideTopBar}
		/>
	);
}
