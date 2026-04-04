import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import { SidebarApp } from '../SidebarApp';

/**
 * Unit tests for SidebarApp verifying commands, dropdowns, and settings
 * behavior used by the install assistant UI.
 */

type MockRegistry = { versions: Record<string, unknown> };

/**
 * Create a mock registry response containing semantic version keys used by
 * tests. The versions map shape mirrors the npm registry `versions` object.
 *
 * @returns MockRegistry object with `versions` map for tests.
 */
const createRegistryResponse = (versions: string[] = ['2.0.0', '1.1.0-beta.1', '1.0.0']): MockRegistry => {
  const versionsObj: Record<string, unknown> = {};
  for (const v of versions) {
    versionsObj[v] = {};
  }
  return { versions: versionsObj };
};

/**
 * Stub global `fetch` to return a resolved Response-like object containing
 * the mock registry JSON. This isolates network calls in tests.
 */
const mockFetch = (versions?: string[]) => {
  const response = { ok: true, json: async () => createRegistryResponse(versions) } as Response;

  // Replace global fetch with a mocked resolved value.
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response));
};

describe('SidebarApp', () => {
  beforeEach(() => {
    // Ensure localStorage starts empty between tests to avoid state leaks.
    window.localStorage.clear();

    // Default network stub returning available versions.
    mockFetch();
  });

  afterEach(() => {
    // Restore any global mocks to their original implementations.
    vi.restoreAllMocks();
  });

  it('renders the default npm install command', async () => {
    // Render component with a known package name.
    render(<SidebarApp packageName="react" />);

    // Default install command should show without user interaction.
    expect(screen.getByText('npm install react')).toBeInTheDocument();

    // Wait for versions to populate from mocked fetch.
    await screen.findByRole('option', { name: '2.0.0' });
  });

  it('disables the version dropdown while loading', () => {
    // Simulate a hanging network request by stubbing fetch with a pending
    // promise so the component stays in loading state.
    vi.stubGlobal('fetch', vi.fn().mockReturnValue(new Promise(() => {}) as Promise<Response>));

    render(<SidebarApp packageName="react" />);

    // While loading, version selector should be disabled.
    expect(screen.getByTestId('version-select')).toBeDisabled();
  });

  it('shows error message when registry fetch fails', async () => {
    // Mock console.error to suppress expected error messages
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));

    render(<SidebarApp packageName="react" />);

    // Should display error message after fetch fails.
    await waitFor(() => {
      expect(screen.getByText('Unable to load versions')).toBeInTheDocument();
    });

    // Version dropdown should be present but empty (latest only).
    const versionSelect = screen.getByTestId('version-select');
    expect(versionSelect).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'latest' })).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it('handles empty versions from registry', async () => {
    mockFetch([]);

    render(<SidebarApp packageName="empty-package" />);

    // Should only have "latest" option.
    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'latest' })).toBeInTheDocument();
    });

    // No other versions should appear.
    expect(screen.queryByRole('option', { name: /^\d+\./ })).not.toBeInTheDocument();
  });

  it('updates command when dependency type changes', async () => {
    const user = userEvent.setup();
    render(<SidebarApp packageName="react" />);

    // Wait for versions to appear before interacting.
    await screen.findByRole('option', { name: '2.0.0' });

    const dependencySelect = screen.getByTestId('dependency-select');
    await user.selectOptions(dependencySelect, 'dev');

    // Changing dependency type should update the generated command.
    expect(screen.getByText('npm install --save-dev react')).toBeInTheDocument();
  });

  it('updates command when version changes', async () => {
    const user = userEvent.setup();
    render(<SidebarApp packageName="react" />);

    // Wait for versions to appear.
    await screen.findByRole('option', { name: '2.0.0' });

    const versionSelect = screen.getByTestId('version-select');
    await user.selectOptions(versionSelect, '1.0.0');

    // Command should include the selected version.
    expect(screen.getByText('npm install react@1.0.0')).toBeInTheDocument();
  });

  it('generates correct commands for all package managers', async () => {
    const user = userEvent.setup();
    render(<SidebarApp packageName="react" />);

    // Wait for versions.
    await screen.findByRole('option', { name: '2.0.0' });

    const pkgManagerSelect = screen.getByTestId('pkg-manager-select');
    const dependencySelect = screen.getByTestId('dependency-select');

    // Ensure starting with prod dependency
    await user.selectOptions(dependencySelect, 'prod');

    // Test npm prod (default)
    expect(screen.getByText('npm install react')).toBeInTheDocument();

    // Test npm dev
    await user.selectOptions(dependencySelect, 'dev');
    expect(screen.getByText('npm install --save-dev react')).toBeInTheDocument();

    // Switch to yarn, reset to prod
    await user.selectOptions(dependencySelect, 'prod');
    await user.selectOptions(pkgManagerSelect, 'yarn');
    expect(screen.getByText('yarn add react')).toBeInTheDocument();

    // Test yarn dev
    await user.selectOptions(dependencySelect, 'dev');
    expect(screen.getByText('yarn add --dev react')).toBeInTheDocument();

    // Switch to pnpm, reset to prod
    await user.selectOptions(dependencySelect, 'prod');
    await user.selectOptions(pkgManagerSelect, 'pnpm');
    expect(screen.getByText('pnpm add react')).toBeInTheDocument();

    // Test pnpm dev
    await user.selectOptions(dependencySelect, 'dev');
    expect(screen.getByText('pnpm add --save-dev react')).toBeInTheDocument();

    // Switch to bun, reset to prod
    await user.selectOptions(dependencySelect, 'prod');
    await user.selectOptions(pkgManagerSelect, 'bun');
    expect(screen.getByText('bun add react')).toBeInTheDocument();

    // Test bun dev
    await user.selectOptions(dependencySelect, 'dev');
    expect(screen.getByText('bun add --dev react')).toBeInTheDocument();
  });

  it('toggles beta versions and limits the list', async () => {
    const user = userEvent.setup();
    render(<SidebarApp packageName="react" />);

    // By default, beta versions are hidden; ensure latest stable present.
    await screen.findByRole('option', { name: '2.0.0' });
    expect(screen.queryByRole('option', { name: '1.1.0-beta.1' })).not.toBeInTheDocument();

    // Open settings and enable showing beta versions.
    const settingsButton = screen.getByTestId('settings-button');
    await user.click(settingsButton);

    const betaCheckbox = screen.getByTestId('show-beta-checkbox');
    await user.click(betaCheckbox);

    // Beta version should now appear in the list.
    expect(await screen.findByRole('option', { name: '1.1.0-beta.1' })).toBeInTheDocument();

    // Limit the number of versions shown and verify truncation behavior.
    const maxVersionsInput = screen.getByTestId('max-versions-input');
    fireEvent.change(maxVersionsInput, { target: { value: '1' } });

    expect(screen.getByRole('option', { name: '2.0.0' })).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByRole('option', { name: '1.0.0' })).not.toBeInTheDocument();
    });
  });

  it('persists package manager preference in localStorage', async () => {
    const user = userEvent.setup();
    render(<SidebarApp packageName="react" />);

    // Wait for versions.
    await screen.findByRole('option', { name: '2.0.0' });

    const pkgManagerSelect = screen.getByTestId('pkg-manager-select');
    await user.selectOptions(pkgManagerSelect, 'yarn');

    // Check localStorage was updated.
    expect(window.localStorage.getItem('nia_package_manager')).toBe('yarn');
  });

  it('loads persisted package manager preference', async () => {
    window.localStorage.setItem('nia_package_manager', 'pnpm');

    render(<SidebarApp packageName="react" />);

    // Wait for versions.
    await screen.findByRole('option', { name: '2.0.0' });

    // Should have loaded the persisted preference.
    const pkgManagerSelect = screen.getByTestId('pkg-manager-select');
    expect(pkgManagerSelect).toHaveValue('pnpm');

    // Command should match the persisted manager.
    expect(screen.getByText('pnpm add react')).toBeInTheDocument();
  });

  it('persists show beta setting in localStorage', async () => {
    const user = userEvent.setup();
    render(<SidebarApp packageName="react" />);

    // Wait for versions.
    await screen.findByRole('option', { name: '2.0.0' });

    // Open settings and enable beta.
    await user.click(screen.getByTestId('settings-button'));
    await user.click(screen.getByTestId('show-beta-checkbox'));

    expect(window.localStorage.getItem('nia_show_beta')).toBe('true');
  });

  it('loads persisted show beta setting', async () => {
    const user = userEvent.setup();
    window.localStorage.setItem('nia_show_beta', 'true');

    render(<SidebarApp packageName="react" />);

    // Wait for versions.
    await screen.findByRole('option', { name: '2.0.0' });

    // Open settings - checkbox should be checked.
    await user.click(screen.getByTestId('settings-button'));
    const betaCheckbox = screen.getByTestId('show-beta-checkbox');
    expect(betaCheckbox).toBeChecked();

    // Beta version should be visible.
    expect(await screen.findByRole('option', { name: '1.1.0-beta.1' })).toBeInTheDocument();
  });

  it('persists max versions setting in localStorage', async () => {
    const user = userEvent.setup();
    render(<SidebarApp packageName="react" />);

    // Wait for versions.
    await screen.findByRole('option', { name: '2.0.0' });

    // Open settings and change max versions.
    await user.click(screen.getByTestId('settings-button'));
    const maxVersionsInput = screen.getByTestId('max-versions-input');
    fireEvent.change(maxVersionsInput, { target: { value: '5' } });

    expect(window.localStorage.getItem('nia_max_versions')).toBe('5');
  });

  it('loads persisted max versions setting', async () => {
    const user = userEvent.setup();
    window.localStorage.setItem('nia_max_versions', '3');

    render(<SidebarApp packageName="react" />);

    // Wait for versions.
    await screen.findByRole('option', { name: '2.0.0' });

    // Open settings to see the input
    await user.click(screen.getByTestId('settings-button'));

    // Should have loaded the persisted max versions.
    const maxVersionsInput = screen.getByTestId('max-versions-input');
    expect(maxVersionsInput).toHaveValue(3);
  });

  it('closes settings dropdown when clicking outside', async () => {
    render(<SidebarApp packageName="react" />);

    // Wait for versions.
    await screen.findByRole('option', { name: '2.0.0' });

    // Open settings.
    fireEvent.click(screen.getByTestId('settings-button'));
    expect(screen.getByTestId('show-beta-checkbox')).toBeInTheDocument();

    // Click outside the settings container.
    fireEvent.mouseDown(document.body);

    // Settings should close.
    await waitFor(() => {
      expect(screen.queryByTestId('show-beta-checkbox')).not.toBeInTheDocument();
    });
  });

  it('copies command to clipboard on button click', async () => {
    const user = userEvent.setup();
    const mockWriteText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { clipboard: { writeText: mockWriteText } });

    render(<SidebarApp packageName="react" />);

    // Command is available immediately; no need to wait for versions.
    const copyButton = screen.getByRole('button', { name: /copy install command/i });
    await user.click(copyButton);

    // Should have called clipboard API with the command.
    expect(mockWriteText).toHaveBeenCalledWith('npm install react');

    // Button should now have copied state (aria-label changes)
    expect(copyButton).toHaveAttribute('aria-label', 'Command line copied');
    expect(copyButton).toHaveClass('nia-command-button--copied');

    vi.restoreAllMocks();
  });

  it('falls back to execCommand when clipboard API unavailable', async () => {
    // In jsdom, clipboard is typically undefined; we ensure it by stubbing a minimal navigator without clipboard
    const originalNavigator = global.navigator;
    vi.stubGlobal('navigator', { ...originalNavigator, clipboard: undefined });

    // Mock document.execCommand (which doesn't exist in jsdom)
    const mockExecCommand = vi.fn().mockReturnValue(true);
    (document as unknown as Record<string, unknown>).execCommand = mockExecCommand;

    render(<SidebarApp packageName="react" />);

    // Command is available immediately; click copy.
    const copyButton = screen.getByRole('button', { name: /copy install command/i });
    await waitFor(() => fireEvent.click(copyButton));

    // Should fall back to execCommand method.
    expect(mockExecCommand).toHaveBeenCalledWith('copy');

    // Cleanup.
    vi.restoreAllMocks();
    delete (document as unknown as Record<string, unknown>).execCommand;
    vi.stubGlobal('navigator', originalNavigator);
  });

  it('handles clipboard write error gracefully', async () => {
    const mockWriteText = vi.fn().mockRejectedValue(new Error('Clipboard denied'));
    vi.stubGlobal('navigator', { clipboard: { writeText: mockWriteText } });

    // Spy on console.error to ensure error is logged.
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<SidebarApp packageName="react" />);

    // Command is available immediately; click copy.
    const copyButton = screen.getByRole('button', { name: /copy install command/i });
    fireEvent.click(copyButton);

    // Wait for async copy to attempt and fail.
    await waitFor(() => {
      // Should have attempted to write.
      expect(mockWriteText).toHaveBeenCalled();
    });

    // Error should be logged.
    expect(consoleSpy).toHaveBeenCalledWith('Failed to copy command', expect.any(Error));

    consoleSpy.mockRestore();
    vi.restoreAllMocks();
  });

  it('shows error when registry responds with non-ok status', async () => {
    // Mock console.error to suppress expected error messages
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 404, json: async () => ({}) } as Response));

    render(<SidebarApp packageName="react" />);

    await waitFor(() => {
      expect(screen.getByText('Unable to load versions')).toBeInTheDocument();
    });

    // Version dropdown should have only 'latest'
    expect(screen.getByRole('option', { name: 'latest' })).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it('loads show beta setting when set to false', async () => {
    const user = userEvent.setup();
    window.localStorage.setItem('nia_show_beta', 'false');

    render(<SidebarApp packageName="react" />);
    await screen.findByRole('option', { name: '2.0.0' });

    // Beta should be hidden (default) - we already test that but with explicit false
    expect(screen.queryByRole('option', { name: '1.1.0-beta.1' })).not.toBeInTheDocument();

    // Open settings and confirm checkbox is unchecked
    await user.click(screen.getByTestId('settings-button'));
    const betaCheckbox = screen.getByTestId('show-beta-checkbox');
    expect(betaCheckbox).not.toBeChecked();
  });

  it('resets to latest when current version exceeds max limit', async () => {
    const user = userEvent.setup();
    render(<SidebarApp packageName="react" />);
    await screen.findByRole('option', { name: '2.0.0' });

    // Select a non-latest version that exists (e.g., 1.0.0)
    await user.selectOptions(screen.getByTestId('version-select'), '1.0.0');
    expect(screen.getByText('npm install react@1.0.0')).toBeInTheDocument();

    // Open settings and set max versions to 1 (only latest stays because we have 2.0.0,1.0.0, but filtered order descending? Actually filteredVersions is all stable sorted descending. The max limit applies after filtering. If max=1, then filteredVersions will have only '2.0.0' (since we slice 0:1). Since showBeta false, filtered=[2.0.0, 1.0.0] then slice(0,1) gives [2.0.0]. The selectedVersion '1.0.0' is not in filtered, so should reset to latest.

    await user.click(screen.getByTestId('settings-button'));
    const maxInput = screen.getByTestId('max-versions-input');
    await user.clear(maxInput);
    await user.type(maxInput, '1');

    // After limit change, selected version should have reset to latest
    await waitFor(() => {
      expect(screen.getByText('npm install react')).toBeInTheDocument();
    });
  });

  it('handles versions with equal numeric parts', async () => {
    mockFetch(['1.0', '1.0.0']);
    render(<SidebarApp packageName="react" />);
    await screen.findByRole('option', { name: '1.0' });
    await screen.findByRole('option', { name: '1.0.0' });
  });

  it('triggers deduplication check when version list could have duplicates', async () => {
    // This ensures line 265 (if (!base.includes(v))) is covered
    mockFetch(['3.0.0', '2.0.0', '1.0.0']);

    render(<SidebarApp packageName="react" />);

    // Wait for versions to load
    await screen.findByRole('option', { name: '3.0.0' });

    const versionSelect = screen.getByTestId('version-select');
    const options = versionSelect.querySelectorAll('option');

    // Should have: latest, 3.0.0, 2.0.0, 1.0.0
    expect(options).toHaveLength(4);
  });
});
