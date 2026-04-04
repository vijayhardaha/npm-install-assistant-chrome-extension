import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';

type PkgManager = 'npm' | 'yarn' | 'pnpm' | 'bun';
type DependencyType = 'prod' | 'dev';

/**
 * Props for `SidebarApp`.
 *
 * @property packageName - Package name from the current npm URL.
 */
interface SidebarAppProps {
  packageName: string;
}

/**
 * Error Boundary for the Sidebar App.
 * Catches rendering errors and displays a safe fallback UI.
 */
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error?: Error }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): { hasError: boolean; error?: Error } {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('SidebarApp error:', error, errorInfo);
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <section className="nia-card" aria-label="Install helper">
          <div className="nia-error">Something went wrong. Please reload the page.</div>
        </section>
      );
    }
    return this.props.children;
  }
}

/**
 * Minimal registry response shape used by the sidebar.
 *
 * @property dist-tags - Dist tags including `latest`.
 * @property versions - Map of published versions.
 */
interface RegistryResponse {
  'dist-tags'?: { latest?: string; [key: string]: string | undefined };
  versions?: Record<string, unknown>;
}

/**
 * Supported package managers.
 */
const PKG_MANAGERS: PkgManager[] = ['npm', 'yarn', 'pnpm', 'bun'];
/**
 * Default maximum number of versions to display.
 */
const MAX_VERSIONS = 10;
/**
 * localStorage key for the selected package manager.
 */
const PKG_MANAGER_STORAGE_KEY = 'nia_package_manager';
/**
 * localStorage key for showing beta versions.
 */
const SHOW_BETA_STORAGE_KEY = 'nia_show_beta';
/**
 * localStorage key for maximum versions limit.
 */
const MAX_VERSIONS_STORAGE_KEY = 'nia_max_versions';

/**
 * Parses a semver string into its components for comparison.
 *
 * @param {string} version - The version string to parse.
 * @returns An object with numeric parts, pre-release identifier (or null), and build metadata (ignored).
 */
function parseVersion(version: string): { numeric: number[]; prerelease: string[] | null } {
  const mainParts = version.split('-')[0].split('.');
  const numeric = mainParts.map((p) => {
    const n = parseInt(p, 10);
    return Number.isNaN(n) ? 0 : n;
  });

  const prerelease: string[] | null = (() => {
    const dashIdx = version.indexOf('-');
    if (dashIdx === -1) return null;
    const afterDash = version.slice(dashIdx + 1);
    // Remove any +build metadata if present
    const plusIdx = afterDash.indexOf('+');
    const prereleasePart = plusIdx === -1 ? afterDash : afterDash.slice(0, plusIdx);
    return prereleasePart.split('.').filter(Boolean);
  })();

  return { numeric, prerelease };
}

/**
 * Sorts semver-like strings in descending order (newest first).
 * Pre-release versions are sorted lower than release versions when numeric parts are equal.
 *
 * @param {string} a - The first version string.
 * @param {string} b - The second version string.
 * @returns A negative number if a > b, positive if a < b, 0 if equal.
 */
function compareVersionsDesc(a: string, b: string): number {
  const { numeric: na, prerelease: pa } = parseVersion(a);
  const { numeric: nb, prerelease: pb } = parseVersion(b);
  const maxLen = Math.max(na.length, nb.length);

  for (let i = 0; i < maxLen; i += 1) {
    const av = na[i] ?? 0;
    const bv = nb[i] ?? 0;
    if (av !== bv) return bv - av; // descending numeric
  }

  // Numeric parts equal; check pre-release precedence.
  // Release (no prerelease) has higher precedence than any prerelease.
  const aHasPre = pa !== null && pa.length > 0;
  const bHasPre = pb !== null && pb.length > 0;

  if (!aHasPre && bHasPre) return -1; // a is release, b is prerelease -> a wins
  if (aHasPre && !bHasPre) return 1; // a is prerelease, b is release -> b wins
  if (!aHasPre && !bHasPre) return 0; // both release -> equal

  // Both have prerelease identifiers; compare lexically (dot separated).
  const maxPreLen = Math.max(pa!.length, pb!.length);
  for (let i = 0; i < maxPreLen; i += 1) {
    const as = pa![i] ?? '';
    const bs = pb![i] ?? '';

    // Try numeric comparison if both are numeric
    const an = parseInt(as, 10);
    const bn = parseInt(bs, 10);
    const aIsNum = !Number.isNaN(an);
    const bIsNum = !Number.isNaN(bn);

    if (aIsNum && bIsNum) {
      if (an !== bn) return bn - an; // numeric descending
    } else if (aIsNum) {
      return -1; // Numeric identifiers have higher precedence than non-numeric
    } else if (bIsNum) {
      return 1;
    } else {
      // Both alphabetic, compare lexically descending (Z-a)
      if (as !== bs) return bs.localeCompare(as);
    }
  }

  return 0;
}

/**
 * Builds an install command for a manager and dependency type.
 *
 * @param params - Command options.
 * @param params.pkgManager - Package manager to target.
 * @param params.dependencyType - Dependency type to install.
 * @param params.packageName - Package name to install.
 * @param params.version - Version tag or exact version string.
 * @returns A formatted install command string.
 */
function buildInstallCommand(params: {
  pkgManager: PkgManager;
  dependencyType: DependencyType;
  packageName: string;
  version: string;
}): string {
  const { pkgManager, dependencyType, packageName, version } = params;
  const versionSuffix = version && version !== 'latest' ? `@${version}` : '';
  const pkgWithVersion = `${packageName}${versionSuffix}`;

  if (pkgManager === 'bun') {
    if (dependencyType === 'dev') {
      return `bun add --dev ${pkgWithVersion}`;
    }
    return `bun add ${pkgWithVersion}`;
  }

  if (pkgManager === 'npm') {
    if (dependencyType === 'dev') {
      return `npm install --save-dev ${pkgWithVersion}`;
    }
    return `npm install ${pkgWithVersion}`;
  }

  if (pkgManager === 'yarn') {
    if (dependencyType === 'dev') {
      return `yarn add --dev ${pkgWithVersion}`;
    }
    return `yarn add ${pkgWithVersion}`;
  }

  // pnpm
  if (dependencyType === 'dev') {
    return `pnpm add --save-dev ${pkgWithVersion}`;
  }
  return `pnpm add ${pkgWithVersion}`;
}

/**
 * Sidebar UI injected into npm package pages.
 *
 * @param {SidebarAppProps} props - Component props.
 * @returns The rendered sidebar UI.
 */
const SidebarAppInner: React.FC<SidebarAppProps> = ({ packageName }: SidebarAppProps) => {
  const [versions, setVersions] = useState<string[]>([]);
  const [filteredVersions, setFilteredVersions] = useState<string[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<string>('latest');
  const [pkgManager, setPkgManager] = useState<PkgManager>('npm');
  const [dependencyType, setDependencyType] = useState<DependencyType>('prod');
  const [copied, setCopied] = useState(false);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [versionError, setVersionError] = useState<string | null>(null);
  const [showBeta, setShowBeta] = useState(false);
  const [maxVersions, setMaxVersions] = useState<number>(MAX_VERSIONS);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement | null>(null);
  const copiedTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    // Load preferred pkgManager from localStorage, and settings if present.
    try {
      const stored = window.localStorage.getItem(PKG_MANAGER_STORAGE_KEY);
      if (stored !== null && PKG_MANAGERS.includes(stored as PkgManager)) {
        setPkgManager(stored as PkgManager);
      }

      // Load persisted showBeta and maxVersions settings
      const storedShowBeta = window.localStorage.getItem(SHOW_BETA_STORAGE_KEY);
      if (storedShowBeta === 'true') {
        setShowBeta(true);
      } else if (storedShowBeta === 'false') {
        setShowBeta(false);
      }

      const storedMax = window.localStorage.getItem(MAX_VERSIONS_STORAGE_KEY);
      if (storedMax) {
        const parsed = parseInt(storedMax, 10);
        if (!Number.isNaN(parsed) && parsed > 0) {
          setMaxVersions(parsed);
        }
      }
    } catch {
      // Ignore storage errors.
    }
  }, []);

  useEffect(() => {
    // Persist pkgManager preference for future visits.
    try {
      window.localStorage.setItem(PKG_MANAGER_STORAGE_KEY, pkgManager);
    } catch {
      // Ignore storage errors.
    }
  }, [pkgManager]);

  useEffect(() => {
    try {
      window.localStorage.setItem(SHOW_BETA_STORAGE_KEY, String(showBeta));
    } catch {
      // Ignore
    }
  }, [showBeta]);

  useEffect(() => {
    try {
      window.localStorage.setItem(MAX_VERSIONS_STORAGE_KEY, String(maxVersions));
    } catch {
      // Ignore
    }
  }, [maxVersions]);

  // Close settings dropdown when clicking outside.
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!settingsRef.current) return;
      if (settingsRef.current.contains(e.target as Node)) return;
      setSettingsOpen(false);
    };

    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadVersions = async () => {
      setLoadingVersions(true);
      setVersionError(null);

      try {
        const response = await fetch(`https://registry.npmjs.org/${encodeURIComponent(packageName)}`);

        // Fail fast on registry errors.
        if (!response.ok) {
          throw new Error(`Registry responded with ${response.status}`);
        }

        const data = (await response.json()) as RegistryResponse;
        const allVersions = Object.keys(data.versions ?? {});
        // Handle packages with no published versions.
        if (!allVersions.length) {
          if (!cancelled) {
            setVersions([]);
            setSelectedVersion('latest');
          }
          return;
        }

        allVersions.sort(compareVersionsDesc);

        if (!cancelled) {
          setVersions(allVersions);
          setSelectedVersion('latest');
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to fetch versions from registry', error);
          setVersionError('Unable to load versions');
          setVersions([]);
          setSelectedVersion('latest');
        }
      } finally {
        if (!cancelled) {
          setLoadingVersions(false);
        }
      }
    };

    loadVersions();

    return () => {
      cancelled = true;
    };
  }, [packageName]);

  useEffect(() => {
    // Clamp the limit to a positive integer.
    const limit = Math.max(1, Math.floor(maxVersions));
    if (showBeta) {
      setFilteredVersions(versions.slice(0, limit));
    } else {
      const filtered = versions.filter((v) => !v.includes('-')).slice(0, limit);
      setFilteredVersions(filtered);
      if (selectedVersion !== 'latest' && !filtered.includes(selectedVersion)) {
        // Reset to latest when the selected version is filtered out.
        setSelectedVersion('latest');
      }
    }
  }, [showBeta, versions, selectedVersion, maxVersions]);

  const versionOptions = useMemo(() => {
    const base: string[] = ['latest'];
    for (const v of filteredVersions) {
      if (!base.includes(v)) {
        base.push(v);
      }
    }
    return base;
  }, [filteredVersions]);

  const command = useMemo(
    () => buildInstallCommand({ pkgManager, dependencyType, packageName, version: selectedVersion }),
    [pkgManager, dependencyType, packageName, selectedVersion]
  );

  const handleCopy = useCallback(async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(command);
      } else {
        // Fallback for older browsers without clipboard APIs.
        const textarea = document.createElement('textarea');
        textarea.value = command;
        textarea.style.position = 'fixed';
        textarea.style.left = '-1000px';
        textarea.style.top = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }

      // Clear any existing timeout to avoid multiple timers
      if (copiedTimeoutRef.current) {
        clearTimeout(copiedTimeoutRef.current);
      }

      setCopied(true);
      copiedTimeoutRef.current = window.setTimeout(() => {
        setCopied(false);
        copiedTimeoutRef.current = null;
      }, 1500);
    } catch (error) {
      console.error('Failed to copy command', error);
    }
  }, [command]);

  // Cleanup timeout on unmount to prevent setState after unmount.
  useEffect(() => {
    return () => {
      if (copiedTimeoutRef.current !== null) {
        window.clearTimeout(copiedTimeoutRef.current);
      }
    };
  }, []);

  return (
    <section className="nia-card" aria-label="Install helper">
      {settingsOpen && <div className="nia-settings-overlay" aria-hidden="true"></div>}

      <header className="nia-header">
        <div className="nia-header-content">
          <h3 className="nia-title">Install Assistant</h3>
          <div className="nia-settings-container" ref={settingsRef}>
            <button
              id="nia-settings-button"
              data-testid="settings-button"
              type="button"
              className="nia-settings-button"
              aria-haspopup="true"
              aria-expanded={settingsOpen}
              onClick={() => setSettingsOpen((s) => !s)}
              aria-label="Open install assistant settings"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="1rem"
                width="1rem"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M0 0h24v24H0V0z" fill="none" />
                <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
              </svg>
            </button>
            {settingsOpen && (
              <div className="nia-settings-dropdown" role="menu" aria-labelledby="nia-settings-button">
                <label className="nia-field" htmlFor="nia-show-beta-checkbox">
                  <span className="nia-label">Beta versions</span>
                  <span className="nia-checkbox-toggle-container">
                    <input
                      id="nia-show-beta-checkbox"
                      data-testid="show-beta-checkbox"
                      type="checkbox"
                      className="nia-checkbox nia-checkbox-toggle-input"
                      checked={showBeta}
                      onChange={() => setShowBeta((prev) => !prev)}
                      disabled={loadingVersions || versionError !== null}
                    />
                    <span className="nia-checkbox-toggle"></span>
                  </span>
                </label>

                <label className="nia-field" htmlFor="nia-max-versions-input">
                  <span className="nia-label">Max versions</span>
                  <input
                    id="nia-max-versions-input"
                    data-testid="max-versions-input"
                    type="number"
                    className="nia-input"
                    min={1}
                    max={99}
                    value={maxVersions}
                    onChange={(e) => {
                      const v = parseInt(e.target.value, 10);
                      setMaxVersions(!Number.isNaN(v) && v > 0 ? Math.min(v, 99) : 1);
                    }}
                  />
                </label>
              </div>
            )}
          </div>
        </div>
        <p className="nia-subtitle">
          Generate install commands for any package and version. Select your package manager, dependency type, and
          version to get the exact command you need.
        </p>
      </header>

      <div className="nia-controls">
        <label className="nia-field">
          <span className="nia-label">Pkg Manager</span>
          <select
            id="nia-pkg-manager-select"
            data-testid="pkg-manager-select"
            className="nia-select"
            value={pkgManager}
            aria-label="Select package manager"
            onChange={(e) => setPkgManager(e.target.value as PkgManager)}
          >
            {PKG_MANAGERS.map((manager) => (
              <option key={manager} value={manager}>
                {manager}
              </option>
            ))}
          </select>
        </label>

        <label className="nia-field">
          <span className="nia-label">Dependency</span>
          <select
            id="nia-dependency-select"
            data-testid="dependency-select"
            className="nia-select"
            value={dependencyType}
            aria-label="Select dependency type"
            onChange={(e) => setDependencyType(e.target.value as DependencyType)}
          >
            <option value="prod">Production</option>
            <option value="dev">Development</option>
          </select>
        </label>

        <label className="nia-field">
          <span className="nia-label">Version</span>
          <select
            id="nia-version-select"
            data-testid="version-select"
            className="nia-select"
            value={selectedVersion}
            aria-label="Select package version"
            onChange={(e) => setSelectedVersion(e.target.value)}
            disabled={loadingVersions}
          >
            {versionOptions.map((v) => (
              <option key={v} value={v}>
                {v === 'latest' ? 'latest' : v}
              </option>
            ))}
          </select>
          {loadingVersions && <span className="nia-hint">Loading versions…</span>}
          {versionError && !loadingVersions && <span className="nia-hint nia-hint-error">{versionError}</span>}
        </label>
      </div>

      <button
        type="button"
        className={`nia-command-button${copied ? ' nia-command-button--copied' : ''}`}
        onClick={handleCopy}
        aria-label={copied ? 'Command line copied' : 'Copy install command line'}
      >
        <span className="nia-command-text">{command}</span>
        <span className={`nia-copy-icon${copied ? ' nia-copy-icon--active' : ''}`} aria-hidden="true">
          {copied ? (
            <svg xmlns="http://www.w3.org/2000/svg" height="1rem" width="1rem" viewBox="0 0 24 24" fill="currentColor">
              <path d="M0 0h24v24H0V0z" fill="none" />
              <path d="M9 16.17L5.53 12.7c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41l4.18 4.18c.39.39 1.02.39 1.41 0L20.29 7.71c.39-.39.39-1.02 0-1.41-.39-.39-1.02-.39-1.41 0L9 16.17z" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              enableBackground="new 0 0 24 24"
              height="1rem"
              width="1rem"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <g>
                <rect fill="none" height="24" width="24" />
              </g>
              <g>
                <path d="M15,20H5V7c0-0.55-0.45-1-1-1h0C3.45,6,3,6.45,3,7v13c0,1.1,0.9,2,2,2h10c0.55,0,1-0.45,1-1v0C16,20.45,15.55,20,15,20z M20,16V4c0-1.1-0.9-2-2-2H9C7.9,2,7,2.9,7,4v12c0,1.1,0.9,2,2,2h9C19.1,18,20,17.1,20,16z M18,16H9V4h9V16z" />
              </g>
            </svg>
          )}
        </span>
      </button>
    </section>
  );
};

export const SidebarApp = (props: SidebarAppProps) => (
  <ErrorBoundary>
    <SidebarAppInner {...props} />
  </ErrorBoundary>
);
