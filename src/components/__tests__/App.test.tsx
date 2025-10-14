import { render, screen } from "@testing-library/react";
import { App } from "@/components/App";

/**
 * App smoke tests after main restoration
 * - Keep minimal assertions that match restored UI
 */
describe("App component (restored)", () => {
  test("renders main landmark and tabs", () => {
    render(<App />);
    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByRole("tablist")).toBeInTheDocument();
  });

  test("shows Image to Prompt content by default", () => {
    render(<App />);
    const nodes = screen.getAllByText(/Image to Prompt/i);
    expect(nodes.length).toBeGreaterThan(0);
  });
});
