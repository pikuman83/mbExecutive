# Open Face Scorer

A web app that scores Open Face Chinese Poker hands for 2–4 players. It checks fouls, royalties, row points and scoops, tracks Fantasyland (including the progressive option) and keeps a running total. It works offline, and on a phone you can add it to your home screen.

## Entering cards

- **Tap grid (main way):** tap *Enter cards* on a player and tap the 13 cards. Cards held by other players are greyed out, so the same card can't be entered twice.
- **Scan photo (beta):** runs a card-detection model on the phone itself, with no account, no upload and no cost. The model (44 MB) downloads once and is then cached. It often misreads cards, so treat it as a first guess and fix mistakes in the grid.
- **Paste from a Claude chat:** send the photos in a Claude chat using the instructions in the app, then paste the reply.

## Hosting on Netlify (free)

The app is static files only, with no build step.

- **Connect a Git repo:** Netlify → *Add new site* → *Import an existing project* → GitHub → choose the repo and branch. Set **Base directory** to `ofc-app`, leave the **build command** empty, and set **Publish directory** to `ofc-app` (Netlify may show it as `.` relative to the base).
- **Or drag and drop:** open <https://app.netlify.com/drop> and drop the `ofc-app` folder.

## Third-party parts

- `vendor/`: [onnxruntime-web](https://github.com/microsoft/onnxruntime) 1.22.0, MIT licence.
- `model/cards.onnx`: YOLOv8s playing-card detector from [Hamza-Asif-ai/Playing-Card-Detection-YOLOv8](https://github.com/Hamza-Asif-ai/Playing-Card-Detection-YOLOv8). That repo has no licence file, and the model was trained with Ultralytics YOLOv8 (AGPL-3.0). It's fine for a private app among friends. Before publishing the app widely, ask the author for permission or replace the model with one you trained yourself.
