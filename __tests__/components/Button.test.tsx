import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "../__mocks__/render-helper";
import Button from "../../components/ui/Button";

describe("Button", () => {
  it("renders with title text", () => {
    const { getByText } = render(<Button title="Confirm Ride" onPress={() => {}} />);
    expect(getByText("Confirm Ride")).toBeTruthy();
  });

  it("calls onPress when tapped", () => {
    const onPress = vi.fn();
    const { getByText } = render(<Button title="Book Now" onPress={onPress} />);
    fireEvent.press(getByText("Book Now"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("shows ActivityIndicator when loading", () => {
    const { queryByText, renderer } = render(
      <Button title="Submit" onPress={() => {}} loading />
    );
    // When loading, the title text should not be visible
    expect(queryByText("Submit")).toBeNull();
    // ActivityIndicator should be present
    const indicators = renderer.root.findAll(
      (n: any) => n.props?.role === "progressbar"
    );
    expect(indicators.length).toBeGreaterThan(0);
  });

  it("is disabled when disabled prop is true", () => {
    const onPress = vi.fn();
    const { getByText } = render(
      <Button title="Disabled" onPress={onPress} disabled />
    );
    fireEvent.press(getByText("Disabled"));
    expect(onPress).not.toHaveBeenCalled();
  });

  it("renders primary variant by default", () => {
    const { getByText } = render(<Button title="Primary" onPress={() => {}} />);
    expect(getByText("Primary")).toBeTruthy();
  });

  it("renders secondary variant", () => {
    const { getByText } = render(
      <Button title="Secondary" onPress={() => {}} variant="secondary" />
    );
    expect(getByText("Secondary")).toBeTruthy();
  });

  it("renders danger variant", () => {
    const { getByText } = render(
      <Button title="Danger" onPress={() => {}} variant="danger" />
    );
    expect(getByText("Danger")).toBeTruthy();
  });

  it("renders ghost variant", () => {
    const { getByText } = render(
      <Button title="Ghost" onPress={() => {}} variant="ghost" />
    );
    expect(getByText("Ghost")).toBeTruthy();
  });
});
