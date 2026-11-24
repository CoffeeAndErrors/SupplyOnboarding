# KOI · what's new (the founder video)

A 75-second film of KOI's new UI and the KOI agent. It is made from real footage
of the demo app: every line KOI says comes from the live model, and every figure
comes from the engine. Nothing is mocked. Remotion composes it: a caption band in
the brand's type, the store in a card, and a camera that eases in on what matters.

```
capture.mjs   drives the demo app in Chrome; records each clip into public/capture/<clip>/
contact.mjs   a contact sheet of one clip, to choose in and out points
stills.mjs    preview frames of the film, as one contact sheet
src/edit.js   the edit: captions, shots (source seconds → screen seconds), camera keys
src/KoiWhatsNew.jsx   the film: stage, caption band, card, drawn cursor, opening and close
```

Footage (`public/capture/`) and renders (`out/`) are not committed: about 720 MB.

## Make it again

1. Run the demo app from this worktree: `npm run dev:demo -- -p 3114` in `web/`.
   Back up `web/.demo/db.json` first, because the capture changes it.
2. Start a Chrome the script can drive, and leave it running:
   ```
   chrome --headless=new --remote-debugging-port=9333 --window-size=1440,900 \
          --force-device-scale-factor=2 --hide-scrollbars --user-data-dir=<a temp folder>
   ```
3. Install and capture, from this folder:
   ```
   npm install
   node capture.mjs all                 # reset the demo, then every clip in order
   node capture.mjs clip <name> [...]   # or one at a time; the state carries on
   node contact.mjs <clip>              # check what a clip caught
   ```
   KOI's replies are the live model's, so they vary between runs. If a clip comes
   out different, check its contact sheet and adjust that shot's times in `src/edit.js`.
4. Preview and render:
   ```
   node stills.mjs sheet.png 3 10 20 40   # frames at those seconds
   npm run render                          # out/koi-whats-new.mp4 (1920×1080, 30 fps, H.264)
   ```

The prompts in `capture.mjs` are the ones rehearsed for the founder demo: one request
per message. Keep away from the known traps:
- a bare age ("she's 64"; say "my 64-year-old mother");
- "diabetic";
- asking for macros;
- saving Advanced numbers on the test catalogue.

**Remotion licence.** Remotion is free for individuals and for companies of up to
3 people. A bigger company needs a company licence (remotion.dev/license).
