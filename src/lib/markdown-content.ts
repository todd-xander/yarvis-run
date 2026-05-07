import "server-only";

import path from "node:path";
import fs from "node:fs";
import type { DataFrontmatter, Post, PostImage } from "@/lib/content-types";
import { getSectionContentPath, resolveContentUrl } from "@/lib/content-paths";
import { parseContent } from "@/lib/parse-frontmatter";
import { CONTENT_ROOT } from "@/lib/site-config";

function countWords(body: string) {
	return body.replace(/\s+/g, "").length;
}

function extractMarkdownImages(body: string): PostImage[] {
	const images: PostImage[] = [];
	const imagePattern = /!\[([^\]]*)\]\((\S+?)(?:\s+"([^"]*)")?\)|<img\s+[^>]*>/g;
	for (const match of body.matchAll(imagePattern)) {
		if (match[0].startsWith("![")) {
			images.push({ alt: match[1] ?? "", src: match[2] ?? "", title: match[3] || undefined });
			continue;
		}
		const src = match[0].match(/\ssrc="([^"]+)"/)?.[1] ?? "";
		const alt = match[0].match(/\salt="([^"]*)"/)?.[1] ?? "";
		const title = match[0].match(/\stitle="([^"]*)"/)?.[1] || undefined;
		if (src && !images.some((image) => image.src === src && image.alt === alt)) {
			images.push({ src, alt, title });
		}
	}
	return images;
}

function resolveAssetPrefix(filePath: string): string | undefined {
	const resolved = fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()
		? filePath
		: path.dirname(filePath);
	const rel = path.relative(CONTENT_ROOT, resolved);
	const parts = rel.split(path.sep);
	if (parts.length >= 2) {
		return resolveContentUrl(CONTENT_ROOT, rel);
	}
	return undefined;
}

function resolveAssetPath(src: string | undefined, assetPrefix: string | undefined): string | undefined {
	if (!src) return undefined;
	if (!assetPrefix || src.startsWith("http") || src.startsWith("/")) return src;
	return `${assetPrefix}/${src}`;
}

function toPost(filePath: string, section: string): Post | undefined {
	const { frontmatter, body } = parseContent(filePath);
	if (frontmatter.layout !== "post") return undefined;
	const fm = frontmatter as DataFrontmatter & { layout: "post" };
	const wordCount = countWords(body);
	const assetPrefix = resolveAssetPrefix(filePath);
	const resolvedBody = assetPrefix ? resolveRelativeImagePaths(body, assetPrefix) : body;

	return {
		id: `${section}/${fm.slug}`,
		...fm,
		cover: resolveAssetPath(fm.cover, assetPrefix),
		avatar: resolveAssetPath(fm.avatar, assetPrefix),
		content: resolvedBody,
		wordCount,
		readingMinutes: Math.max(1, Math.ceil(wordCount / 300)),
		images: extractMarkdownImages(resolvedBody),
	};
}

function resolveRelativeImagePaths(body: string, assetPrefix: string): string {
	const imgPattern = /(!\[[^\]]*\]\()([^)\s]+)((?:\s+"[^"]*")?\))/g;
	return body.replace(imgPattern, (_match, prefix, src, suffix) => {
		if (src.startsWith("http") || src.startsWith("/")) return _match;
		return `${prefix}${assetPrefix}/${src}${suffix}`;
	});
}

function collectPostsFromDir(section: string): Post[] {
	const sectionPath = getSectionContentPath(CONTENT_ROOT, section);
	if (!fs.existsSync(sectionPath)) return [];

	const entries = fs.readdirSync(sectionPath, { withFileTypes: true });
	const posts: Post[] = [];

	for (const entry of entries) {
		if (entry.name === "_index.md" || entry.name === "index.md") continue;

		if (entry.isFile() && entry.name.endsWith(".md")) {
			const post = toPost(path.join(sectionPath, entry.name), section);
			if (post) posts.push(post);
		} else if (entry.isDirectory()) {
			const indexPath = path.join(sectionPath, entry.name, "index.md");
			if (fs.existsSync(indexPath)) {
				const post = toPost(path.join(sectionPath, entry.name), section);
				if (post) posts.push(post);
			}
		}
	}

	return posts;
}

export function listPostsFromMarkdown(): Post[] {
	if (!fs.existsSync(CONTENT_ROOT)) return [];

	return fs
		.readdirSync(CONTENT_ROOT, { withFileTypes: true })
		.filter((entry) => entry.isDirectory())
		.flatMap((entry) => collectPostsFromDir(entry.name));
}
