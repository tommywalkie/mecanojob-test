import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { Button } from "./Button";
import { describe, it, expect } from "vitest";

describe("Button", () => {
  it("renders correctly", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });
});
