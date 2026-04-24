import { MorePageClient } from "@/components/more-page-client";
import { PageTopBar } from "@/components/page-top-bar";
import { listPostSlugs } from "@/lib/content-repository";
import { getMenuLabel, getMoreMenu } from "@/lib/site-config";

export default function MorePage() {
	return (
		<section className="layout-content">
			<PageTopBar title={getMenuLabel("more", "更多")} />
			<MorePageClient
				postSlugs={listPostSlugs()}
				menuGroups={getMoreMenu()}
			/>
		</section>
	);
}
