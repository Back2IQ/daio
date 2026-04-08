# DAIO Backlog — Open Issues from Metaphor Audit

Issues identified 2026-04-08 via structural metaphor analysis.
Items marked [FIXED] were resolved in this session. Remaining items require either server-side infrastructure or deeper implementation work.

---

## [FIXED] Wächter der nickt — DMS Check-in Verification
Challenge-response questions added. Owner sets personal questions, random one is asked at each check-in. Wrong answer = failed check-in + audit log.

## [FIXED] Zwei Köche am selben Topf — Duplicate Asset Inventory
Digital Estate module is now the single source of truth. Inheritance Vault references Digital Estate data instead of maintaining a separate freetext field.

## [FIXED] Religion ohne Gott — Score Without Consequence
Score-based recommendations now appear in Succession Sentinel. Each recommendation shows the action and point value, driving the user toward specific improvements.

## [FIXED] Gefühl ohne Seele — Chat Without Context
AI chat now receives user's Governance Score, asset count, beneficiary count, DMS status, and container level. Responses are personalized to the user's current state.

## [FIXED] Lernstoff ohne Studierenden — Education Without Funnel
CTAs added at the bottom of Strategic Platform: "Inventory Your Assets" and "Activate Succession Sentinel" — direct links from learning to action.

## [FIXED] Glück ohne Freude — Audit Without Visibility
Audit trail now shows 30-day activity count alongside total entries. Proactive visibility of governance actions.

---

## OPEN — Uhr ohne Zeiger — DMS Timer is Client-Side Only
**Problem:** The Dead Man's Switch only evaluates when the user opens the app. If nobody opens the app, escalation never happens. The clock doesn't tick server-side.
**Required:** Cloudflare Worker Cron Trigger that:
1. Reads DMS state from D1 (requires syncing client state to D1)
2. Evaluates escalation stages based on last check-in timestamp
3. Advances status (warning_1 → warning_2 → warning_3 → triggered)
4. Sends notifications to beneficiaries at each stage
**Complexity:** High — requires client-server sync architecture, notification system.

## OPEN — Stecker ohne Dose — Key Fragments Never Distributed
**Problem:** Shamir fragments are generated but never leave the app. No mechanism to deliver fragments to guardians/heirs.
**Required:**
1. Fragment export as QR code or encrypted PDF
2. Email delivery of encrypted fragments to beneficiaries
3. Fragment import in a guardian/heir portal view
**Complexity:** Medium — needs email service integration or download mechanism.

## OPEN — Kraft ohne Energie — Emergency Protocol Notifies Nobody
**Problem:** Panic button regenerates keys and logs audit entry, but doesn't notify guardians, heirs, or notaries.
**Required:**
1. Webhook/email notification to all registered beneficiaries on emergency trigger
2. Requires beneficiary contact info to be stored server-side (D1)
3. Consider: SMS gateway for critical alerts
**Complexity:** Medium — depends on notification infrastructure.

## OPEN — Archiv ohne Leser — NDA Requests Without Alert
**Problem:** Contact form submissions land in D1 but nobody is notified. Must actively poll `/api/nda-list`.
**Required:**
1. Cal.com or Calendly integration for direct booking
2. Or: email notification on form submit (Resend.com free tier, or Cloudflare Email Workers)
3. Or: Slack/Discord webhook
**Complexity:** Low — just needs one integration.

## OPEN — Auto ohne Reifen — Transfer Gate is Display-Only
**Problem:** 5-step Transfer Gate timeline exists but no step ever activates. Pure decoration.
**Required:**
1. Wire to DMS trigger: when DMS reaches "triggered", auto-advance step 1
2. Connect to guardian fragment submission for step 3
3. This is a fundamental product feature — needs real state machine
**Complexity:** High — needs the full succession execution engine.

## OPEN — Licht ohne Wärme — Loss Clock Without Personal Relevance
**Problem:** Landing page shows €840B global loss figure. Impressive but impersonal.
**Possible improvement:**
1. After user inventories assets in Digital Estate, show personalized: "€X of YOUR assets are undocumented"
2. Could be a banner on the landing page post-login, or in the app dashboard
**Complexity:** Low — data exists in localStorage, just needs display logic.

## OPEN — Wissen ohne Hirn — Playbook Not Integrated
**Problem:** 7-chapter playbook exists as separate markdown files. Not referenced from within the app modules.
**Possible improvement:**
1. Contextual "Learn more" links in each module → relevant playbook chapter
2. Or: inline playbook excerpts as expandable sections
**Complexity:** Low — just linking, unless inline rendering is desired.

## OPEN — Trauer ohne Schmerz — Compliance Without Export
**Problem:** Compliance tab in Continuity Dashboard shows MiCA checks but produces no exportable report.
**Required:**
1. PDF/text export of compliance report
2. Should include: jurisdiction, score, passed/failed checks, action items
3. Useful for advisors presenting to clients
**Complexity:** Low-Medium — report generation exists in old wallet code, needs porting.

## OPEN — Gegenwind ignorieren — No Error/Failure Tracking
**Problem:** No mechanism to detect or react to failures. If the DMS check is missed, if a fragment is lost, if a beneficiary becomes unreachable — the system doesn't know.
**Required:**
1. Periodic health checks of governance state
2. Stale beneficiary detection (email bounces, etc.)
3. Requires server-side monitoring
**Complexity:** High.
