# CoachFace Mega-Scale Product Build

## Confirmed product scope

CoachFace will launch as one combined four-sport platform for baseball, football, basketball, and soccer. It includes a public coach intelligence product, free fantasy contests, full user profiles, explainable scoring, licensed live sports data, editorial review, and administrative overrides.

## Foundation completed

- Lovable Cloud database, authentication, realtime delivery, and server-side capabilities are connected.
- Email and Google account access are configured with leaked-password protection.
- The production data model covers profiles, separate secure roles, sports, leagues, teams, coaches, games, versioned scoring rules, immutable score events, score totals, contests, entries, and roster picks.
- Row-level access rules protect user information and restrict scoring or administrative changes to authorized roles.
- Games, score events, and coach totals can broadcast live updates to connected clients.

## Delivery sequence

### Phase 1: Accounts and core product

- Complete onboarding, profile editing, favorite teams and sports, notification preferences, and account recovery.
- Replace fictional homepage data with public database reads and clear empty/loading/error states.
- Build coach directory, coach detail, live scores, schedules, rankings, contest lobby, roster builder, and personal entries.
- Add an authenticated operations console for sports configuration, coaches, scoring rules, contests, and staff roles.

### Phase 2: Licensed feed and scoring pipeline

- Select and contract one licensed provider with coverage across all four sports.
- Store the provider key securely, never in browser code.
- Implement a provider adapter that converts vendor payloads into a stable internal event format.
- Add signed webhook ingestion where supported, scheduled polling as fallback, idempotency, retries, dead-letter handling, and source health monitoring.
- Run deterministic versioned scoring against normalized events. Every score must preserve evidence, rule version, confidence, and review state.
- Publish approved events and update game, coach, roster, and leaderboard totals atomically.

### Phase 3: Live fan experience

- Subscribe only to the live games, contests, and rankings a viewer is actively watching.
- Push score diffs instead of repeatedly downloading full leaderboards.
- Add live game centers, score explanations, movement indicators, roster impact, alerts, and finalization states.
- Support corrections by superseding events rather than deleting history, then replay affected totals.

### Phase 4: Scale, media, and intelligence

- Add editorial articles, Fantasy Coach Insider programming, show pages, voting, and producer workflows.
- Generate cited AI recaps only from approved CoachFace events and source data.
- Add caching, search, analytics, performance budgets, operational dashboards, alerting, backups, and recovery drills.
- Introduce premium analytics, private leagues, sponsor modules, and white-label distribution after free-product retention is proven.

## Required external dependency

The live pipeline can be finished after selecting the licensed sports-data provider and securely connecting its API credentials. The internal provider-neutral model prevents vendor lock-in.

## Preliminary assessment

CoachFace has a clear and still understandable core idea: **fans draft and score real coaches, coordinators, managers, and the units they supervise, rather than treating athletes as the only fantasy assets.** The source material supports multiple game formats, including drafts, salary caps, head-to-head leagues, pick'em, brackets, trivia, and customized commissioner leagues.

The patent describes selecting coaches for fantasy-team positions and calculating positive or negative coach scores from on-field or off-field actions by teams and team members. This is potentially valuable intellectual property, but current ownership, maintenance, remaining term, assignments, claim scope, and international coverage should be confirmed by an intellectual-property attorney before relying on exclusivity. Isaac has indicated that he controls the rights.

The original business plan and market figures are from approximately 2009 to 2010. They establish the history and product logic, but should not be used as current evidence. The brand presentation is memorable and energetic, although the visual identity, social references, language, and user experience need modernization.

## Recommended venture structure

Build CoachFace as one connected multi-sport property with four layers:

1. **CoachFace Game**: A free digital second-screen competition where fans choose coaches and earn transparent scores from coaching decisions and team outcomes.
2. **CoachFace Show**: A weekly creator-led streaming program that debates coaching decisions, reveals rankings, runs audience polls, and feeds viewers into the game.
3. **CoachFace AI**: A clearly disclosed analysis assistant that explains scoring events, compares coaching decisions, creates personalized recaps, and helps producers identify strong show segments. It should not invent statistics or make unsupported claims.
4. **CoachFace Live**: Later-stage watch parties, draft nights, college or youth coaching competitions, sponsor activations, and eventually a television format.

The digital game and streaming show should be validated together first. Traditional television and a large physical production require more capital, distribution, licensing, and proof of audience demand.

## Phase 1: Complete the evidence review

- Inventory the remaining CoachFace files by category: ownership and legal, game rules, scoring systems, financial plans, brand assets, technical work, partnerships, and media concepts.
- Produce a source-of-truth summary that separates historical facts, current facts, assumptions, and ideas requiring validation.
- Create a multi-sport scoring framework with universal categories and sport-specific modules.
- Identify data needed for each scoring event and determine whether it is available from licensed feeds, official public records, editorial review, or manual judging.
- Obtain professional review of patent status, trademarks, publicity rights, league and team marks, sports-data rights, contest law, gambling restrictions, privacy, and AI-generated commentary.

## Phase 2: Define the minimum viable experience

Create a focused pilot that demonstrates the complete audience loop without building a full fantasy platform:

- A multi-sport CoachFace home experience with current coach rankings, featured matchups, and the weekly show.
- A simple free-to-play contest where users select a small roster of coaches across selected sports.
- A transparent scorecard showing exactly which decisions or results changed each score.
- Fan voting on a limited subjective category, kept separate from objective statistical scoring.
- An AI-powered recap that cites the scoring events it summarizes.
- A producer dashboard or manual workflow for reviewing disputed events before scores become final.

No cash-entry contests should be included in the first pilot. This reduces regulatory, payment, age-verification, and geographic-compliance risk while testing the core appeal.

## Phase 3: Produce the streaming-show pilot

Develop a repeatable 20 to 30 minute weekly format:

1. Cold open with the week's biggest coaching decision.
2. CoachFace leaderboard and major score changes.
3. Film-room or strategy breakdown.
4. “Make the Call” audience decision with live voting.
5. Coach versus coach debate.
6. Fan roster results and next-week picks.
7. Short AI-generated personalized recap clips for registered users, reviewed against source data.

Start with YouTube and short-form social distribution. Use audience retention, repeat viewers, game registrations, roster completion, votes, and sharing to decide whether to approach streaming platforms or television buyers.

## Phase 4: Validate across sports

Although the venture is multi-sport, test it in a controlled sequence rather than launching every league at once:

- Select two contrasting sports for the first public season.
- Keep universal scoring concepts consistent, such as wins, tactical decisions, discipline, unit performance, and game management.
- Use sport-specific modules for football coordinators, basketball rotations and timeouts, baseball pitching and substitution decisions, and soccer managers and formations.
- Compare engagement and operational cost by sport before expanding.

## Phase 5: Business model

Prioritize revenue in this order:

1. Sponsorship of rankings, show segments, and fan polls.
2. Advertising and creator-platform revenue.
3. Premium memberships for deeper analytics, private leagues, alerts, and historical comparisons.
4. White-label games or licensed formats for media companies and sports organizations.
5. Live-event tickets, branded draft nights, merchandise, and coaching clinics.
6. Regulated paid contests only after specialist legal review and proven free-to-play retention.

## Phase 6: Decision gates

- **Gate 1, concept test:** Do fans understand and want to compare coaches as fantasy assets?
- **Gate 2, scoring trust:** Can CoachFace produce timely, explainable, defensible scores at an affordable data cost?
- **Gate 3, repeat behavior:** Do users return weekly to adjust selections, watch the show, and discuss decisions?
- **Gate 4, commercial proof:** Will sponsors, subscribers, or media partners pay to reach this audience?
- **Gate 5, expansion:** Only after these signals should CoachFace fund a full platform, television package, or touring live format.

## Initial deliverables after the remaining files arrive

- Updated CoachFace venture brief and positioning statement.
- Rights and risk checklist for counsel.
- Multi-sport product architecture and scoring blueprint.
- Pilot show treatment with recurring segments.
- Audience-validation plan and measurable success criteria.
- Phased financial model with low, base, and high scenarios.
- Investor and media-partner presentation.
- Build specification for the first interactive CoachFace prototype.

## Working recommendation

The best first move is **not** a traditional TV pitch or a complete paid fantasy platform. It is a free, data-transparent CoachFace game paired with a creator-led weekly streaming show. This creates a testable audience, proves the scoring system, generates original media, and gives future investors, sponsors, and television partners measurable evidence rather than only a concept.