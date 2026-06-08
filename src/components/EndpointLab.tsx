import {
	Code2,
	Copy,
	ExternalLink,
	Loader2,
	Star,
	StarOff,
	TerminalSquare,
} from "lucide-react";
import { type FormEvent, useMemo, useState } from "react";
import {
	type EndpointDefinition,
	endpoints,
	fetchApi,
	tryBuildUrl,
} from "../api";
import { categoryIcons, categoryLabels } from "../config";
import type { ApiState, EndpointFavoriteId } from "../types";
import { defaults } from "../utils";

export function EndpointLab({
	apiBase,
	query,
	favorites,
	setFavorites,
}: {
	apiBase: string;
	query: string;
	favorites: EndpointFavoriteId[];
	setFavorites: (favorites: EndpointFavoriteId[]) => void;
}) {
	const [category, setCategory] = useState<
		EndpointDefinition["category"] | "all"
	>("all");
	const [active, setActive] = useState(endpoints[0]);
	const [params, setParams] = useState<Record<string, string>>(
		defaults(endpoints[0]),
	);
	const [result, setResult] = useState<ApiState<unknown>>({ loading: false });
	const activeUrl = useMemo(
		() => tryBuildUrl(apiBase, active.path, params),
		[active.path, apiBase, params],
	);
	const hasApiBase = Boolean(apiBase.trim());
	const favoriteSet = useMemo(() => new Set(favorites), [favorites]);
	const favoriteEndpoints = useMemo(
		() =>
			favorites
				.map((id) => endpoints.find((endpoint) => endpoint.id === id))
				.filter((endpoint): endpoint is EndpointDefinition => Boolean(endpoint)),
		[favorites],
	);

	const visible = useMemo(() => {
		const keyword = query.trim().toLowerCase();
		return endpoints.filter((endpoint) => {
			const categoryMatch =
				category === "all" || endpoint.category === category;
			const queryMatch =
				!keyword ||
				[
					endpoint.name,
					endpoint.path,
					endpoint.description,
					categoryLabels[endpoint.category],
				]
					.join(" ")
					.toLowerCase()
					.includes(keyword);
			return categoryMatch && queryMatch;
		});
	}, [category, query]);

	const choose = (endpoint: EndpointDefinition) => {
		setActive(endpoint);
		setParams(defaults(endpoint));
		setResult({ loading: false });
	};

	const toggleFavorite = (endpoint: EndpointDefinition) => {
		if (favoriteSet.has(endpoint.id)) {
			setFavorites(favorites.filter((id) => id !== endpoint.id));
			return;
		}
		setFavorites([...favorites, endpoint.id]);
	};

	const run = async (event?: FormEvent) => {
		event?.preventDefault();
		setResult({ loading: true });
		try {
			const payload = await fetchApi(apiBase, active.path, params);
			setResult({ data: payload, loading: false, updatedAt: new Date() });
		} catch (error) {
			setResult({
				loading: false,
				error: error instanceof Error ? error.message : "请求失败",
			});
		}
	};

	return (
		<>
			<section className="endpoint-favorites card">
				<div className="card-title">
					<span>
						<Star size={20} />
						<b>常用接口</b>
					</span>
					<small>{favoriteEndpoints.length} 个收藏</small>
				</div>
				{favoriteEndpoints.length > 0 ? (
					<div className="favorite-grid">
						{favoriteEndpoints.map((endpoint) => {
							const Icon = categoryIcons[endpoint.category];
							const href = tryBuildUrl(apiBase, endpoint.path, defaults(endpoint));
							return (
								<article className="favorite-card" key={endpoint.id}>
									<button type="button" onClick={() => choose(endpoint)}>
										<Icon size={19} />
										<span>
											<b>{endpoint.name}</b>
											<small>{endpoint.path}</small>
										</span>
									</button>
									<div className="favorite-card-actions">
										{href ? (
											<a href={href} target="_blank" rel="noreferrer">
												打开 <ExternalLink size={14} />
											</a>
										) : (
											<span>{hasApiBase ? "地址无效" : "先配置 API"}</span>
										)}
										<button
											type="button"
											aria-label={`取消收藏：${endpoint.name}`}
											onClick={() => toggleFavorite(endpoint)}
										>
											<StarOff size={15} /> 取消
										</button>
									</div>
								</article>
							);
						})}
					</div>
				) : (
					<p className="favorite-empty">
						点击接口旁的星标收藏常用 API，之后会显示在这里。
					</p>
				)}
			</section>
			<div className="endpoint-lab">
			<div className="section-title">
				<span>
					<Code2 size={24} />
					<b>接口实验室</b>
				</span>
				<small>已收录 {endpoints.length} 个上游路由</small>
			</div>
			<div className="category-tabs">
				<button
					className={category === "all" ? "active" : ""}
					onClick={() => setCategory("all")}
				>
					全部
				</button>
				{(Object.keys(categoryLabels) as EndpointDefinition["category"][]).map(
					(key) => (
						<button
							key={key}
							className={category === key ? "active" : ""}
							onClick={() => setCategory(key)}
						>
							{categoryLabels[key]}
						</button>
					),
				)}
			</div>
			<div className="lab-grid">
				<div className="endpoint-list">
					{visible.map((endpoint) => {
						const Icon = categoryIcons[endpoint.category];
						const isFavorite = favoriteSet.has(endpoint.id);
						return (
							<div
								key={endpoint.id}
								className={`endpoint-list-item ${
									active.id === endpoint.id ? "active" : ""
								}`}
							>
								<button
									type="button"
									className="endpoint-choice"
									onClick={() => choose(endpoint)}
								>
									<Icon size={18} />
									<span>
										<b>{endpoint.name}</b>
										<small>{endpoint.path}</small>
									</span>
								</button>
								<button
									type="button"
									className={`favorite-toggle ${isFavorite ? "active" : ""}`}
									aria-label={`${isFavorite ? "取消收藏" : "收藏"}：${endpoint.name}`}
									onClick={() => toggleFavorite(endpoint)}
								>
									<Star size={16} />
								</button>
							</div>
						);
					})}
				</div>
				<div className="endpoint-runner">
					<div className="runner-head">
						<div>
							<b>{active.name}</b>
							<small>{active.description}</small>
						</div>
						<div className="runner-head-actions">
							<button
								type="button"
								className={`favorite-toggle ${
									favoriteSet.has(active.id) ? "active" : ""
								}`}
								aria-label={`${
									favoriteSet.has(active.id) ? "取消收藏" : "收藏"
								}：${active.name}`}
								onClick={() => toggleFavorite(active)}
							>
								<Star size={16} />
								{favoriteSet.has(active.id) ? "已收藏" : "收藏"}
							</button>
							{activeUrl ? (
								<a href={activeUrl} target="_blank" rel="noreferrer">
									打开 <ExternalLink size={15} />
								</a>
							) : (
								<span className="disabled-link">
									{hasApiBase ? "地址无效" : "先配置 API"}
								</span>
							)}
						</div>
					</div>
					<form onSubmit={run} className="param-form">
						{(active.params?.length
							? active.params
							: [{ name: "_empty", label: "无需参数", defaultValue: "" }]
						).map((param) => (
							<label
								key={param.name}
								className={param.name === "_empty" ? "disabled" : ""}
							>
								<span>
									{param.label}
									{param.required ? " *" : ""}
								</span>
								<input
									disabled={param.name === "_empty"}
									value={
										param.name === "_empty" ? "" : params[param.name] || ""
									}
									onChange={(event) =>
										setParams({ ...params, [param.name]: event.target.value })
									}
									placeholder={param.placeholder}
								/>
							</label>
						))}
						<div className="runner-actions">
							<button
								type="submit"
								className="primary-subtle"
								disabled={!hasApiBase}
							>
								{result.loading ? (
									<Loader2 className="spin" size={17} />
								) : (
									<TerminalSquare size={17} />
								)}
								调用接口
							</button>
							<button
								type="button"
								className="outline-button"
								disabled={!activeUrl}
								onClick={() => {
									if (activeUrl) navigator.clipboard?.writeText(activeUrl);
								}}
							>
								<Copy size={16} /> 复制 URL
							</button>
						</div>
					</form>
					<pre className="response-panel">
						{result.loading
							? "Loading..."
							: result.error
								? result.error
								: result.data
									? JSON.stringify(result.data, null, 2)
									: "选择接口后点击调用，响应会显示在这里。"}
					</pre>
				</div>
			</div>
			</div>
		</>
	);
}
