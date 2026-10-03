import type { NextStepRequest, Step } from "../schema.ts";

export type ProviderResult = {
  step: Step;
  inputTokens?: number;
  outputTokens?: number;
};

export type Provider = {
  name: string;
  model: string;
  // `signal` aborts the call (hedged requests abort the loser).
  getNextStep(req: NextStepRequest, extraNote?: string, signal?: AbortSignal): Promise<ProviderResult>;
};

export class ProviderError extends Error {
  retryable: boolean;
  authFailed: boolean;
  constructor(message: string, opts: { retryable?: boolean; authFailed?: boolean } = {}) {
    super(message);
    this.name = "ProviderError";
    this.retryable = opts.retryable ?? false;
    this.authFailed = opts.authFailed ?? false;
  }
}

// Thrown by a provider when the model answered but the text is not a usable
// Step. Each provider retries once on it before giving up.
export class UnparsableOutput extends Error {}

// Calls `once` and retries a single time on UnparsableOutput.
export async function withParseRetry(
  name: string,
  once: () => Promise<ProviderResult>
): Promise<ProviderResult> {
  try {
    return await once();
  } catch (err) {
    if (!(err instanceof UnparsableOutput)) throw err;
    console.warn(`${name}: unparsable output, retrying once (${err.message})`);
    try {
      return await once();
    } catch (err2) {
      if (err2 instanceof UnparsableOutput) {
        throw new ProviderError(`${name} returned unusable output twice: ${err2.message}`, { retryable: true });
      }
      throw err2;
    }
  }
}

// The `error` field of an OpenAI-compatible body is usually an object
// ({ message, type, code }); some gateways send a plain string instead.
// Formatting it here keeps "[object Object]" out of the widget's error text.
export function errorText(error: unknown, raw: string): string {
  if (typeof error === "string" && error) return error;
  if (error && typeof error === "object") {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message) return message;
  }
  return raw.slice(0, 240);
}

// Knobs a provider accepts (for the bake-off). Unknown keys are ignored.
export type ProviderKnobs = Record<string, string>;

// "gemini:gemini-3.1-flash-lite#thinking=low" ->
// { provider: "gemini", model: "gemini-3.1-flash-lite", knobs: {thinking:"low"} }
export function parseProviderSpec(spec: string): { provider: string; model: string; knobs: ProviderKnobs } {
  const [head, knobText = ""] = spec.split("#");
  const colon = head.indexOf(":");
  if (colon < 0) throw new Error(`provider spec must look like provider:model (got "${spec}")`);
  const knobs: ProviderKnobs = {};
  for (const pair of knobText.split(",").filter(Boolean)) {
    const [k, v = "true"] = pair.split("=");
    knobs[k.trim()] = v.trim();
  }
  return { provider: head.slice(0, colon), model: head.slice(colon + 1), knobs };
}
