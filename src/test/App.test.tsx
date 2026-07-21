import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { App } from "../app/App";

describe("guided presentation", () => {
  it("moves from introduction to the structured brief", () => {
    render(<App />);
    expect(screen.getByRole("button", { name: "Open system overview" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /begin analysis/i }));
    expect(screen.getByRole("dialog", { name: "Focused decision artifact" })).toBeInTheDocument();
    expect(screen.getByText("Structured venture brief")).toBeInTheDocument();
    expect(screen.getByText("No cafés, prepared drinks, ice cream, or coffee machines")).toBeInTheDocument();
    expect(screen.getByText("France, Scotland, Germany, Italy")).toBeInTheDocument();
    expect(screen.getByText("Competitive headroom")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /close artifact popup/i }));
    expect(screen.queryByRole("dialog", { name: "Focused decision artifact" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Review structured brief" })).toBeInTheDocument();
  });

  it("opens and closes an agent detail drawer", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: /open market agent details/i }));
    expect(screen.getByRole("dialog", { name: "Market Agent" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /close agent details/i }));
    expect(screen.queryByRole("dialog", { name: "Market Agent" })).not.toBeInTheDocument();
  });
});
