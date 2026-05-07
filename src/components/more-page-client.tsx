"use client";

import { useCallback, useEffect, useState } from "react";
import {
	Row,
	SectionGroup,
	ShortcutHelpModal,
} from "@/components/quick-menu-content";
import { ThemeToggleGroup } from "@/components/theme-toggle-group";
import type { MenuGroup, PostRouteEntry } from "@/lib/content-types";

export function MorePageClient({
	postSlugs,
	menuGroups,
}: {
	postSlugs: PostRouteEntry[];
	menuGroups: MenuGroup[];
}) {
	const [shortcutOpen, setShortcutOpen] = useState(false);

	const handleRandom = useCallback(() => {
		if (postSlugs.length === 0) return;
		const entry = postSlugs[Math.floor(Math.random() * postSlugs.length)];
		window.location.href = `/${entry.section}/${entry.slug}`;
	}, [postSlugs]);

	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			if (
				e.key === "h" &&
				!e.metaKey &&
				!e.ctrlKey &&
				!e.altKey &&
				!(e.target instanceof HTMLInputElement) &&
				!(e.target instanceof HTMLTextAreaElement)
			) {
				e.preventDefault();
				setShortcutOpen(true);
			}
		};
		window.addEventListener("keydown", handler);
		return () => window.removeEventListener("keydown", handler);
	}, []);

	return (
		<>
			<div className="space-y-4 p-4">
				<SectionGroup title="界面外观">
					<div className="flex items-center justify-between py-2.5 border-t border-border/50">
						<span className="text-base leading-6">主题</span>
						<ThemeToggleGroup />
					</div>
				</SectionGroup>

				{menuGroups.map((group) => (
					<SectionGroup key={group.group} title={group.group}>
						{group.items.map((item) => (
							<Row key={item.href} href={item.href} label={item.label} />
						))}
					</SectionGroup>
				))}

				<SectionGroup title="其他">
					<Row onClick={() => setShortcutOpen(true)} label="魔法捷径" />
					<Row onClick={handleRandom} label="随便看看" />
				</SectionGroup>
			</div>

			<ShortcutHelpModal
				open={shortcutOpen}
				onClose={() => setShortcutOpen(false)}
			/>
		</>
	);
}
