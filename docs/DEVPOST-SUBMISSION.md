# Dotty — Devpost submission brief

## Project title

**Dotty: A Patient Pointer for the Web**

## One-line description

An accessible AI guide that helps people complete real website tasks one step at a time while keeping every decision and action in the user's hands.

## Problem

The web assumes that users can identify the right control in a dense interface, recover from unexpected popups, and understand unfamiliar forms. That assumption excludes older adults, people with low vision, people with low digital confidence, and anyone who is overwhelmed by a crowded screen.

Most AI assistants solve this by taking over through a chat interface or by acting on behalf of the user. That can be difficult to understand, hard to trust, and unsafe for sensitive tasks such as banking or healthcare.

## Solution

Dotty is a Chrome extension with one simple interaction: the user says or types one goal, such as:

- “Pay my credit card bill.”
- “What are my allergies?”
- “Order milk, eggs and bread for pickup.”

Dotty examines the current page and shows one large, high-contrast pointer and plain-language instruction. The user performs the action, and Dotty observes the result before giving the next step. It can recover from popups, wrong clicks, logout, reloads, Back navigation, and new tabs without losing the original goal.

Dotty is intentionally not a chatbot. It is a calm, transparent bridge between what a person wants to do and the controls already present on the website.

## Key features

1. **One goal, one next step** — reduces cognitive load instead of presenting a long plan.
2. **Visual grounding** — Gemini chooses from numbered live elements; Dotty rings the real DOM element rather than guessing screen coordinates.
3. **User-controlled execution** — Dotty never clicks, types, or requests a password for the user.
4. **Accessible presentation** — Atkinson Hyperlegible, high-contrast yellow guidance, page dimming, keyboard access, and short instructions.
5. **Resilient recovery** — handles interruptions and follows the user's current page back toward the original goal.
6. **Voice input** — push-to-talk goal entry with local faster-whisper transcription.
7. **Information goals** — can navigate to an account or health record and point out the answer without pretending to be the source of truth.
8. **Privacy-aware contracts** — the element list excludes field values; credentials are never requested from or repeated to the model.

## Technical implementation

### Sponsor-aligned technology story

For the Build Challenge submission, Dotty is presented as a sponsor-aligned accessibility project. The sponsor technologies below map to concrete parts of the product and its evaluation plan:

- **Featherless AI** — a potential hosted-model path for Dotty's grounded next-step reasoning and model comparison. The model must return one safe, structured action from the live page rather than operate the page autonomously.
- **Backboard** — a potential evaluation and session-context layer for preserving the user's original goal, recovery history, and accessibility preferences across a guided task. Sensitive credentials and field values remain excluded.
- **Momen** — a potential rapid-prototyping and presentation layer for the accessible onboarding flow, challenge landing page, or impact dashboard. The core browser-guidance experience remains the Dotty extension.
- **Adaption Labs** — a potential experimentation and impact-measurement layer for comparing task completion, recovery, and confidence outcomes for users who receive guided assistance.
- **Mobbin** — a design-research reference for studying accessible onboarding, focused task flows, and low-cognitive-load interaction patterns before refining Dotty's interface.

These are sponsor-aligned integrations and extension opportunities for the challenge narrative. Only technologies listed in the **Implemented prototype** section are claimed as currently running in this repository.

### Implemented prototype

- **Client:** Chrome Manifest V3 extension in plain JavaScript.
- **Grounding:** DOM scanner plus Set-of-Marks screenshots. Every model-selected target must exist in the current element list.
- **AI:** Google Gemini with structured JSON output and schema validation.
- **Backend:** Node.js 24 and TypeScript. API keys stay on the backend.
- **Voice:** faster-whisper in a local CPU container; voice is push-to-talk, not an always-on listener.
- **Demo apps:** React + Vite + TypeScript applications for banking, pharmacy, and grocery workflows.
- **Validation:** Playwright end-to-end scenarios, visual checks, voice checks, scanner cases, and captured-screen model bake-off tooling.

### Sponsor integration plan

If sponsor access is available during the build period, the integration order is:

1. Use **Featherless AI** as an optional provider behind the existing structured `Step` contract, then compare accuracy and latency with the current provider.
2. Use **Backboard** for non-sensitive task context and explicit evaluation traces, never for passwords, payment numbers, health identifiers, or raw field values.
3. Use **Momen** to package the onboarding and impact story into a simple public-facing project experience.
4. Use **Adaption Labs** to measure task success, recovery after interruptions, time-to-completion, and user confidence.
5. Use **Mobbin** research to refine the visual hierarchy and reduce cognitive load in the goal-entry and completion states.

The product theme remains consistent across every integration: AI should make essential digital services easier to use while preserving user agency, transparency, and privacy.

## Demonstration script

1. Open the Demo Hub and set the Harbor Bank popup chance to **Always**.
2. Open Harbor Bank, start logged out, and submit: **“Pay my credit card bill.”**
3. Show Dotty dismissing the paperless popup before guiding the sign-in and payment flow.
4. Click a wrong control or log out mid-task. Show Dotty recovering without restarting the user's goal.
5. Repeat on SunPlaza Pharmacy with: **“What are my allergies?”** Dotty navigates to the record and points out the answer.
6. Repeat on FreshCart with: **“Order milk, eggs and bread for pickup.”** Show search, cart, pickup window, and confirmation.
7. Finish with voice input using `Alt+X`.

## Judging criteria mapping

| Criterion | How Dotty demonstrates it |
|---|---|
| Technical Implementation (30%) | Live screenshot + DOM grounding, structured Gemini output, schema validation, event-driven loop, voice pipeline, recovery state machine, and automated scenarios. |
| Creativity & Innovation (20%) | A non-chat, non-autonomous AI interaction model: the AI interprets and points, while the person stays in control. |
| Real-World Impact (20%) | Makes banking, healthcare, grocery, and everyday web tasks more accessible to people excluded by dense interfaces. |
| Project Design & UX (15%) | High-contrast pointer, short instructions, one-goal flow, keyboard/voice entry, and no distracting transcript. |
| Presentation & Documentation (15%) | Reproducible local demo, three realistic apps, demo script, architecture contracts, supported goals, and automated evidence. |

## Responsible AI and limitations

Dotty is assistive guidance, not an autonomous agent or a replacement for a bank, pharmacy, clinician, or accessibility professional. It can be uncertain when a page is ambiguous; in that case it reports low confidence rather than inventing a target. The current prototype is English-only, requires Chrome and a local backend, does not operate inside iframes, and relies on the website's accessible labels. These boundaries are explicit so users can make informed decisions.

## Links and submission checklist

- **Repository:** link to this GitHub repository on Devpost.
- **Live demo:** use the local Demo Hub walkthrough or record the demonstration script above.
- **Screenshots/video:** capture the goal box, numbered guidance ring, popup recovery, information answer, and completion state.
- **Team details:** add each contributor and role on Devpost.
- **Project description:** use this document as the source for the problem, solution, features, technology, and impact sections.
