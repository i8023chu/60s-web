import { Flame } from "lucide-react";
import { formatHotValue, type HotItem, toItems } from "../api";
import { hotBoards, hotTabs } from "../config";
import { useApi } from "../hooks/useApi";
import type { ApiState, HotBoardId } from "../types";
import { skeletonItems } from "../utils";
import { CardTitle, EmptyState, Status } from "./ui";

function getHotTitle(item: HotItem, fallback: string) {
	return item.title || item.name || item.movie_name || fallback;
}

function getHotMetric(item: HotItem) {
	return formatHotValue(item.hot_value ?? item.hot ?? item.heat ?? item.score);
}

export function HotPage({
	apiBase,
	visibleHotBoardIds,
}: {
	apiBase: string;
	visibleHotBoardIds: HotBoardId[];
}) {
	const apiReady = Boolean(apiBase.trim());
	const visibleBoardSet = new Set(visibleHotBoardIds);
	const displayBoards = hotBoards.filter((board) =>
		visibleBoardSet.has(board.id),
	);

	return (
		<section className="page-stack">
			<div className="multi-board-grid">
				{displayBoards.map((board) => (
					<HotMiniBoard
						key={board.id}
						apiBase={apiBase}
						title={board.title}
						path={board.path}
						params={board.params}
						enabled={apiReady}
					/>
				))}
			</div>
		</section>
	);
}

function HotMiniBoard({
	apiBase,
	title,
	path,
	params,
	enabled,
}: {
	apiBase: string;
	title: string;
	path: string;
	params?: Record<string, string>;
	enabled: boolean;
}) {
	const state = useApi<unknown>(apiBase, path, params || {}, enabled);
	const items = toItems(state.data).slice(0, 8);
	const displayItems = state.loading ? skeletonItems(8) : items;
	const isIdle =
		!state.loading &&
		!state.error &&
		state.data === undefined &&
		!state.updatedAt;
	const isEmpty = !state.loading && !state.error && items.length === 0;
	return (
		<article className="card mini-hot-card">
			<CardTitle
				icon={<Flame size={19} />}
				title={title}
				right={<Status state={state} />}
			/>
			{isEmpty ? (
				<EmptyState
					title={isIdle ? "暂无内容" : "暂无热榜数据"}
					desc={isIdle ? "" : "暂无热榜数据"}
				/>
			) : (
				<ol className="rank-list compact-rank">
					{displayItems.map((item, index) => {
						const titleText = getHotTitle(item, "正在读取...");
						const hotMetric = getHotMetric(item);
						return (
							<li
								key={`${titleText}-${index}`}
								className={hotMetric ? undefined : "no-hot-value"}
								data-rank-title={titleText}
							>
								<b>{index + 1}</b>
								<a
									href={item.link || item.url || "#"}
									target="_blank"
									rel="noreferrer"
									title={titleText}
								>
									{titleText}
								</a>
								{hotMetric && <span>{hotMetric}</span>}
							</li>
						);
					})}
				</ol>
			)}
		</article>
	);
}

export function HotBoard({
	tabs,
	active,
	setActive,
	state,
	items,
	wide = false,
}: {
	tabs: Array<(typeof hotTabs)[number]>;
	active: string;
	setActive: (tab: (typeof hotTabs)[number]) => void;
	state: ApiState<unknown> & { reload: () => void };
	items: HotItem[];
	wide?: boolean;
}) {
	const displayItems = state.loading ? skeletonItems(10) : items;
	const isIdle =
		!state.loading &&
		!state.error &&
		state.data === undefined &&
		!state.updatedAt;
	const isEmpty = !state.loading && !state.error && items.length === 0;

	return (
		<article className={`card hot-board ${wide ? "wide" : ""}`}>
			<CardTitle
				icon={<Flame size={22} />}
				title="全网热榜"
				right={<Status state={state} />}
			/>
			<div className="tabs">
				{tabs.map((tab) => (
					<button
						key={tab.id}
						className={active === tab.id ? "active" : ""}
						onClick={() => setActive(tab)}
					>
						{tab.label}
					</button>
				))}
			</div>
			{isEmpty ? (
				<EmptyState
					title={isIdle ? "暂无内容" : "暂无热榜数据"}
					desc={isIdle ? "" : "暂无热榜数据"}
				/>
			) : (
				<ol className="rank-list">
					{displayItems.map((item, index) => {
						const titleText = getHotTitle(item, "正在读取热榜...");
						const hotMetric = getHotMetric(item);
						return (
							<li
								key={`${titleText}-${index}`}
								className={hotMetric ? undefined : "no-hot-value"}
								data-rank-title={titleText}
							>
								<b>{index + 1}</b>
								<a
									href={item.link || item.url || "#"}
									target="_blank"
									rel="noreferrer"
									title={titleText}
								>
									{titleText}
								</a>
								{hotMetric && <span>{hotMetric}</span>}
							</li>
						);
					})}
				</ol>
			)}
		</article>
	);
}
