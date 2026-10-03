# Dotty: A Patient Pointer for the Web

## Inspiration

Navigating a new task in a web browser can be difficult, especially for older adults, people with low vision, and anyone who feels overwhelmed by a crowded screen. Having a tech-literate person available is not always possible.

Dotty is our answer: an AI-powered browser overlay that appears when the user asks for help. Instead of taking over the browser or forcing the user into a chat, Dotty calmly points to the next control and lets the person stay in charge.

## What it does

The user tells Dotty one goal, typed or spoken:

- “Pay my credit card bill.”
- “What are my allergies?”
- “Order milk, eggs and bread for pickup.”

Dotty examines the current website and gives exactly one next step. The page dims, a large yellow cursor glides toward the relevant control, a high-contrast ring highlights it, and a short caption explains what to do. The user performs the click or keystroke, and Dotty observes the result before showing the next step.

- **No chat window:** one goal box and one visual pointer.
- **No takeover:** Dotty never clicks, types, or asks for a password on the user's behalf.
- **Real-world recovery:** it handles popups, wrong clicks, logout, reloads, Back navigation, and new tabs.
- **Information goals:** it can guide the user to account or health information and point at the answer.
- **Push-to-talk voice:** `Alt+X` starts and stops recording; transcription runs locally with faster-whisper.

## How we built it

- **Chrome extension:** Manifest V3 and plain JavaScript. A scanner numbers visible buttons, links, fields, tabs, and text landmarks. The overlay renders the dim layer, ring, cursor, and caption. A watcher detects when the user acts.
- **Set-of-Marks grounding:** each turn captures the tab with numbers drawn on the page and sends the screenshot plus the matching element list to the model. The model must return one valid element number and one short instruction.
- **AI backend:** Node.js 24 and TypeScript call Google Gemini with structured JSON output. The response is schema-validated and checked against the live element list before it reaches the user. A second Gemini key can rotate in for transient failures, and slow requests can be hedged.
- **Local voice:** faster-whisper runs in Docker on the user's machine, so push-to-talk dictation does not need to leave the local voice service.
- **Realistic demo apps:** React, Vite, and TypeScript mock banking, pharmacy, and grocery sites include popups, promos, dense navigation, and intentional dead ends.
- **Evaluation:** Playwright drives the real unpacked extension across 19 scenarios, including hero tasks, popups, wrong clicks, logout recovery, reload, Back, new tabs, and information goals.

## Challenges we ran into

- **Accuracy versus speed:** a visual model must choose the correct live element without inventing coordinates or clicking the wrong control. We built a fixture-based bake-off and structured validation around the one-step contract.
- **Latency:** a new model request after every action can feel slow. Dotty is event-driven rather than time-polled, predicts a possible next step, and can hedge a slow request.
- **Off-path users:** people click the wrong thing, press Back, reload, or log out. The original goal must survive these changes while the model replans from the current screen.
- **Messy websites:** popups, icon-only controls, similar buttons, dynamic pages, and new tabs required a semantic scanner and recovery logic rather than app-specific selectors.
- **Responsible guidance:** the assistant must be useful without taking control. Password values are never sent as element labels, and low-confidence situations produce an informational response instead of a random target.

## Accomplishments that we're proud of

- Built an accessibility-focused AI interaction that is deliberately **not** a chatbot and **not** an autonomous browser agent.
- Made the same interaction model work across banking, healthcare, grocery, and ordinary web workflows.
- Added a large high-contrast pointer, page dimming, short instructions, Atkinson Hyperlegible, keyboard access, and push-to-talk voice.
- Implemented recovery for real interruptions instead of only demonstrating a perfect happy path.
- Created three realistic demo apps and a Demo Hub so judges can reproduce the experience locally.
- Added automated coverage for 19 end-to-end scenarios, visual states, voice input, scanner edge cases, and model fixtures.

## What we learned

We learned that helpful AI guidance is less about producing a long answer and more about choosing the right next action in context. A reliable browser guide needs:

- grounding in the current DOM and screenshot rather than guessed coordinates;
- a small, strict response contract that can be validated;
- an event-driven loop that waits for the person to act;
- recovery based on the original goal, not a brittle sequence of selectors;
- accessibility decisions built into the interaction model, not added as decoration;
- clear boundaries so the user understands what the AI did and did not do.

## What's next for Dotty: A Patient Pointer for the Web

1. **Sponsor model comparison:** add Featherless AI as an optional provider behind the existing structured `Step` contract and compare grounding accuracy, latency, and cost with Gemini.
2. **Privacy-preserving context:** evaluate Backboard for non-sensitive task context and recovery history while keeping passwords, payment numbers, health identifiers, and raw field values out of stored context.
3. **Impact measurement:** use Adaption Labs to measure completion rate, recovery after interruptions, time-to-completion, and user confidence.
4. **Accessible onboarding:** use Momen to prototype a simple public onboarding and impact experience.
5. **Design refinement:** use Mobbin research to improve the goal-entry, guidance, and completion flows without increasing cognitive load.
6. **Broader access:** improve multilingual voice input, support more assistive-technology patterns, and explore privacy-first deployment options for sensitive workflows.

Dotty's long-term goal is simple: make essential digital services easier to use without removing the person's agency.

## Built with

Google Gemini · Chrome Manifest V3 · JavaScript · TypeScript · Node.js 24 · React · Vite · faster-whisper · Python · Docker · Playwright · CSS · HTML
