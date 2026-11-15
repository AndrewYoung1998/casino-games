# Casino Academy

A collection of browser games for learning casino games and practicing to play them better. It's plain HTML, CSS and JavaScript, with no build step and no dependencies.

Open `index.html` to start. It's an animated home page with the full rules, payouts and strategy for each game, plus a house-edge comparison chart.

| Game | Rules guide | Interactive trainer |
|---|---|---|
| Blackjack | ✅ | ✅ [Card Counting Academy](games/blackjack/index.html) (11 stages) |
| Texas Hold'em | ✅ | Coming soon |
| Roulette | ✅ | Coming soon |
| Craps | ✅ | Coming soon |
| Baccarat | ✅ | Coming soon |
| Video Poker | ✅ | ✅ [Video Poker](games/videopoker/index.html) (6 stages) |
| Three Card Poker | ✅ | ✅ [Three Card Poker](games/threecard/index.html) (5 stages) |
| Pai Gow Poker | ✅ | Coming soon |

## Project structure

```
casino-games/
├── index.html                Hub / dashboard page
├── css/
│   ├── main.css              Hub styles
│   ├── shared/base.css       Shared trainer styles: colors, buttons, tabs, quizzes, cards, table layout
│   └── <game>/<game>.css     Game-only styles
├── js/
│   ├── components.js         Hub visuals: mini cards, chips, dice, roulette wheel
│   ├── games-data.js         Rules, payouts, strategy, odds and stage counts for every game
│   ├── main.js               Builds the hub, progress bars and rules panel
│   ├── shared/
│   │   ├── core.js           Helpers + deck/shuffle + card rendering
│   │   ├── progress.js       Saves progress per game (read by the hub)
│   │   ├── poker.js          3- and 5-card poker hand evaluator
│   │   └── academy.js        Trainer shell: stage list, lesson/practice tabs, quiz runner
│   ├── threecard/            rules · stages · table-sim · app
│   ├── videopoker/           strategy (paytable + 16-step hold ladder) · stages · machine · app
│   └── blackjack/
│       ├── cards.js          Counting systems, count tally, discard tray
│       ├── strategy.js       Hand values, basic strategy, Illustrious 18, bet ramp
│       ├── table-sim.js      Casino Floor table simulator
│       ├── stages.js         Lessons and drills for all 11 stages
│       └── app.js            Starts the trainer (loads last)
├── img/
│   ├── hub/                  Images for the hub (none yet)
│   └── <game>/               Images per game (none yet)
└── games/
    ├── blackjack/index.html
    ├── threecard/index.html
    └── videopoker/index.html
```

### Adding a game

Each game uses the same folder name everywhere. For a game called `roulette`:

1. Create `games/roulette/index.html`. Copy the blackjack page and swap in the roulette CSS and JS files.
2. Put styles in `css/roulette/roulette.css`. It loads after `css/shared/base.css`.
3. Put scripts in `js/roulette/`. Load the three `js/shared/` files first, then define `STAGES` and finish with:
   ```js
   createAcademy({ id:'roulette', title:'Roulette Academy', subtitle:'…', stages:STAGES });
   ```
4. Put any images in `img/roulette/`.
5. In `js/games-data.js`, set `status:'live'` and `href:'games/roulette/index.html'`. The hub then shows a progress bar for the game automatically.

Progress is stored in the browser's localStorage under `casino-academy:<game id>`.

Scripts are plain `<script>` tags loaded in order, with no modules and no bundler, so the site works when you open the files directly or host them anywhere. Link to pages with an explicit `index.html` so the links also work from `file://`.

Uses play money only. Every casino game has a house edge.
