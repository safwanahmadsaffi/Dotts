import { createGeminiProvider } from "./gemini.ts";
import { ProviderError, parseProviderSpec, type Provider, type ProviderResult } from "./types.ts";
import type { NextStepRequest, Step } from "../schema.ts";

export { ProviderError } from "./types.ts";

// Hedged requests: if the provider has not answered after this long, fire a
// second identical call and take the first usable answer. 0 turns hedging off.
const HEDGE_AFTER_MS = Number(process.env.HEDGE_AFTER_MS ?? 1500);

// Only Gemini is enabled for the project.
export function makeProvider(spec: string): Provider {
  const { provider, model, knobs } = parseProviderSpec(spec);
  if (provider !== "gemini") throw new Error(`unknown provider "${provider}"; only "gemini" is supported`);
  const p = createGeminiProvider(model, knobs);
  if (!p) throw new Error(`${provider} key is not set in server/.env`);
  return p;
}

const primaryOrNull = createGeminiProvider();
if (!primaryOrNull) throw new Error("GEMINI_API_KEY or GEMINI_API_KEY_2 is not set in server/.env");
const primary: Provider = primaryOrNull;

export type FallbackInfo = { from: string; to: string; reason: string };

// hedged: a second identical call was fired; winner: which call's answer was
// used (1 = the original, 2 = the hedge).
export type HedgeInfo = { hedged: boolean; winner: 1 | 2 };

export type ProviderAnswer = {
  step: Step;
  provider: string;
  model: string;
  fallback: FallbackInfo | null;
  hedge: HedgeInfo;
  outputTokens?: number;
};

// Calls p, and if it is slow, a second identical call in parallel. The first
// call to succeed wins and the other is aborted. If the only running call
// fails with a retryable error before the hedge fired, the hedge fires at
// once (a free retry). Fails when every launched call has failed.
export async function hedgedCall(
  p: Provider,
  req: NextStepRequest,
  extraNote: string | undefined,
  hedgeAfterMs: number
): Promise<{ result: ProviderResult; hedge: HedgeInfo }> {
  const controllers = [new AbortController(), new AbortController()];
  return new Promise((resolve, reject) => {
    let settled = false;
    let launched = 0;
    let failures = 0;
    let firstError: unknown = null;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const finish = () => {
      settled = true;
      clearTimeout(timer);
      for (const c of controllers) c.abort();
    };

    const launch = () => {
      const i = launched++;
      p.getNextStep(req, extraNote, controllers[i].signal).then(
        (result) => {
          if (settled) return;
          finish();
          resolve({ result, hedge: { hedged: launched > 1, winner: (i + 1) as 1 | 2 } });
        },
        (err) => {
          if (settled) return;
          failures++;
          firstError ??= err;
          if (failures < launched) return; // the other call is still running
          const retryable = err instanceof ProviderError && err.retryable;
          if (launched < 2 && hedgeAfterMs > 0 && retryable) {
            clearTimeout(timer);
            launch();
            return;
          }
          finish();
          reject(firstError);
        }
      );
    };

    launch();
    if (hedgeAfterMs > 0) {
      timer = setTimeout(() => {
        if (!settled && launched < 2) launch();
      }, hedgeAfterMs);
    }
  });
}

export async function getNextStep(req: NextStepRequest, extraNote?: string): Promise<ProviderAnswer> {
  const { result, hedge } = await hedgedCall(primary, req, extraNote, HEDGE_AFTER_MS);
  return answer(result, primary, null, hedge);
}

function answer(r: ProviderResult, p: Provider, fb: FallbackInfo | null, hedge: HedgeInfo): ProviderAnswer {
  return { step: r.step, provider: p.name, model: p.model, fallback: fb, hedge, outputTokens: r.outputTokens };
}

// GET /health: provider/model = the configured model provider.
export function healthInfo(): { provider: string; model: string; fallback: string | null } {
  return {
    provider: primary.name,
    model: primary.model,
    fallback: null,
  };
}

export function startupSummary(): string {
  const parts = [`provider ${primary.name} (${primary.model})`];
  parts.push("no fallback");
  parts.push(HEDGE_AFTER_MS > 0 ? `hedge after ${HEDGE_AFTER_MS} ms` : "no hedging");
  return parts.join(" | ");
}
