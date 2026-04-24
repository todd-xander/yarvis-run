export type BadgeType = "neutral" | "success" | "warning" | "danger";

export type Badge = {
	label: string;
	type?: BadgeType;
	icon?: string;
};

export type MetaItem = {
	label: string;
	value: string;
	icon?: string;
};

export type MenuItem = {
	label: string;
	href: string;
	icon?: string;
	key?: string;
	matchPrefixes?: string[];
};

export type MenuGroup = {
	group: string;
	items: MenuItem[];
};

export type DimensionPostField = string;

export type CatalogDimension = {
	dir?: string;
	label: string;
	display: "list" | "pill";
	postField: DimensionPostField;
};

export type SiteConfig = {
	title: string;
	description: string;
	copyright?: string;
	nav: MenuItem[];
	menus: MenuGroup[];
	dimensions: CatalogDimension[];
};

export type PostImage = {
	src: string;
	alt: string;
	title?: string;
};

export type SortConfig = {
	key: string;
	order: "ascend" | "descend";
};

export type LayoutType = "post" | "feed" | "list" | "card" | "catalog" | "showpiece";

type BaseFrontmatter = {
	title: string;
	slug: string;
	publishedAt: Date;
	cover?: string;
	description?: string;
	tags?: string[];
};

export type FeedFrontmatter = BaseFrontmatter & {
	layout: "feed";
	sort?: SortConfig;
};

export type ListFrontmatter = BaseFrontmatter & {
	layout: "list";
	sort?: SortConfig;
};

export type CardFrontmatter = BaseFrontmatter & {
	layout: "card";
	sort?: SortConfig;
};

export type CatalogFrontmatter = BaseFrontmatter & {
	layout: "catalog";
	dimensions?: CatalogDimension[];
};

export type PostFrontmatter = BaseFrontmatter & {
	layout: "post";
	avatar?: string;
	author?: string;
	category?: string;
};

export type ShowpieceFrontmatter = BaseFrontmatter & {
	layout: "showpiece";
	description?: string;
	badge?: Badge[];
	meta?: MetaItem[];
};

export type ContentFrontmatter =
	| FeedFrontmatter
	| ListFrontmatter
	| CardFrontmatter
	| CatalogFrontmatter
	| PostFrontmatter
	| ShowpieceFrontmatter;

export type DimensionItem = {
	id: string;
	name: string;
	avatar?: string;
	description?: string;
};

export type DimensionItemWithPostCount = DimensionItem & {
	postCount: number;
};

export type Post = PostFrontmatter & {
	id: string;
	content: string;
	wordCount: number;
	readingMinutes: number;
	images: PostImage[];
	dims?: Record<string, DimensionItem>;
};

export type FeedItem = Post & {
	type: "post" | "showpiece";
	dims: Record<string, DimensionItem>;
};
