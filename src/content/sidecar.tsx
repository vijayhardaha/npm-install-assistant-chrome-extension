import { createRoot, type Root } from 'react-dom/client';

import { SidebarApp } from './SidebarApp';
import { getPackageNameFromPath } from './utils';

let reactRoot: Root | null = null;
let rootContainer: HTMLElement | null = null;
let currentPackageName: string | null = null;

/**
 * Simple debounce utility.
 */
function debounce<Args extends unknown[]>(fn: (...args: Args) => void, delay: number): (...args: Args) => void {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return (...args: Args) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Mounts the sidebar React app when on a valid package page.
 */
export function mountSidebarApp(): void {
  const packageName = getPackageNameFromPath(window.location.pathname);
  if (!packageName) return;

  const aside = document.querySelector<HTMLElement>('aside[aria-label="Package sidebar"]');
  if (!aside) return;

  if (reactRoot && rootContainer && rootContainer.isConnected && currentPackageName === packageName) {
    return;
  }

  if (reactRoot && rootContainer) {
    reactRoot.unmount();
    rootContainer.remove();
  }

  const container = document.createElement('div');
  container.id = 'npm-install-assistant-root';
  container.dataset.packageName = packageName;

  const lhCopy = aside.querySelector<HTMLElement>('div.lh-copy');
  if (lhCopy && lhCopy.parentElement) {
    lhCopy.insertAdjacentElement('afterend', container);
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
 */
export function setupObservers(): void {
  mountSidebarApp();

  const debouncedMount = debounce(mountSidebarApp, 100);

  const observer = new MutationObserver(() => {
    debouncedMount();
  });
  observer.observe(document.body, { childList: true, subtree: true });

  const handleHistoryChange = () => {
    mountSidebarApp();
  };

  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;

  try {
    history.pushState = function (...args: Parameters<typeof originalPushState>) {
      originalPushState.apply(history, args);
      handleHistoryChange();
    } as typeof history.pushState;

    history.replaceState = function (...args: Parameters<typeof originalReplaceState>) {
      originalReplaceState.apply(history, args);
      handleHistoryChange();
    } as typeof history.replaceState;
  } catch {
    // ignore
  }

  window.addEventListener('popstate', handleHistoryChange);
}
