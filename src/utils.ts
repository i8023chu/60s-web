import type { CSSProperties } from "react";
import type {
	EndpointDefinition,
	ExchangeRate,
	HotItem,
	WeatherForecast,
} from "./api";
import { accentThemes } from "./config";
import type {
	AccentThemeState,
	AvatarState,
	ResolvedColorTheme,
	SearchProviderId,
	WallpaperState,
} from "./types";

export function defaults(endpoint: EndpointDefinition) {
	return Object.fromEntries(
		(endpoint.params || []).map((param) => [
			param.name,
			param.defaultValue || "",
		]),
	);
}

export function skeletonLines(count: number) {
	return Array.from({ length: count }, (_, index) => `loading-${index}`);
}

export function skeletonItems(count: number): HotItem[] {
	return Array.from({ length: count }, (_, index) => ({
		title: `正在读取第 ${index + 1} 条...`,
	}));
}

export function shortDate(input: string) {
	if (!input) return "";
	const date = new Date(input.replace(/\//g, "-"));
	if (Number.isNaN(date.getTime())) return input.slice(5);
	return `${date.getMonth() + 1}/${date.getDate()}`;
}

export function formatHourlyTime(input?: string) {
	if (!input) return "";
	const date = new Date(input.replace(" ", "T"));
	if (Number.isNaN(date.getTime())) return input.slice(-5);
	return date.toLocaleTimeString("zh-CN", {
		hour: "2-digit",
		minute: "2-digit",
	});
}

export function getUpcomingForecastDays(
	days?: WeatherForecast["daily_forecast"],
): Array<{
	date: string;
	label: string;
	condition?: string;
	max: string | number;
	min: string | number;
}> {
	if (!days?.length) return [];
	const today = new Date();
	today.setHours(0, 0, 0, 0);

	return days
		.map((day) => ({
			date: day.time || day.date || "",
			condition: day.day_weather || day.day_condition,
			max: day.max_degree ?? day.max_temperature ?? "--",
			min: day.min_degree ?? day.min_temperature ?? "--",
		}))
		.filter((day) => {
			const date = new Date(day.date.replace(/\//g, "-"));
			if (Number.isNaN(date.getTime())) return true;
			date.setHours(0, 0, 0, 0);
			return date >= today;
		})
		.slice(0, 7)
		.map((day, index) => ({
			...day,
			label:
				index === 0 ? "今天" : index === 1 ? "明天" : formatWeekLabel(day.date),
		}));
}

export function formatWeekLabel(input: string) {
	const date = new Date(input.replace(/\//g, "-"));
	if (Number.isNaN(date.getTime())) return "本周";
	return ["周日", "周一", "周二", "周三", "周四", "周五", "周六"][
		date.getDay()
	];
}

export function weatherIconType(condition?: string) {
	if (!condition) return "cloudy";
	if (condition.includes("雨") || condition.includes("雷")) return "rainy";
	if (condition.includes("晴") && !condition.includes("云")) return "sunny";
	if (condition.includes("雪")) return "snowy";
	return "cloudy";
}

export function getQqAvatarUrl(qq: string) {
	return `https://q1.qlogo.cn/g?b=qq&nk=${encodeURIComponent(qq)}&s=100`;
}

export function getAvatarSrc(avatar: AvatarState) {
	if (avatar.mode === "upload" && avatar.src) return avatar.src;
	if (avatar.mode === "qq" && avatar.qq)
		return avatar.src || getQqAvatarUrl(avatar.qq);
	return "/avatar.jpg";
}

export function buildSearchTarget(provider: SearchProviderId, keyword: string) {
	const query = encodeURIComponent(keyword);
	if (provider === "bing") return `https://www.bing.com/search?q=${query}`;
	if (provider === "google") return `https://www.google.com/search?q=${query}`;
	if (provider === "chatgpt") return `https://chatgpt.com/?q=${query}`;
	if (provider === "doubao") return `https://www.doubao.com/chat/?q=${query}`;
	return "#";
}

export function getWallpaperStyle(
	wallpaper: WallpaperState,
	colorTheme: ResolvedColorTheme,
): CSSProperties {
	const dark = colorTheme === "dark";
	if (wallpaper.mode === "custom" && wallpaper.src) {
		const imageOpacity = clampCssNumber(wallpaper.imageOpacity, dark ? 0.58 : 0.78);
		const overlayOpacity = clampCssNumber(wallpaper.overlayOpacity, dark ? 0.64 : 0.48);
		const chromeOpacity = clampCssNumber(wallpaper.chromeOpacity, dark ? 0.72 : 0.68);
		const surfaceOpacity = clampCssNumber(wallpaper.surfaceOpacity, dark ? 0.74 : 0.72);
		const blur = Math.min(Math.max(wallpaper.blur ?? 0, 0), 12);
		const overlayRgb = dark ? "7, 16, 15" : "246, 248, 248";
		const navRgb = dark ? "12, 25, 23" : "255, 255, 255";
		const surfaceRgb = dark ? "14, 29, 27" : "255, 255, 255";
		const lineRgb = dark ? "240, 246, 252" : "31, 35, 40";
		return {
			"--wallpaper-image": `url("${wallpaper.src}")`,
			"--wallpaper-image-opacity": String(imageOpacity),
			"--wallpaper-image-blur": `${blur}px`,
			"--wallpaper-overlay": `rgba(${overlayRgb}, ${overlayOpacity})`,
			"--app-bg": "transparent",
			"--canvas": "transparent",
			"--nav-bg": `rgba(${navRgb}, ${chromeOpacity})`,
			"--surface": `rgba(${surfaceRgb}, ${surfaceOpacity})`,
			"--surface-strong": `rgba(${surfaceRgb}, ${Math.min(
				surfaceOpacity + 0.14,
				dark ? 0.9 : 0.94,
			)})`,
			"--surface-soft": `rgba(${surfaceRgb}, ${Math.min(
				surfaceOpacity + 0.02,
				dark ? 0.82 : 0.84,
			)})`,
			"--input-bg": `rgba(${surfaceRgb}, ${Math.min(
				surfaceOpacity + 0.16,
				dark ? 0.92 : 0.95,
			)})`,
			"--line": `rgba(${lineRgb}, ${dark ? 0.18 : 0.16})`,
			"--line-strong": `rgba(${lineRgb}, ${dark ? 0.26 : 0.22})`,
			background: "transparent",
		} as CSSProperties;
	}
	if (wallpaper.mode === "mint") {
		return {
			background:
				dark
					? "linear-gradient(135deg, rgba(55,216,197,0.16), rgba(37,99,235,0.1) 45%, rgba(7,16,15,1) 100%)"
					: "linear-gradient(135deg, rgba(15,155,142,0.16), rgba(37,99,235,0.08) 45%, rgba(246,248,248,1) 100%)",
		};
	}
	if (wallpaper.mode === "paper") {
		return {
			background:
				dark
					? "linear-gradient(180deg, rgba(12,25,23,0.96), rgba(7,16,15,1)), radial-gradient(circle at 20% 18%, rgba(55,216,197,0.12), transparent 28rem)"
					: "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(246,248,248,1)), radial-gradient(circle at 20% 18%, rgba(15,155,142,0.06), transparent 28rem)",
		};
	}
	if (wallpaper.mode === "dawn") {
		return {
			background:
				dark
					? "linear-gradient(135deg, rgba(76,43,23,0.55), rgba(13,28,25,1) 52%, rgba(7,16,15,1))"
					: "linear-gradient(135deg, rgba(255,244,229,0.95), rgba(239,247,245,1) 52%, rgba(246,248,248,1))",
		};
	}
	return {};
}

function clampCssNumber(value: number | undefined, fallback: number) {
	if (typeof value !== "number" || Number.isNaN(value)) return fallback;
	return Math.min(Math.max(value, 0), 1);
}

function normalizeHexColor(value?: string) {
	if (!value) return "";
	const clean = value.trim();
	if (/^#[0-9a-f]{6}$/i.test(clean)) return clean.toLowerCase();
	if (/^[0-9a-f]{6}$/i.test(clean)) return `#${clean.toLowerCase()}`;
	return "";
}

function hexToRgb(hex: string) {
	const clean = normalizeHexColor(hex) || "#0f8f7f";
	const value = Number.parseInt(clean.slice(1), 16);
	return {
		r: (value >> 16) & 255,
		g: (value >> 8) & 255,
		b: value & 255,
	};
}

function mixHex(hex: string, target: "#000000" | "#ffffff", weight: number) {
	const base = hexToRgb(hex);
	const mix = hexToRgb(target);
	const ratio = Math.min(Math.max(weight, 0), 1);
	const channel = (from: number, to: number) =>
		Math.round(from * (1 - ratio) + to * ratio);
	return `#${[channel(base.r, mix.r), channel(base.g, mix.g), channel(base.b, mix.b)]
		.map((part) => part.toString(16).padStart(2, "0"))
		.join("")}`;
}

export function getAccentStyle(accentTheme: AccentThemeState): CSSProperties {
	const preset = accentThemes.find((theme) => theme.id === accentTheme.mode);
	const primary =
		accentTheme.mode === "custom"
			? normalizeHexColor(accentTheme.color) || accentThemes[0].primary
			: preset?.primary || accentThemes[0].primary;
	const dark =
		accentTheme.mode === "custom"
			? mixHex(primary, "#000000", 0.2)
			: preset?.dark || mixHex(primary, "#000000", 0.2);
	const secondary =
		accentTheme.mode === "custom"
			? mixHex(primary, "#ffffff", 0.18)
			: preset?.secondary || mixHex(primary, "#ffffff", 0.18);
	const warm = preset?.warm || "#ff7a45";
	const { r, g, b } = hexToRgb(primary);

	return {
		"--accent": primary,
		"--accent-dark": dark,
		"--accent-teal": secondary,
		"--accent-warm": warm,
		"--surface-tint": `rgba(${r}, ${g}, ${b}, 0.12)`,
		"--accent-soft": `rgba(${r}, ${g}, ${b}, 0.08)`,
		"--accent-border": `rgba(${r}, ${g}, ${b}, 0.32)`,
		"--accent-focus": `rgba(${r}, ${g}, ${b}, 0.1)`,
	} as CSSProperties;
}

export function readCurrencyRate(data: ExchangeRate | undefined, code: string) {
	if (!data?.rates) return undefined;
	if (Array.isArray(data.rates)) {
		const match = data.rates.find(
			(item) => item.currency === code || item.code === code,
		);
		return Number(match?.rate ?? match?.value) || undefined;
	}
	return data.rates[code];
}
