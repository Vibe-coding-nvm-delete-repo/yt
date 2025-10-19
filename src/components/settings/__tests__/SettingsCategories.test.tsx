import React from "react";
import { render, screen } from "@testing-library/react";
import { SettingsCategories } from "../SettingsCategories";

describe("SettingsCategories", () => {
  it("renders categories section", () => {
    render(<SettingsCategories />);

    expect(screen.getByText("Categories")).toBeInTheDocument();
  });

  it("displays coming soon message", () => {
    render(<SettingsCategories />);

    expect(
      screen.getByText(/This feature is coming soon/i),
    ).toBeInTheDocument();
  });
});
