import { describe, it, expect } from "vitest";
import { render } from "../__mocks__/render-helper";
import { Text } from "react-native";
import Card from "../../components/ui/Card";

describe("Card", () => {
  it("renders children content", () => {
    const { getByText } = render(
      <Card>
        <Text>Card content</Text>
      </Card>
    );
    expect(getByText("Card content")).toBeTruthy();
  });

  it("renders multiple children", () => {
    const { getByText } = render(
      <Card>
        <Text>First child</Text>
        <Text>Second child</Text>
      </Card>
    );
    expect(getByText("First child")).toBeTruthy();
    expect(getByText("Second child")).toBeTruthy();
  });

  it("accepts className prop without crashing", () => {
    const { getByText } = render(
      <Card className="mb-4">
        <Text>Styled card</Text>
      </Card>
    );
    expect(getByText("Styled card")).toBeTruthy();
  });
});
