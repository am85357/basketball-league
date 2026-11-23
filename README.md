# League Central — Basketball League Website

A responsive, professional-looking basketball league website for a six-team league. It includes:
- Weekly schedule with clickable games and player box scores
- Cumulative player totals (games, points, rebounds, PPG, RPG)
- Top 10 points and rebounds leaders
- Teams directory
- Google Sheets CSV connection; the site is read-only for visitors

## Files
- `index.html` — page structure
- `styles.css` — professional navy/orange design
- `app.js` — schedule, box scores and statistics calculations
- `config.js` — league name and Google Sheets URLs
- `League-Stats-Template.xlsx` — spreadsheet template

## 1. Prepare the spreadsheet
1. Upload `League-Stats-Template.xlsx` to Google Drive and open it with Google Sheets.
2. Rename the six placeholder teams in the `Teams` tab.
3. Add games to `Games`. Use unique IDs such as `G1`, `G2`, `G3`. `week` should be a number such as `1`. For an unplayed game, leave scores blank and set status to `Upcoming`. For a completed game, enter both scores and set status to `Final`.
4. After each game, add one row per player to `PlayerStats`. Use the same `game_id` as the matching row in `Games`. Enter that player's team name exactly as it appears in `Teams`.
5. Do not change the column headings. A player should have one row per game.

### Spreadsheet column headings

**Teams:** `team_id, team_name, color`

**Games:** `game_id, week, date, time, home_team, away_team, home_score, away_score, status`

**PlayerStats:** `game_id, player_name, team_name, points, rebounds`

Date format: `YYYY-MM-DD` is recommended. Use `Final` and `Upcoming` for status.

## 2. Publish each Google Sheets tab as CSV
For each of the three tabs (Teams, Games, PlayerStats):
1. In Google Sheets, choose **File → Share → Publish to web**.
2. Choose the individual tab, not the entire workbook.
3. Choose **Comma-separated values (.csv)** as the format, then click **Publish**.
4. Copy the published URL for that tab.

Google's menus may vary slightly. The published CSV is readable by anyone who has the link, so only include information you are comfortable making public. Do not put private contact details in these tabs.

## 3. Connect the website to the spreadsheet
Open `config.js` and paste the three URLs between the quotes:

```js
window.LEAGUE_CONFIG = {
  leagueName: "YOUR LEAGUE NAME",
  seasonLabel: "2026 SEASON",
  teamsCsvUrl: "PASTE_TEAMS_CSV_URL",
  gamesCsvUrl: "PASTE_GAMES_CSV_URL",
  playerStatsCsvUrl: "PASTE_PLAYERSTATS_CSV_URL"
};
```

Save the file. The site will load your live published spreadsheet data. Visitors can view the stats but cannot edit the spreadsheet through the site.

## 4. Publish free with GitHub Pages
1. Create or sign in to a GitHub account at https://github.com.
2. Click **New repository**. Name it `basketball-league` (or another name). Set it to **Public** for the simplest GitHub Free setup.
3. Upload the website files and folders from this project to the repository. Make sure `index.html` is in the repository's top level, not inside another nested folder.
4. Open the repository's **Settings → Pages**.
5. Under **Build and deployment**, choose **Deploy from a branch**.
6. Choose branch `main` and folder `/(root)`, then click **Save**.
7. Wait for the deployment to finish. GitHub will show the published URL in Settings → Pages. For a project named `basketball-league`, it will look like `https://YOUR-USERNAME.github.io/basketball-league/`.

Updates pushed to the selected branch are published automatically. It can take several minutes for a change to appear.

## 5. Weekly workflow
1. Add the week's games to `Games`.
2. After each game, enter the final score and change status to `Final`.
3. Add each player's points and rebounds to `PlayerStats`.
4. The schedule, box score, cumulative totals and leaders update from the spreadsheet. Google Sheets may take a short time to refresh its published CSV.

## Notes / limitations
- The public website is view-only. Anyone can see the published statistics.
- Do not put private or sensitive player information in the public spreadsheet.
- The current version tracks points and rebounds only. Assists, steals, blocks, standings, team records and admin editing can be added later.
- This starter uses sample preview data until the Google Sheets URLs are connected.
