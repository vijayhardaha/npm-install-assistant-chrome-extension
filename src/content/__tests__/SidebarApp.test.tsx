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
const createRegistryResponse = (): MockRegistry => ({ versions: { '2.0.0': {}, '1.1.0-beta.1': {}, '1.0.0': {} } });

/**
 * Stub global `fetch` to return a resolved Response-like object containing
 * the mock registry JSON. This isolates network calls in tests.
 */
const mockFetch = () => {
  const response = { ok: true, json: async () => createRegistryResponse() } as Response;

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
});
