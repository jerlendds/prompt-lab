<a href="https://chrome.google.com/webstore/detail/chatgpt-history/jjdnakkfjnnbbckhifcfchagnpofjffo/"><img src="https://user-images.githubusercontent.com/12115686/206926802-0461dc64-84cd-42de-8c17-74a7ee64528c.png" style="width: 180px !important; height: 50px !important"></a> <a href="https://www.reddit.com/r/ChatGPTPromptGenius/"><img src="https://user-images.githubusercontent.com/12115686/211184170-6aea6981-abd4-447c-bd3d-199d1688011f.png" style="width: 50px !important"></a> <a href="https://ko-fi.com/bennyfi" target="_blank"><img src="https://storage.ko-fi.com/cdn/kofi3.png?v=3" alt="Buy Me A Coffee" style="height: 40px !important;width: 173px !important;" ></a> <a href="http://creativecommons.org/licenses/by-nc-sa/4.0/"><img src="https://licensebuttons.net/l/by-nc-sa/4.0/88x31.png" style="height: 48px !important"></a>


Prompt Lab is a Firefox extension that allows you to curate a custom library of AI Prompts, upgrade the ChatGPT chat styles, add some additional features to OpenAIs ChatGPT interface, and retrieve and store your ChatGPT history. View [studium.dev/tech/prompt-lab](https://studium.dev/tech/prompt-lab) for more details about my motivation and journey in forking and enhancing this into a Firefox extension.  

## TODO

- [x] replace react w/ preact
- [x] update tailwindcss
- [x] remove the ads
- [ ] fix the code
- [ ] remove the themes
- [ ] be opinionated with sane defaults
- [ ] build my way better version

## Tech Stack
- React
- Tailwind CSS
- remark.js
- Firefox extension APIs

## Installation
- Chrome - May or may not work, I'm focusing on Firefox support. Trial at your own risk.
- Firefox - to be continued...

## License
Shield: [![CC BY-NC-SA 4.0][cc-by-nc-sa-shield]][cc-by-nc-sa] 

This work is licensed under a
[Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License][cc-by-nc-sa].

[![CC BY-NC-SA 4.0][cc-by-nc-sa-image]][cc-by-nc-sa]

[cc-by-nc-sa]: http://creativecommons.org/licenses/by-nc-sa/4.0/ 
[cc-by-nc-sa-image]: https://licensebuttons.net/l/by-nc-sa/4.0/88x31.png 
[cc-by-nc-sa-shield]: https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg 


---

Forked from AI Prompt Genius - https://github.com/benf2004/AI-Prompt-Genius
@benf2004 - https://github.com/benf2004/ - Original Creator
View the full list of contributors to the original at https://github.com/benf2004/AI-Prompt-Genius/graphs/contributors


---

# Excerpts from GPT5 Generated Overview of where I want to take this


---

## Phase 3.3: Core Implementation

### Browser extension surfaces (wiring; thin)

* [ ] **T037** Background script: message bus, storage init, panic toggle (`src/background/index.ts`)
* [ ] **T038** Content script (ChatGPT adapter): input detection, insertion API, selector watchdog, auto-disable banner (`src/content/chatgpt_adapter.ts`)
* [ ] **T039** Enhancer module: markdown render, syntax code copy, collapsible long blocks, per-feature toggles (`src/content/enhancer.ts`)
* [ ] **T040** UI: Library panel (browse/search/filter/sort/favorites) (`src/ui/library_panel.tsx`)
* [ ] **T041** UI: Template fill dialog (required/optional with validators) (`src/ui/template_dialog.tsx`)
* [ ] **T042** UI: Discover view (curated sources, preview, import) (`src/ui/discover_view.tsx`)
* [ ] **T043** UI: Share modal (URL-fragment, IPFS share, QR) (`src/ui/share_modal.tsx`)
* [ ] **T044** UI: Settings (toggles, shortcuts, analytics opt-in, retention ≤30d) (`src/ui/settings_page.tsx`)
* [ ] **T045** Keyboard handler for Up-Arrow history + Esc cancel with visual cue (`src/content/history_input.ts`)

---

## Phase 3.4: Integration

* [ ] **T046** Wire LibraryService to storage layer (local-first; persistence across restarts) (`src/services/library_service.py`)
* [ ] **T047** Hook UsageService increments on insertion events; expose counters to UI (`src/services/usage_service.py`)
* [ ] **T048** Connect content adapter to Enhancer toggles; degrade on selector failures (`src/content/chatgpt_adapter.ts`)
* [ ] **T049** Import path: IPFS fetch → integrity check → preview → save (`src/services/ipfs_share_service.py`, `src/ui/discover_view.tsx`)
* [ ] **T050** Export/import library as JSON (versioned) (`src/services/library_service.py`, `src/ui/settings_page.tsx`)
* [ ] **T051** Telemetry opt-in gate + retention purge job (`src/services/telemetry_service.py`)

---

## Phase 3.5: Polish

* [ ] **T052 \[P]** Unit tests for variable validators & edge cases (`tests/unit/test_template_validators.py`)
* [ ] **T053 \[P]** Unit tests for search/sort/favorites semantics (`tests/unit/test_library_queries.py`)
* [ ] **T054 \[P]** Unit tests for URL-fragment encoding/limits (`tests/unit/test_share_fragment.py`)
* [ ] **T055 \[P]** Unit tests for CID recomputation + signature verification paths (`tests/unit/test_ipfs_verification.py`)
* [ ] **T056** Performance: library search p95 < 50ms on 5k prompts; render enhancer overhead budget defined (`tests/perf/test_perf_budgets.py`)
* [ ] **T057 \[P]** Update `docs/quickstart.md` and `docs/api.md` with models & public services
* [ ] **T058** Duplication pass & small refactors (keep public contracts stable)
* [ ] **T059** Manual QA script for acceptance scenarios (`manual-testing.md`)

---

## Dependencies

* **Tests before implementation**: T004–T023 must exist and fail before starting T024+
* **Models**: T024–T029 block their respective Services (T030–T036)
* **Services**: T030–T036 block UI/Content wiring (T037–T045)
* **Integration**: T046–T051 depend on corresponding Services/UI being present
* **Polish**: T052–T059 after Integration wiring is in place

---

## Parallel Execution Examples

```
# Kick off independent contract tests in parallel
T004, T005, T006, T007, T008, T009, T010, T011, T012, T013, T014, T015, T016

# After models exist, parallelize service implementations
T030, T031, T032, T033, T034, T035, T036

# UI pieces can parallelize once services’ interfaces are stable
T040, T041, T042, T043, T044
```

---

## Validation Checklist (generator gate)

* [x] All contracts have corresponding tests (T004–T016)
* [x] All entities have model tasks (T024–T029)
* [x] All tests precede implementation tasks
* [x] \[P] tasks touch different files or are clearly independent
* [x] Every task names an exact file path

---

If you want this emitted to `/specs/prompt-lab/tasks.md` in your repo style, say the word and I’ll output it verbatim, ready to commit.
