import {
	AlertCircle,
	CheckCircle2,
	CircleDashed,
	Github,
	Loader2,
	Sparkles,
} from "lucide-react";
import type { ReactNode } from "react";
import packageInfo from "../../package.json";
import { WEB_REPO_URL } from "../config";
import type { ApiState } from "../types";
import { weatherIconType } from "../utils";

export function CardTitle({
	icon,
	title,
	right,
}: {
	icon: ReactNode;
	title: string;
	right?: ReactNode;
}) {
	return (
		<div className="card-title">
			<span>
				{icon}
				<b>{title}</b>
			</span>
			{right}
		</div>
	);
}

export function EmptyState(_props: { title: string; desc: string }) {
	return (
		<div className="empty-state" aria-hidden="true">
			<Sparkles size={20} />
		</div>
	);
}

export function Status({ state }: { state: ApiState<unknown> }) {
	if (state.loading)
		return (
			<span className="status icon-status loading" aria-label="同步中" title="同步中">
				<Loader2 className="spin" size={15} />
			</span>
		);
	if (state.error)
		return (
			<span className="status icon-status error" aria-label="同步失败" title="同步失败">
				<AlertCircle size={15} />
			</span>
		);
	if (state.data === undefined && !state.updatedAt) {
		return (
			<span className="status icon-status idle" aria-label="未同步" title="未同步">
				<CircleDashed size={15} />
			</span>
		);
	}
	return (
		<span className="status icon-status" aria-label="已同步" title="已同步">
			<CheckCircle2 size={15} />
		</span>
	);
}

export function Metric({
	icon,
	label,
	value,
	sub,
	tone,
}: {
	icon?: ReactNode;
	label: string;
	value: string | number;
	sub?: string;
	tone?: "green" | "gold" | "red";
}) {
	return (
		<div className={`metric ${tone || ""}`}>
			{icon && <span className="metric-icon">{icon}</span>}
			<small>{label}</small>
			<b>{value}</b>
			{sub && <em>{sub}</em>}
		</div>
	);
}

export function WeatherIcon({
	condition,
	small = false,
}: {
	condition?: string;
	small?: boolean;
}) {
	const type = weatherIconType(condition);
	return (
		<span
			className={`weather-art ${small ? "small" : ""} ${type}`}
			aria-hidden="true"
		>
			<i className="sun-dot" />
			<i className="cloud-a" />
			<i className="cloud-b" />
			<i className="rain-a" />
			<i className="rain-b" />
		</span>
	);
}

export function Footer({
	apiBase,
	updatedAt,
	isOffline = false,
}: {
	apiBase: string;
	updatedAt?: Date;
	isOffline?: boolean;
}) {
	return (
		<footer>
			<div className="footer-inner">
				<div className="footer-left">
					<a
						className="footer-text-link brand-link"
						href={WEB_REPO_URL}
						target="_blank"
						rel="noreferrer"
					>
						<Github size={14} />
						60s-web
					</a>
					{apiBase && (
						<>
							<span className="footer-separator" />
							<span className="footer-meta api-link">
								{apiBase.replace(/^https?:\/\//, "")}
							</span>
						</>
					)}
				</div>
				<div className="footer-right">
					<span className="footer-meta version">
						v{packageInfo.version}
					</span>
					<span className="footer-dot" />
					<span className="footer-meta">
						{updatedAt
							? updatedAt.toLocaleTimeString("zh-CN", {
									hour: "2-digit",
									minute: "2-digit",
								})
							: "--:--"}
					</span>
					{isOffline && <span className="footer-meta error">离线</span>}
				</div>
			</div>
		</footer>
	);
}
