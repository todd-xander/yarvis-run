"use client";

import Image from "next/image";
import { useState } from "react";
import { ImageLightbox } from "@/components/image-lightbox";
import type { PostImage } from "@/lib/content-types";

function splitImageRows(images: PostImage[]) {
	const fullRowCount = Math.floor(images.length / 3);
	const remainder = images.length % 3;
	const rows: PostImage[][] = [];

	for (let index = 0; index < fullRowCount; index += 1) {
		rows.push(images.slice(index * 3, index * 3 + 3));
	}

	if (remainder > 0) {
		rows.push(images.slice(fullRowCount * 3));
	}

	return rows;
}

export function PostImageGrid({ images }: { images: PostImage[] }) {
	const [activeIndex, setActiveIndex] = useState<number | null>(null);

	if (images.length === 0) return null;

	if (images.length === 1) {
		const image = images[0];
		return (
			<div className="post-image-grid mt-2.5">
				<button
					type="button"
					className="post-image-grid__single relative max-w-96 cursor-pointer"
					onClick={() => setActiveIndex(0)}
					aria-label={`查看图片：${image.alt || "图片"}`}
				>
					<Image
						src={image.src}
						alt={image.alt}
						title={image.title}
						width={960}
						height={960}
						className="post-image-grid__single-image max-h-96 w-auto"
					/>
				</button>
				<ImageLightbox
					images={images}
					activeIndex={activeIndex}
					onClose={() => setActiveIndex(null)}
					onSelect={setActiveIndex}
				/>
			</div>
		);
	}

	return (
		<div className="post-image-grid mt-2.5">
			<div className="post-image-grid__rows">
				{splitImageRows(images).map((row, rowIndex, allRows) => {
					const rowStartIndex = allRows
						.slice(0, rowIndex)
						.reduce((sum, currentRow) => sum + currentRow.length, 0);
					const rowClassName =
						row.length === 3
							? "post-image-grid__row post-image-grid__row--three"
							: row.length === 2
								? "post-image-grid__row post-image-grid__row--two"
								: "post-image-grid__row post-image-grid__row--one";

					return (
						<div
							key={`${row[0]?.src ?? "row"}-${row.length}`}
							className={rowClassName}
						>
							{row.map((image, imageIndex) => (
								<button
									type="button"
									key={`${image.src}-${image.alt}`}
									className="post-image-grid__tile cursor-pointer"
									onClick={() => setActiveIndex(rowStartIndex + imageIndex)}
									aria-label={`查看图片：${image.alt || "图片"}`}
								>
									<Image
										src={image.src}
										alt={image.alt}
										title={image.title}
										fill
										sizes="(max-width: 768px) 100vw, 33vw"
										className="post-image-grid__tile-image"
									/>
								</button>
							))}
						</div>
					);
				})}
			</div>
			<ImageLightbox
				images={images}
				activeIndex={activeIndex}
				onClose={() => setActiveIndex(null)}
				onSelect={setActiveIndex}
			/>
		</div>
	);
}
