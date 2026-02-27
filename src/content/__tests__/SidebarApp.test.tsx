import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import { SidebarApp } from "../SidebarApp";

type MockRegistry = { versions: Record<string, unknown> };

const createRegistryResponse = (): MockRegistry => ({
	versions: { "2.0.0": {}, "1.1.0-beta.1": {}, "1.0.0": {} },
});

const mockFetch = () => {
	const response = {
		ok: true,
		json: async () => createRegistryResponse(),
	} as Response;

	vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response));
};

describe("SidebarApp", () => {
	beforeEach(() => {
		window.localStorage.clear();
		mockFetch();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("renders the default npm install command", async () => {
		render(<SidebarApp packageName="react" />);

		expect(screen.getByText("npm install react")).toBeInTheDocument();

		await screen.findByRole("option", { name: "2.0.0" });
	});

	it("disables the version dropdown while loading", () => {
		vi.stubGlobal(
			"fetch",
			vi.fn().mockReturnValue(new Promise(() => {}) as Promise<Response>)
		);

		render(<SidebarApp packageName="react" />);

		expect(screen.getByTestId("version-select")).toBeDisabled();
	});

	it("updates command when dependency type changes", async () => {
		const user = userEvent.setup();
		render(<SidebarApp packageName="react" />);

		await screen.findByRole("option", { name: "2.0.0" });

		const dependencySelect = screen.getByTestId("dependency-select");
		await user.selectOptions(dependencySelect, "dev");

		expect(
			screen.getByText("npm install --save-dev react")
		).toBeInTheDocument();
	});

	it("toggles beta versions and limits the list", async () => {
		const user = userEvent.setup();
		render(<SidebarApp packageName="react" />);

		await screen.findByRole("option", { name: "2.0.0" });
		expect(
			screen.queryByRole("option", { name: "1.1.0-beta.1" })
		).not.toBeInTheDocument();

		const settingsButton = screen.getByTestId("settings-button");
		await user.click(settingsButton);

		const betaCheckbox = screen.getByTestId("show-beta-checkbox");
		await user.click(betaCheckbox);

		expect(
			await screen.findByRole("option", { name: "1.1.0-beta.1" })
		).toBeInTheDocument();

		const maxVersionsInput = screen.getByTestId("max-versions-input");
		fireEvent.change(maxVersionsInput, { target: { value: "1" } });

		expect(
			screen.getByRole("option", { name: "2.0.0" })
		).toBeInTheDocument();
		await waitFor(() => {
			expect(
				screen.queryByRole("option", { name: "1.0.0" })
			).not.toBeInTheDocument();
		});
	});
});
