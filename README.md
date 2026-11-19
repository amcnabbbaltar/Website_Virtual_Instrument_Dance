# Dance Cards

A webcam dance game: movement makes the music. MediaPipe Pose tracks the body. Everything runs on your computer, with no internet needed at the dance space.

The same game runs in three ways:

| Way | What you need | Offline? |
|---|---|---|
| **A. Website** | Any modern browser (Chrome or Edge recommended) | Yes, after the first visit (it installs itself as an app) |
| **B. Max** | Max 8 or 9. Max runs patches for free; a license is only needed to *save edits* | Yes, always |
| **C. Local folder** | Python (macOS/Linux usually have it) | Yes, always |

---

## How to play

1. **Swipe** a hand sideways in front of the camera. A **choreography card** appears and is read aloud.
2. **Choose an instrument.** Raise a hand and point it toward one of the 4 tiles (Synth, Piano, Bells, Drums). Hold still until the tile fills up.
3. **Dance.**
   - **Height of your highest hand → which chord plays.** There are 6 chords, from hip level up to above your head. The ladder on the right shows where you are.
   - **How much your body moves → reverb.** Bigger movement gives more reverb.
   - **Distance between your hands → brightness.** Open arms make the synth brighter.
   - **A quick punch or flick** replays the chord (piano, bells, drums).
   - **Drums:** hand height picks kick, snare, tom, hat or crash. A hi-hat groove fades in when you move a lot.
4. **New card:** hold **both hands above your head** for 1.5 s. You can change this in Settings.

Keyboard, for a helper: **Space** new card · **1–4** instrument · **A** ambient on/off · **M** mute · **F** full screen · **S** settings · **Esc** back to start.

Everything is measured relative to the dancer's own shoulders. It works close to or far from the camera, standing or seated.

## Your prompt cards

Edit **`prompts.txt`**: one prompt per line. Lines starting with `#` are ignored. Save the file and reload the page.
You can also paste prompts into **Settings → Prompt cards**. They are saved in that browser and replace prompts.txt until you clear the box.

## Ambient soundscape

Put your file in the **`ambient`** folder:
- Website / local folder: name it **`ambient.mp3`**. You can also pick any file in Settings → Ambient file.
- Max: name it **`ambient.wav`** (mp3 also works on most systems).

Turn it on or off with **A**, the Settings button, or the toggle in the Max patch.

## Accessibility (Settings ⚙)

- **Movement sensitivity:** raise it so that small movements are enough.
- **Seated mode:** ignores the legs.
- **Hold time to choose:** how long to hold over a tile.
- **Read cards aloud:** uses the voices installed on the computer, which work offline. Voices marked "needs internet" won't work at the venue.
- Large, high-contrast text throughout. Camera image can be hidden.

---

## A. Put it on a website

Upload the whole folder (keep the structure) to any static host. Camera access requires **https**.
- **Easiest:** go to app.netlify.com/drop and drag the folder in. You get a link in seconds.
- Or GitHub Pages, Cloudflare Pages, or your own site.

Open the link once **while online**, then click Start. The page saves itself, including the tracker, so after that it works with **no internet**.
In Chrome or Edge, click "Install app" in the address bar to get a desktop icon.

## B. Run it in Max

Open **`max/DanceCards.maxpat`**. It:
1. starts a tiny local server with `node.script server.js` (built into Max, no install);
2. opens the game inside `[jweb]`;
3. turns movement into **MIDI**: chords on channel 1, General MIDI drums on channel 10, reverb as CC 91, brightness as CC 74, instrument as a program change;
4. plays the ambient file through `sfplay~`.

Double-click `[noteout 1]` / `[noteout 10]` to choose an output. The computer's built-in synth works (it has General MIDI piano, pads and drums), or send it to Ableton or another DAW for better sounds.
In Settings → "Sound comes from", choose **This page** to use the browser sounds instead, or **Both**.
Max can also control the page: `newcard`, `ambient`, `instrument piano`. Any incoming MIDI note draws a new card, so a foot pedal works.

**Why the old patch failed offline:** most MediaPipe-in-Max examples load MediaPipe from the internet (a CDN) each time. This version ships the tracker files in `mediapipe/pose/`, so nothing is downloaded.

## C. Run from the folder (no Max, no website)

- macOS: double-click `start-mac.command`. If macOS blocks it the first time, right-click it and choose Open.
- Windows: double-click `start-windows.bat`. Needs Python from python.org or the Microsoft Store.

This opens the game at `http://localhost:8137`. Double-clicking `index.html` alone **won't work**: browsers block the tracker files on `file://` pages.

---

## Tweaking

- Chords: edit `CHORDS` at the top of `audio.js`. The key can be changed in Settings.
- Add an instrument: add it to `INSTRUMENTS` in `audio.js` and give it a sound in `playChord`.
- Slower computer: add `?model=0` to the address to use the lighter tracker.

Credits: MediaPipe Pose (Google, Apache-2.0).
