/**
 * Trigger a browser download for an in-memory Blob.
 *
 * Same anchor + object-URL pattern the JSON export in src/pages/Settings.tsx
 * already uses, so every download in the app behaves identically.
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  // Revoke on the next tick — revoking synchronously can cancel the download
  // in Firefox/Safari before it has started.
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}