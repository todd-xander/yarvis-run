import type { Metadata } from "next";
import type { PropsWithChildren } from "react";
import "katex/dist/katex.min.css";
import "streamdown/styles.css";
import "./globals.css";
import { AppShell } from "@/components/app-shell";
import { QuickMenuLauncher } from "@/components/quick-menu-launcher";
import { ThemeProvider } from "@/components/theme-provider";
import { APP_DESCRIPTION, APP_NAME } from "@/lib/app-config";
import { listPostSlugs } from "@/lib/content-repository";
import { getSiteConfig } from "@/lib/site-config";

const siteConfig = getSiteConfig();
const postSlugs = listPostSlugs();
const menuGroups = siteConfig.menus;

export const metadata: Metadata = {
	title: siteConfig.title || APP_NAME,
	description: siteConfig.description || APP_DESCRIPTION,
	manifest: "/manifest.webmanifest",
	icons: {
		icon: [
			{ url: "/icons/yarvis-icon.svg", type: "image/svg+xml" },
			{ url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
			{ url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
		],
		apple: [
			{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
		],
		shortcut: ["/favicon.ico"],
	},
	alternates: {
		types: {
			"application/rss+xml": "/feed.xml",
		},
	},
};

export default function RootLayout({ children }: Readonly<PropsWithChildren>) {
	return (
		<html lang="zh-CN">
			<body className="antialiased">
				<ThemeProvider>
					<AppShell>{children}</AppShell>
					<QuickMenuLauncher postSlugs={postSlugs} menuGroups={menuGroups} />
				</ThemeProvider>
			</body>
		</html>
	);
}
