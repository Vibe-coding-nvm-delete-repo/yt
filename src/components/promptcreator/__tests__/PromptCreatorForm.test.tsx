import React from "react";
import { render, screen } from "@testing-library/react";
import { PromptCreatorForm } from "../PromptCreatorForm";
import type { PromptCreatorField } from "@/types/promptCreator";

describe("PromptCreatorForm", () => {
  const mockFields: PromptCreatorField[] = [
    {
      id: "field-1",
      label: "Test Field 1",
      tier: "mandatory",
      type: "text",
      order: 1,
      hidden: false,
    },
    {
      id: "field-2",
      label: "Test Field 2",
      tier: "optional",
      type: "dropdown",
      order: 2,
      hidden: false,
      options: ["Option 1", "Option 2"],
    },
  ];

  const mockRenderFieldControl = (field: PromptCreatorField) => (
    <div>{field.label} Control</div>
  );

  it("renders form with fields", () => {
    const mockOnDragStart = jest.fn();
    const mockOnDrop = jest.fn();
    const mockOnDelete = jest.fn();

    render(
      <PromptCreatorForm
        visibleFields={mockFields}
        draggedFieldId={null}
        onFieldDragStart={mockOnDragStart}
        onFieldDrop={mockOnDrop}
        onFieldDelete={mockOnDelete}
        renderFieldControl={mockRenderFieldControl}
      />,
    );

    expect(screen.getByText("All Fields")).toBeInTheDocument();
    expect(screen.getByText("(2 fields)")).toBeInTheDocument();
  });

  it("displays empty state when no fields", () => {
    const mockOnDragStart = jest.fn();
    const mockOnDrop = jest.fn();
    const mockOnDelete = jest.fn();

    render(
      <PromptCreatorForm
        visibleFields={[]}
        draggedFieldId={null}
        onFieldDragStart={mockOnDragStart}
        onFieldDrop={mockOnDrop}
        onFieldDelete={mockOnDelete}
        renderFieldControl={mockRenderFieldControl}
      />,
    );

    expect(screen.getByText(/No fields configured yet/i)).toBeInTheDocument();
  });

  it("renders field controls", () => {
    const mockOnDragStart = jest.fn();
    const mockOnDrop = jest.fn();
    const mockOnDelete = jest.fn();

    render(
      <PromptCreatorForm
        visibleFields={mockFields}
        draggedFieldId={null}
        onFieldDragStart={mockOnDragStart}
        onFieldDrop={mockOnDrop}
        onFieldDelete={mockOnDelete}
        renderFieldControl={mockRenderFieldControl}
      />,
    );

    expect(screen.getByText("Test Field 1 Control")).toBeInTheDocument();
    expect(screen.getByText("Test Field 2 Control")).toBeInTheDocument();
  });

  it("displays hide button for each field", () => {
    const mockOnDragStart = jest.fn();
    const mockOnDrop = jest.fn();
    const mockOnDelete = jest.fn();

    render(
      <PromptCreatorForm
        visibleFields={mockFields}
        draggedFieldId={null}
        onFieldDragStart={mockOnDragStart}
        onFieldDrop={mockOnDrop}
        onFieldDelete={mockOnDelete}
        renderFieldControl={mockRenderFieldControl}
      />,
    );

    const hideButtons = screen.getAllByText("Hide");
    expect(hideButtons).toHaveLength(2);
  });

  it("applies opacity when field is being dragged", () => {
    const mockOnDragStart = jest.fn();
    const mockOnDrop = jest.fn();
    const mockOnDelete = jest.fn();

    const { container } = render(
      <PromptCreatorForm
        visibleFields={mockFields}
        draggedFieldId="field-1"
        onFieldDragStart={mockOnDragStart}
        onFieldDrop={mockOnDrop}
        onFieldDelete={mockOnDelete}
        renderFieldControl={mockRenderFieldControl}
      />,
    );

    const draggedField = container.querySelector(".opacity-50");
    expect(draggedField).toBeInTheDocument();
  });
});
