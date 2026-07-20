import {
	BarChart3,
	CalendarClock,
	CloudSun,
	Coins,
	Flame,
	Gauge,
	Home,
	KeyRound,
	Languages,
	LayoutGrid,
	Newspaper,
	Palette,
	QrCode,
	Settings,
	ShieldCheck,
	Sparkles,
	TerminalSquare,
} from "lucide-react";
import type { EndpointDefinition } from "./api";
import type {
	ChromeTheme,
	ColorTheme,
	AccentThemeMode,
	HotBoardId,
	MobileNavMode,
	QuickActionDefinition,
	QuickFavoriteId,
	SearchProviderId,
	ToolDefinition,
	WallpaperMode,
} from "./types";

export const CACHE_TTL = 60 * 60 * 1000;

export const STORAGE_KEYS = {
	apiBase: "60s-web:api-base",
	city: "60s-web:city",
	cityAutoDetected: "60s-web:city-auto-detected",
	activePage: "60s-web:active-page",
	settings: "60s-web:settings",
	avatar: "60s-web:avatar",
	searchProvider: "60s-web:search-provider",
	wallpaper: "60s-web:wallpaper",
	chromeTheme: "60s-web:chrome-theme",
	colorTheme: "60s-web:color-theme",
	accentTheme: "60s-web:accent-theme",
	mobileNavMode: "60s-web:mobile-nav-mode",
	homeCardLayout: "60s-web:home-card-layout",
	endpointFavorites: "60s-web:endpoint-favorites",
	quickFavorites: "60s-web:quick-favorites",
	hotBoardPreferences: "60s-web:hot-board-preferences",
} as const;

export const nav = [
	{ id: "home" as const, label: "首页", icon: Home },
	{ id: "hot" as const, label: "热榜", icon: BarChart3 },
	{ id: "news" as const, label: "新闻", icon: Newspaper },
	{ id: "weather" as const, label: "天气", icon: CloudSun },
	{ id: "tools" as const, label: "工具", icon: LayoutGrid },
	{ id: "settings" as const, label: "设置", icon: Settings },
];

export const hotTabs = [
	{ id: "weibo", label: "微博", path: "/weibo" },
	{ id: "zhihu", label: "知乎", path: "/zhihu" },
	{ id: "bili", label: "B站", path: "/bili" },
	{ id: "douyin", label: "抖音", path: "/douyin" },
	{ id: "toutiao", label: "头条", path: "/toutiao" },
] as const;

export const hotBoards: Array<{
	id: HotBoardId;
	title: string;
	path: string;
	params?: Record<string, string>;
}> = [
	{ id: "weibo", title: "微博热搜", path: "/weibo" },
	{ id: "zhihu", title: "知乎热榜", path: "/zhihu" },
	{ id: "bili", title: "B站热榜", path: "/bili" },
	{ id: "douyin", title: "抖音热搜", path: "/douyin" },
	{ id: "toutiao", title: "头条热榜", path: "/toutiao" },
	{ id: "baidu", title: "百度热搜", path: "/baidu/hot" },
	{ id: "rednote", title: "小红书热点", path: "/rednote" },
	{ id: "hacker-news", title: "Hacker News", path: "/hacker-news/top", params: { limit: "12" } },
];

export const defaultHotBoardPreferences: HotBoardId[] = [
	"weibo",
	"zhihu",
	"bili",
	"douyin",
];

export const defaultQuickFavorites: QuickFavoriteId[] = [
	"daily",
	"hot-weibo",
	"hot-zhihu",
	"hot-bili",
	"weather",
	"gold",
	"tools",
];

export const quickActions: QuickActionDefinition[] = [
	{
		id: "daily",
		label: "今日60秒",
		sub: "每日简报",
		icon: CalendarClock,
		target: { page: "news" },
	},
	{
		id: "hot-weibo",
		label: "微博热搜",
		sub: "热榜",
		icon: Flame,
		target: { page: "hot", hotTabId: "weibo" },
	},
	{
		id: "hot-zhihu",
		label: "知乎热榜",
		sub: "热榜",
		symbol: "知",
		symbolTone: "blue",
		target: { page: "hot", hotTabId: "zhihu" },
	},
	{
		id: "hot-bili",
		label: "B站热榜",
		sub: "热榜",
		symbol: "B",
		symbolTone: "pink",
		target: { page: "hot", hotTabId: "bili" },
	},
	{
		id: "weather",
		label: "天气",
		sub: "城市天气",
		icon: CloudSun,
		target: { page: "weather" },
	},
	{
		id: "gold",
		label: "金价",
		sub: "实用数据",
		icon: Coins,
		target: { page: "tools" },
	},
	{
		id: "tools",
		label: "工具",
		sub: "工具中心",
		icon: LayoutGrid,
		target: { page: "tools" },
	},
	{
		id: "tool-translate",
		label: "翻译",
		sub: "多语言互译",
		icon: Languages,
		target: { page: "tools", toolId: "translate" },
	},
	{
		id: "tool-qrcode",
		label: "二维码",
		sub: "生成与预览",
		icon: QrCode,
		target: { page: "tools", toolId: "qrcode" },
	},
	{
		id: "tool-password",
		label: "密码",
		sub: "生成强密码",
		icon: KeyRound,
		target: { page: "tools", toolId: "password" },
	},
	{
		id: "tool-palette",
		label: "配色",
		sub: "色彩搭配",
		icon: Palette,
		target: { page: "tools", toolId: "palette" },
	},
];

export const searchProviders: Array<{
	id: SearchProviderId;
	label: string;
	sub: string;
}> = [
	{ id: "bing", label: "Bing", sub: "网页" },
	{ id: "google", label: "Google", sub: "网页" },
	{ id: "chatgpt", label: "ChatGPT", sub: "问答" },
	{ id: "doubao", label: "豆包", sub: "对话" },
];

export const wallpaperOptions: Array<{
	id: WallpaperMode;
	label: string;
	sub: string;
}> = [
	{ id: "default", label: "默认", sub: "清爽渐变" },
	{ id: "mint", label: "薄荷", sub: "轻绿色调" },
	{ id: "paper", label: "纸面", sub: "干净留白" },
	{ id: "dawn", label: "晨光", sub: "暖色氛围" },
	{ id: "custom", label: "自定义", sub: "本地图片" },
];

export const chromeThemes: Array<{
	id: ChromeTheme;
	label: string;
	sub: string;
}> = [
	{ id: "classic", label: "经典", sub: "标准顶栏" },
	{ id: "floating", label: "悬浮", sub: "悬浮胶囊" },
	{ id: "single", label: "单页", sub: "隐藏导航" },
];

export const colorThemes: Array<{
	id: ColorTheme;
	label: string;
	sub: string;
}> = [
	{ id: "system", label: "系统", sub: "跟随设备" },
	{ id: "light", label: "浅色", sub: "清爽白昼" },
	{ id: "dark", label: "暗色", sub: "夜间低亮" },
];

export const accentThemes: Array<{
	id: Exclude<AccentThemeMode, "custom">;
	label: string;
	sub: string;
	primary: string;
	dark: string;
	secondary: string;
	warm: string;
}> = [
	{
		id: "green",
		label: "松绿",
		sub: "默认耐看",
		primary: "#0f8f7f",
		dark: "#08776d",
		secondary: "#14b8a6",
		warm: "#ff7a45",
	},
	{
		id: "blue",
		label: "仓蓝",
		sub: "清晰理性",
		primary: "#0969da",
		dark: "#0550ae",
		secondary: "#12a594",
		warm: "#ff8a3d",
	},
	{
		id: "coral",
		label: "珊瑚",
		sub: "温暖醒目",
		primary: "#e85d3f",
		dark: "#c6432e",
		secondary: "#0ea5a4",
		warm: "#ff9f1c",
	},
	{
		id: "violet",
		label: "藤紫",
		sub: "轻巧特别",
		primary: "#7657d6",
		dark: "#6046b6",
		secondary: "#0f9f8f",
		warm: "#f97316",
	},
];

export const mobileNavModes: Array<{
	id: MobileNavMode;
	label: string;
	sub: string;
}> = [
	{ id: "auto", label: "自动", sub: "PWA 底部，浏览器顶部" },
	{ id: "bottom", label: "底部导航", sub: "单手操作更顺手" },
	{ id: "top", label: "顶部导航", sub: "释放底部空间" },
];

export const toolDefinitions: ToolDefinition[] = [
	{
		id: "translate",
		icon: Languages,
		label: "翻译",
		sub: "多语言互译",
	},
	{
		id: "qrcode",
		icon: QrCode,
		label: "二维码",
		sub: "生成与预览",
	},
	{
		id: "password",
		icon: KeyRound,
		label: "密码",
		sub: "生成强密码",
	},
	{
		id: "palette",
		icon: Palette,
		label: "配色",
		sub: "色彩搭配",
	},
];

export const EPIC_COVER_PLACEHOLDER =
	"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='172' height='116' viewBox='0 0 172 116'><rect width='172' height='116' rx='12' fill='%23f3f6f8'/><rect x='16' y='16' width='140' height='84' rx='10' fill='%23e7eef3'/><path d='M36 82l24-26 18 18 26-30 32 38H36z' fill='%23c9d6df'/><circle cx='58' cy='44' r='9' fill='%23d7e3ea'/><text x='86' y='104' text-anchor='middle' font-size='12' fill='%23667885' font-family='Arial, sans-serif'>Epic Cover</text></svg>";
export const API_REPO_URL = "https://github.com/vikiboss/60s";
export const WEB_REPO_URL = "https://github.com/dogxii/60s-web";
export const API_DOCS_URL = "https://docs.60s-api.viki.moe/7306811m0";

export const categoryLabels: Record<EndpointDefinition["category"], string> = {
	periodic: "周期资讯",
	utility: "实用功能",
	hot: "热门榜单",
	entertainment: "消遣娱乐",
	beta: "Beta",
	legacy: "兼容旧版",
};

export const categoryIcons: Record<EndpointDefinition["category"], typeof Home> = {
	periodic: CalendarClock,
	utility: Gauge,
	hot: Flame,
	entertainment: Sparkles,
	beta: TerminalSquare,
	legacy: ShieldCheck,
};
