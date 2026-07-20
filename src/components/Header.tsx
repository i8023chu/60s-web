import {
	Menu,
	Monitor,
	Moon,
	RotateCcw,
	Save,
	Settings,
	Sun,
	Upload,
	UserRound,
	X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { nav } from "../config";
import type { AvatarState, ColorTheme, PageId, ResolvedColorTheme } from "../types";
import { getAvatarSrc, getQqAvatarUrl } from "../utils";

const themeChoices: Array<{
	id: ColorTheme;
	label: string;
	icon: typeof Monitor;
}> = [
	{ id: "system", label: "系统", icon: Monitor },
	{ id: "light", label: "浅色", icon: Sun },
	{ id: "dark", label: "暗色", icon: Moon },
];

export function Header({
	activePage,
	setActivePage,
	avatar,
	setAvatar,
	colorTheme,
	resolvedColorTheme,
	setColorTheme,
}: {
	activePage: PageId;
	setActivePage: (page: PageId) => void;
	avatar: AvatarState;
	setAvatar: (avatar: AvatarState) => void;
	colorTheme: ColorTheme;
	resolvedColorTheme: ResolvedColorTheme;
	setColorTheme: (theme: ColorTheme) => void;
}) {
	const [avatarOpen, setAvatarOpen] = useState(false);
	const [menuOpen, setMenuOpen] = useState(false);
	const [qqInput, setQqInput] = useState(avatar.qq || "");
	const [avatarNotice, setAvatarNotice] = useState("");
	const fileInputRef = useRef<HTMLInputElement | null>(null);
	const avatarWrapRef = useRef<HTMLDivElement | null>(null);
	const menuWrapRef = useRef<HTMLDivElement | null>(null);
	const avatarSrc = getAvatarSrc(avatar);
	const mainNav = nav.filter((item) => item.id !== "settings");
	const mobileMenuNav = nav;

	const navigateTo = (page: PageId) => {
		setActivePage(page);
		setMenuOpen(false);
		setAvatarOpen(false);
		window.requestAnimationFrame(() => {
			window.scrollTo({ top: 0, behavior: "auto" });
		});
	};

	const handleAvatarFile = (file?: File) => {
		if (!file) return;
		if (!file.type.startsWith("image/")) {
			setAvatarNotice("请选择图片文件");
			return;
		}
		if (file.size > 1.5 * 1024 * 1024) {
			setAvatarNotice("图片请控制在 1.5MB 内，避免本地缓存过大");
			return;
		}
		const reader = new FileReader();
		reader.onload = () => {
			if (typeof reader.result !== "string") return;
			setAvatar({
				mode: "upload",
				src: reader.result,
				updatedAt: Date.now(),
			});
			setAvatarNotice("");
			setAvatarOpen(false);
		};
		reader.readAsDataURL(file);
	};

	const saveQqAvatar = () => {
		const qq = qqInput.trim();
		if (!/^\d{5,12}$/.test(qq)) {
			setAvatarNotice("请输入 5-12 位 QQ 号");
			return;
		}
		setAvatar({
			mode: "qq",
			qq,
			src: getQqAvatarUrl(qq),
			updatedAt: Date.now(),
		});
		setAvatarNotice("");
		setAvatarOpen(false);
	};

	useEffect(() => {
		setQqInput(avatar.qq || "");
	}, [avatar.qq]);

	useEffect(() => {
		if (!avatarOpen) return;
		const onPointerDown = (event: PointerEvent) => {
			const target = event.target;
			if (
				target instanceof Node &&
				avatarWrapRef.current &&
				!avatarWrapRef.current.contains(target)
			) {
				setAvatarOpen(false);
			}
		};
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") setAvatarOpen(false);
		};
		document.addEventListener("pointerdown", onPointerDown);
		document.addEventListener("keydown", onKeyDown);
		return () => {
			document.removeEventListener("pointerdown", onPointerDown);
			document.removeEventListener("keydown", onKeyDown);
		};
	}, [avatarOpen]);

	useEffect(() => {
		if (!menuOpen) return;
		const onPointerDown = (event: PointerEvent) => {
			const target = event.target;
			if (
				target instanceof Node &&
				menuWrapRef.current &&
				!menuWrapRef.current.contains(target)
			) {
				setMenuOpen(false);
			}
		};
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") setMenuOpen(false);
		};
		document.addEventListener("pointerdown", onPointerDown);
		document.addEventListener("keydown", onKeyDown);
		return () => {
			document.removeEventListener("pointerdown", onPointerDown);
			document.removeEventListener("keydown", onKeyDown);
		};
	}, [menuOpen]);

	return (
		<header className="topbar">
			<button
				className="brand"
				onClick={() => setActivePage("home")}
				aria-label="60s 信息聚合首页"
			>
				<img src="/favicon.png" alt="60s logo" width={24} height={24} />
				<span className="brand-copy">
					<strong>60s</strong>
					<small>信息聚合</small>
				</span>
			</button>
			<nav>
				{mainNav.map((item) => (
					<button
						key={item.id}
						className={activePage === item.id ? "active" : ""}
						onClick={() => navigateTo(item.id)}
					>
						<span className="nav-label">{item.label}</span>
					</button>
				))}
			</nav>
			<div className="header-actions">
				<div className="mobile-menu-wrap" ref={menuWrapRef}>
					<button
						className="mobile-menu-toggle"
						type="button"
						aria-label="打开导航"
						aria-expanded={menuOpen}
						onClick={() => setMenuOpen((open) => !open)}
					>
						<Menu size={18} />
					</button>
					{menuOpen && (
						<div className="mobile-menu-popover" role="menu">
							{mobileMenuNav.map((item) => {
								const active = activePage === item.id;
								return (
									<button
										key={item.id}
										type="button"
										role="menuitem"
										className={active ? "active" : ""}
										aria-current={active ? "page" : undefined}
										onClick={() => navigateTo(item.id)}
									>
										{item.label}
									</button>
								);
							})}
						</div>
					)}
				</div>
				<button
					className={`settings-shortcut ${
						activePage === "settings" ? "active" : ""
					}`}
					type="button"
					aria-label="打开设置"
					onClick={() => navigateTo("settings")}
				>
					<Settings size={18} />
				</button>
				<div className="avatar-wrap" ref={avatarWrapRef}>
					<button
						className="avatar"
						type="button"
						aria-label="自定义头像"
						onClick={() => {
							setAvatarNotice("");
							setAvatarOpen((open) => !open);
						}}
					>
						<img src={avatarSrc} alt="" />
					</button>
					{avatarOpen && (
						<div className="avatar-popover">
							<div className="avatar-popover-head">
								<span>
									<UserRound size={18} /> 个人
								</span>
								<button
									type="button"
									aria-label="关闭头像设置"
									onClick={() => setAvatarOpen(false)}
								>
									<X size={16} />
								</button>
							</div>
							<div className="avatar-menu-actions">
								<button type="button" onClick={() => navigateTo("settings")}>
									<Settings size={15} /> 设置
								</button>
								<button
									type="button"
									onClick={() => fileInputRef.current?.click()}
								>
									<Upload size={15} /> 上传
								</button>
								<button
									type="button"
									onClick={() => {
										setAvatar({ mode: "default" });
										setAvatarNotice("");
										setAvatarOpen(false);
									}}
								>
									<RotateCcw size={15} /> 默认
								</button>
							</div>
							<div className="avatar-theme-picker" aria-label="明暗主题">
								{themeChoices.map((theme) => {
									const Icon = theme.icon;
									const active = colorTheme === theme.id;
									return (
										<button
											key={theme.id}
											type="button"
											className={active ? "active" : ""}
											aria-pressed={active}
											title={
												theme.id === "system"
													? `跟随系统：当前${resolvedColorTheme === "dark" ? "暗色" : "浅色"}`
													: theme.label
											}
											onClick={() => setColorTheme(theme.id)}
										>
											<Icon size={14} />
											{theme.label}
										</button>
									);
								})}
							</div>
							<input
								ref={fileInputRef}
								type="file"
								accept="image/*"
								hidden
								onChange={(event) => handleAvatarFile(event.target.files?.[0])}
							/>
							<label className="qq-avatar-field">
								<span>QQ 头像</span>
								<div>
									<input
										value={qqInput}
										onChange={(event) => setQqInput(event.target.value)}
										placeholder="输入 QQ 号"
										inputMode="numeric"
									/>
									<button type="button" onClick={saveQqAvatar}>
										<Save size={15} /> 保存
									</button>
								</div>
							</label>
							{avatarNotice && (
								<p className="avatar-notice" role="status">
									{avatarNotice}
								</p>
							)}
					</div>
				)}
				</div>
			</div>
		</header>
	);
}
