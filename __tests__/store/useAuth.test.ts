import { describe, it, expect, beforeEach } from "vitest";
import { useAuth } from "../../store/useAuth";
import type { User } from "../../types/user";

const mockUser: User = {
  id: "u-1",
  clerkId: "clerk-1",
  email: "test@example.com",
  fullName: "Test User",
  phone: "+15551234567",
  role: "rider",
  createdAt: "2026-01-01T00:00:00.000Z",
};

function resetAuth() {
  useAuth.setState({ user: null, isSignedIn: false, isLoading: false });
}

describe("useAuth", () => {
  beforeEach(() => {
    resetAuth();
  });

  it("has correct initial state", () => {
    const state = useAuth.getState();
    expect(state.user).toBeNull();
    expect(state.isSignedIn).toBe(false);
    expect(state.isLoading).toBe(false);
  });

  describe("setUser", () => {
    it("sets user and marks signed in", () => {
      useAuth.getState().setUser(mockUser);
      const state = useAuth.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.isSignedIn).toBe(true);
    });

    it("clears user and marks signed out when set to null", () => {
      useAuth.getState().setUser(mockUser);
      useAuth.getState().setUser(null);
      const state = useAuth.getState();
      expect(state.user).toBeNull();
      expect(state.isSignedIn).toBe(false);
    });
  });

  describe("setRole", () => {
    it("updates the user role", () => {
      useAuth.getState().setUser(mockUser);
      useAuth.getState().setRole("driver");
      expect(useAuth.getState().user?.role).toBe("driver");
    });

    it("does nothing when no user is set", () => {
      useAuth.getState().setRole("driver");
      expect(useAuth.getState().user).toBeNull();
    });
  });

  describe("updateProfile", () => {
    it("updates fullName", () => {
      useAuth.getState().setUser(mockUser);
      useAuth.getState().updateProfile({ fullName: "New Name" });
      expect(useAuth.getState().user?.fullName).toBe("New Name");
    });

    it("updates fullName and phone", () => {
      useAuth.getState().setUser(mockUser);
      useAuth.getState().updateProfile({ fullName: "New Name", phone: "+19999999999" });
      const user = useAuth.getState().user!;
      expect(user.fullName).toBe("New Name");
      expect(user.phone).toBe("+19999999999");
    });

    it("does nothing when no user is set", () => {
      useAuth.getState().updateProfile({ fullName: "Ghost" });
      expect(useAuth.getState().user).toBeNull();
    });
  });

  describe("signOut", () => {
    it("clears user and sets isSignedIn to false", () => {
      useAuth.getState().setUser(mockUser);
      useAuth.getState().signOut();
      const state = useAuth.getState();
      expect(state.user).toBeNull();
      expect(state.isSignedIn).toBe(false);
    });
  });
});
