# Crucified

A pixel-art horror detective visual novel for our AP Lang *Crucible* project. You play a priest-detective sent to find a "demon" in a small town. There is no demon. One playthrough takes about 15 minutes.

## How to play
- Open `index.html` in Chrome by double-clicking it. You don't need to install anything, and it works on Chromebooks.
- Click or press **Space** to advance text, press **1-9** to pick choices, and press **J** to open the journal.
- Each question costs 1 hour, and you get 6 hours a day for 2 days. Every question can be asked **Kind**, **Direct**, or **Intimidate**, and each character reacts differently, like a Pokémon type chart.
- At each town meeting, choose up to 2 pieces of evidence to tell the town. Calm facts slow the hysteria meter, and shocking claims spike it. The meter always reaches 100% in the end, and that's the point.
- In the journal, connect two clues to make an inference.
- **Presenter mode** on the title screen shows notes explaining which theme each mechanic represents. Use it during the presentation.

## Changing the story (no coding needed)
Everything the game says is in **`story.js`**. Open it in any text editor (Notepad, VS Code, or the Chromebook Text app).
- Change only the text inside quotes `"like this"`.
- Keep the commas at the ends of lines.
- If your text needs quotation marks, use single ones `'like this'`.
- Save the file and refresh the browser. If the page goes blank, press F12 and the Console tab will name the line that broke.

The *Crucible* quotes are in the `quotes:` section at the top of `story.js`. **Check every quote against our copy of the play before we turn this in.**

## Adding our own art
Right now every picture is drawn by code as placeholder pixel art. To replace one, save a PNG into the `assets/` folder using the exact name below. The game uses it automatically next time you refresh, with no code changes.

**Backgrounds** (320×180 pixels, or any 16:9 size)
`bg_title.png`, `bg_town_day.png` (also the map), `bg_town_night.png`, `bg_memory.png`, `bg_church.png`, `bg_inn.png`, `bg_farm.png`, `bg_square.png`, `bg_house.png`, `bg_cottage.png`, `bg_shack.png`, `bg_clearing.png`, `bg_study.png`, `bg_barn.png`, `bg_courtroom.png`, `bg_jail.png`

**Characters** (transparent PNG, standing, roughly 1:2 width:height)
`char_<id>_<mood>.png`, where mood is `neutral`, `scared`, `angry`, or `sad`. If you only draw `neutral`, the game uses it for every mood.
The ids are `rarris`, `wibigail`, `jroctor`, `eliztor`, `abutit`, `pannama`, `cebeca`, `berity`, `reversa`, `fanforth` (the judge), and `detective` (you).
Example: `char_wibigail_angry.png`

**Map button positions:** if your town map art puts buildings in different spots, change the `x` and `y` numbers (in percent) in the `locations:` section of `story.js`.

## Music
Drop MP3 files into `assets/` with these names and they replace the built-in synth music: `music_day.mp3`, `music_night.mp3`, `music_trial.mp3`, and `music_ending.mp3`.
- `music_ending.mp3` plays during the folder-toss ending.
- The built-in music goes slightly out of tune for one moment, the first night at the shack. If you use your own night track, build that moment into it.
- Only use music we're allowed to use (our own, royalty-free, or Creative Commons). Copyrighted songs can get the itch.io page taken down.

## Sharing
- **Easiest:** zip this whole folder and send it. Teammates unzip it and double-click `index.html`.
- **Online (anyone can play from a link):** make a free itch.io account → Upload new project → Kind of project: **HTML** → upload the zip → check "This file will be played in the browser" → set the viewport to 960×540 → Save. Use "Draft" or "Restricted" if you don't want it public.
- **To edit together:** put the folder in a shared Google Drive folder or a GitHub repo, and take turns editing `story.js` so you don't overwrite each other.

## Files
| File | What it is |
|---|---|
| `index.html` | The page you open |
| `story.js` | **All the writing**: characters, dialogue, evidence, quotes, endings |
| `engine.js` | Game logic and the placeholder pixel art (you usually don't need to touch it) |
| `style.css` | Colors, fonts, and layout |
| `assets/` | Our art and music (optional) |
