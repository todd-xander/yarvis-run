import type { ReactNode } from "react";
import { MobileBottomNav, SidebarNav } from "@/components/sidebar-nav";
import { APP_COPYRIGHT } from "@/lib/app-config";
import { listPostSlugs } from "@/lib/content-repository";
import { getSiteConfig } from "@/lib/site-config";

export function AppShell({ children }: { children: ReactNode }) {
	const config = getSiteConfig();
	const postSlugs = listPostSlugs();

	return (
		<div className="min-h-screen bg-background text-foreground">
			<div className="hidden md:block">
				<SidebarNav items={config.nav} postSlugs={postSlugs} />
			</div>
			<main className="flex min-h-screen flex-col pb-24 md:ml-[84px] md:pb-0">
				<div className="layout-content flex-1">{children}</div>
				<footer className="mt-16 py-6 text-center text-xs text-muted-soft">
					© {config.copyright || APP_COPYRIGHT || config.title}
				</footer>
			</main>
			<MobileBottomNav items={config.nav} postSlugs={postSlugs} />
		</div>
	);
}
