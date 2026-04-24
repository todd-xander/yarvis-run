"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { AuthorHoverCard } from "@/components/author-hover-card";
import { AuthorAvatar } from "@/components/ui/author-avatar";
import type { DimensionItem } from "@/lib/content-types";

function formatDate(value: Date) {
	return value.toLocaleDateString("zh-CN", {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	});
}

function useHoverDisclosure(delayMs = 120) {
	const [open, setOpen] = useState(false);
	const timerRef = useRef<number | null>(null);

	function clearTimer() {
		if (timerRef.current !== null) {
			window.clearTimeout(timerRef.current);
			timerRef.current = null;
		}
	}

	function show() {
		clearTimer();
		setOpen(true);
	}

	function hide() {
		clearTimer();
		timerRef.current = window.setTimeout(() => {
			setOpen(false);
			timerRef.current = null;
		}, delayMs);
	}

	useEffect(() => {
		return () => {
			if (timerRef.current !== null) {
				window.clearTimeout(timerRef.current);
				timerRef.current = null;
			}
		};
	}, []);

	return {
		open,
		show,
		hide,
	};
}

type FeedCardShellProps = {
	author: DimensionItem;
	publishedAt: Date;
	authorDimDir?: string;
	headerRight?: ReactNode;
	children: ReactNode;
};

export function FeedCardShell({
	author,
	publishedAt,
	authorDimDir,
	headerRight,
	children,
}: FeedCardShellProps) {
	const { open, show, hide } = useHoverDisclosure();
	const authorHref = authorDimDir ? `/${authorDimDir}/${author.id}` : undefined;

	return (
		<article className="shadow-divider-bottom">
			<div className="px-4 py-5">
				<div className="relative flex gap-2.5">
					<div className="flex shrink-0 items-start">
						<AuthorAvatar
							author={author}
							size="md"
							shape="circle"
							href={authorHref}
							onMouseEnter={show}
							onMouseLeave={hide}
							onFocus={show}
							onBlur={hide}
						/>
					</div>
					<div className="min-w-0 grow">
						<header className="mb-2.5 flex min-h-10 items-center justify-between">
							<div className="grid">
								{authorHref ? (
									<Link
										href={authorHref}
										className="inline-flex w-fit truncate text-sm font-medium leading-5 hover:underline"
										onMouseEnter={show}
										onMouseLeave={hide}
										onFocus={show}
										onBlur={hide}
									>
										{author.name}
									</Link>
								) : (
									<span className="inline-flex w-fit truncate text-sm font-medium leading-5">
										{author.name}
									</span>
								)}
								<div className="text-xs leading-5 text-muted">
									{formatDate(publishedAt)}
								</div>
							</div>
							{headerRight}
						</header>
						{children}
					</div>
					<AuthorHoverCard
						dimItem={author}
						visible={open}
						onMouseEnter={show}
						onMouseLeave={hide}
						dimDir={authorDimDir}
					/>
				</div>
			</div>
		</article>
	);
}
