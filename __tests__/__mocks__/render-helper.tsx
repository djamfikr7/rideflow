/**
 * Lightweight render + fireEvent helper using react-test-renderer.
 * Avoids @testing-library/react-native which requires the real react-native.
 */
import React from "react";
import { act, create, ReactTestRenderer } from "react-test-renderer";

function getNodeText(node: any): string {
  if (!node) return "";
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(getNodeText).join("");
  if (node.children) {
    if (typeof node.children === "string") return node.children;
    if (Array.isArray(node.children))
      return node.children.map(getNodeText).join("");
  }
  return "";
}

export function render(element: React.ReactElement) {
  let renderer: ReactTestRenderer;

  act(() => {
    renderer = create(element);
  });

  return {
    renderer: renderer!,
    getByText: (text: string) => {
      const node = renderer!.root.find(
        (n: any) => getNodeText(n) === text
      );
      if (!node) {
        throw new Error(
          `Could not find an element with text: "${text}". Tree: ${JSON.stringify(renderer!.toJSON())}`
        );
      }
      return node;
    },
    queryByText: (text: string) => {
      try {
        return renderer!.root.find(
          (n: any) => getNodeText(n) === text
        );
      } catch {
        return null;
      }
    },
    findAllByText: (text: string) => {
      return renderer!.root.findAll(
        (n: any) => getNodeText(n) === text
      );
    },
    toJSON: () => renderer!.toJSON(),
    unmount: () => {
      act(() => {
        renderer!.unmount();
      });
    },
  };
}

export const fireEvent = {
  press: (element: any) => {
    // Navigate up to find the nearest ancestor with onClick/onPress
    let current = element;
    while (current) {
      // Skip disabled elements
      if (current.props?.disabled) {
        current = current.parent;
        continue;
      }
      if (current.props?.onClick) {
        act(() => {
          current.props.onClick();
        });
        return;
      }
      if (current.props?.onPress) {
        act(() => {
          current.props.onPress();
        });
        return;
      }
      current = current.parent;
    }
    // If no onClick/onPress found on ancestors, try the element itself
    if (element.props?.disabled) return;
    if (element.props?.onClick) {
      act(() => {
        element.props.onClick();
      });
    } else if (element.props?.onPress) {
      act(() => {
        element.props.onPress();
      });
    }
  },
  changeText: (element: any, text: string) => {
    if (element.props?.onChangeText) {
      act(() => {
        element.props.onChangeText(text);
      });
    } else if (element.props?.onChange) {
      act(() => {
        element.props.onChange({ target: { value: text } });
      });
    }
  },
};

export { act };
