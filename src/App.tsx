import { useState, useMemo, useEffect } from "react"
import { type ColumnDef } from "@tanstack/react-table"
import { ChevronRight, ChevronDown, Link } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  FULL_AUDIT_ROWS, PATTERNS, NAV_TREE, DEEP_PANELS,
  VERDICT_LABEL, VERDICT_COLOR,
  type Verdict,
} from "@/data"
import { PageHeader } from "@/components/page-header"
import { TldrCard } from "@/components/tldr-card"
import { Callout } from "@/components/callout"
import { DataTable } from "@/components/data-table"
import { DataSources } from "@/components/data-sources"
import { PageFooter } from "@/components/page-footer"
import { MockPrototype } from "@/components/mock-prototype"
import { type ColumnFiltersState } from "@tanstack/react-table"

// ─── Anchor heading ───────────────────────────────────────────────────────────

function AnchorH2({ id, children, className }: { id: string; children: React.ReactNode; className?: string }) {
  return (
    <h2
      id={id}
      className={cn("scroll-mt-6 group flex items-center gap-2 text-lg font-semibold mt-8 mb-3", className)}
    >
      {children}
      <a
        href={`#${id}`}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
        aria-label="Anchor link"
      >
        <Link className="size-3.5" />
      </a>
    </h2>
  )
}

type TabId = "prototype" | "proposed-ia" | "patterns-principles"

const TABS: { id: TabId; label: string; sub: string }[] = [
  { id: "prototype", label: "1 \u00b7 Maps IA Prototype", sub: "Interactive click-through of the Verkada Maps 2.0 IA \u2014 16 viewer + editor + settings states." },
  { id: "proposed-ia", label: "2 \u00b7 Proposed IA Structure", sub: "Complete left-sidebar information architecture for Verkada Maps 2.0, derived from the Google Maps audit." },
  { id: "patterns-principles", label: "3 \u00b7 Google Maps Patterns & Principles", sub: "TL;DR, Verkada Maps dictionary, full Google Maps surface audit, reusable UX patterns, deep panel re-audit, and decision checklist." },
]

// Backwards-compat: old #full / #patterns / #verkada / #mock / #gmaps-deep
// hashes still land readers on a sensible new tab. Section anchors that
// live inside the merged patterns-principles tab also map back to it,
// so a refresh on e.g. #audit re-opens the right tab and scrolls there.
const HASH_ALIASES: Record<string, TabId> = {
  // New
  "prototype": "prototype",
  "proposed-ia": "proposed-ia",
  "patterns-principles": "patterns-principles",
  // Old tab IDs
  "mock": "prototype",
  "verkada": "proposed-ia",
  "full": "patterns-principles",
  "patterns": "patterns-principles",
  "gmaps-deep": "patterns-principles",
  // In-tab section anchors on patterns-principles
  "tldr": "patterns-principles",
  "dictionary": "patterns-principles",
  "audit": "patterns-principles",
  "decisions": "patterns-principles",
  "decision-checklist": "patterns-principles",
  "gmaps-panels": "patterns-principles",
}

function VerdictBadge({ verdict }: { verdict: Verdict }) {
  return (
    <span className={cn("inline-flex items-center rounded border px-2 py-0.5 text-[11px] font-medium whitespace-nowrap", VERDICT_COLOR[verdict])}>
      {VERDICT_LABEL[verdict]}
    </span>
  )
}

// Overview content (TL;DR + dictionary anchors). Rendered at the top of
// Tab 1 (Full audit) so the navigation pills sit directly under the header.
const TLDR_ITEMS: string[] = [
  "Google Maps has 24 distinct left-sidebar surfaces. Verkada adopts 9 as-is, adapts 6, skips 6, and adds 3 net-new.",
  "The top P0 UX patterns to carry over: contextual place detail panel, layered data-layer toggle, and grouped search autocomplete.",
  "Verkada-first IA flips Google's content hierarchy: Locations and Collections lead, not recents and saved places.",
  "Search should add per-result-type icons \u2014 our results (cameras, floors, locations) are more heterogeneous than Google's.",
  "File-creates-Place is a primary onboarding moment and should be prominently surfaced, not buried.",
]

// ─── Tab 1 ───────────────────────────────────────────────────────────────────

const AUDIT_COLUMNS: ColumnDef<typeof FULL_AUDIT_ROWS[0], unknown>[] = [
  {
    accessorKey: "gmaps",
    header: "Google Maps surface",
    cell: ({ getValue }) => (
      <span className="text-muted-foreground text-xs">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "verkada",
    header: "Verkada Maps 2.0 equivalent",
    cell: ({ getValue }) => <span className="text-sm">{getValue() as string}</span>,
  },
  {
    accessorKey: "verdict",
    header: "Verdict",
    cell: ({ getValue }) => <VerdictBadge verdict={getValue() as Verdict} />,
    filterFn: (row, _id, filterValue) =>
      filterValue === "all" || row.original.verdict === filterValue,
  },
  {
    accessorKey: "rationale",
    header: "Rationale",
    enableSorting: false,
    cell: ({ getValue }) => (
      <span className="text-muted-foreground text-xs leading-relaxed">{getValue() as string}</span>
    ),
  },
]

function FullAuditSection() {
  const [filter, setFilter] = useState<Verdict | "all">("all")
  const counts = { adopt: 0, adapt: 0, reject: 0, new: 0 } as Record<Verdict, number>
  FULL_AUDIT_ROWS.forEach(r => counts[r.verdict]++)

  const externalFilter: ColumnFiltersState = filter === "all"
    ? []
    : [{ id: "verdict", value: filter }]

  return (
    <section className="space-y-6 scroll-mt-6">
      <AnchorH2 id="audit">Full surface audit</AnchorH2>
      <Callout variant="info" title="What this is">
        Every Google Maps left-sidebar surface mapped 1:1 to a Verkada Maps 2.0 equivalent. Verdict tells you whether to lift the pattern as-is, adapt it, drop it, or recognize it as Verkada-specific net-new.
      </Callout>

      <div className="flex flex-wrap gap-3">
        {(["all", "adopt", "adapt", "reject", "new"] as const).map(v => (
          <button
            key={v}
            onClick={() => setFilter(v)}
            className={cn(
              "rounded-full border px-3.5 py-1 text-xs font-medium transition-colors",
              filter === v
                ? "bg-foreground text-background border-foreground"
                : "border-border text-muted-foreground hover:border-foreground/50",
            )}
          >
            {v === "all" ? `All (${FULL_AUDIT_ROWS.length})` : `${VERDICT_LABEL[v]} (${counts[v]})`}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-3">
        {(["adopt", "adapt", "reject", "new"] as Verdict[]).map(v => (
          <div key={v} className={cn("rounded-xl border p-4", VERDICT_COLOR[v])}>
            <div className="text-3xl font-bold">{counts[v]}</div>
            <div className="text-xs mt-1 opacity-80">{VERDICT_LABEL[v]}</div>
          </div>
        ))}
      </div>

      <DataTable
        columns={AUDIT_COLUMNS}
        data={FULL_AUDIT_ROWS}
        externalFilter={externalFilter}
        showSearch
        searchPlaceholder="Search surfaces, verdicts, rationale…"
      />
    </section>
  )
}

// ─── Patterns section ────────────────────────────────────────────────────────

const PRIORITY_COLOR: Record<string, string> = {
  P0: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  P1: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  P2: "bg-neutral-500/15 text-neutral-300 border-neutral-500/30",
}

// Left border accent per priority (outlined on the card)
const PRIORITY_BORDER: Record<string, string> = {
  P0: "border-l-[3px] border-l-emerald-500/70",
  P1: "border-l-[3px] border-l-sky-500/70",
  P2: "border-l-[3px] border-l-neutral-500/50",
}

function PatternsSection() {
  const allNames = useMemo(() => PATTERNS.map(p => p.name), [])
  // Default collapsed in the merged Patterns & Principles tab so the
  // section is scannable; users expand the ones they care about.
  const [open, setOpen] = useState<Set<string>>(() => new Set())
  const allOpen = open.size === PATTERNS.length

  const p0 = PATTERNS.filter(p => p.priority === "P0").length
  const p1 = PATTERNS.filter(p => p.priority === "P1").length

  function toggleAll() {
    setOpen(allOpen ? new Set() : new Set(allNames))
  }

  function toggle(name: string) {
    setOpen(prev => {
      const next = new Set(prev)
      next.has(name) ? next.delete(name) : next.add(name)
      return next
    })
  }

  return (
    <section className="space-y-6 scroll-mt-6">
      <AnchorH2 id="patterns">Reusable UX patterns</AnchorH2>
      <Callout variant="info" title="What this is">
        Reusable UX patterns underneath the Google Maps IA, lifted out of surface-specific context. Each has a Verkada application, priority, and the panels it applies to. Build P0 patterns first — they compound across the entire product.
      </Callout>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "P0 patterns", value: p0, cls: PRIORITY_COLOR.P0 },
          { label: "P1 patterns", value: p1, cls: PRIORITY_COLOR.P1 },
          { label: "P2 patterns", value: 0,  cls: PRIORITY_COLOR.P2 },
        ].map(s => (
          <div key={s.label} className={cn("rounded-xl border p-4", s.cls)}>
            <div className="text-3xl font-bold">{s.value}</div>
            <div className="text-xs mt-1 opacity-80">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Expand / collapse all */}
      <div className="flex justify-end">
        <button
          onClick={toggleAll}
          className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
        >
          {allOpen ? "Collapse all" : "Expand all"}
        </button>
      </div>

      <div className="space-y-2">
        {PATTERNS.map(p => {
          const isOpen = open.has(p.name)
          return (
            <div key={p.name} className={cn("rounded-xl border border-border bg-card overflow-hidden", PRIORITY_BORDER[p.priority])}>
              <button
                className="w-full flex items-center gap-3 p-4 text-left hover:bg-muted/30 transition-colors"
                onClick={() => toggle(p.name)}
              >
                {isOpen
                  ? <ChevronDown className="size-4 text-muted-foreground shrink-0" />
                  : <ChevronRight className="size-4 text-muted-foreground shrink-0" />}
                <span className="font-medium flex-1">{p.name}</span>
                <span className={cn("rounded border px-2 py-0.5 text-[11px] font-medium", PRIORITY_COLOR[p.priority])}>
                  {p.priority}
                </span>
                <span className="text-xs text-muted-foreground ml-2 hidden sm:block">{p.appliesTo.length} surfaces</span>
              </button>
              {isOpen && (
                <div className="px-4 pb-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">What Google does</div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{p.whatGoogleDoes}</p>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Why it works</div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{p.whyItWorks}</p>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Verkada application</div>
                    <p className="text-sm leading-relaxed">{p.verkadaApplication}</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {p.appliesTo.map(s => (
                      <span key={s} className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">{s}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}

// ─── Proposed IA section (was Tab 3) ─────────────────────────────────────────

const KIND_COLOR: Record<string, string> = {
  rail: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
  search: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  panel: "bg-violet-500/15 text-violet-300 border-violet-500/30",
  drawer: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  filter: "bg-teal-500/15 text-teal-300 border-teal-500/30",
  layer: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  section: "bg-neutral-500/15 text-neutral-400 border-neutral-500/30",
  tab: "bg-pink-500/15 text-pink-300 border-pink-500/30",
  button: "bg-blue-500/15 text-blue-300 border-blue-500/30",
}

function NavTreeNode({ node, isExpanded, hasChildren, onToggle }: {
  node: typeof NAV_TREE[0]
  isExpanded: boolean
  hasChildren: boolean
  onToggle: () => void
}) {
  const indent = node.depth * 20
  const isSection = node.kind === "section"
  return (
    <div
      className={cn(
        "flex items-start gap-2 py-1.5 px-2 rounded-lg group",
        isSection ? "bg-muted/20 border border-border/50 mt-2" : "hover:bg-muted/20 transition-colors",
        node.depth === 0 && !isSection ? "border-l-2 border-primary/40 pl-3" : "",
      )}
      style={{ paddingLeft: `${indent + 8}px` }}
    >
      <button
        onClick={hasChildren ? onToggle : undefined}
        className={cn("mt-0.5 shrink-0 size-4", hasChildren ? "cursor-pointer" : "cursor-default")}
      >
        {hasChildren ? (
          isExpanded
            ? <ChevronDown className="size-4 text-muted-foreground" />
            : <ChevronRight className="size-4 text-muted-foreground" />
        ) : (
          <span className="size-4 inline-block" />
        )}
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className={cn("text-sm", isSection ? "font-semibold text-foreground/60 uppercase text-xs tracking-wider" : node.depth === 0 ? "font-medium" : "")}>
            {node.label}
          </span>
          {node.kind && node.kind !== "section" && (
            <span className={cn("rounded border px-1.5 py-px text-[10px] font-medium", KIND_COLOR[node.kind] ?? "bg-muted text-muted-foreground border-border")}>
              {node.kind}
            </span>
          )}
          {node.source && (
            <span className="text-[10px] text-muted-foreground/60">← {node.source}</span>
          )}
        </div>
        {node.note && (
          <p className="text-xs text-muted-foreground/70 mt-0.5 leading-relaxed">{node.note}</p>
        )}
      </div>
    </div>
  )
}

function TabProposedIA() {
  // maxDepth controls which depth levels are visible (0 = root only, 99 = all)
  const [maxDepth, setMaxDepth] = useState<number>(99)
  // Per-node individual collapse (on top of maxDepth)
  const [collapsed, setCollapsed] = useState<Set<number>>(new Set())

  // Max depth that exists in the tree
  const treMaxDepth = useMemo(() => Math.max(...NAV_TREE.map(n => n.depth)), [])

  function hasChildren(i: number): boolean {
    const next = NAV_TREE[i + 1]
    return !!next && next.depth > NAV_TREE[i].depth
  }

  function isVisible(i: number): boolean {
    const node = NAV_TREE[i]
    if (node.depth > maxDepth) return false
    // Check if any ancestor is individually collapsed
    for (let j = i - 1; j >= 0; j--) {
      if (NAV_TREE[j].depth < node.depth && collapsed.has(j)) return false
    }
    return true
  }

  function toggleCollapse(i: number) {
    setCollapsed(prev => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })
  }

  function setLevel(depth: number) {
    setMaxDepth(depth)
    setCollapsed(new Set()) // clear per-node collapses when switching levels
  }

  const LEVELS = [
    { label: "L0", depth: 0 },
    { label: "L1", depth: 1 },
    { label: "L2", depth: 2 },
    { label: "L3", depth: 3 },
    { label: "All", depth: 99 },
  ].filter(l => l.depth <= treMaxDepth || l.depth === 99)

  return (
    <div className="space-y-6">
      <Callout variant="info" title="What this is">
        The complete proposed information architecture for Verkada Maps 2.0, derived from the Google Maps audit. Indentation = hierarchy depth. Use the level controls to expand/collapse the tree by depth, or click individual nodes.
      </Callout>

      {/* Legend */}
      <div className="text-xs text-muted-foreground flex flex-wrap gap-2">
        {Object.entries(KIND_COLOR).map(([kind, cls]) => (
          <span key={kind} className={cn("rounded border px-2 py-0.5", cls)}>{kind}</span>
        ))}
      </div>

      {/* Level controls */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground shrink-0">Expand to:</span>
        <div className="flex gap-1.5">
          {LEVELS.map(l => (
            <button
              key={l.label}
              onClick={() => setLevel(l.depth)}
              className={cn(
                "rounded border px-3 py-1 text-xs font-medium transition-colors",
                maxDepth === l.depth
                  ? "bg-foreground text-background border-foreground"
                  : "border-border text-muted-foreground hover:border-foreground/50",
              )}
            >
              {l.label}
            </button>
          ))}
        </div>
        <span className="text-xs text-muted-foreground ml-1">
          · {NAV_TREE.filter((_, i) => isVisible(i)).length} nodes visible
        </span>
      </div>

      <div className="rounded-xl border border-border bg-card p-4 space-y-0.5">
        {NAV_TREE.map((node, i) =>
          isVisible(i) ? (
            <NavTreeNode
              key={i}
              node={node}
              isExpanded={!collapsed.has(i)}
              hasChildren={hasChildren(i)}
              onToggle={() => toggleCollapse(i)}
            />
          ) : null
        )}
      </div>
    </div>
  )
}

// ─── Tab 4: Interactive prototype ────────────────────────────────────────────

function TabMock() {
  return <MockPrototype />
}

// ─── GMaps deep + decision sections ──────────────────────────────────────────

const GMAPS_HEADLINES: string[] = [
  "Google gates almost everything personalized behind sign-in. We do not need to. Verkada users are already authenticated. Use that to show full state on first open.",
  "Place detail is the most information-dense surface in Maps and fully public. Hero + action bar + tabbed body is the pattern to copy for the Verkada Place card.",
  "Search autocomplete is plain text with mixed result types. No category icons. Verkada should add type icons because our result kinds are more heterogeneous.",
  "'Suggest an edit' is buried. Our analog (file-creates-Place) is a primary onboarding moment; prominence should invert: dropzone + on-map dragover, not a hidden button.",
  "Hours, price, reviews all use inline accordions, not modals. Verkada Place card should follow: collapse dense sections inline.",
]

const DECISION_CHECKLIST: string[] = [
  "Keep Collections at top-level in the left rail (Panel 1).",
  "Do not introduce a 'Your Places' aggregate. Recents + Collections + Site scope cover the same jobs (Panel 2).",
  "Search dropdown: add category icons per result type and group results by kind (Panel 3).",
  "Place card adopts hero + action bar + tabbed body. Add copy-to-clipboard for IDs (Panel 4).",
  "File-creates-Place is primary, not buried. Implemented via Files flyout dropzone (Path A) and on-map dragover (Path B) (Panel 5).",
  "No locked decisions conflict with the audit. Site separation, rail order, Editor-only-from-Place, and Permissions demotion all stand.",
]

function GMapsDeepSection() {
  return (
    <section className="space-y-6 scroll-mt-6">
      <AnchorH2 id="gmaps-deep">Google Maps deep panel audit</AnchorH2>
      <p className="text-sm text-muted-foreground leading-relaxed">
        Focused live re-audit of five Google Maps panels. Each card pairs Google&apos;s concrete behavior with a Verkada verdict. Three of the five panels were sign-in gated; public surface is what we have to work from.
      </p>

      <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 p-5">
        <div className="text-xs font-semibold text-sky-300 uppercase tracking-wider mb-3">5 things to remember</div>
        <ol className="space-y-2">
          {GMAPS_HEADLINES.map((h, i) => (
            <li key={i} className="flex gap-3 text-sm text-sky-200/80">
              <span className="shrink-0 text-sky-400 font-bold">{i + 1}.</span>
              {h}
            </li>
          ))}
        </ol>
      </div>

      <div className="space-y-4">
        {DEEP_PANELS.map(p => (
          <div key={p.num} className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border/50">
              <div>
                <span className="text-xs text-muted-foreground mr-2">Panel {p.num}</span>
                <span className="font-medium">{p.title}</span>
                <div className="text-xs text-muted-foreground mt-0.5">Entry: {p.entry}</div>
              </div>
              <div className="flex items-center gap-2">
                {p.blocked && <span className="rounded border border-amber-500/30 bg-amber-500/10 text-amber-300 text-[11px] px-2 py-0.5">Sign-in gated</span>}
                <VerdictBadge verdict={p.verdict} />
              </div>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">What Google does</div>
                <ul className="space-y-1.5">
                  {p.google.map((g, i) => (
                    <li key={i} className="text-sm text-muted-foreground leading-relaxed flex gap-2">
                      <span className="shrink-0 text-muted-foreground/40">–</span>{g}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">What Verkada should do</div>
                <ul className="space-y-1.5">
                  {p.verkada.map((v, i) => (
                    <li key={i} className="text-sm leading-relaxed flex gap-2">
                      <span className="shrink-0 text-muted-foreground/40">–</span>{v}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            {p.flag && (
              <div className="mx-4 mb-4">
                <Callout variant="warning" title="Note">{p.flag}</Callout>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

function DecisionChecklistSection() {
  return (
    <section className="space-y-4 scroll-mt-6">
      <AnchorH2 id="decisions">Decision checklist</AnchorH2>
      <p className="text-sm text-muted-foreground leading-relaxed">
        How the audit translated into the current mock prototype. Cross-reference each line item to its Panel in the deep audit above.
      </p>
      <div className="rounded-xl border border-border bg-card p-5">
        <ul className="space-y-2">
          {DECISION_CHECKLIST.map((item, i) => (
            <li key={i} className="flex gap-2 text-sm text-muted-foreground">
              <span className="shrink-0 text-emerald-400 font-bold">✓</span>{item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

// ─── Dictionary anchor ────────────────────────────────────────────────────────

function DictionaryAnchor() {
  const items = [
    { title: "Places (spatial)", body: "Location → Building → Floor → Area. Locations can also hold Areas directly. Floors can be outdoor." },
    { title: "Markers (placed on Places)", body: "Architectural (walls, doors, windows, elevators, stairs), Verkada Device, Verkada Entity (logical overlay), Annotation (non-Verkada, labels)." },
    { title: "Collections (flat, non-spatial)", body: "Optional containers holding Locations, Buildings, Floors, Files, Boundaries. For grouping and sharing only. Equivalent to Google Maps saved Lists." },
    { title: "Sites (Command construct)", body: "Permission bucket inherited from Command. Not spatial, not on the map. Every Place item must resolve to one or more Sites for RBAC." },
    { title: "Layouts / Files", body: "File is the artifact (PDF, DWG, PNG). Layout is the arranged scene attached to a Place. Files can live in Collections before being placed." },
    { title: "Data Layers", body: "12 toggleable overlays (Basemap, Device Status, Coverage, Events, Foot Traffic, Door Schedules, Occupancy, Measurements, Emergency, Time-series, etc.)." },
  ]
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <AnchorH2 id="dictionary" className="text-base mt-0 mb-4">Verkada Maps 2.0 dictionary anchors</AnchorH2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(item => (
          <div key={item.title}>
            <div className="text-sm font-medium mb-1">{item.title}</div>
            <p className="text-xs text-muted-foreground leading-relaxed">{item.body}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Patterns & Principles tab (merged) ──────────────────────────────────────

// Anchor IDs map onto the sections rendered inside TabPatternsPrinciples.
// Section anchors that live outside the tab body (#audit, #patterns,
// #gmaps-deep, #decisions, #tldr, #dictionary) all live on this tab.
const PRINCIPLES_TOC: { id: string; label: string }[] = [
  { id: "tldr", label: "TL;DR" },
  { id: "dictionary", label: "Verkada Maps dictionary" },
  { id: "audit", label: "Full surface audit" },
  { id: "patterns", label: "Reusable UX patterns" },
  { id: "gmaps-deep", label: "Google Maps deep panel audit" },
  { id: "decisions", label: "Decision checklist" },
]

function PrinciplesTOC() {
  function jumpTo(id: string) {
    const el = document.getElementById(id)
    if (!el) return
    el.scrollIntoView({ behavior: "smooth", block: "start" })
    history.replaceState(null, "", `#${id}`)
  }
  return (
    <nav
      aria-label="On this page"
      className="rounded-xl border border-border bg-card/60 p-4 lg:sticky lg:top-4"
    >
      <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">
        On this page
      </div>
      <ol className="space-y-1.5">
        {PRINCIPLES_TOC.map((t, i) => (
          <li key={t.id}>
            <button
              onClick={() => jumpTo(t.id)}
              className="w-full text-left text-sm text-muted-foreground hover:text-foreground transition-colors flex gap-2"
            >
              <span className="shrink-0 text-muted-foreground/50 tabular-nums">{i + 1}.</span>
              <span>{t.label}</span>
            </button>
          </li>
        ))}
      </ol>
    </nav>
  )
}

function TldrSection() {
  return (
    <section className="space-y-3 scroll-mt-6">
      <AnchorH2 id="tldr">TL;DR</AnchorH2>
      <TldrCard items={TLDR_ITEMS} className="mb-0" />
    </section>
  )
}

function DictionarySection() {
  return (
    <section className="scroll-mt-6">
      <DictionaryAnchor />
    </section>
  )
}

function TabPatternsPrinciples() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[14rem_minmax(0,1fr)] gap-6 lg:gap-8">
      <aside className="lg:block">
        <PrinciplesTOC />
      </aside>
      <div className="space-y-12 min-w-0">
        <TldrSection />
        <DictionarySection />
        <FullAuditSection />
        <PatternsSection />
        <GMapsDeepSection />
        <DecisionChecklistSection />
      </div>
    </div>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────

const VALID_TABS: TabId[] = ["prototype", "proposed-ia", "patterns-principles"]

function resolveTab(rawHash: string): TabId {
  const key = rawHash.replace(/^#/, "")
  if ((VALID_TABS as string[]).includes(key)) return key as TabId
  if (key in HASH_ALIASES) return HASH_ALIASES[key]
  return "prototype"
}

// Section anchors that live inside a specific tab. When a user lands on
// one of these via URL hash, we both route to the parent tab and scroll
// to the section after render.
const SECTION_ANCHORS = new Set<string>([
  "tldr",
  "dictionary",
  "audit",
  "patterns",
  "gmaps-deep",
  "gmaps-panels",
  "decisions",
  "decision-checklist",
])

export default function App() {
  const [tab, setTab] = useState<TabId>(() => resolveTab(window.location.hash))
  const current = useMemo(() => TABS.find(t => t.id === tab), [tab])

  useEffect(() => {
    function onHashChange() {
      const key = window.location.hash.replace(/^#/, "")
      if ((VALID_TABS as string[]).includes(key) || key in HASH_ALIASES) {
        setTab(resolveTab(window.location.hash))
      }
    }
    window.addEventListener("hashchange", onHashChange)
    return () => window.removeEventListener("hashchange", onHashChange)
  }, [])

  // On initial mount or whenever the tab changes due to a section
  // anchor in the URL, scroll the section into view once the new
  // tab content is rendered.
  useEffect(() => {
    const key = window.location.hash.replace(/^#/, "")
    if (!SECTION_ANCHORS.has(key)) return
    const id = setTimeout(() => {
      const el = document.getElementById(key)
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
    }, 50)
    return () => clearTimeout(id)
  }, [tab])

  function changeTab(id: TabId) {
    setTab(id)
    history.pushState(null, "", `#${id}`)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto max-w-6xl px-4 md:px-6 py-10">
        <PageHeader
          type="Navigation Audit"
          title={<>Maps 2.0 IA + Flows<br /><span className="text-muted-foreground">Google Maps Nav Audit</span></>}
          subtitle={<>Google Maps is purrty gud.<br />What can we learn from their UX and apply to Maps?</>}
          createdDate="May 15, 2026"
          modifiedDate="May 16, 2026"
          stats={[
            { value: FULL_AUDIT_ROWS.length, label: "surfaces audited" },
            { value: PATTERNS.length, label: "reusable patterns" },
          ]}
          gradient="radial-gradient(ellipse 80% 60% at 15% 0%, oklch(0.55 0.18 230 / 0.7), transparent), radial-gradient(ellipse 60% 50% at 85% 0%, oklch(0.6 0.18 160 / 0.5), transparent)"
        />

        <nav className="mt-6 mb-2 flex flex-wrap gap-2">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => changeTab(t.id)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                tab === t.id ? "bg-foreground text-background border-foreground" : "border-border text-muted-foreground hover:border-foreground/50",
              )}
            >
              {t.label}
            </button>
          ))}
        </nav>
        {current && <p className="text-sm text-muted-foreground mb-6">{current.sub}</p>}

        {tab === "prototype" && <TabMock />}
        {tab === "proposed-ia" && <TabProposedIA />}
        {tab === "patterns-principles" && <TabPatternsPrinciples />}

        <DataSources
          sources={[
            { label: "Google Maps (live re-audit)", description: "5 panels audited live in May 2026. 3 of 5 sign-in gated — public surfaces only analyzed." },
            { label: "Verkada Maps 2.0 PRD", description: "Internal product requirements and design artifacts. IA derived from PRD v0.4." },
            { label: "Verkada Design System (VDS)", description: "Component naming and hierarchy conventions used to map Google patterns to Verkada equivalents." },
          ]}
          methodology="Each Google Maps surface was manually tested and categorized as Adopt / Adapt / Reject / New. Patterns were extracted by grouping common behaviors across surfaces."
          asOf="May 2026"
        />

        <PageFooter builtDate="2026-05-15" />
      </main>
    </div>
  )
}
