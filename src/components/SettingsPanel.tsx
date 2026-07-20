import {
	AlertTriangle,
	CheckCircle2,
	Download,
	ExternalLink,
	FileUp,
	Github,
	Image as ImageIcon,
	LayoutGrid,
	Loader2,
	Monitor,
	Moon,
	Palette,
	RotateCcw,
	Settings,
	SlidersHorizontal,
	Star,
	Sun,
	Wifi,
	X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { fetchApi, normalizeApiBase, normalizeApiBaseInput } from "../api";
import {
	API_DOCS_URL,
	WEB_REPO_URL,
	accentThemes,
	chromeThemes,
	colorThemes,
	hotBoards,
	quickActions,
	wallpaperOptions,
} from "../config";
import type {
	AccentThemeState,
	ChromeTheme,
	ColorTheme,
	HotBoardId,
	QuickActionDefinition,
	QuickFavoriteId,
	SettingsState,
	WallpaperState,
} from "../types";
import { CardTitle } from "./ui";

type ConfigActionResult = {
	ok: boolean;
	message: string;
};

function normalizeOptionalApiBase(value: string) {
	return value.trim() ? normalizeApiBaseInput(value) : "";
}

function getApiBaseCandidates(value: string) {
	const cleanValue = value.trim();
	if (!cleanValue) throw new Error("请输入 API 地址");
	const withProtocol = /^[a-z][a-z\d+.-]*:\/\//i.test(cleanValue)
		? cleanValue
		: `https://${cleanValue}`;
	return Array.from(
		new Set([
			normalizeApiBaseInput(cleanValue),
			normalizeApiBase(withProtocol),
		]),
	);
}

async function checkApiBase(base: string) {
	const controller = new AbortController();
	const timer = window.setTimeout(() => controller.abort(), 6000);
	try {
		await fetchApi(base, "/60s", {}, controller.signal);
	} finally {
		window.clearTimeout(timer);
	}
}

function hasApiVersionSuffix(value: string) {
	const cleanValue = value.trim();
	if (!cleanValue) return true;
	const withProtocol = /^[a-z][a-z\d+.-]*:\/\//i.test(cleanValue)
		? cleanValue
		: `https://${cleanValue}`;
	try {
		const url = new URL(withProtocol);
		return /\/v\d+\/?$/i.test(url.pathname);
	} catch {
		return true;
	}
}

function clampRangeValue(value: number | undefined, fallback: number) {
	if (typeof value !== "number" || Number.isNaN(value)) return fallback;
	return Math.min(Math.max(value, 0), 1);
}

function formatPercent(value: number) {
	return `${Math.round(value * 100)}%`;
}

export function SettingsPanel({
	apiBase,
	setApiBase,
	city,
	setCity,
	wallpaper,
	setWallpaper,
	chromeTheme,
	setChromeTheme,
	colorTheme,
	setColorTheme,
	accentTheme,
	setAccentTheme,
	settings,
	setSettings,
	onExportConfig,
	onImportConfig,
	onResetConfig,
	quickFavorites,
	setQuickFavorites,
	hotBoardPreferences,
	setHotBoardPreferences,
	compact = false,
}: {
	apiBase: string;
	setApiBase: (value: string) => void;
	city?: string;
	setCity?: (value: string) => void;
	wallpaper?: WallpaperState;
	setWallpaper?: (value: WallpaperState) => void;
	chromeTheme?: ChromeTheme;
	setChromeTheme?: (value: ChromeTheme) => void;
	colorTheme?: ColorTheme;
	setColorTheme?: (value: ColorTheme) => void;
	accentTheme?: AccentThemeState;
	setAccentTheme?: (value: AccentThemeState) => void;
	settings?: SettingsState;
	setSettings?: (value: SettingsState) => void;
	onExportConfig?: () => ConfigActionResult;
	onImportConfig?: (raw: string) => ConfigActionResult;
	onResetConfig?: () => ConfigActionResult;
	quickFavorites?: QuickFavoriteId[];
	setQuickFavorites?: (favorites: QuickFavoriteId[]) => void;
	hotBoardPreferences?: HotBoardId[];
	setHotBoardPreferences?: (preferences: HotBoardId[]) => void;
	compact?: boolean;
}) {
	const wallpaperInputRef = useRef<HTMLInputElement | null>(null);
	const configInputRef = useRef<HTMLInputElement | null>(null);
	const [apiCheck, setApiCheck] = useState<{
		status: "idle" | "checking" | "success" | "error";
		message: string;
	}>({ status: "idle", message: "" });
	const [apiDraft, setApiDraft] = useState(apiBase);
	const [configNotice, setConfigNotice] = useState<ConfigActionResult | null>(
		null,
	);
	const [settingsSection, setSettingsSection] = useState<
		"connect" | "appearance" | "preferences" | "data"
	>("connect");
	const [hiddenApiWarningValue, setHiddenApiWarningValue] = useState("");
	const favoriteQuickSet = new Set(quickFavorites || []);
	const selectedHotBoardSet = new Set(hotBoardPreferences || []);
	const moduleToggles: Array<[keyof SettingsState, string]> = [
		["showSearch", "搜索栏"],
		["showWeather", "天气"],
		["showHot", "热榜"],
		["showNews", "新闻"],
	];
	const trimmedApiDraft = apiDraft.trim();
	const showApiVersionWarning =
		Boolean(trimmedApiDraft) &&
		!hasApiVersionSuffix(trimmedApiDraft) &&
		hiddenApiWarningValue !== trimmedApiDraft;

	useEffect(() => {
		setApiDraft(apiBase);
	}, [apiBase]);

	const saveApiBase = () => {
		try {
			const normalized = normalizeOptionalApiBase(apiDraft);
			setApiBase(normalized);
			setApiDraft(normalized);
			setApiCheck({
				status: "success",
				message: normalized
					? "API 地址已保存，数据会使用新地址同步。"
					: "已清空 API 地址，页面不会自动请求。",
			});
		} catch (error) {
			setApiCheck({
				status: "error",
				message: error instanceof Error ? error.message : "API 地址无效",
			});
		}
	};

	const handleWallpaperFile = (file?: File) => {
		if (!file || !setWallpaper) return;
		if (!file.type.startsWith("image/")) return;
		const reader = new FileReader();
		reader.onload = () => {
			if (typeof reader.result !== "string") return;
			setWallpaper({
				mode: "custom",
				src: reader.result,
				imageOpacity: 0.78,
				overlayOpacity: 0.48,
				chromeOpacity: 0.68,
				surfaceOpacity: 0.72,
				blur: 0,
				updatedAt: Date.now(),
			});
		};
		reader.readAsDataURL(file);
	};

	const checkApiConnection = async () => {
		let candidates: string[];
		try {
			candidates = getApiBaseCandidates(apiDraft);
		} catch (error) {
			setApiCheck({
				status: "error",
				message: error instanceof Error ? error.message : "API 地址无效",
			});
			return;
		}

		setApiCheck({ status: "checking", message: "正在检测 API 连接..." });
		let lastError: unknown;
		try {
			for (const candidate of candidates) {
				try {
					await checkApiBase(candidate);
					setApiBase(candidate);
					setApiDraft(candidate);
					setApiCheck({
						status: "success",
						message: "连接正常，API 地址已保存。",
					});
					return;
				} catch (error) {
					lastError = error;
				}
			}
			const message =
				lastError instanceof DOMException && lastError.name === "AbortError"
					? "检测超时，请确认 API 服务可访问。"
					: lastError instanceof Error
						? lastError.message
						: "检测失败，请稍后重试。";
			setApiCheck({ status: "error", message });
		} catch (error) {
			setApiCheck({
				status: "error",
				message: error instanceof Error ? error.message : "检测失败，请稍后重试。",
			});
		}
	};

	const importConfigFile = (file?: File) => {
		if (!file || !onImportConfig) return;
		const reader = new FileReader();
		reader.onload = () => {
			if (typeof reader.result !== "string") {
				setConfigNotice({ ok: false, message: "无法读取配置文件。" });
				return;
			}
			setConfigNotice(onImportConfig(reader.result));
		};
		reader.onerror = () => {
			setConfigNotice({ ok: false, message: "配置文件读取失败。" });
		};
		reader.readAsText(file);
	};

	const exportConfig = () => {
		if (!onExportConfig) return;
		setConfigNotice(onExportConfig());
	};

	const resetConfig = () => {
		if (!onResetConfig) return;
		const confirmed = window.confirm(
			"确定恢复默认设置并清理 60s-web 本地缓存吗？",
		);
		if (!confirmed) return;
		setApiCheck({ status: "idle", message: "" });
		setConfigNotice(onResetConfig());
	};

	const toggleQuickFavorite = (action: QuickActionDefinition) => {
		if (!quickFavorites || !setQuickFavorites) return;
		if (favoriteQuickSet.has(action.id)) {
			setQuickFavorites(quickFavorites.filter((id) => id !== action.id));
			return;
		}
		setQuickFavorites([...quickFavorites, action.id]);
	};

	const toggleHotBoard = (id: HotBoardId) => {
		if (!hotBoardPreferences || !setHotBoardPreferences) return;
		if (selectedHotBoardSet.has(id)) {
			if (hotBoardPreferences.length <= 1) return;
			setHotBoardPreferences(hotBoardPreferences.filter((item) => item !== id));
			return;
		}
		setHotBoardPreferences([...hotBoardPreferences, id]);
	};

	const updateWallpaper = (patch: Partial<WallpaperState>) => {
		if (!wallpaper || !setWallpaper) return;
		setWallpaper({ ...wallpaper, ...patch });
	};

	const readWallpaperNumber = (
		key: keyof Pick<
			WallpaperState,
			"imageOpacity" | "overlayOpacity" | "chromeOpacity" | "surfaceOpacity"
		>,
		fallback: number,
	) => clampRangeValue(wallpaper?.[key], fallback);

	return (
		<article
			className={`card settings-panel settings-dashboard ${
				compact ? "compact-settings" : ""
			}`}
		>
			{!compact && (
				<div className="settings-nav" aria-label="设置分区">
					{[
						{ id: "connect" as const, label: "连接", icon: Wifi },
						{ id: "appearance" as const, label: "外观", icon: Palette },
						{
							id: "preferences" as const,
							label: "偏好",
							icon: SlidersHorizontal,
						},
						{ id: "data" as const, label: "数据", icon: FileUp },
					].map((item) => {
						const Icon = item.icon;
						return (
							<button
								type="button"
								key={item.id}
								className={settingsSection === item.id ? "active" : ""}
								onClick={() => setSettingsSection(item.id)}
							>
								<Icon size={17} />
								{item.label}
							</button>
						);
					})}
				</div>
			)}

			{(compact || settingsSection === "connect") && (
				<section className="settings-section">
					<div className="settings-section-head">
						<span>
							<Wifi size={18} /> 连接与城市
						</span>
					</div>
					<div className="settings-grid connection-grid">
						<div className="api-base api-setting-row">
							<span className="api-field-title">
								<span>API 地址</span>
								<a
									className="settings-inline-link"
									href={API_DOCS_URL}
									target="_blank"
									rel="noreferrer"
								>
									公共实例列表 <ExternalLink size={13} />
								</a>
							</span>
							<span className="api-control-row">
								<input
									value={apiDraft}
									onChange={(event) => {
										setApiDraft(event.target.value);
										setApiCheck({ status: "idle", message: "" });
									}}
									onKeyDown={(event) => {
										if (event.key === "Enter") {
											event.preventDefault();
											saveApiBase();
										}
									}}
									placeholder="example.com/v2"
								/>
								<button
									type="button"
									className="outline-button"
									onClick={saveApiBase}
									disabled={apiCheck.status === "checking"}
								>
									保存
								</button>
								<button
									type="button"
									className="outline-button"
									onClick={checkApiConnection}
									disabled={apiCheck.status === "checking"}
								>
									{apiCheck.status === "checking" ? (
										<Loader2 className="spin" size={16} />
									) : (
										<Wifi size={16} />
									)}
									检测
								</button>
							</span>
							{showApiVersionWarning && (
								<span className="settings-notice warning">
									<AlertTriangle size={15} />
									API 地址通常需要带版本后缀，例如 /v2
									<button
										type="button"
										aria-label="关闭版本后缀提示"
										onClick={() => setHiddenApiWarningValue(trimmedApiDraft)}
									>
										<X size={14} />
									</button>
								</span>
							)}
							{apiCheck.message && (
								<span className={`settings-notice ${apiCheck.status}`}>
									{apiCheck.status === "success" ? (
										<CheckCircle2 size={15} />
									) : apiCheck.status === "checking" ? (
										<Loader2 className="spin" size={15} />
									) : (
										<AlertTriangle size={15} />
									)}
									{apiCheck.message}
								</span>
							)}
						</div>
						{city !== undefined && setCity && (
							<label className="api-base city-setting">
								默认城市
								<input
									value={city}
									onChange={(event) => setCity(event.target.value)}
									placeholder="例如 上海"
								/>
							</label>
						)}
					</div>
				</section>
			)}

			{!compact &&
				settingsSection === "appearance" &&
				wallpaper &&
				setWallpaper && (
					<section className="settings-section">
						<div className="settings-section-head">
							<span>
								<Palette size={18} /> 外观与布局
							</span>
						</div>
						{colorTheme && setColorTheme && (
							<>
								<div className="settings-subtitle first-subtitle">
									<span>
										{colorTheme === "system" ? (
											<Monitor size={18} />
										) : colorTheme === "dark" ? (
											<Moon size={18} />
										) : (
											<Sun size={18} />
										)}
										明暗
									</span>
								</div>
								<div className="color-theme-grid">
									{colorThemes.map((theme) => (
										<button
											type="button"
											key={theme.id}
											className={colorTheme === theme.id ? "active" : ""}
											onClick={() => setColorTheme(theme.id)}
										>
											<i className={`color-preview color-preview-${theme.id}`}>
												<span />
												<b />
											</i>
											<span>
												<b>{theme.label}</b>
												<small>{theme.sub}</small>
											</span>
										</button>
									))}
								</div>
							</>
						)}
						{accentTheme && setAccentTheme && (
							<>
								<div className="settings-subtitle">
									<span>
										<Palette size={18} /> 主题色
									</span>
								</div>
								<div className="accent-theme-grid">
									{accentThemes.map((theme) => (
										<button
											type="button"
											key={theme.id}
											className={accentTheme.mode === theme.id ? "active" : ""}
											onClick={() => setAccentTheme({ mode: theme.id })}
										>
											<i
												className="accent-preview"
												style={{ backgroundColor: theme.primary }}
											/>
											<span>
												<b>{theme.label}</b>
												<small>{theme.sub}</small>
											</span>
										</button>
									))}
									<label
										className={`accent-custom-field ${
											accentTheme.mode === "custom" ? "active" : ""
										}`}
									>
										<input
											type="color"
											value={
												accentTheme.mode === "custom"
													? accentTheme.color || "#0f8f7f"
													: "#0f8f7f"
											}
											onChange={(event) =>
												setAccentTheme({
													mode: "custom",
													color: event.target.value,
												})
											}
										/>
										<span>
											<b>自定义</b>
											<small>选择任意主色</small>
										</span>
									</label>
								</div>
							</>
						)}
						{chromeTheme && setChromeTheme && (
							<>
								<div className="settings-subtitle">
									<span>
										<LayoutGrid size={18} /> 桌面布局
									</span>
								</div>
								<div className="chrome-theme-grid">
									{chromeThemes.map((theme) => (
										<button
											type="button"
											key={theme.id}
											className={chromeTheme === theme.id ? "active" : ""}
											onClick={() => setChromeTheme(theme.id)}
										>
											<i className={`chrome-preview chrome-preview-${theme.id}`}>
												<span />
												<b />
											</i>
											<span>
												<b>{theme.label}</b>
												<small>{theme.sub}</small>
											</span>
										</button>
									))}
								</div>
							</>
						)}
						<div className="settings-subtitle">
							<span>
								<ImageIcon size={18} /> 背景
							</span>
						</div>
						<div className="wallpaper-grid">
							{wallpaperOptions.map((option) => (
								<button
									type="button"
									key={option.id}
									className={wallpaper.mode === option.id ? "active" : ""}
									onClick={() => {
										if (option.id === "custom") {
											wallpaperInputRef.current?.click();
											return;
										}
										setWallpaper({ mode: option.id });
									}}
								>
									<i className={`wallpaper-preview wallpaper-${option.id}`}>
										{option.id === "custom" && wallpaper.src ? (
											<img src={wallpaper.src} alt="" />
										) : null}
									</i>
									<span>
										<b>{option.label}</b>
										<small>{option.sub}</small>
									</span>
								</button>
							))}
						</div>
						<input
							ref={wallpaperInputRef}
							type="file"
							accept="image/*"
							hidden
							onChange={(event) => handleWallpaperFile(event.target.files?.[0])}
						/>
						{wallpaper.mode === "custom" && (
							<div className="wallpaper-controls">
								{[
									{
										key: "imageOpacity" as const,
										label: "图片强度",
									fallback: 0.78,
								},
									{
										key: "overlayOpacity" as const,
										label: "遮罩",
										fallback: 0.48,
									},
									{
										key: "chromeOpacity" as const,
										label: "顶栏",
										fallback: 0.68,
									},
									{
										key: "surfaceOpacity" as const,
										label: "面板",
										fallback: 0.72,
									},
								].map((control) => {
									const value = readWallpaperNumber(
										control.key,
										control.fallback,
									);
									return (
										<label className="range-row" key={control.key}>
											<span>{control.label}</span>
											<input
												type="range"
												min="0"
												max="1"
												step="0.05"
												value={value}
												onChange={(event) =>
													updateWallpaper({
														[control.key]: Number(event.target.value),
													})
												}
											/>
											<b>{formatPercent(value)}</b>
										</label>
									);
								})}
								<label className="range-row">
									<span>模糊</span>
									<input
										type="range"
										min="0"
										max="12"
										step="1"
										value={Math.min(Math.max(wallpaper.blur ?? 0, 0), 12)}
										onChange={(event) =>
											updateWallpaper({ blur: Number(event.target.value) })
										}
									/>
									<b>{Math.min(Math.max(wallpaper.blur ?? 0, 0), 12)}px</b>
								</label>
							</div>
						)}
					</section>
				)}

			{!compact && settingsSection === "preferences" && (
				<section className="settings-section">
					<div className="settings-section-head">
						<span>
							<SlidersHorizontal size={18} /> 偏好
						</span>
					</div>
					{settings && setSettings && (
						<div className="module-toggle-grid">
							{moduleToggles.map(([key, label]) => (
								<label className="switch-row" key={key}>
									<span>{label}</span>
									<input
										type="checkbox"
										checked={settings[key]}
										onChange={(event) =>
											setSettings({ ...settings, [key]: event.target.checked })
										}
									/>
								</label>
							))}
						</div>
					)}
					{hotBoardPreferences && setHotBoardPreferences && (
						<>
							<div className="settings-subtitle">
								<span>
									<LayoutGrid size={18} /> 热榜源
								</span>
							</div>
							<div className="hot-source-grid">
								{hotBoards.map((board) => {
									const active = selectedHotBoardSet.has(board.id);
									return (
										<button
											type="button"
											key={board.id}
											className={active ? "active" : ""}
											aria-pressed={active}
											onClick={() => toggleHotBoard(board.id)}
										>
											<span>{board.title}</span>
											<small>{board.path}</small>
										</button>
									);
								})}
							</div>
						</>
					)}
					{quickFavorites && setQuickFavorites && (
						<>
							<div className="settings-subtitle">
								<span>
									<Star size={18} /> 搜索下方快捷入口
								</span>
								<small>{quickFavorites.length} 个收藏</small>
							</div>
							<div className="quick-settings-grid">
								{quickActions.map((action) => {
									const Icon = action.icon;
									const active = favoriteQuickSet.has(action.id);
									return (
										<button
											type="button"
											key={action.id}
											className={active ? "active" : ""}
											onClick={() => toggleQuickFavorite(action)}
											aria-pressed={active}
										>
											{Icon ? (
												<Icon size={19} />
											) : (
												<i className={`chip-symbol ${action.symbolTone || ""}`}>
													{action.symbol}
												</i>
											)}
											<span>
												<b>{action.label}</b>
												<small>{action.sub}</small>
											</span>
											<Star size={16} className="quick-star" />
										</button>
									);
								})}
							</div>
						</>
					)}
				</section>
			)}

			{!compact &&
				settingsSection === "data" &&
				onExportConfig &&
				onImportConfig &&
				onResetConfig && (
					<section className="settings-section">
						<div className="settings-section-head">
							<span>
								<FileUp size={18} /> 数据与配置
							</span>
						</div>
						<div className="config-action-grid">
							<button type="button" onClick={exportConfig}>
								<Download size={18} />
								<span>
									<b>导出配置</b>
									<small>保存当前偏好</small>
								</span>
							</button>
							<button
								type="button"
								onClick={() => configInputRef.current?.click()}
							>
								<FileUp size={18} />
								<span>
									<b>导入配置</b>
									<small>从 JSON 恢复</small>
								</span>
							</button>
							<button type="button" className="danger" onClick={resetConfig}>
								<RotateCcw size={18} />
								<span>
									<b>恢复默认</b>
									<small>清理本地缓存</small>
								</span>
							</button>
						</div>
						<input
							ref={configInputRef}
							type="file"
							accept="application/json,.json"
							hidden
							onChange={(event) => {
								importConfigFile(event.target.files?.[0]);
								event.currentTarget.value = "";
							}}
						/>
						{configNotice && (
							<p
								className={`config-notice ${
									configNotice.ok ? "success" : "error"
								}`}
								role="status"
							>
								{configNotice.ok ? (
									<CheckCircle2 size={16} />
								) : (
									<AlertTriangle size={16} />
								)}
								{configNotice.message}
							</p>
						)}
						<div className="config-action-grid github-link-grid">
							<a href={WEB_REPO_URL} target="_blank" rel="noreferrer">
								<Github size={18} />
								<span>
									<b>60s-web</b>
									<small>前端项目</small>
								</span>
							</a>
						</div>
					</section>
				)}
		</article>
	);
}

export function HomeModuleSettings({
	apiBase,
	setApiBase,
	city,
	setCity,
	settings,
	setSettings,
}: {
	apiBase: string;
	setApiBase: (value: string) => void;
	city: string;
	setCity: (value: string) => void;
	settings: SettingsState;
	setSettings: (value: SettingsState) => void;
}) {
	const [apiDraft, setApiDraft] = useState(apiBase);
	const [apiNotice, setApiNotice] = useState("");
	const toggles: Array<[keyof SettingsState, string]> = [
		["showSearch", "显示搜索栏"],
		["showWeather", "显示天气"],
		["showHot", "显示热榜"],
		["showNews", "显示新闻"],
	];

	useEffect(() => {
		setApiDraft(apiBase);
	}, [apiBase]);

	const saveApiBase = () => {
		try {
			const normalized = normalizeOptionalApiBase(apiDraft);
			setApiBase(normalized);
			setApiDraft(normalized);
			setApiNotice(normalized ? "API 地址已保存" : "已清空 API 地址");
		} catch (error) {
			setApiNotice(error instanceof Error ? error.message : "API 地址无效");
		}
	};

	return (
		<article className="card settings-panel home-module-settings">
			<CardTitle icon={<Settings size={21} />} title="模块设置" />
			<div className="settings-grid">
				{toggles.map(([key, label]) => (
					<label className="switch-row" key={key}>
						<span>{label}</span>
						<input
							type="checkbox"
							checked={settings[key]}
							onChange={(event) =>
								setSettings({ ...settings, [key]: event.target.checked })
							}
						/>
					</label>
				))}
				<label className="api-base city-setting">
					天气设置
					<input
						value={city}
						onChange={(event) => setCity(event.target.value)}
						placeholder="例如 上海"
					/>
				</label>
				<div className="api-base api-setting-row">
					<span className="api-field-title">
						<span>API 设置</span>
						<a
							className="settings-inline-link"
							href={API_DOCS_URL}
							target="_blank"
							rel="noreferrer"
						>
							公共实例 <ExternalLink size={13} />
						</a>
					</span>
					<span className="api-compact-row">
						<input
							value={apiDraft}
							onChange={(event) => {
								setApiDraft(event.target.value);
								setApiNotice("");
							}}
							onKeyDown={(event) => {
								if (event.key === "Enter") {
									event.preventDefault();
									saveApiBase();
								}
							}}
							placeholder="example.com/v2"
						/>
						<button
							type="button"
							className="outline-button"
							onClick={saveApiBase}
						>
							保存
						</button>
						</span>
						{apiNotice && (
							<small className="api-inline-notice">{apiNotice}</small>
						)}
					</div>
			</div>
		</article>
	);
}
