// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const { requestUploadMock, saveAvatarMock } = vi.hoisted(() => ({
  requestUploadMock: vi.fn(),
  saveAvatarMock: vi.fn(),
}));

vi.mock("@/features/settings/actions", () => ({
  requestAvatarUploadAction: requestUploadMock,
  saveAvatarAction: saveAvatarMock,
}));

import { ChangePhotoForm } from "@/features/settings/change-photo-form";

const MB = 1024 * 1024;

// jsdom implements neither, and the preview effect calls both.
Object.assign(URL, {
  createObjectURL: vi.fn(() => "blob:preview"),
  revokeObjectURL: vi.fn(),
});

function photo(name: string, bytes: number, type = "image/png"): File {
  return new File([new Uint8Array(bytes)], name, { type });
}

beforeEach(() => {
  vi.clearAllMocks();
  requestUploadMock.mockResolvedValue({
    success: true,
    data: {
      uploadUrl: "https://storage.example.com/put",
      key: "avatars/k.png",
    },
  });
  saveAvatarMock.mockResolvedValue({
    success: true,
    data: { image: "https://storage.example.com/signed.png" },
  });
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true } as Response));
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function renderForm() {
  render(<ChangePhotoForm name="Afolabi Hassan" currentImage={null} />);
  return document.querySelector("input[type=file]") as HTMLInputElement;
}

describe("ChangePhotoForm — what it will accept", () => {
  it("states the limits the backend enforces", () => {
    renderForm();

    expect(screen.getByText("JPG, PNG")).toBeInTheDocument();
    expect(screen.getByText("5MB")).toBeInTheDocument();
    expect(screen.getByText("1:1 (Square)")).toBeInTheDocument();
  });

  it("turns an oversized file away without troubling the server", async () => {
    const user = userEvent.setup();
    const input = renderForm();

    await user.upload(input, photo("huge.png", 6 * MB));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /File too large/i,
    );
    expect(screen.getByRole("alert")).toHaveTextContent(/Maximum size is 5MB/i);
    expect(requestUploadMock).not.toHaveBeenCalled();
  });

  it("turns a non-image away even when the picker let it through", async () => {
    const input = renderForm();

    // The input's `accept` filters the file picker, but drag-and-drop and
    // "All files" walk straight past it — so the check has to be in the code.
    fireEvent.change(input, {
      target: { files: [photo("resume.pdf", 1024, "application/pdf")] },
    });

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /Unsupported format/i,
    );
    expect(requestUploadMock).not.toHaveBeenCalled();
  });

  it("offers a way out of a rejection", async () => {
    const user = userEvent.setup();
    const input = renderForm();

    await user.upload(input, photo("huge.png", 6 * MB));

    await screen.findByRole("alert");
    expect(screen.getByText("Crop your photo")).toBeInTheDocument();
    expect(
      screen.getByText("Compress your image and try again"),
    ).toBeInTheDocument();
  });
});

describe("ChangePhotoForm — uploading", () => {
  it("sends the bytes to storage, never through the server", async () => {
    const user = userEvent.setup();
    const input = renderForm();
    const file = photo("me.png", 1024);

    await user.upload(input, file);
    await user.click(screen.getByRole("button", { name: "Save Changes" }));

    await waitFor(() =>
      expect(saveAvatarMock).toHaveBeenCalledWith("avatars/k.png"),
    );
    expect(requestUploadMock).toHaveBeenCalledWith("me.png", 1024);
    expect(fetch).toHaveBeenCalledWith(
      "https://storage.example.com/put",
      expect.objectContaining({ method: "PUT", body: file }),
    );
  });

  it("confirms the change once the key is saved", async () => {
    const user = userEvent.setup();
    const input = renderForm();

    await user.upload(input, photo("me.png", 1024));
    await user.click(screen.getByRole("button", { name: "Save Changes" }));

    expect(await screen.findByRole("status")).toHaveTextContent(
      /Profile photo updated successfully/i,
    );
    expect(
      screen.getByRole("button", { name: "Change photo" }),
    ).toBeInTheDocument();
  });

  it("reports a storage refusal rather than claiming success", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false } as Response),
    );
    const user = userEvent.setup();
    const input = renderForm();

    await user.upload(input, photo("me.png", 1024));
    await user.click(screen.getByRole("button", { name: "Save Changes" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /Upload failed/i,
    );
    expect(saveAvatarMock).not.toHaveBeenCalled();
  });

  it("reports a rejected key rather than claiming success", async () => {
    saveAvatarMock.mockResolvedValue({
      success: false,
      error: "That upload could not be verified. Please try again.",
    });
    const user = userEvent.setup();
    const input = renderForm();

    await user.upload(input, photo("me.png", 1024));
    await user.click(screen.getByRole("button", { name: "Save Changes" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /Upload failed/i,
    );
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("refuses to submit with nothing chosen", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole("button", { name: "Save Changes" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /No photo chosen/i,
    );
    expect(requestUploadMock).not.toHaveBeenCalled();
  });
});
