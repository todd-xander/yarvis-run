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

export type PaginationConfig = {
	pageSize: number;
};

export type ListlikeLayout = "feed" | "list" | "card" | "catalog";

export type DataLayout = "post" | "showpiece";

export type LayoutType = ListlikeLayout | DataLayout;

export type BaseFrontmatter = {
	title: string;
	slug: string;
	publishedAt: Date;
	cover?: string;
	description?: string;
	avatar?: string;
	location?: string;
	tags?: string[];
};

export type ListlikeFrontmatter = BaseFrontmatter & {
	layout: ListlikeLayout;
	sort?: SortConfig;
	pagination?: PaginationConfig;
	dimensions?: CatalogDimension[];
};

export type DataFrontmatter = BaseFrontmatter & {
	layout: DataLayout;
	author?: string;
	category?: string;
	badge?: Badge[];
	meta?: MetaItem[];
};

export type ContentFrontmatter =
	| ListlikeFrontmatter
	| DataFrontmatter;

export type AvatarAuthor = Pick<BaseFrontmatter, "title" | "avatar">;

export type DimensionItem = {
	id: string;
	name: string;
	avatar?: string;
	description?: string;
};

export type DimensionItemWithPostCount = DimensionItem & {
	postCount: number;
};

export type CatalogItemData = DimensionItemWithPostCount & {
	href?: string;
};

export type PostRouteEntry = {
	slug: string;
	section: string;
};

export type CatalogSectionData = {
	key: string;
	basePath: string;
	title: string;
	display: CatalogDimension["display"];
	items: CatalogItemData[];
};

export type CatalogViewModel = {
	sections: CatalogSectionData[];
};

export type Post = BaseFrontmatter & {
	layout: "post";
	author?: string;
	category?: string;
	id: string;
	content: string;
	wordCount: number;
	readingMinutes: number;
	images: PostImage[];
};

export type ResolvedPost = Post & {
	dims: Record<string, DimensionItem>;
};

export type ShowpieceFeedItem = ResolvedPost & {
	type: "showpiece";
	sectionLabel?: string;
};

export type FeedItem = (ResolvedPost & { type: "post" }) | ShowpieceFeedItem;

export type SearchablePost = ResolvedPost & {
	searchText: string;
};
