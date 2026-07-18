type ServiceWorkerUpdateHandler = (
	registration: ServiceWorkerRegistration,
) => void;

let reloadingForUpdate = false;

function hasActiveController() {
	return Boolean(navigator.serviceWorker.controller);
}

export function registerServiceWorker(onUpdate: ServiceWorkerUpdateHandler) {
	if (!import.meta.env.PROD || !("serviceWorker" in navigator)) return () => {};

	const handleControllerChange = () => {
		if (reloadingForUpdate) return;
		reloadingForUpdate = true;
		window.location.reload();
	};

	const notifyIfWaiting = (registration: ServiceWorkerRegistration) => {
		if (registration.waiting && hasActiveController()) {
			onUpdate(registration);
		}
	};

	const register = () => {
		navigator.serviceWorker
			.register("/sw.js")
			.then((registration) => {
				notifyIfWaiting(registration);
				registration.addEventListener("updatefound", () => {
					const installing = registration.installing;
					if (!installing) return;
					installing.addEventListener("statechange", () => {
						if (installing.state === "installed") {
							notifyIfWaiting(registration);
						}
					});
				});
			})
			.catch(() => {
				// PWA enhancement only; the app should keep working if registration fails.
			});
	};

	let listensForLoad = false;
	if (document.readyState === "complete") {
		register();
	} else {
		listensForLoad = true;
		window.addEventListener("load", register);
	}
	navigator.serviceWorker.addEventListener(
		"controllerchange",
		handleControllerChange,
	);

	return () => {
		if (listensForLoad) window.removeEventListener("load", register);
		navigator.serviceWorker.removeEventListener(
			"controllerchange",
			handleControllerChange,
		);
	};
}

export function applyServiceWorkerUpdate(
	registration: ServiceWorkerRegistration | null,
) {
	registration?.waiting?.postMessage({ type: "SKIP_WAITING" });
}
