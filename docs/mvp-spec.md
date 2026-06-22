# Chess Platform MVP Specification

## 1. MVP Goal

Build a browser-based chess platform where a user can:

- play a game against the computer;
- play a game against another human online;
- use time controls, including increment per move;
- give one side a time handicap;
- receive a final result and rating change;
- save the game in PGN;
- view their own games and open any completed game.

The MVP should validate the main product loop: "sign in -> choose game type -> play -> get a result -> find the game in history".

## 2. Platforms

### 2.1 MVP

- Browser application for desktop and mobile web.
- Responsive UI without a separate mobile application.

### 2.2 After MVP

- Mobile applications using the shared backend API.
- Possible desktop client, for example Python/PySide, Electron, or Tauri, if there is a practical reason to build one.

## 3. Users and Roles

### 3.1 Guest

A guest may:

- open the site;
- play a quick local or temporary guest game against the computer, if this does not slow down the MVP;
- see a prompt to register in order to keep rating and game history.

For the baseline MVP, guest mode may be postponed if it makes the authenticated flow slower to deliver.

### 3.2 Registered User

A registered user can:

- sign in;
- play against the computer;
- play against another human online;
- see their rating;
- see their game history;
- open PGN for completed games;
- change basic interface settings.

### 3.3 Administrator

An admin panel is not required for the MVP. The minimum technical capability should be:

- inspect users and games at the database level;
- manually disable a problematic user if moderation is implemented.

## 4. Core MVP Scenarios

### 4.1 Registration and Sign-In

A user can:

- register with email and password;
- sign in with email and password;
- sign out;
- password recovery may be postponed if the MVP uses simple authentication.

Minimum user data:

- `id`;
- `email`;
- `displayName`;
- `createdAt`;
- `lastSeenAt`;
- ratings by pool.

### 4.2 Play Against Computer

The user chooses:

- color: white, black, or random;
- time control;
- increment per move;
- time handicap, if needed;
- computer level.

Computer levels in the MVP:

- Beginner;
- Casual;
- Club;
- Advanced.

Computer strength must be controllable through:

- search depth limit;
- move time limit;
- probability of a suboptimal move on lower levels;
- fixed estimated strength in Elo-like values.

For the MVP, it is acceptable to use an existing chess engine, such as Stockfish through a server process or WebAssembly. The engine must be isolated behind an internal interface so the implementation can be replaced later.

### 4.3 Play Against Human Online

A user can:

- create a game with selected settings;
- get an invite link;
- join a game through an invite link;
- play the game in real time;
- see the opponent connection status;
- receive a result on checkmate, stalemate, resignation, timeout, or draw.

For the first MVP, matchmaking can be simplified:

- required scenario: game by invite link;
- optional scenario: search queue by nearby rating.

### 4.4 Time Control

The MVP must support:

- base time for each player;
- increment after each completed move;
- different starting time values for white and black;
- time handicap for the human when playing against the computer;
- time handicap for one of the players in an invite-link human game.

Example presets:

- 1+0 bullet;
- 3+0 blitz;
- 3+2 blitz;
- 5+0 blitz;
- 10+0 rapid;
- 15+10 rapid;
- custom.

Requirements:

- the server is the source of truth for time;
- the client displays a local timer, but flagging is confirmed by the server;
- time is deducted from the player whose turn it is;
- increment is added after a legal move;
- on reconnect, the client receives the current clock state from the server.

### 4.5 Chess Rules

The platform must correctly handle:

- move legality;
- check;
- checkmate;
- stalemate;
- castling;
- en passant;
- pawn promotion;
- rejecting moves with the wrong side's pieces;
- rejecting moves after the game has ended;
- insufficient material;
- draw by agreement can be postponed or implemented as a simple offer/accept flow;
- the 50-move rule and threefold repetition should preferably be supported by the chess rules library, even if the UI remains simple.

The platform should not implement chess rules manually unless there is a strong reason. Use a proven move generation and validation library.

### 4.6 Elo Rating

The MVP needs a clear rating model, even if it is intentionally simple.

Requirements:

- separate rating for human games;
- separate rating for computer games or training games;
- starting rating: 1200;
- rating is updated after a completed rated game;
- rating is not changed for an aborted game before the first move;
- rating before and after the game is stored.

Baseline formula:

- expected score: `1 / (1 + 10 ^ ((opponentRating - playerRating) / 400))`;
- new rating: `rating + K * (score - expectedScore)`;
- MVP K-factor: 32;
- score: 1 for win, 0.5 for draw, 0 for loss.

Each computer level receives an estimated rating, for example:

- Beginner: 700;
- Casual: 1000;
- Club: 1300;
- Advanced: 1600.

Later this can be replaced with Glicko-2 or a more accurate model.

### 4.7 Game Persistence

Each completed game must be saved:

- in the database as a structured record;
- in PGN as exportable text;
- with the full move sequence;
- with the final result;
- with timing and participant metadata.

Minimum PGN tags:

- `Event`;
- `Site`;
- `Date`;
- `White`;
- `Black`;
- `Result`;
- `WhiteElo`;
- `BlackElo`;
- `TimeControl`;
- `Termination`.

Additional internal fields:

- `gameId`;
- `rated`;
- `mode`;
- `initialFen`;
- `finalFen`;
- `createdAt`;
- `startedAt`;
- `endedAt`;
- `terminationReason`;
- `whiteClockInitialMs`;
- `blackClockInitialMs`;
- `incrementMs`;
- `whiteClockRemainingMs`;
- `blackClockRemainingMs`.

### 4.8 Game History

A user can open the "My Games" page and see:

- date;
- mode: against computer or against human;
- color;
- opponent;
- time control;
- result;
- rating change;
- move count.

A user can:

- open the game details page;
- review the position move by move;
- copy or download PGN.

MVP filters:

- all games;
- computer games only;
- human games only;
- wins, draws, losses.

Advanced filters and search can be postponed.

## 5. MVP Screens

### 5.1 Home Screen

Contains:

- current user rating;
- quick actions: "Play Computer", "Play Human", "My Games";
- the latest few games.

### 5.2 Game Creation Screen

For computer games:

- color selection;
- computer level;
- time control;
- increment;
- time handicap.

For human games:

- color selection or random;
- time control;
- increment;
- time handicap;
- rated/unrated;
- create invite link button.

### 5.3 Game Screen

Contains:

- chessboard;
- white and black clocks;
- move list;
- side-to-move indicator;
- game status;
- "Resign" and "Offer Draw" buttons for human games;
- "New Game" button after completion;
- PGN link after completion.

### 5.4 Game History

Contains:

- table or list of games;
- basic filters;
- link to the game page.

### 5.5 Game Review

Contains:

- board with move navigation;
- PGN;
- game metadata;
- result and rating change.

## 6. Server Requirements

### 6.1 Game Service

Responsible for:

- creating games;
- storing game state;
- validating moves;
- updating clocks;
- ending games;
- calculating results;
- calculating ratings;
- generating PGN.

### 6.2 Real-Time Transport

Online play requires a real-time channel:

- WebSocket or compatible transport;
- client subscription to a specific game;
- move submission to the server;
- broadcasting the new state to both players;
- reconnect with current game snapshot.

### 6.3 Engine Service

Responsible for:

- choosing the computer move;
- configuring strength level;
- timeout for calculation;
- returning a move in UCI or SAN format;
- handling engine errors.

### 6.4 Persistence

The system must store:

- users;
- ratings;
- games;
- game participants;
- moves;
- time events;
- PGN or enough data to generate it.

## 7. Preliminary Data Model

### 7.1 User

- `id`;
- `email`;
- `displayName`;
- `passwordHash`;
- `createdAt`;
- `updatedAt`;
- `lastSeenAt`.

### 7.2 Rating

- `id`;
- `userId`;
- `pool`: `human`, `computer`;
- `value`;
- `gamesPlayed`;
- `updatedAt`.

### 7.3 Game

- `id`;
- `mode`: `computer`, `human`;
- `status`: `waiting`, `active`, `completed`, `aborted`;
- `rated`;
- `timeControl`;
- `incrementMs`;
- `initialFen`;
- `currentFen`;
- `pgn`;
- `result`: `1-0`, `0-1`, `1/2-1/2`, `*`;
- `terminationReason`;
- `createdAt`;
- `startedAt`;
- `endedAt`.

### 7.4 GameParticipant

- `id`;
- `gameId`;
- `userId`;
- `side`: `white`, `black`;
- `kind`: `human`, `engine`;
- `displayName`;
- `ratingBefore`;
- `ratingAfter`;
- `clockInitialMs`;
- `clockRemainingMs`.

### 7.5 Move

- `id`;
- `gameId`;
- `moveNumber`;
- `side`;
- `uci`;
- `san`;
- `fenAfter`;
- `clockBeforeMs`;
- `clockAfterMs`;
- `createdAt`.

## 8. Non-Functional Requirements

### 8.1 Reliability

- the server must not accept illegal moves;
- resubmitting the same move must not corrupt the game;
- after connection loss, the user can return to an active game;
- completed games are immutable.

### 8.2 Performance

- a player move should appear visually quickly;
- server confirmation should usually arrive within 300 ms, excluding network latency;
- computer move calculation must have a time limit;
- game history must support pagination.

### 8.3 Security

- passwords are stored only as hashes;
- a user cannot move for the opponent's side;
- a user cannot read private unfinished games unless they are a participant;
- PGN for completed games may be public or private depending on product policy.

### 8.4 Scalability

- game logic is separated from UI;
- the chess engine is isolated behind a service or adapter;
- the API is suitable for future mobile and desktop clients.

## 9. MVP Scope

Included in the MVP:

- authentication;
- play against computer;
- play against human by invite link;
- time controls and increment;
- time handicap;
- Elo rating;
- PGN;
- game history;
- completed game review.

Not included in the MVP:

- full public matchmaking;
- tournaments;
- post-game engine analysis;
- puzzles;
- chat;
- anti-cheat;
- moderation;
- social features;
- mobile apps;
- desktop app;
- advanced rating systems.

## 10. MVP Acceptance Criteria

The MVP is complete when:

- a user can register and sign in;
- a user can complete a game against the computer;
- a user can create a human game link, and a second user can join and play;
- the server rejects illegal moves;
- clocks deduct time correctly and add increment correctly;
- a game ends by checkmate, stalemate, resignation, and timeout;
- PGN is generated after game completion;
- the game appears in the history of both participants;
- rating changes after a rated game;
- a completed game can be opened and reviewed move by move.

## 11. Open Questions

- Should guest mode be part of the first MVP, or should all games require registered users?
- Should human games be rated by default?
- Should draw offers be included in the MVP?
- Should public viewing of other users' completed games be allowed?
- Which technology stack should be used for the first browser MVP?
- Should the MVP be English-only, Russian-only, or bilingual from the start?
