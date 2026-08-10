// Registers jest-dom's matchers (toBeInTheDocument, toBeDisabled, ...) with
// Vitest's expect. Harmless for node-environment specs, which simply never use them.
import "@testing-library/jest-dom/vitest";
