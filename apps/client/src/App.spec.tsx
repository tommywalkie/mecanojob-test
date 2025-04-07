import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import App from "./App";
import { expect, it, describe } from "vitest";

describe("App", () => {
  it("renders hello world", () => {
    render(<App />);
    expect(screen.getByText("Hello World")).toBeInTheDocument();
  });
});
