# Kidopia mobile-first demo

## Files
- `index.html` — page structure
- `style.css` — responsive mobile-first design
- `app.js` — demo interactions and local browser storage

## Publish with GitHub Pages from Android
1. Open your repository in Chrome.
2. Upload these three files to the repository root (same folder as each other).
3. Commit the changes.
4. Open Settings → Pages.
5. Choose **Deploy from a branch**, branch `main`, folder `/(root)`, then Save.
6. Wait a few minutes and open the Pages URL.

## Demo features
- Child profile with nickname, username and avatar
- Demo parent PIN (default `2468`)
- Parent-created questions
- Quiz and number guessing game
- Earn and spend stars
- Pet collection and accessory shop
- Responsive bottom navigation

## Important limitations
This is a front-end learning prototype. It does NOT provide real email registration, secure login, secure parent verification, cloud sync, or protection against a child changing browser data. The PIN is visible in `app.js` and is only a demo gate. Data is stored in the current browser using localStorage and may disappear if browser data is cleared.

For a real service used by families, add a trusted backend and authentication, server-side parent verification, data validation, privacy protections, and parental consent appropriate to the places where it is offered. Do not collect children's sensitive personal information in this demo.

The site uses Google Fonts from the internet; if offline, it falls back to system fonts.


## Version 1.2 arcade games
- Tic Tac Toe: two-player game on one device; a Player O win triggers a parent-question gate, and Player X wins earn 5 stars.
- Lane Race: choose one of three lanes for five rounds; hitting a cone triggers a parent-question gate.
- Star Shooter: a safe tap-the-stars game; avoid clouds, and three misses trigger a parent-question gate. Collect five stars to earn 5 points.
