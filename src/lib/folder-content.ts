import "server-only";

import fs from "node:fs";
import path from "node:path";
import type { PageViewModel } from "@/lib/page-view-model";
import { readPageViewModel } from "@/lib/content-page-data";
import { getSectionContentPath } from "@/lib/content-paths";
import { CONTENT_ROOT } from "@/lib/site-config";

function listFolderSlugs(section: string): string[] {
	const sectionPath = getSectionContentPath(CONTENT_ROOT, section);
	if (!fs.existsSync(sectionPath)) return [];

	return fs
		.readdirSync(sectionPath, { withFileTypes: true })
		.filter((entry) => {
			if (entry.isDirectory()) {
				return fs.existsSync(path.join(sectionPath, entry.name, "index.md"));
			}

			return entry.isFile()
				&& entry.name.endsWith(".md")
				&& entry.name !== "_index.md"
				&& entry.name !== "index.md";
		})
		.sort()
		.map((entry) => entry.isDirectory() ? entry.name : path.basename(entry.name, ".md"));
}

export function listFolderDocuments(section: string): PageViewModel[] {
	return listFolderSlugs(section)
		.map((slug) => (
			readPageViewModel(getSectionContentPath(CONTENT_ROOT, section, slug))
			|| readPageViewModel(getSectionContentPath(CONTENT_ROOT, section, `${slug}.md`))
		))
		.filter((doc): doc is PageViewModel => doc !== undefined)
		.sort((a, b) => b.frontmatter.publishedAt.getTime() - a.frontmatter.publishedAt.getTime());
}
