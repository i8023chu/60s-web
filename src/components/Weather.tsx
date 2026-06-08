import {
	CalendarClock,
	CloudRain,
	CloudSun,
	Droplets,
	Gauge,
	MapPin,
	Wind,
} from "lucide-react";
import type { WeatherForecast, WeatherRealtime } from "../api";
import type { ApiState } from "../types";
import {
	formatHourlyTime,
	getUpcomingForecastDays,
	shortDate,
} from "../utils";
import { CardTitle, Metric, WeatherIcon } from "./ui";

export function WeatherPage({
	city,
	setCity,
	realtime,
	forecast,
}: {
	city: string;
	setCity: (city: string) => void;
	realtime: ApiState<WeatherRealtime> & { reload: () => void };
	forecast: ApiState<WeatherForecast> & { reload: () => void };
}) {
	const hourly = forecast.data?.hourly_forecast?.slice(0, 12) ?? [];
	const current = realtime.data?.weather;
	const air = realtime.data?.air_quality;
	return (
		<section className="page-stack">
			<div className="page-title">
				<span>
					<CloudSun size={24} /> 天气中心
				</span>
				<label className="city-select page-city">
					<MapPin size={17} />
					<input
						value={city}
						onChange={(event) => setCity(event.target.value)}
					/>
				</label>
			</div>
			<WeatherCard
				city={city}
				setCity={setCity}
				realtime={realtime}
				forecast={forecast}
			/>
			<div className="weather-detail-grid">
				<Metric
					icon={<Droplets size={26} />}
					label="湿度"
					value={`${current?.humidity ?? "--"}%`}
					sub="实时观测"
				/>
				<Metric
					icon={<Wind size={26} />}
					label="风力"
					value={current?.wind_power || "--"}
					sub={current?.wind_direction || "风向"}
				/>
				<Metric
					icon={<Gauge size={26} />}
					label="AQI"
					value={air?.aqi ?? "--"}
					sub={air?.quality || "空气质量"}
					tone="green"
				/>
				<Metric
					icon={<CloudRain size={26} />}
					label="PM2.5"
					value={air?.pm25 ?? "--"}
					sub="细颗粒物"
				/>
			</div>
			<article className="card hourly-card">
				<CardTitle icon={<CalendarClock size={20} />} title="逐小时预报" />
				<div className="hourly-row">
					{hourly.map((item, index) => (
						<div
							key={`${item.update_time || item.datetime}-${index}`}
							className="hourly-item"
						>
							<span>
								{formatHourlyTime(item.update_time || item.datetime) ||
									`${index + 1}h`}
							</span>
							<WeatherIcon condition={item.weather || item.condition} small />
							<b>{item.degree ?? item.temperature}°</b>
							<small>{item.weather || item.condition}</small>
						</div>
					))}
				</div>
			</article>
		</section>
	);
}

export function WeatherCard({
	city,
	setCity,
	realtime,
	forecast,
	compact = false,
}: {
	city: string;
	setCity: (city: string) => void;
	realtime: ApiState<WeatherRealtime> & { reload: () => void };
	forecast: ApiState<WeatherForecast> & { reload: () => void };
	compact?: boolean;
}) {
	const current = realtime.data?.weather;
	const air = realtime.data?.air_quality;
	const days = getUpcomingForecastDays(forecast.data?.daily_forecast);
	const isIdle =
		!realtime.loading &&
		!realtime.error &&
		realtime.data === undefined &&
		!realtime.updatedAt;

	return (
		<article className={`card weather-card ${compact ? "home-weather" : ""}`}>
			<CardTitle
				icon={<CloudSun size={22} />}
				title="城市天气"
				right={
					<div className="weather-actions">
						<label className="mini-input">
							<input
								value={city}
								onChange={(event) => setCity(event.target.value)}
							/>
						</label>
						<span className="status weather-status">
							{current?.updated
								? `更新 ${current.updated.slice(11, 16)}`
								: "未来 7 天"}
						</span>
					</div>
				}
			/>
			<div className="weather-body">
				<div className="weather-main">
					<WeatherIcon condition={current?.condition} />
					<div className="temperature">
						<strong>{current?.temperature ?? "--"}</strong>
						<span>°C</span>
					</div>
					<div className="weather-summary">
						<b>{current?.condition || (isIdle ? "未配置 API" : "读取中")}</b>
						<small>
							{realtime.data?.location?.city ||
								realtime.data?.location?.name ||
								city}
							{" · "}
							{current?.wind_direction || "风向"} {current?.wind_power || "--"}
						</small>
					</div>
				</div>
				<div className="weather-metrics">
					<Metric
						label="AQI"
						value={air?.aqi ?? "--"}
						sub={air?.quality || "空气"}
						tone="green"
					/>
					<Metric
						icon={<Droplets size={22} />}
						label="湿度"
						value={`${current?.humidity ?? "--"}%`}
						sub="相对湿度"
					/>
					<Metric
						icon={<Wind size={22} />}
						label="风速"
						value={current?.wind_power || "--"}
						sub={current?.wind_direction || "风向"}
					/>
				</div>
				<div
					className="forecast-row"
					style={{
						gridTemplateColumns: `repeat(${Math.max(days.length, 1)}, minmax(0, 1fr))`,
					}}
				>
					{days.map((day) => (
						<div key={`${day.date}-${day.label}`} className="forecast-day">
							<b>{day.label}</b>
							<span>{shortDate(day.date)}</span>
							<WeatherIcon condition={day.condition} small />
							<b>{day.max}°</b>
							<small>{day.min}°</small>
						</div>
					))}
				</div>
			</div>
		</article>
	);
}
