<div align="center">

# Dotty

### A patient pointer for the web

Tell Dotty one goal, typed or spoken, and it guides you through the real website one step at a time.

[![Chrome Extension](https://img.shields.io/badge/Chrome-Manifest%20V3-4285F4?style=flat-square&logo=googlechrome&logoColor=white)](extension/manifest.json)
[![Node.js](https://img.shields.io/badge/Node.js-24-339933?style=flat-square&logo=nodedotjs&logoColor=white)](server/package.json)
[![Gemini](https://img.shields.io/badge/AI-Gemini%203-4285F4?style=flat-square&logo=googlegemini&logoColor=white)](server/.env.example)
[![Voice](https://img.shields.io/badge/Voice-faster--whisper-00A67E?style=flat-square)](server/voice/)

**One goal. One guided step. You stay in control.**

</div>

Built for the ML Empowerment Build Challenge for people who find websites hard to use: older adults, people with low vision, and anyone who freezes at a screen full of buttons. Dotty is not a chatbot. There is no chat window, just one goal box and a pointer.

**Challenge fit:** Dotty turns AI literacy into a practical accessibility tool. A user states a real-world goal in plain language, Gemini interprets the live page, and Dotty guides the user without taking control. This makes everyday tasks such as managing money, refilling medicine, and ordering essentials more understandable and less error-prone.

| | |
|---|---|
| **Goals** | `pay my credit card bill` · `what are my allergies?` · `order milk for pickup` |
| **Input** | Type a goal or press <kbd>Alt</kbd>+<kbd>X</kbd> to talk |
| **Model** | Google Gemini 3.1 Flash Lite |
| **Voice** | faster-whisper `base.en`, running locally on CPU |
| **Demo login** | `safwan` / `1234` on every mock app |

## What it does

- **One goal, step by step.** Dotty plans a single next step at a time from what is on the screen right now, and never clicks or types for you (it never asks for your password either; it points at the box).
- **Handles real-world mess.** Closes popups and promos first, guides you back after a wrong click, a logout, a reload or the Back button, follows you into new tabs, and after three off-path clicks asks "Still want help with ...?".
- **Answers "tell me" goals.** "What's my checking balance?" navigates there and rings the answer.
- **Push-to-talk voice.** Press <kbd>Alt</kbd>+<kbd>X</kbd> (or the mic in the goal box), talk, press again. The microphone is allowed once for Dotty, never per website, and speech is transcribed on your own machine.
- **Works on real sites.** Demoed on three mock apps we built, and tested by hand on Outlook (sign in, draft an email) and Amazon (add a product to the cart).

## How it works

```
 Chrome                                                 Local machine
+-----------------------------------------+           +--------------------------------------+
| Content script (every page)             |           | Backend  server/  (Node 24, :8787)   |
|  scanner  -> numbered element list      |           |   POST /next-step -> prompt ->       |
|  overlay  -> ring, dim, cursor, caption |           |     Google Gemini                    |
|  watcher  -> "the user did it"          |           |     (two-key rotation supported)     |
|  widget   -> goal box, mic, Stop        |   HTTP    |   POST /transcribe -> Whisper        |
| Service worker: step loop               | <-------> |   logs/ (every request + screenshot) |
|  screenshot + numbered boxes            |           |                                      |
|  (Set-of-Marks), predicted next step    |           | Whisper  server/voice/ (Docker :8790)|
| Offscreen document: mic (Alt+X)         |           |   faster-whisper base.en, CPU        |
+-----------------------------------------+           |                                      |
                                                      | Demo apps  demo-apps/ (Docker)       |
                                                      |   Hub :3000  Bank :3001              |
                                                      |   Pharmacy :3002  Grocery :3003      |
                                                      +--------------------------------------+
```

Each step: the extension screenshots the tab with a number drawn on every button, link and field, and sends the picture plus the numbered list to the model. The model answers with ONE element number and a short instruction; the extension rings that element (pixel-exact, from the real page) and waits for the user. Dotty only looks again when something happens, and it often predicts the next step, so the next ring can appear about half a second after you act. Details and contracts: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## ML Empowerment Build Challenge submission

The project is designed around the challenge requirements: a working AI application, a clear social-impact audience, a demonstrable workflow, and reproducible documentation.

- **Problem:** Many people can state what they want to do online but cannot reliably find the correct control in crowded, unfamiliar interfaces.
- **Solution:** Dotty converts a plain-language goal into one safe, visual next step on the current page. The person remains the decision-maker and performs every click and keystroke.
- **Impact:** The same interaction model supports financial access, healthcare navigation, grocery access, and ordinary web tasks. It is useful for older adults, people with low vision, users with low digital confidence, and anyone facing a complex form.
- **AI implementation:** Gemini receives the current screenshot, grounded element list, goal, and action history, then returns a validated structured step. Voice goals can be transcribed locally with faster-whisper.
- **Evidence:** Three realistic demo applications, 19 end-to-end scenarios, recovery tests for popups/logout/reload/back/new-tab flows, voice tests, scanner tests, and a model bake-off are included in the repository.
- **Responsible design:** Dotty never asks for a password, never clicks or types on the user's behalf, omits field values from the model's element list, and uses low-confidence informational guidance instead of guessing.

For the complete Devpost-ready project story — Inspiration, What it does, How we built it, Challenges, Accomplishments, Learnings, and What's next — see [`docs/DEVPOST-SUBMISSION.md`](docs/DEVPOST-SUBMISSION.md).

## Run it

**Requirements:** Node 24 · Docker with Compose · Google Chrome · a Gemini API key.

| Step | What to do |
|------|------------|
| 1. Keys | Copy `server/.env.example` to `server/.env` and fill in `GEMINI_API_KEY` (plus `GEMINI_API_KEY_2` for retry rotation). `.env` is gitignored; never commit it. |
| 2. Backend | `cd server && npm install && npm run dev` on **:8787**. The startup line shows the model and hedging status, the next line whether the voice helper is reachable. |
| 3. Voice | `cd server && docker compose up -d --build whisper` on **:8790**. First build downloads the speech model; after that it runs offline. |
| 4. Demo apps | `cd demo-apps && docker compose up -d --build`, then open the Hub at <http://localhost:3000>. |
| 5. Extension | In Chrome open `chrome://extensions`, turn on **Developer mode**, click **Load unpacked** and pick `extension/`. Click **Allow microphone** once on the welcome tab. After code changes: reload Dotty, then refresh the page. |

**Model configuration:** Gemini is configured with `GEMINI_API_KEY`; add `GEMINI_API_KEY_2` to rotate between two keys after transient failures.

**Use it:** click the round Dotty button (bottom right) and type a goal, or press <kbd>Alt</kbd>+<kbd>X</kbd>, say the goal, and press <kbd>Alt</kbd>+<kbd>X</kbd> again. Try "pay my credit card bill" on the bank, "refill my blood pressure medicine" on the pharmacy, or "order milk, eggs and bread for pickup" on the grocery store. More goals for every app: [What to ask](#what-to-ask).

Running Chrome on Windows with the code in WSL works too: load the extension from `\\wsl.localhost\<distro>\<path>\extension`; WSL forwards the localhost ports.

## The four demo apps

Dotty is never needed on the Hub. It is only the control panel: open or reset the three apps and tune their popup odds.

| App | Port | Personality | What makes it hard |
|-----|------|-------------|---------------------|
| **Demo Hub** | `3000` | Control panel | - |
| **Harbor Bank** | `3001` | Cluttered, traditional bank | 7-link nav, promo carousel, similar-looking buttons, huge footer |
| **SunPlaza Pharmacy** | `3002` | Medium density | Promos and popups over a busy home page |
| **FreshCart** | `3003` | Clean, minimal | Nesting: hamburger menu, icon-only buttons, multi-step checkout |

Demo login on every app: **`safwan`** / **`1234`**. Demo identity and local service URLs live in `demo-apps/demo-config.json`, shared by the apps and the E2E harness. Each app stores its state in `localStorage` under its own prefix (`harbor:`, `sunplaza:`, `freshcart:`); visit `/reset` on any app to wipe it back to seed data.

## What to ask

Start each app logged out to get the hard version of every task. The three hero tasks are the demo spine.

### Harbor Bank `:3001`

| Ask | Answer / effect |
|-----|-----------------|
| **pay my credit card bill** :star: | Statement / minimum / current / custom amount, from checking or savings |
| pay $200 of my credit card bill from savings | Forces the custom-amount path |
| what's my checking balance | Rings $2,431.18 |
| how much did I spend on groceries last month | Rings $412.56 |
| pay my electric bill | Payee flow (Sunshine Electric) |
| transfer $500 from checking to savings | |
| turn on paperless statements | |
| find the customer service phone number | 1-800-555-0142 |
| send a secure message to my bank | Topic + subject, then confirmation |
| log out, then log back in | |
| What is my statement balance? / When is my minimum due? / Which accounts do I have? | "tell me" goals |

### SunPlaza Pharmacy `:3002`

| Ask | Answer / effect |
|-----|-----------------|
| **refill my blood pressure medicine** :star: | Lisinopril: review, pickup store, pickup time, confirmation |
| request a renewal for my diabetes medicine | Metformin, 0 refills left |
| book an appointment with my primary doctor | Dr. Alvarez, visit type, in person or video, date and slot |
| cancel my upcoming appointment | Confirm dialog |
| what are my allergies? | Penicillin (hives), sulfa drugs (rash) |
| what was my last A1C? | 6.1%, Aug 14 2026 |
| is my order ready for pickup? | Order #SP-20418 |
| when can I refill my cholesterol medicine? | Atorvastatin, available Oct 15 |
| show me my lab results / immunizations / medications | |
| sign out and sign back in | |

### FreshCart `:3003`

| Ask | Answer / effect |
|-----|-----------------|
| **order milk, eggs and bread for pickup** :star: | Search, add 3 items, cart, sign in, switch to Pickup, pick a window, place order |
| order milk, eggs and bread for delivery | Same, plus a delivery window and driver tip |
| add two loaves of bread to my cart and remove one | Cart drawer steppers |
| change my store | Store pill opens the picker |
| browse the produce aisle and add an item | Behind the hamburger menu |
| what are my past orders? | |
| sign in / sign out | |

:star: = the hero task for that app.

### Worth demoing on any app

- Set a popup chance to **Always (1.00)** in the Hub, then ask the main goal again: Dotty closes the promo first.
- Log out mid-payment on the bank and ask the same goal: Dotty recovers through `/login` and lands you back on the payment.
- Click the wrong thing, press Back, reload, or open the order in a new tab.
- After three off-path clicks, Dotty asks "Still want help with ...?".
- Voice: press <kbd>Alt</kbd>+<kbd>X</kbd>, say the goal, press <kbd>Alt</kbd>+<kbd>X</kbd> again.

From the command line:

```bash
node scripts/e2e/run-goal.mjs http://localhost:3001 "pay my credit card bill"
```

## Test it

**Set up once:** `bash scripts/e2e/setup.sh`

| Test | Command | What it does |
|------|---------|--------------|
| **Smoke** | `node suite.mjs --smoke` | Robot tester, about 1 minute |
| **Full suite** | `node suite.mjs --runs 3` | All 19 scenarios |
| **One goal** | `node run-goal.mjs <url> "<goal>"` | Drives a single task |
| **Voice** | `node voice.mjs` | Playwright's fake microphone |
| **Look** | `node visual.mjs [--zoom 1.25]` | Screenshots of every overlay and widget state |
| **Scanner** | `node scanner-cases.mjs` | Tricky real-world markup |
| **Bake-off** | `cd server && npm run bakeoff` | 41 captured screens, accuracy + latency |

All of these run from `scripts/e2e/` (except the bake-off, which runs from `server/`). The full suite covers the three main tasks, popups, logout mid-task, wrong clicks, reload, Back, new tab, tab close, and "tell me" questions. The robot only drives our own demo apps and local test pages, never real third-party sites.

## Repository

```
extension/     Chrome extension (Manifest V3, plain JS, no build step)
server/        Node backend, model providers, prompt, fixtures, Whisper container (voice/)
demo-apps/     Demo Hub + Harbor Bank + SunPlaza Pharmacy + FreshCart (React, Docker)
scripts/e2e/   Robot tester
docs/          ARCHITECTURE.md (design + contracts), MOCK-APPS.md (what the demo apps do)
```

| Doc | Covers |
|-----|--------|
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Design, message contracts, scanner/overlay internals |
| [`docs/MOCK-APPS.md`](docs/MOCK-APPS.md) | Every page, seed value and supported task in the four apps |
| [`demo-apps/README.md`](demo-apps/README.md) | Running the apps in Docker or locally, resetting state |

## Built with

Chrome Extensions (Manifest V3, offscreen documents) · Google Gemini API · faster-whisper · Node.js 24 · React + Vite · Docker · Playwright

Font: Atkinson Hyperlegible by the Braille Institute (SIL Open Font License, [`extension/fonts/OFL.txt`](extension/fonts/OFL.txt)).
