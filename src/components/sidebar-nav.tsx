"use client";

import React from "react";
import * as RemixIcons from "@remixicon/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { GradientShadowText } from "@/components/ui/gradient-shadow-text";
import type { MenuItem } from "@/lib/content-types";

function toPascalCase(str: string): string {
	return str
		.split("-")
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join("");
}

function resolveIcon(iconName: string, variant: "Line" | "Fill", className?: string): React.ReactNode {
	const componentName = `Ri${toPascalCase(iconName)}${variant}`;
	const Icon = (RemixIcons as Record<string, React.ComponentType<{ className?: string }>>)[componentName];
	if (!Icon) return null;
	return React.createElement(Icon, { className });
}

function isActive(pathname: string, item: MenuItem) {
	if (item.href === "/") return pathname === "/";
	if (pathname === item.href) return true;
	return item.matchPrefixes?.some((p) => pathname.startsWith(p)) ?? false;
}

function NavItemButton({
	item,
	pathname,
}: {
	item: MenuItem;
	pathname: string;
}) {
	const active = isActive(pathname, item);
	const iconName = item.icon || "question";

	return (
		<Link
			href={item.href}
			aria-label={item.label}
			className={active ? "active" : ""}
			title={item.label}
		>
			<div
				className={`relative flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl p-2 text-xl text-foreground outline-2 outline-transparent transition-colors duration-300 ${active
					? "font-medium"
					: "hover:bg-interactive-hover hover:outline-surface-soft"
					}`}
			>
				{active ? (
					<div className="absolute inset-0 h-full w-full rounded-xl bg-surface-soft" />
				) : null}
				<span className="relative z-1">
					{resolveIcon(iconName, active ? "Fill" : "Line", "h-7 w-7")}
				</span>
			</div>
		</Link>
	);
}

function RandomPostButton({
	postSlugs,
}: {
	postSlugs: { slug: string; section: string }[];
}) {
	const pathname = usePathname();
	const router = useRouter();

	function handleRandomClick() {
		if (postSlugs.length === 0) return;

		const currentEntry = postSlugs.find(
			(entry) => pathname === `/${entry.section}/${entry.slug}`,
		);
		const candidates =
			postSlugs.length > 1 && currentEntry
				? postSlugs.filter((e) => e !== currentEntry)
				: postSlugs;
		const next = candidates[Math.floor(Math.random() * candidates.length)];
		if (!next) return;

		router.push(`/${next.section}/${next.slug}`);
	}

	return (
		<button
			type="button"
			onClick={handleRandomClick}
			aria-label="随机文章"
			title="随机文章"
			disabled={postSlugs.length === 0}
			className={`inline-flex items-center justify-center rounded-full bg-neutral-800 text-jike-yellow size-10 shrink-0 ${postSlugs.length > 0
				? "cursor-pointer"
				: "pointer-events-none opacity-50"
				}`.trim()}
		>
			<RemixIcons.RiSparklingFill className="size-5" />
		</button>
	);
}

export function SidebarNav({
	items,
	postSlugs,
}: {
	items: MenuItem[];
	postSlugs: { slug: string; section: string }[];
}) {
	const pathname = usePathname();

	return (
		<aside className="fixed left-0 top-0 flex h-screen w-[84px] flex-col items-center justify-start border-r border-border/50 bg-card px-5 py-5">
			<Link
				href="/"
				className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-bg-jike-yellow"
			>
				<GradientShadowText fontSize="text-3xl">Y</GradientShadowText>
			</Link>

			<div className="flex flex-1 flex-col items-center mt-16">
				<div className="flex flex-col items-center gap-3">
					{items.map((item) => (
						<NavItemButton key={item.href} item={item} pathname={pathname} />
					))}
				</div>
			</div>

			<div className="mt-auto flex items-center justify-center pb-0.5">
				<RandomPostButton postSlugs={postSlugs} />
			</div>
		</aside>
	);
}

export function MobileBottomNav({
	items,
	postSlugs,
}: {
	items: MenuItem[];
	postSlugs: { slug: string; section: string }[];
}) {
	const pathname = usePathname();

	return (
		<div
			className="fixed left-1/2 z-30 flex -translate-x-1/2 items-center justify-between gap-4 rounded-full bg-card p-3 shadow-lg md:hidden"
			style={{ bottom: "max(env(safe-area-inset-bottom), 20px)" }}
		>
			<div className="flex h-11 flex-1 gap-3 items-center justify-between">
				{items.map((item) => (
					<NavItemButton key={item.href} item={item} pathname={pathname} />
				))}
			</div>
			<RandomPostButton postSlugs={postSlugs} />
		</div>
	);
}
