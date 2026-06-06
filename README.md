# STOPDog – Stay Focused Blocker

> Your personal productivity watchdog. When your browsing time is up, a dog takes over your screen until you get back to work.

STOPDog is a lightweight Chrome extension that helps you stop mindless scrolling. Set a focus timer, and when it runs out, a full-screen guard dog blocks the page until your break is over — so you actually step away or get back on task.

**Live on the Chrome Web Store:** https://chromewebstore.google.com/detail/stopdog-stay-focused-bloc/dmeljaoiocbohnfogibljkapijgpcehl

Version 1.1 · Category: Well-being

## Features

- **Flexible timers** – set custom focus and break durations to match your workflow
- **Always-active mode** – run 24/7, or set a specific daily schedule
- **Quick blocklist** – one-tap block for YouTube, Facebook, TikTok and Reddit, or add your own URLs
- **Strict lockdown** – a full-screen overlay with a countdown prevents scrolling until the break ends
- **Lightweight** – minimal footprint, no measurable impact on browser speed
- **Privacy-first** – no data is collected, stored, or sent anywhere; all settings stay on your device
- **Free** – no subscriptions, no ads

## Screenshots

<!-- Add 2–3 screenshots here: the settings/popup, the blocklist, and the full-screen dog overlay -->

| Settings | Blocklist | Lockdown |
| --- | --- | --- |
| _add image_ | _add image_ | _add image_ |

## Tech stack

> Adjust this section to match your actual implementation.

- **Chrome Extension (Manifest V3)**
- **JavaScript** – popup / options UI, background service worker, content scripts
- **`chrome.storage`** – local persistence of timers, schedule, and blocklist
- **`chrome.alarms`** – scheduling focus / break cycles
- **Content-script overlay** – injects the full-screen countdown / blocker into target pages

## How it works

1. The user sets focus/break durations and a blocklist in the popup (saved via `chrome.storage`).
2. A background service worker tracks the active timer using `chrome.alarms`.
3. When time is up on a blocked site, a content script injects a full-screen overlay (the dog + countdown) that prevents interaction until the break ends.

## Install

**From the Chrome Web Store (recommended):**
Open the [store listing](https://chromewebstore.google.com/detail/stopdog-stay-focused-bloc/dmeljaoiocbohnfogibljkapijgpcehl) and click **Add to Chrome**.

**Run locally (for development):**
1. Clone this repository
2. Go to `chrome://extensions`
3. Enable **Developer mode**
4. Click **Load unpacked** and select the project folder

## Roadmap

More dogs are in training to join the pack:
- The Judgmental Shiba Inu
- The Intense Siberian Husky
- The Curious Corgi

## Privacy

STOPDog does not collect, store, or transmit any of your data. All settings stay locally on your device.

## Contact

Questions, feedback, or issues — open an issue on this repo or reach out at groupgroup.it@gmail.com

## License

Released under the [MIT License](LICENSE). <!-- Add a LICENSE file; MIT is a good default for a portfolio project. -->
