import { setupObservers } from './sidecar';

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', setupObservers);
} else {
  setupObservers();
}
