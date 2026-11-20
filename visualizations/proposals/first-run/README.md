# First-run wireframes

Review only. No production app files or persisted records are changed. Serve the repository root and open `visualizations/proposals/first-run/`.

Eight review routes: no games, no contacts, your contact, saved contact, banker selection, no history, no insights, and a created table with no players. Contact form → success → create game preselects the entered name as banker. Data lives only in page memory and disappears on reload. Direct saved-state routes use Alex Morgan as an example. No app storage, cloud access or network submission.

Intent: self contact is optional; create a game remains the primary home action. Saving a contact does not seat it, record money or create an account. Full name is required; phone/photo optional. The wireframe photo control represents the proposed picker; this preview does not process or retain selected files. Contacts created outside a table should save without forcing a buy-in. Future production implementation must preserve stable contact IDs and audited storage.

Tournament setup and buy-in review stay outside this preview’s scope. Tournament CTA opens the existing tournament-setup wireframe.

Verified: all eight routes at 320px in dark/light themes without page overflow; no missing images or captured console errors. Browser exercised blank-name feedback, name-only save, selected banker and empty created table; desktop reviewed at 1280px. Production tests/build were not rerun because only this separate proposal changed.
