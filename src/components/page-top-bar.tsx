"use client";

import { RiArrowLeftSLine } from "@remixicon/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

type PageTopBarProps = {
	title: string;
	rightSlot?: ReactNode;
	cover?: string;
};

export function PageTopBar({ title, rightSlot, cover }: PageTopBarProps) {
	const router = useRouter();
	const sentinelRef = useRef<HTMLDivElement>(null);
	const [scrolled, setScrolled] = useState(false);

	const handleBack = useCallback(() => {
		router.back();
	}, [router]);

	useEffect(() => {
		const sentinel = sentinelRef.current;
		if (!sentinel) return;

		const observer = new IntersectionObserver(
			([entry]) => {
				setScrolled(!entry.isIntersecting);
			},
			{ threshold: 0 },
		);

		observer.observe(sentinel);
		return () => observer.disconnect();
	}, []);

	const hasCover = !!cover;

	return (
		<>
			<div
				className={`sticky top-0 z-20 transition-colors duration-300 ${hasCover
					? scrolled
						? "bg-background shadow-divider-bottom"
						: "bg-transparent"
					: "bg-background shadow-divider-bottom"
					}`}
			>
				<div className="flex items-center justify-between p-4">
					<div className="flex min-h-7 min-w-7 items-center justify-start">
						<button
							type="button"
							onClick={handleBack}
							className={`inline-flex cursor-pointer items-center rounded-full transition-all duration-300 ${hasCover && !scrolled
								? "gap-1 bg-black/16 px-3.5 py-1 text-white backdrop-blur-[6px]"
								: "size-7 justify-center text-foreground"
								}`}
							aria-label="返回"
						>
							<RiArrowLeftSLine className={hasCover && !scrolled ? "size-5" : "size-8 transition-all duration-300"} />
						</button>
					</div>
					<h1
						className={`text-xl font-medium leading-7 transition-opacity duration-300 ${hasCover && !scrolled ? "opacity-0" : "opacity-100 text-foreground"
							}`}
					>
						{title}
					</h1>
					<div className="flex min-h-7 min-w-7 items-center justify-end">
						{rightSlot}
					</div>
				</div>
			</div>

			{hasCover ? (
				<div className="relative -mt-[60px]">
					<div
						className="h-65"
						style={{
							backgroundImage: `url(${cover})`,
							backgroundSize: "cover",
							backgroundPosition: "center",
						}}
						aria-hidden
					/>
					<div ref={sentinelRef} className="absolute bottom-0 inset-x-0" />
				</div>
			) : (
				<div ref={sentinelRef} />
			)}
		</>
	);
}
