"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { ImageLightbox } from "@/components/image-lightbox";
import { EmptyStateCard } from "@/components/ui/empty-state-card";
import type { PostImage } from "@/lib/content-types";

type GalleryImage = PostImage & {
	postId: string;
	postTitle: string;
	publishedAt: Date;
};

function groupImagesByDate(images: GalleryImage[]) {
	const groups: { year: number; month: number; items: GalleryImage[] }[] = [];
	for (const image of images) {
		const year = image.publishedAt.getFullYear();
		const month = image.publishedAt.getMonth() + 1;
		let group = groups.find((item) => item.year === year && item.month === month);
		if (!group) {
			group = { year, month, items: [] };
			groups.push(group);
		}
		group.items.push(image);
	}
	return groups;
}

export function CatalogGalleryPage({ images }: { images: GalleryImage[] }) {
	const [activeIndex, setActiveIndex] = useState<number | null>(null);
	const groups = useMemo(() => groupImagesByDate(images), [images]);
	const currentYear = new Date().getFullYear();

	if (images.length === 0) {
		return <EmptyStateCard>暂无图片内容</EmptyStateCard>;
	}

	return (
		<div className="space-y-6 px-4 py-5">
			{groups.map((group) => {
				const groupStartIndex = images.indexOf(group.items[0]);
				const showYear = group.year < currentYear;
				return (
					<div key={`${group.year}-${group.month}`} className="flex items-start gap-4">
						<div className="w-12 shrink-0 pt-1 text-right text-muted-soft">
							{showYear ? (
								<div className="space-y-0.5">
									<div className="text-[11px] leading-4">{group.year}</div>
									<div className="text-lg font-medium leading-5">{group.month}月</div>
								</div>
							) : (
								<div className="text-lg font-medium leading-5">{group.month}月</div>
							)}
						</div>
						<div className="min-w-0 flex-1">
							<div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4">
								{group.items.map((image, index) => (
									<button
										type="button"
										key={`${image.postId}-${image.src}`}
										className="relative aspect-square overflow-hidden rounded-lg border-0 bg-surface-subtle p-0"
										onClick={() => setActiveIndex(groupStartIndex + index)}
										aria-label={`查看图片：${image.alt || image.postTitle}`}
									>
										<Image
											src={image.src}
											alt={image.alt || image.postTitle}
											title={image.title}
											fill
											unoptimized
											sizes="(max-width: 768px) 33vw, 25vw"
											className="object-cover"
										/>
									</button>
								))}
							</div>
						</div>
					</div>
				);
			})}
			<ImageLightbox
				images={images}
				activeIndex={activeIndex}
				onClose={() => setActiveIndex(null)}
				onSelect={setActiveIndex}
				getActionHref={(index) => `/${images[index]?.postId ?? ""}`}
				actionLabel="转到文章"
			/>
		</div>
	);
}
