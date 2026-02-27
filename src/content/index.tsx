import React from "react";
import { createRoot, Root } from "react-dom/client";
import { SidebarApp } from "./SidebarApp";

let reactRoot: Root | null = null;
let rootContainer: HTMLElement | null = null;
let currentPackageName: string | null = null;

/**
 * Extracts the npm package name from a pathname.
 *
 * @param {string} pathname - The current location pathname.
 * @returns The package name or null when not on a package page.
 */
function getPackageNameFromPath(pathname: string): string | null {
	const parts = pathname.split("/").filter(Boolean);

	if (parts[0] !== "package") {
		return null;
	}

	if (!parts[1]) {
		return null;
	}

	// Scoped packages: /package/@scope/name[/...]
	if (parts[1].startsWith("@")) {
		const scope = parts[1];
		const name = parts[2];
		if (!name) {
			return null;
		}
		return `${scope}/${name}`;
	}

	// Unscoped packages: /package/name[/...]
	return parts[1];
}

/**
 * Mounts the sidebar React app when on a valid package page.
 *
 * @returns void
 */
function mountSidebarApp(): void {
	const packageName = getPackageNameFromPath(window.location.pathname);
	if (!packageName) {
		return;
	}

	const aside = document.querySelector<HTMLElement>('aside[aria-label="Package sidebar"]');
	if (!aside) {
		return;
	}

	// If we already have a root for this package and it's still attached, do nothing.
	if (
		reactRoot
		&& rootContainer
		&& rootContainer.isConnected
		&& currentPackageName === packageName
	) {
		return;
	}

	// If we have a root from a previous package, clean it up.
	if (reactRoot && rootContainer) {
		reactRoot.unmount();
		rootContainer.remove();
	}

	const container = document.createElement("div");
	container.id = "npm-install-assistant-root";
	container.dataset.packageName = packageName;

	const lhCopy = aside.querySelector<HTMLElement>("div.lh-copy");
	if (lhCopy && lhCopy.parentElement) {
		lhCopy.insertAdjacentElement("afterend", container);
	} else {
		aside.appendChild(container);
	}

	reactRoot = createRoot(container);
	reactRoot.render(<SidebarApp packageName={packageName} />);
	rootContainer = container;
	currentPackageName = packageName;
}

/**
 * Sets up observers to remount the sidebar on SPA navigation.
 *
 * @returns void
 */
function setupObservers(): void {
	mountSidebarApp();

	const observer = new MutationObserver(() => {
		mountSidebarApp();
	});

	observer.observe(document.body, { childList: true, subtree: true });

	const handleHistoryChange = () => {
		mountSidebarApp();
	};

	const originalPushState = history.pushState;
	const originalReplaceState = history.replaceState;

	try {
		// Patch pushState/replaceState to detect SPA navigations.
		history.pushState = function (...args: Parameters<typeof originalPushState>) {
			originalPushState.apply(history, args);
			handleHistoryChange();
		} as typeof history.pushState;

		history.replaceState = function (...args: Parameters<typeof originalReplaceState>) {
			originalReplaceState.apply(history, args);
			handleHistoryChange();
		} as typeof history.replaceState;
	} catch {
		// If anything goes wrong patching history, just rely on MutationObserver.
	}

	window.addEventListener("popstate", handleHistoryChange);
}

if (document.readyState === "loading") {
	window.addEventListener("DOMContentLoaded", setupObservers);
} else {
	setupObservers();
}
