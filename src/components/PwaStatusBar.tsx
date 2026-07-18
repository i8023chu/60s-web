import {
	RefreshCw,
	WifiOff,
} from "lucide-react";

export function PwaStatusBar({
	isOffline,
	updateReady,
	onApplyUpdate,
}: {
	isOffline: boolean;
	updateReady: boolean;
	onApplyUpdate: () => void;
}) {
	if (!isOffline && !updateReady) return null;

	return (
		<div className="pwa-status-stack" aria-live="polite">
			{updateReady && (
				<div className="pwa-status-strip update" role="status">
					<span>
						<RefreshCw size={17} />
						<b>新版本可用</b>
					</span>
					<button
						type="button"
						className="icon-only"
						aria-label="刷新使用最新内容"
						title="刷新"
						onClick={onApplyUpdate}
					>
						<RefreshCw size={15} />
					</button>
				</div>
			)}
			{isOffline && (
				<div className="pwa-status-strip offline" role="status">
					<span>
						<WifiOff size={17} />
						<b>离线模式</b>
						<small>页面壳可继续打开，实时数据会在联网后恢复</small>
					</span>
				</div>
			)}
		</div>
	);
}
