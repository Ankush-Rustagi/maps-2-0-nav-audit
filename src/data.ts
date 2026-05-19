export type Verdict = "adopt" | "adapt" | "reject" | "new"

export const VERDICT_LABEL: Record<Verdict, string> = {
  adopt: "Adopt as-is",
  adapt: "Adapt to Verkada",
  reject: "Reject / N/A",
  new: "New (Verkada-only)",
}

export const VERDICT_COLOR: Record<Verdict, string> = {
  adopt: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  adapt: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  reject: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  new: "bg-neutral-500/15 text-neutral-300 border-neutral-500/30",
}

// ─── Tab 1: Full Audit ───────────────────────────────────────────────────────

export const FULL_AUDIT_ROWS: Array<{
  gmaps: string
  verkada: string
  verdict: Verdict
  rationale: string
}> = [
  { gmaps: "Persistent left rail (Saved, Recents, Get app)", verkada: "Persistent left rail: Map, Collections, Recents, Editor, Profile", verdict: "adapt", rationale: "Same icon-rail anchor. Swap 'Get app' for 'Editor' entry. Always-visible auth-gated jump points." },
  { gmaps: "Search Google Maps (top-of-panel combobox + autocomplete grid)", verkada: "Search Verkada Maps (Places, Markers, Devices, Sites, Collections in one combobox)", verdict: "adopt", rationale: "Search-first IA is the single biggest pattern to lift. Federated across all entity types with type-prefixed suggestions." },
  { gmaps: "Quick category chips (Restaurants, Hotels, Things to do, ATMs…)", verkada: "Quick filters: Cameras, Doors, Sensors, Alerts, Offline, Lockdowns, My sites", verdict: "adapt", rationale: "One-click intent shortcuts. Verkada categories are device classes + operational states instead of consumer POI categories." },
  { gmaps: "Hamburger Menu drawer (17 flat menuitems)", verkada: "Menu drawer (Editor, Permissions, Imports, Bulk, History, Help)", verdict: "adapt", rationale: "Keep the flat list pattern. Items become Verkada admin/editor surfaces, not consumer ones." },
  { gmaps: "Directions panel (mode tabs, origin/destination, route list)", verkada: "N/A (no routing)", verdict: "reject", rationale: "Pure navigation/wayfinding. Verkada Maps is a security operations view, not a wayfinder. Do not build." },
  { gmaps: "Place details: header photo, rating, action row, Overview/Reviews/About tabs", verkada: "Place panel: name, basemap thumb, action row (Details, Edit, Share, Permissions, Nearby), tabs: Overview / Markers / Activity / About", verdict: "adapt", rationale: "The strongest pattern after search. Same shape, Verkada-native tabs. Reviews → Activity. About → permissions & metadata." },
  { gmaps: "Save button → list picker popover (Favorites, Want to go, custom)", verkada: "Add to Collection popover (system + custom Collections, New Collection)", verdict: "adopt", rationale: "1:1 mapping. Google Maps 'Lists' = Verkada 'Collections'. Use the same multi-select popover with a 'New Collection' affordance." },
  { gmaps: "Send to phone, Share, Embed a map", verkada: "Send to mobile (Command app), Share link, Embed view (later)", verdict: "adapt", rationale: "Same affordances, scoped to permitted recipients. Embed is post-V1." },
  { gmaps: "Nearby (button under place)", verkada: "Nearby (re-seeds search with 'near <Place>' to find adjacent assets)", verdict: "adopt", rationale: "Excellent for security ops: 'show cameras near this door', 'show sensors near this elevator'." },
  { gmaps: "Search results: filter chips (Hours, Rating, Price), All filters sheet", verkada: "Results: filters (Site, Device type, Status, Owner, Tag), Advanced filters sheet", verdict: "adapt", rationale: "Dynamic filter chips based on result class. Hours/Price replaced with Site, Status, Device type." },
  { gmaps: "'Search this area' floating button + 'Update results when map moves' toggle", verkada: "Same affordance, scoped to the visible viewport across spatial hierarchy", verdict: "adopt", rationale: "Essential pattern for any map-anchored list. Lift verbatim." },
  { gmaps: "Saved → Lists / Labeled / Visited / Maps / Offline / Following", verkada: "Collections → My Collections / Shared with me / Following / Recent / System (Favorites, Watchlist)", verdict: "adapt", rationale: "Same surface, simpler taxonomy. Drop Labeled and Offline (V1). Visited maps to Recents." },
  { gmaps: "Your timeline (location history)", verkada: "Activity timeline (events, alerts, badge swipes for a Place)", verdict: "adapt", rationale: "Different data, same UX. Time-scrubber + day cards + filter by entity type." },
  { gmaps: "Your contributions (reviews, photos, edits)", verkada: "My edits (places, layouts, marker plots) with edit history & status", verdict: "adapt", rationale: "Editor-focused contribution log. Critical for audit trail in security context." },
  { gmaps: "Your data in Maps (Location History, Web Activity)", verkada: "My data in Maps (placement history, share log, permissions audit)", verdict: "adapt", rationale: "Privacy/audit surface. Verkada equivalent is compliance-oriented." },
  { gmaps: "Add a missing place / Add your business / Edit the map", verkada: "New Location / New Building / New Floor (Editor entry points)", verdict: "adapt", rationale: "Authoring entry. Verkada has Editor mode with stricter permissions and required Site selection." },
  { gmaps: "Layers panel (Transit, Traffic, Satellite, Terrain, Wildfires, Air Quality)", verkada: "Data Layers panel (Device Status, Coverage, Events, Foot Traffic, Door Schedules, Occupancy, Emergency, …)", verdict: "adapt", rationale: "Direct analog. Verkada has 12 layers vs Google's ~7. Same toggle UX, layered by category." },
  { gmaps: "Map type: Default / Satellite / Globe / Labels", verkada: "Basemap style: Streets / Satellite / Hybrid / Dark (Mapbox-backed)", verdict: "adopt", rationale: "Same control. Sits in the same Layers panel." },
  { gmaps: "Travel time / Measure (Map tools)", verkada: "Measure tool (distance, area) + Coverage simulator", verdict: "adapt", rationale: "Measure pattern lifts cleanly. Travel time has no Verkada use." },
  { gmaps: "Sign-in upsells throughout signed-out experience", verkada: "N/A (auth-required product, no signed-out state)", verdict: "reject", rationale: "Verkada is enterprise-auth. No public/anonymous surface." },
  { gmaps: "Profile / account avatar in header", verkada: "Command global header (org switcher, user, search) — already exists", verdict: "reject", rationale: "Owned by Command shell, not Maps. Maps inherits the global Command chrome." },
  { gmaps: "(No equivalent)", verkada: "Site filter / Site scope selector (persistent)", verdict: "new", rationale: "Verkada-specific. Sites are RBAC buckets, not spatial. Need a persistent way to scope every panel by Site." },
  { gmaps: "(No equivalent)", verkada: "Spatial breadcrumb (Org › Location › Building › Floor › Area)", verdict: "new", rationale: "Verkada has 4-deep spatial hierarchy. Google Maps is 1-level. Need persistent breadcrumb at top of every Place panel." },
  { gmaps: "(No equivalent)", verkada: "Editor / Viewer mode switch", verdict: "new", rationale: "Google has implicit edit-by-suggestion. Verkada needs explicit Editor mode with its own tool palette." },
  { gmaps: "(No equivalent)", verkada: "Emergency state banner (lockdown, active alarm) at top of panel", verdict: "new", rationale: "Verkada-only. Data Layer DL11 surfaces this; needs persistent top-of-panel treatment, not just an overlay." },
]

// ─── Tab 2: Patterns ─────────────────────────────────────────────────────────

export type Pattern = {
  name: string
  whatGoogleDoes: string
  whyItWorks: string
  verkadaApplication: string
  appliesTo: string[]
  priority: "P0" | "P1" | "P2"
}

export const PATTERNS: Pattern[] = [
  { name: "Search-first information architecture", whatGoogleDoes: "Search box is the primary, always-focused entry point at the top of the left panel. Every IA branch (Directions, Place, Saved, Layers) is reachable but secondary to typing.", whyItWorks: "Users think in intents, not menus. Typing 'pharmacy near me' is faster than navigating a tree. Reduces hierarchy depth.", verkadaApplication: "Make federated search the primary entry. Search Places, Markers, Devices, Sites, Collections, Events from one combobox. Type-prefix suggestions group results by entity class.", appliesTo: ["Default view", "Search results", "Editor"], priority: "P0" },
  { name: "Persistent thin icon rail", whatGoogleDoes: "A 4-icon rail (Saved, Recents, Get app, …) sits at the far-left edge of the sidebar at all times, regardless of which panel is active.", whyItWorks: "Gives users a stable jumppoint set. Stays anchored when the main panel content swaps between Search, Directions, Place, Saved.", verkadaApplication: "Persistent rail with: Map (home), Collections, Recents, Editor, Permissions, Profile. Always visible across Viewer and Editor modes.", appliesTo: ["All panels"], priority: "P0" },
  { name: "Hamburger drawer as flat menu", whatGoogleDoes: "The 'Menu' button opens a single-level list of 17 destinations. No accordion, no submenus. Each item swaps the main panel.", whyItWorks: "Discoverability without nesting penalty. Power-user destinations stay one click away.", verkadaApplication: "Hamburger drawer holds admin/editor destinations: Editor mode, Imports, Bulk actions, Permissions audit, Activity, Settings, Help. Keep flat — no submenus.", appliesTo: ["All panels"], priority: "P1" },
  { name: "Tabbed entity detail panel", whatGoogleDoes: "Place details uses 3 tabs (Overview / Reviews / About) plus conditional Menu and Updates. Action button row sits above tabs.", whyItWorks: "Splits dense content into 3 cognitive buckets: 'what is this', 'what do others say', 'metadata'. Action row is always one click away.", verkadaApplication: "Place panel tabs: Overview / Markers / Activity / About. Action row: Open in Editor, Share, Add to Collection, Permissions, Nearby.", appliesTo: ["Place panel (Location, Building, Floor, Area)"], priority: "P0" },
  { name: "Action button row (consistent set)", whatGoogleDoes: "Directions, Save, Nearby, Send to phone, Share. Same 5 buttons on every place, in the same order.", whyItWorks: "Muscle memory. Cross-place consistency. Users never hunt for primary actions.", verkadaApplication: "Standard 5-button row across every Place, Marker, and Collection: Open in Editor, Add to Collection, Share, Permissions, Nearby. Order is fixed.", appliesTo: ["Every entity panel"], priority: "P0" },
  { name: "Save-to-list popover (multi-select with create)", whatGoogleDoes: "Save button opens a popover with checkboxes for system lists (Favorites, Want to go) and custom lists, plus a 'New list' button at the bottom.", whyItWorks: "One affordance for two jobs: assign to existing list, or create-and-assign in the same gesture.", verkadaApplication: "'Add to Collection' popover with system Collections (Favorites, Watchlist) + user Collections + 'New Collection'. Inherits Verkada permission rules.", appliesTo: ["Every entity panel"], priority: "P0" },
  { name: "Filter chip row above results", whatGoogleDoes: "Top of results: dynamic chips (Hours, Rating, Price for restaurants; different chips for hotels) + 'All filters' sheet.", whyItWorks: "Filters surface 70% of intent in one tap. The 'All filters' escape hatch handles the long tail without polluting the chip row.", verkadaApplication: "Result chips: Site, Device type, Status (online/offline), Owner, Tag, Date range. Chip set is dynamic per result class. 'Advanced filters' sheet for the long tail.", appliesTo: ["Search results", "Activity feed", "Editor lists"], priority: "P0" },
  { name: "'Update results when map moves' opt-in", whatGoogleDoes: "A checkbox under the result list lets users couple the result set to the viewport. 'Search this area' button appears when decoupled.", whyItWorks: "Honors two user modes (browsing vs. pinned search) without forcing a choice up front.", verkadaApplication: "Identical pattern: 'Update results when map moves' toggle + 'Search this area' button. Critical for security ops scoping cameras to a viewport.", appliesTo: ["Search results", "Activity feed"], priority: "P1" },
  { name: "Layers panel (categorized toggleable overlays)", whatGoogleDoes: "Layers panel groups overlays by category: Map details (Transit, Traffic, Biking…), Map tools (Travel time, Measure), Map type.", whyItWorks: "Clear separation between data overlays (state) and rendering choices (basemap). Users can hold multiple toggles on at once.", verkadaApplication: "Data Layers panel grouped: Context, Device State, Operations, Analytics, Emergency. 12 toggles total. Sources (Devices & Entities) + Outputs (Visualizations) are compositionally independent.", appliesTo: ["Map viewport (all modes)"], priority: "P0" },
  { name: "Breadcrumb / back navigation in every subpanel", whatGoogleDoes: "Every secondary panel has an explicit Back arrow at the top-left, not relying on browser back.", whyItWorks: "Spatial orientation. Users always know where they are and how to go up one level.", verkadaApplication: "Place panels show a 4-level spatial breadcrumb (Org › Location › Building › Floor › Area). Every drilldown panel has explicit Back. Browser back is a fallback, not the path.", appliesTo: ["Every drilldown panel"], priority: "P0" },
  { name: "Nearby (re-seed search by context)", whatGoogleDoes: "Place panel has a 'Nearby' button that re-seeds the search box with 'near <place>' so users can find adjacent things without losing context.", whyItWorks: "Bridges 'I'm looking at X' to 'now show me Y near X' in one click. Preserves the spatial anchor.", verkadaApplication: "Highest leverage for security ops: 'cameras near this door', 'sensors near this elevator', 'doors near this alarm zone'. One button, scoped to the active Place.", appliesTo: ["Place panel"], priority: "P0" },
  { name: "Auth-gated rail items redirect gracefully", whatGoogleDoes: "Clicking Saved/Recents when signed-out redirects to a sign-in page, then returns to the action.", whyItWorks: "Doesn't hide auth-gated affordances; surfaces the gate at the moment of intent.", verkadaApplication: "Permissioned items (e.g., Editor, Activity for Sites you can't view) show the affordance but trigger a permission-request flow on click instead of hiding.", appliesTo: ["Rail", "Menu drawer"], priority: "P1" },
]

// ─── Proposed IA tree ────────────────────────────────────────────────────────
//
// This tree mirrors the interactive prototype (Tab 1) 1:1. Every node here
// corresponds to a surface, control, list, or state in the click-through
// prototype. Edits to either side should land in both places. Top-level
// groupings follow the prototype's mode model:
//   1. Prototype states  (the 16 named click-through variants A-P)
//   2. Viewer mode       (chrome, rail, flyouts, search, site picker,
//                         place card, file flows, collection detail)
//   3. Editor mode       (top bar, toolbelt, selection aside)
//   4. Settings modal    (categories, scope tabs, row metadata)
//   5. Data model        (Places / Sites / Markers / Collections /
//                         Layouts / Data layers)

export type NavNode = {
  label: string
  depth: number
  /** Visual tag for the node. `mode` chunks the top-level groupings;
   *  `surface` marks a discrete floating UI surface (e.g. Layers,
   *  Alerts, Place card); other kinds match the actual control type. */
  kind?:
    | "mode"
    | "surface"
    | "rail"
    | "search"
    | "tab"
    | "button"
    | "drawer"
    | "panel"
    | "filter"
    | "layer"
    | "input"
    | "section"
    | "state"
  note?: string
  source?: string
}

export const NAV_TREE: NavNode[] = [
  // ──────────────────────────────────────────────────────────────────────
  // 1. Prototype states (the click-through variants)
  // ──────────────────────────────────────────────────────────────────────
  { label: "Prototype states (16 click-through variants A\u2013P)", depth: 0, kind: "mode", note: "Direct map to the Mock prototype tab. Each state is reachable from the left-side state rail." },
  { label: "A \u00b7 Null state", depth: 1, kind: "state", note: "Map only. Hamburger top-left, floating search, Alerts cluster, Account avatar top-right." },
  { label: "B \u00b7 Rail expanded", depth: 1, kind: "state", note: "Hamburger clicked. Icon column visible. \u2699 Settings footer item is the only Viewer entry to Settings." },
  { label: "C \u00b7 Recents flyout", depth: 1, kind: "state" },
  { label: "D \u00b7 Locations flyout", depth: 1, kind: "state", note: "Site context strip on top, filter chips + free-text, spatial breadcrumb." },
  { label: "E \u00b7 Collections flyout", depth: 1, kind: "state" },
  { label: "F \u00b7 Files flyout", depth: 1, kind: "state", note: "Files list with drag-to-canvas affordance for first-time builders." },
  { label: "G \u00b7 Place selected", depth: 1, kind: "state", note: "Place card pinned bottom-left. \u201cOpen in Editor\u201d is the only entry to editor mode." },
  { label: "H \u00b7 Viewer \u2192 Editor handoff", depth: 1, kind: "state", note: "Place card highlights \u201cOpen in Editor\u201d. Viewer chrome dims, editor chrome fades in." },
  { label: "I \u00b7 Editor mode", depth: 1, kind: "state", note: "Toolbelt + selection aside + top bar. Viewer rail and alerts hidden." },
  { label: "J \u00b7 Search active", depth: 1, kind: "state", note: "Navigator search. Results dropdown. Site scope is read-only context here." },
  { label: "K \u00b7 Site picker open", depth: 1, kind: "state", note: "Site chip clicked. Shows only sites with map presence in current view." },
  { label: "L \u00b7 File-first dropzone", depth: 1, kind: "state", note: "Files flyout open. Dropzone at top of list. Path A flow." },
  { label: "M \u00b7 Place + drag accelerator", depth: 1, kind: "state", note: "Place card open. Browser detects dragover. Drop hint over map. Path B flow." },
  { label: "N \u00b7 File attaching / aligning", depth: 1, kind: "state", note: "Post-drop. Progress card + alignment prompt over the map." },
  { label: "O \u00b7 Collection detail", depth: 1, kind: "state", note: "Inside a Collection. Children render as a flat nav list." },
  { label: "P \u00b7 Settings open", depth: 1, kind: "state", note: "User + Org Admin settings, scoped tabs, locked rows." },

  // ──────────────────────────────────────────────────────────────────────
  // 2. Viewer mode
  // ──────────────────────────────────────────────────────────────────────
  { label: "Viewer mode", depth: 0, kind: "mode", note: "Read-only inspection of the map. All variants A\u2013G, J\u2013O, P live here. The only path into Editor mode is the Place card." },

  // 2a. Persistent chrome (always visible)
  { label: "Persistent chrome (visible across all viewer states)", depth: 1, kind: "section" },
  { label: "Hamburger button (top-left)", depth: 2, kind: "button", note: "Toggles the left rail." },
  { label: "Floating search bar (top-center)", depth: 2, kind: "search", source: "GMaps search-first", note: "Federated search across Devices, Entities, Places, Collections." },
  { label: "Top-right cluster", depth: 2, kind: "section" },
  { label: "Site scope chip (current site or \u201cN sites\u201d)", depth: 3, kind: "button", note: "Click opens the Site picker." },
  { label: "Alerts cluster (collapsed badge / expanded list)", depth: 3, kind: "surface", note: "Live alert counts. Click to expand the alert feed." },
  { label: "Account avatar menu", depth: 3, kind: "surface", note: "Identity + help only. Settings is intentionally NOT here \u2014 the menu footer hints \u201copen the rail.\u201d" },
  { label: "Identity block (name, email, org chips, role)", depth: 4 },
  { label: "Help &amp; hotkeys", depth: 4, kind: "button" },
  { label: "Manage account", depth: 4, kind: "button" },
  { label: "Switch org", depth: 4, kind: "button" },
  { label: "Sign out", depth: 4, kind: "button" },
  { label: "Bottom-left Layers cluster", depth: 2, kind: "surface", note: "Collapsed pill summarizing visible devices and current overlay mode. Expanded panel splits Devices (multi-select) and Data overlay (single-select)." },
  { label: "Devices column (multi-select)", depth: 3, kind: "section" },
  { label: "Cameras (count)", depth: 4, kind: "layer" },
  { label: "Doors (count)", depth: 4, kind: "layer" },
  { label: "Access readers (count)", depth: 4, kind: "layer" },
  { label: "Sensors (count)", depth: 4, kind: "layer" },
  { label: "Intercoms (count)", depth: 4, kind: "layer" },
  { label: "Speakers (count)", depth: 4, kind: "layer" },
  { label: "Alarms (count)", depth: 4, kind: "layer", note: "Disabled when count is 0." },
  { label: "Data overlay column (single-select)", depth: 3, kind: "section" },
  { label: "None \u2014 identity only", depth: 4, kind: "layer" },
  { label: "Device health \u2014 markers colored by online / offline / degraded", depth: 4, kind: "layer" },
  { label: "Coverage \u2014 FOV cones + read range", depth: 4, kind: "layer" },
  { label: "Alerts and events \u2014 active alerts + per-device event counts", depth: 4, kind: "layer" },
  { label: "Footer toggles", depth: 3, kind: "section" },
  { label: "Satellite (toggle)", depth: 4, kind: "input", source: "GMaps Map type" },
  { label: "Dark mode (toggle)", depth: 4, kind: "input" },
  { label: "Bottom-right zoom controls", depth: 2, kind: "surface" },

  // 2b. Left rail
  { label: "Left rail (expanded via hamburger)", depth: 1, kind: "rail", note: "Icon column. Each item opens a flyout to the right of the rail." },
  { label: "Recents (\u21BA)", depth: 2, kind: "button", source: "GMaps Recents" },
  { label: "Locations (\u2261)", depth: 2, kind: "button", note: "Verkada-only. Top-level container for spatial entities." },
  { label: "Collections (\u25C7)", depth: 2, kind: "button", source: "GMaps Saved" },
  { label: "Files (\u25A4)", depth: 2, kind: "button", note: "Verkada-only. Layouts attached to Places live here." },
  { label: "\u2699 Settings (footer)", depth: 2, kind: "button", note: "Only Viewer entry to the Settings modal. Sits below a footer divider." },

  // 2c. Rail flyouts
  { label: "Rail flyouts (one open at a time, slides out from the rail)", depth: 1, kind: "section", note: "All flyouts share the same shape: site context strip on top, filter chips, list of children." },
  { label: "Recents flyout", depth: 2, kind: "panel", source: "GMaps Recents" },
  { label: "Recent items list (place name, when, jump-to)", depth: 3 },
  { label: "Locations flyout", depth: 2, kind: "panel" },
  { label: "Compact spatial breadcrumb (Top \u203A first \u203A \u2026 \u203A parent \u203A current)", depth: 3, kind: "section" },
  { label: "Filter chips + free-text", depth: 3, kind: "filter" },
  { label: "Children of current node (Locations / Buildings / Floors / Areas)", depth: 3 },
  { label: "Click child \u2192 fly-to + descend", depth: 3 },
  { label: "Collections flyout", depth: 2, kind: "panel", source: "GMaps Saved (1:1 model)" },
  { label: "Top list (each collection with member count + summary)", depth: 3 },
  { label: "Detail (variant O): flat nav list of memberIds across Locations / Floors / Areas", depth: 3 },
  { label: "Files flyout", depth: 2, kind: "panel" },
  { label: "Files dropzone (Path A)", depth: 3, kind: "section" },
  { label: "File list (each file with attached Place + status)", depth: 3 },
  { label: "Bind wizard callout (file \u2192 Place attach)", depth: 3 },

  // 2d. Search
  { label: "Search active (variant J)", depth: 1, kind: "surface", source: "GMaps search-first" },
  { label: "Search dropdown", depth: 2, kind: "panel" },
  { label: "Filter pills: All / Devices / Entities / Places / Collections", depth: 3, kind: "filter" },
  { label: "Mixed-entity result list", depth: 3 },
  { label: "Site scope context (read-only here)", depth: 2, note: "Search does not change scope; scope is set explicitly via the Site picker." },

  // 2e. Site picker
  { label: "Site picker open (variant K)", depth: 1, kind: "surface", note: "Filtered to sites with map presence in the current view. Multi-select." },
  { label: "Filter input (text)", depth: 2, kind: "input" },
  { label: "Site rows (id, place count, checkbox)", depth: 2 },
  { label: "Footer hint: \u201cGo to Maps setup\u201d for sites with no place presence", depth: 2 },

  // 2f. Place card
  { label: "Place card (variant G \u2014 pinned bottom-left)", depth: 1, kind: "surface" },
  { label: "Header (last segment of breadcrumb + site badges)", depth: 2, kind: "section" },
  { label: "Action row", depth: 2, kind: "section", source: "GMaps action row" },
  { label: "Open in Editor (primary; only entry to editor mode)", depth: 3, kind: "button" },
  { label: "Add to Collection (popover)", depth: 3, kind: "button", source: "GMaps Save \u2192 list picker" },
  { label: "Share", depth: 3, kind: "button" },
  { label: "Permissions", depth: 3, kind: "button" },
  { label: "Nearby", depth: 3, kind: "button", source: "GMaps Nearby" },
  { label: "Tabs (Overview / Markers / Layouts / Permissions)", depth: 2, kind: "tab" },
  { label: "Overview", depth: 3 },
  { label: "Markers (count) \u2014 device list scoped to this Place", depth: 3 },
  { label: "Layouts \u2014 attached files (PDF / DWG / PNG)", depth: 3 },
  { label: "Permissions \u2014 Sites, roles, sharing", depth: 3, note: "Verkada-only" },

  // 2g. File drop flows
  { label: "File drop flows (Path A and Path B)", depth: 1, kind: "section", note: "Two parallel ways to attach a layout file to a Place." },
  { label: "Path A \u2014 File-first dropzone (variant L)", depth: 2, kind: "state", note: "Open Files flyout, drop the file, then pick or create a Place." },
  { label: "Path B \u2014 Place + drag accelerator (variant M)", depth: 2, kind: "state", note: "Place card open, browser detects dragover, on-map drop hint." },
  { label: "File attaching / aligning (variant N)", depth: 2, kind: "state", note: "Post-drop. Progress card + alignment prompt." },

  // 2h. Editor handoff (transient)
  { label: "Viewer \u2192 Editor handoff (variant H)", depth: 1, kind: "state", note: "Transient state between G and I. Place card highlights \u201cOpen in Editor\u201d. Confirms the only path into editor mode." },

  // ──────────────────────────────────────────────────────────────────────
  // 3. Editor mode
  // ──────────────────────────────────────────────────────────────────────
  { label: "Editor mode (variant I)", depth: 0, kind: "mode", note: "Verkada-only. Entered exclusively via \u201cOpen in Editor\u201d on a Place card. Scope = that Place. Viewer rail and alerts hidden." },

  // 3a. Top bar
  { label: "Top bar", depth: 1, kind: "section" },
  { label: "Place breadcrumb (Org \u203A Location \u203A \u2026 \u203A Place)", depth: 2, kind: "section" },
  { label: "Undo / Redo", depth: 2, kind: "button" },
  { label: "Save status (clean / dirty / saving / saved)", depth: 2 },
  { label: "Exit (returns to Place card)", depth: 2, kind: "button" },

  // 3b. Toolbelt
  { label: "Editor toolbelt (left, vertical column)", depth: 1, kind: "surface", note: "Inspired by Site Planner ProductMenu. Click a category to open its slide-out tile panel." },
  { label: "Select (pointer / multi-select)", depth: 2, kind: "button" },
  { label: "Devices", depth: 2, kind: "section", note: "Plot Verkada hardware. Drag a tile onto the map or click-then-click to stamp." },
  { label: "Cameras (CD52, CD42, CD32, CB52, CY52)", depth: 3 },
  { label: "Doors (AC42, AC62, AC72)", depth: 3 },
  { label: "Access readers (AD32, AD33, AD34)", depth: 3 },
  { label: "Sensors (SV11, SV23, SV25)", depth: 3 },
  { label: "Intercoms (TD52)", depth: 3 },
  { label: "Speakers (BS11)", depth: 3 },
  { label: "Alarms (BX11, BX12)", depth: 3 },
  { label: "Architecture", depth: 2, kind: "section", note: "Draw the building shell so plotted devices snap to real geometry." },
  { label: "Wall, Doorway, Window, Elevator, Stairs, Boundary", depth: 3 },
  { label: "Annotations", depth: 2, kind: "section", note: "Non-Verkada notes: labels, sticky notes, scoped regions." },
  { label: "Text label, Sticky note, Region, Arrow, Pin", depth: 3 },
  { label: "Layouts", depth: 2, kind: "section", note: "Manage the floorplan files attached to this Place." },
  { label: "Place layout, Align, Replace, Detach, Version history", depth: 3 },
  { label: "Measure", depth: 2, kind: "section", note: "Distance, area, and coverage simulation." },
  { label: "Distance, Area, Coverage simulator", depth: 3 },
  { label: "Share &amp; Permissions", depth: 2, kind: "section" },
  { label: "Share link (internal-only; viewer or editor)", depth: 3 },
  { label: "Permissions (inherited from Site; override per-Place)", depth: 3 },
  { label: "Audit log (who viewed, who edited, when)", depth: 3, note: "Verkada-only" },
  { label: "Publish revision (snapshot for distribution)", depth: 3 },
  { label: "\u2699 Settings (toolbelt bottom group)", depth: 2, kind: "button", note: "Editor entry to the Settings modal." },
  { label: "? Help &amp; Hotkeys (toolbelt bottom group)", depth: 2, kind: "button", note: "Opens the hotkeys modal. ? from anywhere triggers this." },

  // 3c. Selection aside
  { label: "Selection aside (right)", depth: 1, kind: "surface", note: "Inspired by Site Planner RightFloatingAside. Switches between bill of materials (nothing selected) and marker detail (one marker selected)." },
  { label: "Bill of materials (default \u2014 no selection)", depth: 2 },
  { label: "Marker detail (when a marker is selected)", depth: 2 },

  // ──────────────────────────────────────────────────────────────────────
  // 4. Settings modal
  // ──────────────────────────────────────────────────────────────────────
  { label: "Settings modal (variant P)", depth: 0, kind: "mode", note: "Reachable from the rail \u2699 in Viewer mode and the toolbelt \u2699 in Editor mode. Two-pane layout: category nav on the left, settings rows on the right." },
  { label: "Scope filter tabs (All / User / Org admin)", depth: 1, kind: "filter", note: "Admins can switch tabs. Non-admins see org rows but they\u2019re locked." },
  { label: "Category navigation (left pane)", depth: 1, kind: "section" },
  { label: "Map view", depth: 2, note: "Default basemap, theme, traffic, 3D buildings, auto-rotate." },
  { label: "Navigation", depth: 2, note: "Click-to-drag, scroll-to-zoom, default zoom, sticky site scope." },
  { label: "Editor", depth: 2, note: "Canvas grid, grid spacing, measurement unit, snap-to-grid, snap-to-walls, autosave." },
  { label: "Devices &amp; data", depth: 2, note: "Default device visibility, default overlay, clustering threshold." },
  { label: "Alerts", depth: 2, note: "Notification scope, sound, silence windows." },
  { label: "Accessibility", depth: 2, note: "Reduced motion, high-contrast pins, keyboard-only mode." },
  { label: "Privacy &amp; data", depth: 2, note: "Retention preferences, data export, audit subscription." },
  { label: "Hotkeys", depth: 2, note: "Per-action key bindings, palette open shortcut." },
  { label: "Per-row metadata", depth: 1, kind: "section" },
  { label: "Source badge (Site Planner / Google Maps / New)", depth: 2 },
  { label: "Scope badge (User / Org admin)", depth: 2 },
  { label: "Reset to default (per-row + reset all)", depth: 1, kind: "button" },

  // ──────────────────────────────────────────────────────────────────────
  // 5. Data model (entities the prototype operates on)
  // ──────────────────────────────────────────────────────────────────────
  { label: "Data model (referenced throughout; not surfaced as a screen)", depth: 0, kind: "mode", note: "Every surface above resolves down to these primitives. Cross-reference: the Verkada Maps 2.0 dictionary anchors on Tab 3." },
  { label: "Places (spatial)", depth: 1, kind: "section" },
  { label: "Location \u2192 Building \u2192 Floor \u2192 Area", depth: 2, note: "Strict hierarchy. Locations can also hold Areas directly (e.g. outdoor pop-ups)." },
  { label: "Sites (RBAC, not on the map)", depth: 1, kind: "section", note: "Verkada-only. Permission bucket inherited from Command. Every Place resolves to one or more Sites." },
  { label: "Markers (placed on Places)", depth: 1, kind: "section" },
  { label: "Verkada devices (cameras, doors, access, sensors, intercoms, speakers, alarms)", depth: 2 },
  { label: "Verkada entities (logical overlays)", depth: 2 },
  { label: "Architectural (walls, doors, windows, elevators, stairs, boundaries)", depth: 2 },
  { label: "Annotations (labels, notes, regions, arrows, pins \u2014 non-Verkada)", depth: 2 },
  { label: "Collections (flat, non-spatial)", depth: 1, kind: "section", source: "GMaps Saved (1:1 model)", note: "Optional containers holding Locations, Buildings, Floors, Files. For grouping and sharing only. Never directly contain Sites." },
  { label: "Layouts / Files", depth: 1, kind: "section", note: "File is the artifact (PDF, DWG, PNG). Layout is the arranged scene attached to a Place. Files can live in Collections before being placed." },
  { label: "Data layers", depth: 1, kind: "section", note: "Composable. Devices = sources, Data overlay = output mode. Both are independently toggleable." },
  { label: "Devices (sources, multi-select)", depth: 2 },
  { label: "Data overlay modes (output, single-select: None / Health / Coverage / Alerts and events)", depth: 2 },
  { label: "Basemap (Streets / Satellite + Dark toggle)", depth: 2, source: "GMaps Map type" },
]

// ─── Tab 5: GMaps Deep Audit ──────────────────────────────────────────────────

export type DeepPanel = {
  num: string
  title: string
  entry: string
  google: string[]
  verkada: string[]
  verdict: Verdict
  flag?: string
  blocked?: boolean
}

export const DEEP_PANELS: DeepPanel[] = [
  {
    num: "1", title: "Saved / Your Lists", entry: "Left rail \"Saved\" button", blocked: true,
    google: [
      "Hard sign-in redirect on click. No teaser, no empty state, no preview.",
      "Authenticated state lists default lists (Favorites, Want to go, Starred, Travel plans) plus user-created custom lists.",
      "Each list has its own detail view with saved places rendered as pins on the map.",
    ],
    verkada: [
      "Map this to Collections, not Saved. Collections is our Saved-equivalent.",
      "Skip the gate. Users are already authenticated. Open straight into Collections.",
      "Drop Google's 'default lists' concept (Favorites, Want to go). Verkada has no semantic for those.",
      "Keep Collections in the left rail as a top-level item, same prominence Google gives Saved.",
    ],
    verdict: "adapt",
    flag: "Google's default lists (Favorites/Want to go) are consumer travel concepts. Forcing analogs into Verkada would create empty seed lists. Skip them.",
  },
  {
    num: "2", title: "Your Places", entry: "Hamburger menu → \"Your contributions\" (sign-in gated)", blocked: true,
    google: [
      "No 'Your Places' item in the visible hamburger menu in 2026 (Google removed or renamed it).",
      "Closest analog 'Your contributions' immediately redirects to sign-in.",
      "Labeled places (Home/Work) are separate from saved-list items: they are pinned, special-cased.",
    ],
    verkada: [
      "Reject the 'Your Places' bucket as a top-level concept.",
      "The closest Verkada need is Recents (already in the rail), which serves the 'places I have been touching' job better with less ceremony.",
      "Skip Google's Labeled places pattern. Sites already pin importance.",
    ],
    verdict: "reject",
    flag: "Your Places mixes too many concepts (labeled, saved, visited, maps). Recents + Collections + Site scope already cover the same jobs without the conceptual overload.",
  },
  {
    num: "3", title: "Recents / Search history", entry: "Search box focus → dropdown",
    google: [
      "Search box at top-left, dropdown opens on focus, suggestions render as user types.",
      "Suggestion types in one mixed list: exact query, query expansion, branded place chain, specific place with address.",
      "No 'Recent' section pinned to the dropdown for unauthenticated sessions.",
      "No category icons. All suggestions are plain text rows.",
      "Suggestions appear ~300ms after typing stops, no loading spinner.",
    ],
    verkada: [
      "Adopt the dropdown-on-focus pattern. Search is already the navigator in v2.",
      "Adapt: ADD category icons. Verkada result types (Place, Device, Entity, File, Collection) are more heterogeneous.",
      "Show Recents at the top of the dropdown on focus before typing. Already authenticated, so no gating.",
      "Group results by type within the dropdown (header per type) instead of a single mixed list.",
    ],
    verdict: "adapt",
    flag: "Google's flat suggestion list works because all results are essentially Places. Verkada's results span 5+ kinds; grouping and icons are non-optional.",
  },
  {
    num: "4", title: "Place detail card", entry: "Click a search result",
    google: [
      "Hero photo (16:9), place name, rating, category badge, review count, photo count.",
      "Action bar: 5 icon+label buttons (Directions, Save, Nearby, Send to phone, Share) plus a kebab.",
      "Four tabs: Overview, Menu, Reviews, About. Overview is default.",
      "Overview: address, hours (accordion), price range, website, Popular Times chart, Reviews preview.",
      "Copy-to-clipboard buttons next to address, website, phone, plus code.",
    ],
    verkada: [
      "Adopt the hero + action bar + tabbed body layout. This IS the Verkada Place card pattern.",
      "Adapt the action bar: 'Open in Editor', 'Share', 'Permissions', 'Save to Collection'.",
      "Replace tabs: Overview, Markers, Layouts, Permissions.",
      "Adopt copy-to-clipboard for all identifier-like fields: site name, location_id, device IDs.",
      "Reject in-panel review search. Markers tab has its own filter matching EntityListPanel shape.",
    ],
    verdict: "adopt",
    flag: "Google's hero photo is a marketing asset. Verkada's hero should be a floorplan thumbnail or building photo. Do not skip the hero region: it gives the panel identity at a glance.",
  },
  {
    num: "5", title: "Suggest an edit / Add a missing place", entry: "Place card → \"Suggest an edit\" button (sign-in gated)", blocked: true,
    google: [
      "'Suggest an edit' is a small text button in the Overview tab, below the plus code. Easy to miss.",
      "Click opens a 'Report a data problem' modal, immediately gated by sign-in.",
      "'Add a missing place' lives in the hamburger menu, also gated.",
      "Edit and Add are clearly secondary contributions for Google. Most users consume; few contribute.",
    ],
    verkada: [
      "Invert the prominence. File-creates-Place is a PRIMARY onboarding moment for Verkada.",
      "Adopt the form steps idea (location → building/floor → name) but reject the buried-button placement.",
      "Use the in-Files-flyout permanent dropzone (Path A) and the on-map dragover overlay (Path B).",
      "Skip Google's photo upload step. We are uploading floorplans. The wizard's last step is alignment, not photos.",
    ],
    verdict: "adapt",
    flag: "Google's Edit is a contribution flow for a public dataset (low-trust, moderated). Verkada's analog is an authenticated workflow on the user's own data (high-trust, immediate). Interaction prominence and validation model should differ.",
  },
]
