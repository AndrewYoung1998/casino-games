# Casino Academy

A collection of browser games for learning casino games and practicing to play them better. It's plain HTML, CSS and JavaScript, with no build step and no dependencies.

Open `index.html` to start. It's an animated home page with the full rules, payouts and strategy for each game, plus a house-edge comparison chart.

| Game | Rules guide | Interactive trainer |
|---|---|---|
| Blackjack | ✅ | ✅ [Card Counting Academy](games/blackjack/index.html) (11 stages) |
| Texas Hold'em | ✅ | ✅ [Texas Hold'em](games/holdem/index.html) (8 stages) |
| Roulette | ✅ | ✅ [Roulette](games/roulette/index.html) (5 stages) |
| Craps | ✅ | ✅ [Craps](games/craps/index.html) (7 stages) |
| Baccarat | ✅ | ✅ [Baccarat](games/baccarat/index.html) (5 stages) |
| Video Poker | ✅ | ✅ [Video Poker](games/videopoker/index.html) (6 stages) |
| Three Card Poker | ✅ | ✅ [Three Card Poker](games/threecard/index.html) (5 stages) |
| Pai Gow Poker | ✅ | ✅ [Pai Gow Poker](games/paigow/index.html) (6 stages) |
| Slots | ✅ | ✅ [Slots](games/slots/index.html) (10 stages, 4 machines) |

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
│   │   ├── poker.js          3-, 5- and 7-card poker hand evaluators
│   │   └── academy.js        Trainer shell: stage list, lesson/practice tabs, quiz runner
│   ├── baccarat/             rules (tableau) · stages · table-sim · app
│   ├── craps/                rules (dice math, roll resolver) · stages · table-sim · app
│   ├── holdem/               math (equity, outs, ranges) · engine (betting, side pots) · bots · stages · table-sim · app
│   ├── paigow/               rules (joker eval, House Way) · setter · stages · table-sim · app
│   ├── roulette/             rules (wheels, bets, layout) · stages · table-sim · app
│   ├── slots/                machines (reel math for all 4 machines) · symbols · stages · floor (playable cabinets) · app
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
    ├── baccarat/index.html
    ├── blackjack/index.html
    ├── craps/index.html
    ├── holdem/index.html
    ├── paigow/index.html
    ├── roulette/index.html
    ├── slots/index.html
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

### Share previews

Every page has description, Open Graph and Twitter tags (inside `<!-- share / SEO metadata -->`) that point to `img/<game>/og-image.png` (1200×630). For a new game, copy the block from another game page and update the title, description, URL and image. Shared icons live in `img/hub/` (`favicon.svg`, `apple-touch-icon.png`).

Progress is stored in the browser's localStorage under `casino-academy:<game id>`.

Scripts are plain `<script>` tags loaded in order, with no modules and no bundler, so the site works when you open the files directly or host them anywhere. Link to pages with an explicit `index.html` so the links also work from `file://`.

Uses play money only. Every casino game has a house edge.
