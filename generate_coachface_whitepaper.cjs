const fs = require("fs");
const {
  AlignmentType, BorderStyle, Document, Footer, Header, HeadingLevel, LevelFormat,
  PageBreak, PageNumber, Packer, Paragraph, ShadingType, Table, TableCell, TableRow,
  TextRun, VerticalAlign, WidthType,
} = require("docx");

const OUT = "/mnt/documents/CoachFace_Investor_Thesis_and_White_Paper.docx";
const GOLD = "E59A2B";
const INK = "171614";
const CREAM = "F7F3EA";
const TAN = "E8DDCB";
const MUTED = "655F57";
const WHITE = "FFFFFF";
const contentWidth = 9360;

const border = (color = "D8CDBD", size = 8) => ({ style: BorderStyle.SINGLE, color, size });
const noBorders = { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE }, insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE } };
const cellBorders = { top: border("D8CDBD", 4), bottom: border("D8CDBD", 4), left: border("D8CDBD", 4), right: border("D8CDBD", 4) };

function p(text, opts = {}) {
  return new Paragraph({
    alignment: opts.alignment,
    spacing: { before: opts.before || 0, after: opts.after ?? 150, line: opts.line || 310 },
    border: opts.border,
    indent: opts.indent,
    keepNext: opts.keepNext,
    pageBreakBefore: opts.pageBreakBefore,
    children: [new TextRun({ text, bold: opts.bold, italics: opts.italics, color: opts.color || INK, size: opts.size || 21, font: opts.font || "Arial" })],
  });
}

function rich(parts, opts = {}) {
  return new Paragraph({
    alignment: opts.alignment,
    spacing: { before: opts.before || 0, after: opts.after ?? 150, line: opts.line || 310 },
    border: opts.border,
    children: parts.map((x) => new TextRun({ text: x.text, bold: x.bold, italics: x.italics, color: x.color || INK, size: x.size || 21, font: x.font || "Arial" })),
  });
}

function eyebrow(text) {
  return p(text.toUpperCase(), { bold: true, color: GOLD, size: 16, after: 90, keepNext: true });
}

function h1(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 160, after: 200 }, children: [new TextRun({ text, bold: true, color: INK, size: 40, font: "Arial Narrow" })] });
}

function h2(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 220, after: 130 }, children: [new TextRun({ text, bold: true, color: INK, size: 29, font: "Arial Narrow" })] });
}

function h3(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_3, spacing: { before: 180, after: 90 }, children: [new TextRun({ text, bold: true, color: INK, size: 23, font: "Arial" })] });
}

function bullet(text, level = 0) {
  return new Paragraph({ numbering: { reference: "bullets", level }, spacing: { after: 90, line: 290 }, children: [new TextRun({ text, color: INK, size: 20, font: "Arial" })] });
}

function numberItem(text) {
  return new Paragraph({ numbering: { reference: "numbers", level: 0 }, spacing: { after: 110, line: 290 }, children: [new TextRun({ text, color: INK, size: 20, font: "Arial" })] });
}

function callout(title, body) {
  return new Table({
    width: { size: contentWidth, type: WidthType.DXA }, columnWidths: [contentWidth],
    rows: [new TableRow({ children: [new TableCell({ width: { size: contentWidth, type: WidthType.DXA }, shading: { fill: CREAM, type: ShadingType.CLEAR }, borders: { top: border(GOLD, 18), bottom: border("D8CDBD", 4), left: border("D8CDBD", 4), right: border("D8CDBD", 4) }, margins: { top: 180, bottom: 180, left: 220, right: 220 }, children: [p(title.toUpperCase(), { bold: true, color: GOLD, size: 16, after: 75 }), p(body, { size: 21, after: 0 })] })] })],
  });
}

function statRow(items) {
  const w = Math.floor(contentWidth / items.length);
  return new Table({ width: { size: contentWidth, type: WidthType.DXA }, columnWidths: items.map(() => w), rows: [new TableRow({ children: items.map((it) => new TableCell({ width: { size: w, type: WidthType.DXA }, shading: { fill: INK, type: ShadingType.CLEAR }, borders: { top: border(INK, 1), bottom: border(INK, 1), left: border(CREAM, 2), right: border(CREAM, 2) }, margins: { top: 190, bottom: 190, left: 120, right: 120 }, verticalAlign: VerticalAlign.CENTER, children: [p(it.value, { alignment: AlignmentType.CENTER, bold: true, color: GOLD, size: 30, after: 50 }), p(it.label, { alignment: AlignmentType.CENTER, color: WHITE, size: 15, after: 0 })] })) })] });
}

function matrix(headers, rows, widths) {
  const makeCell = (text, width, header = false) => new TableCell({ width: { size: width, type: WidthType.DXA }, shading: { fill: header ? INK : WHITE, type: ShadingType.CLEAR }, borders: cellBorders, margins: { top: 100, bottom: 100, left: 120, right: 120 }, children: [p(text, { bold: header, color: header ? WHITE : INK, size: header ? 16 : 18, after: 0, line: 250 })] });
  return new Table({ width: { size: contentWidth, type: WidthType.DXA }, columnWidths: widths, rows: [new TableRow({ tableHeader: true, children: headers.map((x, i) => makeCell(x, widths[i], true)) }), ...rows.map((row) => new TableRow({ children: row.map((x, i) => makeCell(x, widths[i])) }))] });
}

function page() { return new Paragraph({ children: [new PageBreak()] }); }

const children = [];

children.push(
  p("COACHFACE", { bold: true, color: GOLD, size: 22, after: 1400 }),
  p("THE GAME BEHIND THE GAME", { bold: true, color: MUTED, size: 17, after: 180 }),
  p("INVESTMENT THESIS", { bold: true, color: INK, size: 58, after: 30, font: "Arial Narrow" }),
  p("& TECHNOLOGY WHITE PAPER", { bold: true, color: INK, size: 42, after: 500, font: "Arial Narrow" }),
  p("Building the coach-centric layer of fantasy sports", { color: MUTED, size: 25, after: 900 }),
  statRow([{ value: "2", label: "ISSUED U.S. PATENTS" }, { value: "45", label: "TOTAL CLAIMS" }, { value: "9+", label: "SPORT CATEGORIES NAMED" }]),
  p("Prepared for prospective investors and strategic partners", { color: MUTED, size: 17, before: 650, after: 70 }),
  p("June 2026  |  Confidential discussion draft", { color: MUTED, size: 16, after: 0 }),
  page(),
);

children.push(
  eyebrow("Important notice"), h1("Purpose, Scope, and Reliance"),
  p("This paper presents a strategic interpretation of two issued United States patents associated with the CoachFace concept. It is designed to help prospective investors understand the product thesis, technical architecture, potential business model, and diligence agenda."),
  callout("Not legal, financial, or investment advice", "The paper does not provide a legal opinion on validity, enforceability, ownership, remaining patent term, freedom to operate, infringement, regulatory classification, valuation, or expected investment return. Those matters require independent review by qualified counsel and other advisers."),
  h2("Source documents reviewed"),
  bullet("U.S. Patent No. 8,333,642 B2, System and Method for Conducting a Fantasy Sports Game, issued December 18, 2012, naming Isaac Sayo Daniel as inventor and F3M3 Companies, Inc. as assignee."),
  bullet("U.S. Patent No. 8,550,890 B1, Electronic Fantasy Sports System and Method, issued October 8, 2013, naming Isaac S. Daniel and Chuck Kowalski as inventors. The patent identifies itself as a continuation-in-part of the application that became U.S. Patent No. 8,333,642."),
  h2("How to read this paper"),
  p("Statements describing claim language are grounded in the patent documents. Product, market, monetization, and execution proposals are strategic interpretations and should be treated as a development thesis, not as statements about current operations or guaranteed outcomes."),
  page(),
);

children.push(
  eyebrow("Executive investment thesis"), h1("CoachFace Turns Coaching Into a Fantasy Asset Class"),
  p("Most fantasy products organize competition around athletes. CoachFace proposes a different center of gravity: the coach, manager, coordinator, team unit, and the decisions and outcomes under their supervision. That shift can open a new mode of play without requiring fans to abandon the sports, leagues, and statistical behaviors they already understand."),
  callout("The core proposition", "Select real-world coaches or coach-linked team units, translate on-field and selected off-field events into positive or negative points, and compete through a transparent fantasy scoring system."),
  h2("Why this may matter to investors"),
  bullet("Category differentiation: CoachFace is not merely another athlete roster interface. It introduces a coach position and a coach-centered scoring graph."),
  bullet("Portfolio foundation: The two issued patents describe systems, methods, communications, storage, hosting, mobile access, multi-sport coverage, team units, coach roles, and broad classes of scoring events."),
  bullet("Reusable engine: A normalized event and rules architecture can support multiple sports, contest formats, editorial products, rankings, data licensing, and partner integrations."),
  bullet("Media compatibility: Coaching decisions naturally generate debate, explanation, rankings, and recurring programming that can connect gameplay with the CoachFace Show and social content."),
  bullet("Multiple commercial paths: Free-to-play engagement, subscriptions, sponsorship, licensing, white-label games, data products, and carefully regulated paid competition can be developed in stages."),
  h2("The investable question"),
  p("Can CoachFace convert a distinctive patent-backed game mechanic into a trusted data product, a repeatable consumer habit, and a partner-ready platform before larger incumbents establish equivalent coach-centered experiences?"),
  page(),
);

children.push(
  eyebrow("The category gap"), h1("Fantasy Sports Measures Players. Fans Debate Coaches."),
  p("The cultural conversation around sport is already rich with coaching questions: Was the tactical setup correct? Did the manager make the right substitution? Did the defensive coordinator adapt? Did a challenge, timeout, rotation, or lineup decision change the game? Traditional fantasy products capture only a fraction of that conversation because their primary scoring objects are athletes."),
  h2("CoachFace reframes the fan job"),
  matrix(["Traditional fantasy", "CoachFace model"], [
    ["Draft or select athletes", "Select coaches, managers, coordinators, or coach-linked units"],
    ["Score individual production", "Score supervised team and unit outcomes, plus defined coach-relevant events"],
    ["Optimize a player roster", "Express a thesis about leadership, tactics, preparation, and execution"],
    ["Follow box scores", "Follow decisions, context, explainable score events, and rankings"],
  ], [4680, 4680]),
  h2("A new engagement loop"),
  numberItem("Choose: users select coaches or qualifying proxies for coach positions."),
  numberItem("Observe: live sports events and approved contextual signals enter the platform."),
  numberItem("Attribute: rules associate team, member, or unit outcomes with the selected coach position."),
  numberItem("Score: the engine applies positive and negative point values."),
  numberItem("Explain: each score is presented with source event, rule, attribution, and timing."),
  numberItem("Compete and discuss: users move through leaderboards, challenges, rankings, and media conversations."),
  page(),
);

children.push(
  eyebrow("Patent portfolio"), h1("Two Patents, One Expanding System Concept"),
  p("The portfolio begins with a general coach-selection and coach-scoring framework and expands through a continuation-in-part that expressly addresses a wider set of sports, levels of competition, coach roles, team members and units, scoring statistics, devices, and game structures."),
  matrix(["Patent", "Core issued concept", "Selected claim structure"], [
    ["US 8,333,642 B2", "Selection of a coach for a fantasy-team coach position, monitoring on-field or off-field actions or statistics, and determining a coach score.", "23 claims. Independent system claims 1 and 6; independent method claim 12."],
    ["US 8,550,890 B1", "Selection for a coach position may include a coach, member, or team unit, with scoring based on team, member, or unit actions or statistics across professional, amateur, collegiate, or academic contexts.", "22 claims. Continuation-in-part relationship stated on the face of the patent."],
  ], [1900, 4660, 2800]),
  h2("Portfolio progression"),
  bullet("Object expansion: from selecting a real-life coach to selecting a coach, team member, or team unit to fill the fantasy coach position."),
  bullet("Domain expansion: explicit treatment of professional, amateur, collegiate, and academic sports."),
  bullet("Sport expansion: football, baseball, basketball, racing, cricket, hockey, soccer, rugby, and Olympic teams are identified in dependent claims."),
  bullet("Role expansion: head coach or manager, assistant, offensive, defensive, and special teams roles are identified."),
  bullet("Delivery expansion: descriptions include networked systems, servers, storage, smartphones, tablets, personal computers, and downloadable applications."),
  callout("Investor interpretation", "The commercial value is not the patent documents alone. Value emerges when legal rights, proprietary scoring methodology, licensed data, consumer trust, brand, distribution, and operating execution reinforce one another."),
  page(),
);

children.push(
  eyebrow("Claim-informed product map"), h1("From Patent Language to Product Capabilities"),
  matrix(["Claim theme", "Product capability", "Investor relevance"], [
    ["Coach-position selection", "Drafts, weekly picks, salary-cap rosters, head-to-head challenges", "Creates a differentiated roster object and game identity"],
    ["Team, member, and unit attribution", "Head coach, manager, coordinator, defense, offense, special teams, or qualifying proxies", "Supports depth across sports and coaching structures"],
    ["Positive and negative scoring", "Rules engine with bonuses, penalties, thresholds, and contextual modifiers", "Enables balanced game design and explainable outcomes"],
    ["On-field and off-field actions", "Live event scoring plus carefully governed contextual categories", "Extends engagement beyond the final score, with material governance needs"],
    ["Network transmission and hosting", "Web and mobile play, live score delivery, contest administration", "Supports scalable consumer and partner distribution"],
    ["Storage and game information", "Historical scores, rankings, user records, audit trails", "Creates longitudinal data and retention loops"],
    ["Pool and prize concepts in specification", "Potential contest economics where legally permitted", "Creates optional monetization, subject to licensing and compliance"],
  ], [2300, 3860, 3200]),
  h2("What should remain proprietary even beyond the patents"),
  bullet("Sport-specific attribution logic that decides which team, member, or unit outcomes reasonably reflect a coach role."),
  bullet("A versioned scoring-rule library with thresholds, weighting, corrections, and effective dates."),
  bullet("A confidence and provenance model that links every point to a licensed source event."),
  bullet("Historical Coach Scores, benchmarks, archetypes, and cross-sport normalization methods."),
  bullet("Behavioral data on roster construction, prediction quality, and fan response."),
  page(),
);

children.push(
  eyebrow("Product thesis"), h1("The CoachFace Experience"),
  h2("Core consumer products"),
  matrix(["Experience", "Description", "Primary outcome"], [
    ["CoachFace Fantasy", "Select coach positions, receive live explainable scores, compete in private or public leagues.", "Habit and competition"],
    ["CoachFace Power Rankings", "Cross-team and cross-league coach rankings with form, trend, and context.", "Discovery and debate"],
    ["CoachFace Predictions", "Pick coaching decisions, game scripts, unit outcomes, or coach-linked performance thresholds.", "Pre-game and live engagement"],
    ["The CoachFace Show", "Editorial programming built around rankings, tactical moments, fantasy implications, and fan arguments.", "Audience growth and brand"],
    ["CoachFace Pro", "Advanced history, alerts, custom leagues, deeper analytics, and ad-light experiences.", "Subscription revenue"],
  ], [2100, 4800, 2460]),
  h2("Design principles"),
  bullet("Explain every point. A user should be able to open a score event and see the source, rule, attribution, timestamp, and correction state."),
  bullet("Separate fact from opinion. Objective feed-derived scoring should be clearly distinguished from editorial ratings or community votes."),
  bullet("Start free. Identity verification and payments should appear only when a regulated or financial feature requires them."),
  bullet("Make each sport native. Soccer managers, football coordinators, baseball managers, and racing teams require different schemas and vocabulary."),
  bullet("Preserve corrections. Data-feed amendments and official-stat changes should be versioned, visible, and reversible."),
  page(),
);

children.push(
  eyebrow("Technology white paper"), h1("A Rules-Driven, Explainable Scoring Platform"),
  p("CoachFace should be implemented as an event-driven scoring system rather than as a collection of hard-coded pages. The central technical asset is a canonical event model that can ingest licensed sports data, resolve entities, evaluate versioned rules, and produce auditable score events."),
  h2("Reference architecture"),
  matrix(["Layer", "Responsibility"], [
    ["Experience", "Responsive web and mobile interfaces, drafts, rosters, contests, rankings, profiles, and media."],
    ["Identity and eligibility", "Accounts, email verification, consent, age and location controls, and risk-tiered identity verification."],
    ["Game services", "Contest definitions, roster locks, entries, leaderboards, badges, rewards, and notifications."],
    ["Scoring engine", "Rules evaluation, attribution, positive and negative points, corrections, and score aggregation."],
    ["Canonical sports graph", "Sports, leagues, seasons, teams, coaches, roles, units, games, and source identifiers."],
    ["Data ingestion", "Provider adapters, signatures, idempotency, normalization, replay, and dead-letter handling."],
    ["Trust and operations", "Moderation, audit logs, observability, security, responsible-play controls, and compliance workflows."],
  ], [2200, 7160]),
  h2("Processing sequence"),
  numberItem("Receive a licensed provider event or approved administrative correction."),
  numberItem("Authenticate the source, deduplicate the external event identifier, and store the raw payload."),
  numberItem("Normalize the payload into a sport-independent canonical event."),
  numberItem("Resolve the event to game, team, coach, role, member, and unit relationships."),
  numberItem("Evaluate active scoring rules for the contest and effective time."),
  numberItem("Write immutable score events, then aggregate coach, roster, contest, and leaderboard totals."),
  numberItem("Push a human-readable explanation and any later correction to affected users."),
  page(),
);

children.push(
  eyebrow("Scoring governance"), h1("Trust Is the Product"),
  p("Coach attribution is inherently more interpretive than counting a player touchdown or goal. CoachFace should therefore make transparency, governance, and reproducibility first-class product requirements."),
  h2("A score event should contain"),
  bullet("The source event and licensed provider identifier."),
  bullet("The game, team, coach position, and applicable member or unit."),
  bullet("The rule identifier, rule version, effective date, and point value."),
  bullet("The attribution reason and any confidence or review status."),
  bullet("The original calculation, corrections, reversals, and current total."),
  h2("Recommended scoring hierarchy"),
  matrix(["Tier", "Examples", "Governance"], [
    ["Tier 1: objective", "Wins, score margin, penalties, possession, turnovers, goals or points for and against", "Automated from licensed feeds"],
    ["Tier 2: derived", "Red-zone efficiency, unit improvement, situational performance, rolling benchmarks", "Formula documented and versioned"],
    ["Tier 3: adjudicated", "Decision quality or unusual coaching events not reliably represented in feeds", "Expert review, evidence, appeal path"],
    ["Tier 4: contextual", "Selected off-field events allowed by policy and law", "Strict source policy, privacy and defamation review, limited use"],
  ], [1800, 4300, 3260]),
  callout("Recommended launch boundary", "Launch the first competitive product with objective and derived on-field scoring. Add adjudicated or off-field categories only after governance, source standards, review processes, and legal controls are mature."),
  page(),
);

children.push(
  eyebrow("Business model"), h1("One Engine, Multiple Revenue Surfaces"),
  matrix(["Revenue surface", "Customer", "Value exchange"], [
    ["Free-to-play sponsorship", "Brands and advertisers", "Sponsored contests, rankings, segments, and fan activations"],
    ["Consumer subscription", "High-intent fans", "Advanced analytics, alerts, custom leagues, history, personalization, and reduced ads"],
    ["B2B licensing", "Media, leagues, teams, sportsbooks, and fantasy operators", "Coach scoring, rankings, widgets, APIs, and white-label experiences"],
    ["Content and media", "Platforms, advertisers, and audiences", "The CoachFace Show, clips, explainers, rankings, and branded programming"],
    ["Paid competition", "Eligible verified players", "Entry-based contests where permitted, with jurisdiction-specific controls"],
    ["Data products", "Professional and commercial partners", "Historical coach metrics, trend data, and explainable event feeds"],
  ], [2100, 2700, 4560]),
  h2("Sequencing principle"),
  p("Revenue should follow trust. The preferred order is free-to-play engagement, sponsorship and media, premium consumer tools, B2B licensing, then regulated paid competition in approved jurisdictions. This sequence creates product evidence before introducing the highest compliance and reputation burden."),
  h2("Unit-economic framework for diligence"),
  bullet("Acquisition: blended customer acquisition cost by organic, media, partner, and paid channels."),
  bullet("Activation: percentage completing onboarding, first coach selection, and first scored game."),
  bullet("Retention: weekly and season-to-season return rates by sport and contest format."),
  bullet("Monetization: sponsor revenue per active user, subscription conversion, and B2B annual contract value."),
  bullet("Data cost: licensed feed expense, event volume, and gross margin by sport."),
  bullet("Risk cost: verification, payments, fraud, support, moderation, and compliance expense."),
  page(),
);

children.push(
  eyebrow("Go-to-market"), h1("Win a Wedge, Then Compound Across Sports"),
  h2("Phase 1: prove the mechanic"),
  bullet("Launch one sport with objective scoring, limited contest types, and a clear weekly cadence."),
  bullet("Use free private leagues and creator-led challenges to test whether coach selection changes fan behavior."),
  bullet("Publish a weekly CoachFace ranking and explain the largest score movements."),
  h2("Phase 2: build distribution"),
  bullet("Package embeddable rankings, scorecards, and widgets for publishers and creators."),
  bullet("Develop sponsor-ready tentpole contests around playoffs, tournaments, rivalry weeks, and coaching changes."),
  bullet("Integrate the CoachFace Show with gameplay calls to action and personalized recap content."),
  h2("Phase 3: expand the platform"),
  bullet("Add sports through provider adapters and sport-specific rule packs."),
  bullet("Offer APIs and white-label contests to media, leagues, and fantasy operators."),
  bullet("Introduce paid competition only after legal, geographic, identity, payments, fraud, and responsible-play controls are independently validated."),
  h2("Launch metrics that matter"),
  statRow([{ value: "A", label: "ACTIVATION" }, { value: "R", label: "WEEKLY RETENTION" }, { value: "S", label: "SHARES PER USER" }, { value: "E", label: "EXPLAINED SCORE VIEWS" }]),
  p("Investor reporting should emphasize cohort behavior and repeat gameplay, not registrations alone.", { italics: true, color: MUTED, before: 180 }),
  page(),
);

children.push(
  eyebrow("Defensibility"), h1("The Moat Is a Reinforcing System"),
  matrix(["Moat layer", "What compounds", "How to strengthen it"], [
    ["Issued patents", "A documented coach-centered fantasy system and expanded electronic implementation concepts", "Confirm chain of title, status, term, maintenance, claim scope, and enforcement strategy with counsel"],
    ["Scoring IP", "Rule packs, attribution logic, correction policy, and cross-sport normalization", "Keep versioned, tested, documented, and selectively confidential"],
    ["Data asset", "Historical coach scores, trends, benchmarks, and fan behavior", "Secure rights, provenance, quality controls, and reusable identifiers"],
    ["Brand", "CoachFace as the name for measuring and playing the coaching layer", "Consistent media, rankings, visual identity, and trademark strategy"],
    ["Distribution", "Creators, publishers, leagues, teams, and embedded widgets", "Create partner APIs and shared economics"],
    ["Trust", "Explainable points, transparent corrections, and fair contests", "Publish rules, audits, uptime, and support standards"],
  ], [1900, 3700, 3760]),
  callout("Key insight", "A patent can slow imitation of claimed methods, but it does not create consumer adoption. CoachFace becomes difficult to copy when legal rights, trusted scoring, proprietary history, audience, and integrations all compound."),
  page(),
);

children.push(
  eyebrow("Risk and diligence"), h1("What Investors Should Verify"),
  h2("Intellectual property"),
  bullet("Current ownership and complete chain of title for each patent and all related applications, assignments, licenses, security interests, and obligations."),
  bullet("Maintenance-fee history, current status, remaining term, terminal disclaimers, any proceedings, and enforceability considerations."),
  bullet("Claim construction and product-to-claim mapping prepared by patent counsel, plus a freedom-to-operate review for the planned implementation."),
  bullet("Trademark status for CoachFace and ownership of code, designs, scoring rules, content, data rights, and contractor work product."),
  h2("Product and data"),
  bullet("Rights to ingest, transform, display, archive, and sublicense each sports data field."),
  bullet("Scoring accuracy, correction latency, entity resolution, attribution disputes, and auditability."),
  bullet("Evidence that fans understand and repeatedly use coach-centric gameplay."),
  h2("Regulatory and integrity"),
  bullet("Fantasy contest, gaming, sweepstakes, consumer, advertising, tax, privacy, identity, sanctions, payments, and age requirements in every launch jurisdiction."),
  bullet("Responsible-play controls, geolocation, fraud prevention, anti-money-laundering obligations where applicable, and prize fulfillment."),
  bullet("Defamation, publicity, employment, league-rule, and privacy review for off-field scoring or editorial claims."),
  h2("Commercial and execution"),
  bullet("Realistic cost and timing for data licensing, engineering, content production, support, compliance, and customer acquisition."),
  bullet("Dependence on leagues, data suppliers, app platforms, payment providers, and media partners."),
  bullet("Capital plan tied to measurable product milestones rather than broad category assumptions."),
  page(),
);

children.push(
  eyebrow("Execution plan"), h1("A Milestone-Based Roadmap"),
  matrix(["Stage", "Product milestone", "Evidence required before advancing"], [
    ["0. Portfolio and rules diligence", "Ownership file, counsel claim map, data-rights plan, launch-jurisdiction memo", "No material unresolved ownership or launch blockers"],
    ["1. Closed alpha", "One sport, objective scoring, private leagues, full event audit trail", "Scoring accuracy, completion, and qualitative comprehension"],
    ["2. Public free play", "Weekly contests, rankings, notifications, referrals, media integration", "Cohort retention, repeat selection, sharing, sponsor interest"],
    ["3. Multi-sport platform", "Second and third sport adapters, rule packs, partner widgets, subscriptions", "Adapter reuse, gross-margin visibility, conversion evidence"],
    ["4. B2B and regulated formats", "APIs, white label, verified paid contests in approved markets", "Contracts, compliance validation, risk controls, positive unit economics"],
  ], [1600, 4200, 3560]),
  h2("Suggested use of investment capital"),
  bullet("Product and engineering: canonical sports graph, scoring engine, mobile experience, contest services, reliability, and security."),
  bullet("Data and content: licensed feeds, entity operations, scoring research, editorial production, and the CoachFace Show."),
  bullet("Legal and compliance: IP diligence, data rights, regulatory analysis, privacy, payments, and contest controls."),
  bullet("Distribution: creator programs, launch partnerships, sponsor sales, and measured customer acquisition."),
  bullet("Operations: support, trust and safety, finance, analytics, and partner success."),
  page(),
);

children.push(
  eyebrow("Investment conclusion"), h1("A Distinctive Idea With a Disciplined Path to Proof"),
  p("CoachFace begins with a simple but strategically meaningful inversion: fans can draft and score the people responsible for systems, tactics, preparation, and collective execution. The attached patents describe an issued foundation for coach-position selection and scoring based on team, member, and unit actions or statistics, delivered through electronic fantasy systems."),
  p("The opportunity is to turn that foundation into something larger than a feature. CoachFace can become a consumer game, a ranking authority, a media format, a scoring and data layer, and a partner platform. Each surface can strengthen the others, but only if the company earns trust through explainable scoring, licensed data, legal discipline, and repeated consumer use."),
  callout("The thesis in one sentence", "CoachFace has the potential to own the coaching layer of fantasy sports by combining issued patent assets with an explainable multi-sport scoring engine, a distinctive consumer brand, and partner-ready distribution."),
  h2("The next proof points"),
  numberItem("Complete independent IP, ownership, term, regulatory, and data-rights diligence."),
  numberItem("Launch one objective, explainable free-to-play sport experience."),
  numberItem("Demonstrate that users return weekly to select coaches and inspect scoring explanations."),
  numberItem("Convert rankings and gameplay into sponsor, media, subscription, or B2B demand."),
  numberItem("Expand only where the scoring model, data rights, and unit economics remain strong."),
  page(),
);

children.push(
  eyebrow("Appendix A"), h1("Patent Reference Map"),
  matrix(["Reference", "Selected subject matter"], [
    ["US 8,333,642 B2, abstract", "Soliciting coach selection, monitoring team-member actions, and determining a coach score."],
    ["US 8,333,642 B2, claims 1, 6, 12", "Independent system and method formulations covering coach-position selection and scoring from on-field or off-field actions or statistics."],
    ["US 8,333,642 B2, claims 16 to 18", "Point assignment, total calculation, and positive or negative scoring."],
    ["US 8,333,642 B2, claims 19 to 23", "Units of players, in-game or off-field activity, highest user score, and network transmission."],
    ["US 8,550,890 B1, face page", "Continuation-in-part relationship to the application that became US 8,333,642; 22 claims and eight drawing sheets."],
    ["US 8,550,890 B1, claim 1", "Coach position may be filled through selection of a coach, team member, or team unit; scoring may use team, member, or unit actions or statistics."],
    ["US 8,550,890 B1, claims 2 to 5", "Named sports, fantasy-team types, coach positions, and coach roles."],
    ["US 8,550,890 B1, claim 6 and following", "Detailed examples of on-field statistical categories and broader electronic fantasy implementations."],
    ["US 8,550,890 B1, specification around Figure 9", "User devices, downloadable applications, network transmission, remote servers, and receiving coach scores."],
  ], [3000, 6360]),
  h2("Citation note"),
  p("Patent references in this paper summarize the supplied documents and are provided for business discussion. The claims themselves, prosecution histories, assignment records, maintenance records, and current official status should be reviewed directly by qualified counsel."),
  page(),
);

children.push(
  eyebrow("Appendix B"), h1("Investor Diligence Checklist"),
  h2("Documents to request"),
  bullet("Executed patent assignments and all license, option, settlement, financing, or encumbrance documents."),
  bullet("Official status and maintenance records, prosecution histories, related applications, and counsel analysis."),
  bullet("Product architecture, source-code ownership records, contractor invention assignments, security review, and data-processing map."),
  bullet("Sports data agreements, content licenses, trademark records, domain ownership, and platform terms."),
  bullet("Regulatory memoranda, geolocation and identity controls, contest rules, privacy notices, and responsible-play policies."),
  bullet("Product analytics, cohort retention, scoring error rates, support logs, partner pipeline, and financial model assumptions."),
  h2("Management questions"),
  bullet("Which single sport offers the best combination of fan intensity, objective coach-linked metrics, data availability, and launch economics?"),
  bullet("Which scoring categories are entirely objective at launch, and which require interpretation?"),
  bullet("What evidence shows users want to select coaches rather than merely read coach rankings?"),
  bullet("What is the chain of title from named inventors and assignees to the entity receiving investment?"),
  bullet("Which revenue model can be proven without paid contests?"),
  bullet("What proprietary data becomes more valuable with every scored game and active user?"),
  bullet("What milestones can be achieved with the current round, and what decision gates protect capital?"),
  p("COACHFACE  |  THE GAME BEHIND THE GAME", { alignment: AlignmentType.CENTER, bold: true, color: GOLD, size: 18, before: 700, after: 0 }),
);

const doc = new Document({
  creator: "CoachFace",
  title: "CoachFace Investment Thesis and Technology White Paper",
  subject: "Investor thesis based on U.S. Patent Nos. 8,333,642 B2 and 8,550,890 B1",
  description: "Confidential discussion draft for prospective investors and strategic partners.",
  styles: {
    default: { document: { run: { font: "Arial", size: 21, color: INK }, paragraph: { spacing: { after: 150, line: 310 } } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 40, bold: true, font: "Arial Narrow", color: INK }, paragraph: { spacing: { before: 160, after: 200 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 29, bold: true, font: "Arial Narrow", color: INK }, paragraph: { spacing: { before: 220, after: 130 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 23, bold: true, font: "Arial", color: INK }, paragraph: { spacing: { before: 180, after: 90 }, outlineLevel: 2 } },
    ],
  },
  numbering: { config: [
    { reference: "bullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 520, hanging: 260 } } } }] },
    { reference: "numbers", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 560, hanging: 300 } } } }] },
  ] },
  sections: [{
    properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 900, right: 1440, bottom: 1000, left: 1440, header: 400, footer: 450 } } },
    headers: { default: new Header({ children: [new Paragraph({ border: { bottom: border(GOLD, 10) }, children: [new TextRun({ text: "COACHFACE", bold: true, color: INK, size: 15, font: "Arial" }), new TextRun({ text: "    INVESTMENT THESIS & TECHNOLOGY WHITE PAPER", color: MUTED, size: 13, font: "Arial" })] })] }) },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "CONFIDENTIAL DISCUSSION DRAFT  |  ", color: MUTED, size: 12 }), new TextRun({ children: [PageNumber.CURRENT], color: GOLD, bold: true, size: 12 })] })] }) },
    children,
  }],
});

Packer.toBuffer(doc).then((buffer) => {
  fs.mkdirSync("/mnt/documents", { recursive: true });
  fs.writeFileSync(OUT, buffer);
  console.log(OUT);
});