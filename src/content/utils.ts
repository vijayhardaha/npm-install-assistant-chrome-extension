/**
 * Extracts the npm package name from a pathname.
 *
 * @param {string} pathname - The current location pathname.
 * @returns The package name (lowercase) or null when not on a package page.
 */
export function getPackageNameFromPath(pathname: string): string | null {
  const parts = pathname.split('/').filter(Boolean);

  if (parts[0] !== 'package') {
    return null;
  }

  if (!parts[1]) {
    return null;
  }

  // Scoped packages: /package/@scope/name[/...]
  if (parts[1].startsWith('@')) {
    const scope = parts[1];
    const name = parts[2];
    if (!name) {
      return null;
    }
    return `${scope}/${name}`.toLowerCase();
  }

  // Unscoped packages: /package/name[/...]
  return parts[1].toLowerCase();
}
