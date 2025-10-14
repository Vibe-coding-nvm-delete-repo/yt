import { render, screen } from "@testing-library/react";
import ImageToPromptTab from "@/components/ImageToPromptTab";

/**
 * Minimal smoke test for ImageToPromptTab after main restoration.
 * Keeps assertions UI-stable and avoids coupling to error boundary internals.
 */

describe("ImageToPromptTab (restored)", () => {
  test("renders primary controls", () => {
    render(<ImageToPromptTab />);

    // Expect the tab header or landmark text to be present
    const nodes = screen.getAllByText(/Image to Prompt/i);
    expect(nodes.length).toBeGreaterThan(0);
  });
});
