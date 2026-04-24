"use client";

import Giscus from "@giscus/react";

const repo = process.env.NEXT_PUBLIC_GISCUS_REPO;
const repoId = process.env.NEXT_PUBLIC_GISCUS_REPO_ID;
const category = process.env.NEXT_PUBLIC_GISCUS_CATEGORY;
const categoryId = process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID;

export function GiscusComments() {
	if (!repo || !repoId || !category || !categoryId) {
		return null;
	}

	return (
		<div className="pt-4">
			<Giscus
				repo={repo as `${string}/${string}`}
				repoId={repoId}
				category={category}
				categoryId={categoryId}
				mapping="pathname"
				strict="0"
				reactionsEnabled="1"
				emitMetadata="0"
				inputPosition="top"
				theme="preferred_color_scheme"
				lang="zh-CN"
				loading="lazy"
			/>
		</div>
	);
}
