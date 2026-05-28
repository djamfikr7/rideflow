import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "../__mocks__/render-helper";
import DriverInfoCard from "../../components/ride/DriverInfoCard";
import type { DriverInfo } from "../../types/ride";

const mockDriver: DriverInfo = {
  id: "driver-1",
  fullName: "Carlos Martinez",
  rating: 4.8,
  totalRides: 1243,
  vehicleMake: "Toyota",
  vehicleModel: "Camry",
  vehicleColor: "Silver",
  licensePlate: "ABC 1234",
  currentLat: 40.7128,
  currentLng: -74.006,
};

/** Recursively collect all text strings from a JSON tree */
function collectTexts(node: any): string[] {
  const texts: string[] = [];
  if (!node) return texts;
  if (typeof node === "string") {
    texts.push(node);
    return texts;
  }
  if (Array.isArray(node)) {
    for (const child of node) texts.push(...collectTexts(child));
    return texts;
  }
  if (typeof node === "object") {
    if (node.children) texts.push(...collectTexts(node.children));
    if (node.props?.children) texts.push(...collectTexts(node.props.children));
  }
  return texts;
}

describe("DriverInfoCard", () => {
  it("renders driver name", () => {
    const { getByText } = render(<DriverInfoCard driver={mockDriver} />);
    expect(getByText("Carlos Martinez")).toBeTruthy();
  });

  it("renders star rating", () => {
    const result = render(<DriverInfoCard driver={mockDriver} />);
    expect(result.getByText("4.8")).toBeTruthy();
    // Search JSON tree for star characters (our mock renders HTML, not RN)
    const allTexts = collectTexts(result.toJSON());
    const starTexts = allTexts.filter((t) => t.includes("\u2605"));
    expect(starTexts.length).toBeGreaterThanOrEqual(4);
  });

  it("renders vehicle info (make, model, color)", () => {
    const { getByText } = render(<DriverInfoCard driver={mockDriver} />);
    expect(getByText("Silver Toyota Camry")).toBeTruthy();
  });

  it("renders license plate", () => {
    const { getByText } = render(<DriverInfoCard driver={mockDriver} />);
    expect(getByText("ABC 1234")).toBeTruthy();
  });

  it("renders total rides count", () => {
    const { getByText } = render(<DriverInfoCard driver={mockDriver} />);
    expect(getByText("1,243 rides")).toBeTruthy();
  });

  it("calls onCall when call button pressed", () => {
    const onCall = vi.fn();
    const { getByText } = render(
      <DriverInfoCard driver={mockDriver} onCall={onCall} />
    );
    fireEvent.press(getByText("Call"));
    expect(onCall).toHaveBeenCalledTimes(1);
  });

  it("calls onMessage when message button pressed", () => {
    const onMessage = vi.fn();
    const { getByText } = render(
      <DriverInfoCard driver={mockDriver} onMessage={onMessage} />
    );
    fireEvent.press(getByText("Message"));
    expect(onMessage).toHaveBeenCalledTimes(1);
  });
});
