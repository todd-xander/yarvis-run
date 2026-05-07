import { PageFrame } from "@/components/page-frame";
import { MorePageClient } from "@/components/more-page-client";
import type { PageViewModel } from "@/lib/page-view-model";
import { listPostSlugs } from "@/lib/content-repository";
import type { ContentFrontmatter } from "@/lib/content-types";
import { getMenuLabel, getMoreMenu } from "@/lib/site-config";

export default function MorePage() {
	const frontmatter = {
		layout: "list",
		title: getMenuLabel("more", "更多"),
		slug: "more",
		publishedAt: new Date(0),
	} satisfies ContentFrontmatter;
	const pageViewModel: PageViewModel = {
		frontmatter,
		wordCount: 0,
		body: "",
		assetPrefix: "",
	};

	return (
		<PageFrame page={pageViewModel}>
			<MorePageClient
				postSlugs={listPostSlugs()}
				menuGroups={getMoreMenu()}
			/>
		</PageFrame>
	);
}
