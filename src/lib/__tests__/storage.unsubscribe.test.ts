import { waitFor } from "@testing-library/react";
import { settingsStorage, imageStateStorage } from "@/lib/storage";

describe("Storage subscribe/unsubscribe behavior", () => {
  beforeEach(() => {
    // Clear persisted state between tests to avoid cross-test interference
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.clear();
    }
    jest.clearAllMocks();
    (
      settingsStorage as unknown as { subscriptions?: Map<string, unknown> }
    ).subscriptions?.clear?.();
    settingsStorage.clearSettings();
  });

  test("settingsStorage: subscribe returns an unsubscribe that removes the listener", async () => {
    const calls = jest.fn();

    const unsubscribers: Array<() => void> = [];
    const SUB_COUNT = 50;

    // Subscribe SUB_COUNT unique listeners that forward to the mock
    for (let i = 0; i < SUB_COUNT; i++) {
      const listener = () => calls();
      const unsub = settingsStorage.subscribe(listener);
      unsubscribers.push(unsub);
    }

    // Trigger a change that causes notifyListeners()
    settingsStorage.updateCustomPrompt("first-run");

    await waitFor(() => {
      expect(calls.mock.calls.length).toBe(SUB_COUNT);
    });

    // Unsubscribe all listeners
    unsubscribers.forEach((u) => u());

    // Reset mock call history
    calls.mockReset();

    // Trigger another change - no calls should be made to our mock
    settingsStorage.updateCustomPrompt("second-run");
    await waitFor(() => {
      expect(calls.mock.calls.length).toBe(0);
    });
  });

  test("imageStateStorage: subscribe/unsubscribe works and unsubscribed listeners are not invoked", async () => {
    const calls = jest.fn();

    const unsubscribers: Array<() => void> = [];
    const SUB_COUNT = 30;

    for (let i = 0; i < SUB_COUNT; i++) {
      const listener = () => calls();
      const unsub = imageStateStorage.subscribe(listener);
      unsubscribers.push(unsub);
    }

    // Trigger notify via saving an uploaded image
    imageStateStorage.saveUploadedImage(
      "data:image/png;base64,test",
      "img.png",
      123,
      "image/png",
    );

    await waitFor(() => {
      expect(calls.mock.calls.length).toBe(SUB_COUNT);
    });

    // Unsubscribe and reset
    unsubscribers.forEach((u) => u());
    calls.mockReset();

    // Trigger another save - our mock should not be called
    imageStateStorage.saveUploadedImage(
      "data:image/png;base64,again",
      "img2.png",
      456,
      "image/png",
    );
    await waitFor(() => {
      expect(calls.mock.calls.length).toBe(0);
    });
  });
});
