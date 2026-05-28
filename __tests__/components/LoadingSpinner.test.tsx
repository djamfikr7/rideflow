import { describe, it, expect } from "vitest";
import { render } from "../__mocks__/render-helper";
import LoadingSpinner from "../../components/ui/LoadingSpinner";

describe("LoadingSpinner", () => {
  it("renders ActivityIndicator", () => {
    const { toJSON } = render(<LoadingSpinner />);
    const tree = JSON.stringify(toJSON());
    // Should contain ActivityIndicator in the rendered output
    expect(tree).toBeTruthy();
    // ActivityIndicator renders as a div with role="progressbar"
    expect(tree).toContain("progressbar");
  });

  it("shows message text when provided", () => {
    const { getByText } = render(<LoadingSpinner message="Finding your ride..." />);
    expect(getByText("Finding your ride...")).toBeTruthy();
  });

  it("does not show message text when not provided", () => {
    const { toJSON } = render(<LoadingSpinner />);
    const tree = JSON.stringify(toJSON());
    expect(tree).not.toContain("Finding");
  });
});
