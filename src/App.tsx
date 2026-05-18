import { useState, useMemo } from "react"
import { ArrowLeft, ChevronRight, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  FULL_AUDIT_ROWS, PATTERNS, NAV_TREE, DEEP_PANELS,
  VERDICT_LABEL, VERDICT_COLOR,
  type Verdict,
} from "@/data"

type TabId = "full" | "patterns" | "verkada" | "mock" | "gmaps-deep"

const TABS: { id: TabId; label: string; sub: string }[] = [
  { id: "full", label: "1 · Full audit", sub: "Surface-by-surface crosswalk" },
  { id: "patterns", label: "2 · Patterns only", sub: "Reusable UX patterns lifted out" },
  { id: "verkada", label: "3 · Verkada-first", sub: "Proposed Maps 2.0 left-sidebar IA" },
  { id: "mock", label: "4 · Mock (interactive)", sub: "Click-through prototype of the Verkada-first IA" },
  { id: "gmaps-deep", label: "5 · GMaps deep audit", sub: "Live re-audit of 5 specific Google Maps panels" },
]

function VerdictBadge({ verdict }: { verdict: Verdict }) {
  return (
    <span className={cn("inline-flex items-center rounded border px-2 py-0.5 text-[11px] font-medium whitespace-nowrap", VERDICT_COLOR[verdict])}>
      {VERDICT_LABEL[verdict]}
    </span>
  )
}

// ─── Tab 1 ───────────────────────────────────────────────────────────────────

function TabFull() {
  const [filter, setFilter] = useState<Verdict | "all">("all")
  const rows = filter === "all" ? FULL_AUDIT_ROWS : FULL_AUDIT_ROWS.filter(r => r.verdict === filter)
  const counts = { adopt: 0, adapt: 0, reject: 0, new: 0 } as Record<Verdict, number>
  FULL_AUDIT_ROWS.forEach(r => counts[r.verdict]++)

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-sky-500/30 bg-sky-500/10 p-4 text-sm text-sky-300">
        <span className="font-semibold">What this is: </span>
        Every Google Maps left-sidebar surface mapped 1:1 to a Verkada Maps 2.0 equivalent. Verdict tells you whether to lift the pattern as-is, adapt it, drop it, or recognize it as Verkada-specific net-new.
      </div>

      <div className="flex flex-wrap gap-3">
        {(["all", "adopt", "adapt", "reject", "new"] as const).map(v => (
          <button
            key={v}
            onClick={() => setFilter(v)}
            className={cn(
              "rounded-full border px-3.5 py-1 text-xs font-medium transition-colors",
              filter === v ? "bg-foreground text-background border-foreground" : "border-border text-muted-foreground hover:border-foreground/50",
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

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-card">
              <th className="p-3 text-left font-medium text-muted-foreground w-[24%]">Google Maps surface</th>
              <th className="p-3 text-left font-medium text-muted-foreground w-[24%]">Verkada Maps 2.0 equivalent</th>
              <th className="p-3 text-left font-medium text-muted-foreground w-[12%]">Verdict</th>
              <th className="p-3 text-left font-medium text-muted-foreground">Rationale</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                <td className="p-3 align-top text-muted-foreground">{r.gmaps}</td>
                <td className="p-3 align-top">{r.verkada}</td>
                <td className="p-3 align-top"><VerdictBadge verdict={r.verdict} /></td>
                <td className="p-3 align-top text-muted-foreground text-xs leading-relaxed">{r.rationale}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Tab 2 ───────────────────────────────────────────────────────────────────

function TabPatterns() {
  const [open, setOpen] = useState<Set<string>>(new Set())
  const p0 = PATTERNS.filter(p => p.priority === "P0").length
  const p1 = PATTERNS.filter(p => p.priority === "P1").length

  const PRIORITY_COLOR: Record<string, string> = {
    P0: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    P1: "bg-sky-500/15 text-sky-300 border-sky-500/30",
    P2: "bg-neutral-500/15 text-neutral-300 border-neutral-500/30",
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-sky-500/30 bg-sky-500/10 p-4 text-sm text-sky-300">
        <span className="font-semibold">What this is: </span>
        Reusable UX patterns underneath the Google Maps IA, lifted out of surface-specific context. Each has a Verkada application, priority, and the panels it applies to. Build P0 patterns first — they compound across the entire product.
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[{ label: "P0 patterns", value: p0, cls: PRIORITY_COLOR.P0 }, { label: "P1 patterns", value: p1, cls: PRIORITY_COLOR.P1 }, { label: "P2 patterns", value: 0, cls: PRIORITY_COLOR.P2 }].map(s => (
          <div key={s.label} className={cn("rounded-xl border p-4", s.cls)}>
            <div className="text-3xl font-bold">{s.value}</div>
            <div className="text-xs mt-1 opacity-80">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        {PATTERNS.map(p => {
          const isOpen = open.has(p.name)
          return (
            <div key={p.name} className="rounded-xl border border-border bg-card overflow-hidden">
              <button
                className="w-full flex items-center gap-3 p-4 text-left hover:bg-muted/30 transition-colors"
                onClick={() => setOpen(prev => {
                  const next = new Set(prev)
                  next.has(p.name) ? next.delete(p.name) : next.add(p.name)
                  return next
                })}
              >
                {isOpen ? <ChevronDown className="size-4 text-muted-foreground shrink-0" /> : <ChevronRight className="size-4 text-muted-foreground shrink-0" />}
                <span className="font-medium flex-1">{p.name}</span>
                <span className={cn("rounded border px-2 py-0.5 text-[11px] font-medium", PRIORITY_COLOR[p.priority])}>{p.priority}</span>
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
    </div>
  )
}

// ─── Tab 3 ───────────────────────────────────────────────────────────────────

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

function TabVerkada() {
  const [collapsed, setCollapsed] = useState<Set<number>>(new Set())

  function hasChildren(i: number): boolean {
    const next = NAV_TREE[i + 1]
    return !!next && next.depth > NAV_TREE[i].depth
  }

  function isVisible(i: number): boolean {
    for (let j = i - 1; j >= 0; j--) {
      if (NAV_TREE[j].depth < NAV_TREE[i].depth) {
        if (collapsed.has(j)) return false
      }
    }
    return true
  }

  const toggleCollapse = (i: number) => {
    setCollapsed(prev => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-sky-500/30 bg-sky-500/10 p-4 text-sm text-sky-300">
        <span className="font-semibold">What this is: </span>
        The complete proposed information architecture for Verkada Maps 2.0, derived from the Google Maps audit. Indentation = hierarchy depth. Click any node with children to collapse/expand.
      </div>
      <div className="text-xs text-muted-foreground flex flex-wrap gap-2">
        {Object.entries(KIND_COLOR).map(([kind, cls]) => (
          <span key={kind} className={cn("rounded border px-2 py-0.5", cls)}>{kind}</span>
        ))}
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

// ─── Tab 4: Mock wireframe ────────────────────────────────────────────────────

const MOCK_VARIANTS = [
  { id: "null-state", label: "A · Null state", desc: "Default panel, no selection. Site scope chip visible." },
  { id: "search-focused", label: "B · Search focused", desc: "Search dropdown open, grouped autocomplete results." },
  { id: "place-selected", label: "C · Place selected", desc: "Place panel open: HQ Campus > Main Bldg > Floor 3." },
  { id: "editor-mode", label: "D · Editor mode", desc: "Editor toolbar active, marker detail panel open." },
  { id: "layers-open", label: "E · Layers panel", desc: "Data Layers panel open, Device Status + Coverage toggled." },
  { id: "collections", label: "F · Collections", desc: "Collections rail flyout, 'HQ External Cameras' open." },
]

function MockPanel({ variant }: { variant: string }) {
  const SearchDropdown = () => (
    <div className="absolute top-full left-0 right-0 mt-1 rounded-lg border border-border bg-card shadow-xl z-10 overflow-hidden">
      {[{ type: "Recent", items: ["HQ Campus", "Floor 3 · Main Bldg"] }, { type: "Places", items: ["HQ Campus · Location", "East Campus · Location"] }, { type: "Devices", items: ["Cam-Lobby-01 · Camera", "Door-003 · Access Control"] }].map(group => (
        <div key={group.type}>
          <div className="px-3 py-1 text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider bg-muted/30">{group.type}</div>
          {group.items.map(item => (
            <div key={item} className="px-3 py-2 hover:bg-muted/40 cursor-pointer text-sm">{item}</div>
          ))}
        </div>
      ))}
    </div>
  )

  const PlacePanel = () => (
    <div className="h-full flex flex-col text-sm overflow-auto">
      <div className="p-3 border-b border-border/50">
        <div className="text-[10px] text-muted-foreground/60 mb-1">Org › HQ Campus › Main Bldg</div>
        <div className="font-semibold">Floor 3</div>
        <div className="flex gap-1 mt-1 flex-wrap">
          <span className="rounded border border-sky-500/30 bg-sky-500/10 text-sky-300 text-[10px] px-1.5 py-px">Floor</span>
          <span className="rounded border border-violet-500/30 bg-violet-500/10 text-violet-300 text-[10px] px-1.5 py-px">HQ-MAIN</span>
          <span className="rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-[10px] px-1.5 py-px">42/45 online</span>
        </div>
        <div className="flex gap-1.5 mt-2.5 flex-wrap">
          {["Open in Editor", "Add to Collection", "Share", "Permissions", "Nearby"].map(a => (
            <span key={a} className="rounded border border-border bg-muted/50 px-2 py-0.5 text-[10px] cursor-pointer hover:border-foreground/40 transition-colors">{a}</span>
          ))}
        </div>
      </div>
      <div className="flex border-b border-border/50">
        {["Overview", "Markers", "Activity", "About"].map(t => (
          <button key={t} className={cn("px-3 py-2 text-[10px] font-medium transition-colors", t === "Overview" ? "text-foreground border-b-2 border-primary" : "text-muted-foreground hover:text-foreground")}>{t}</button>
        ))}
      </div>
      <div className="p-3 space-y-2 flex-1">
        <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Marker counts</div>
        {[{ label: "Cameras", count: 24 }, { label: "Doors", count: 12 }, { label: "Sensors", count: 6 }].map(m => (
          <div key={m.label} className="flex justify-between text-xs"><span className="text-muted-foreground">{m.label}</span><span>{m.count}</span></div>
        ))}
        <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mt-3">Recent activity</div>
        {["Motion detected · Cam-NE-01 · 2m ago", "Door propped · Door-007 · 14m ago"].map(e => (
          <div key={e} className="text-[10px] text-muted-foreground py-1 border-b border-border/30">{e}</div>
        ))}
      </div>
    </div>
  )

  const LayersPanel = () => (
    <div className="p-3 space-y-3 text-xs overflow-auto h-full">
      <div className="font-semibold text-sm">Data Layers</div>
      <div>
        <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-1.5">(A) Devices & Entities</div>
        {["Cameras", "Access Control", "Alarms", "Sensors"].map(d => (
          <div key={d} className="flex items-center gap-2 py-1">
            <div className="size-3 rounded-sm border-2 border-emerald-400 bg-emerald-400/30" />
            <span>{d}</span>
          </div>
        ))}
      </div>
      <div>
        <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-1.5">(B) Visualizations</div>
        {[{ l: "Device Status", on: true }, { l: "Coverage", on: true }, { l: "Events & Alerts", on: false }, { l: "Foot Traffic", on: false }].map(v => (
          <div key={v.l} className="flex items-center gap-2 py-1">
            <div className={cn("size-3 rounded-full border-2", v.on ? "border-sky-400 bg-sky-400/30" : "border-border bg-transparent")} />
            <span className={v.on ? "" : "text-muted-foreground"}>{v.l}</span>
          </div>
        ))}
      </div>
    </div>
  )

  const CollectionsPanel = () => (
    <div className="p-3 space-y-2 text-xs overflow-auto h-full">
      <div className="font-semibold text-sm">Collections</div>
      <div className="flex gap-1.5 flex-wrap">
        {["My Collections", "Shared with me", "Following"].map(c => (
          <span key={c} className={cn("rounded-full border px-2.5 py-0.5 text-[10px]", c === "My Collections" ? "bg-foreground text-background border-foreground" : "border-border text-muted-foreground")}>{c}</span>
        ))}
      </div>
      {["HQ External Cameras (12)", "Door Access Audit (8)", "Parking Zone A (4)"].map(col => (
        <div key={col} className="flex items-center justify-between py-1.5 border-b border-border/40">
          <span>{col}</span>
          <ChevronRight className="size-3 text-muted-foreground" />
        </div>
      ))}
    </div>
  )

  const EditorPanel = () => (
    <div className="p-3 space-y-2 text-xs overflow-auto h-full">
      <div className="font-semibold text-sm">Cam-Lobby-01</div>
      <div className="flex gap-1"><span className="rounded border border-sky-500/30 bg-sky-500/10 text-sky-300 text-[10px] px-1.5 py-px">Device</span><span className="rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-[10px] px-1.5 py-px">Online</span></div>
      <div className="flex gap-1.5 mt-1 flex-wrap">{["Open footage", "Live view", "Configure"].map(a => <span key={a} className="rounded border border-border bg-muted/50 px-2 py-0.5 text-[10px] cursor-pointer">{a}</span>)}</div>
      <div className="border-t border-border/40 pt-2 space-y-1">
        {[["Name", "Cam-Lobby-01"], ["Site", "HQ-MAIN"], ["Kind", "Camera (CD52)"], ["Status", "Online"]].map(([k, v]) => (
          <div key={k} className="flex justify-between"><span className="text-muted-foreground">{k}</span><span>{v}</span></div>
        ))}
      </div>
    </div>
  )

  const panelContent = () => {
    if (variant === "search-focused") return <div className="relative p-3"><div className="rounded border border-border bg-muted/50 px-2 py-1.5 text-sm text-muted-foreground">Floor 3…<SearchDropdown /></div></div>
    if (variant === "place-selected") return <PlacePanel />
    if (variant === "layers-open") return <LayersPanel />
    if (variant === "collections") return <CollectionsPanel />
    if (variant === "editor-mode") return <EditorPanel />
    return (
      <div className="p-3 space-y-3 text-xs">
        <div className="font-medium text-muted-foreground">Alerts & events</div>
        <div className="rounded border border-amber-500/30 bg-amber-500/10 text-amber-300 p-2">No active emergencies</div>
        {["Cam-NE-01 · Motion · 2m ago", "Door-007 · Propped · 14m ago", "Cam-SW-04 · Offline · 1h ago"].map(e => (
          <div key={e} className="text-muted-foreground py-1 border-b border-border/30">{e}</div>
        ))}
        <div className="font-medium text-muted-foreground pt-1">Recents</div>
        {["Floor 3 · Main Bldg", "HQ Campus", "WAREHOUSE-A"].map(r => (
          <div key={r} className="flex justify-between py-1 border-b border-border/30 text-muted-foreground"><span>{r}</span><ChevronRight className="size-3" /></div>
        ))}
      </div>
    )
  }

  return (
    <div className="relative rounded-xl border border-border overflow-hidden bg-card" style={{ height: 520 }}>
      {/* Editor toolbar (variant D) */}
      {variant === "editor-mode" && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 shadow-lg text-[11px]">
          <span className="rounded bg-sky-500/20 text-sky-300 border border-sky-500/30 px-2 py-0.5 font-medium">Editor</span>
          <span className="h-4 w-px bg-border" />
          {["Select", "Wall", "Door", "Camera", "Sensor", "Label"].map(t => (
            <span key={t} className={cn("px-2 py-0.5 rounded cursor-pointer", t === "Select" ? "bg-muted border border-border" : "hover:bg-muted/50")}>{t}</span>
          ))}
        </div>
      )}
      {/* Map background */}
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 70% 60% at 60% 50%, oklch(0.3 0.04 220), oklch(0.15 0.02 220))" }}>
        {/* mock camera dots */}
        {[[55, 35], [65, 55], [75, 42], [58, 68], [70, 70]].map(([x, y], i) => (
          <div key={i} className="absolute size-2 rounded-full bg-emerald-400/80 ring-2 ring-emerald-400/30" style={{ left: `${x}%`, top: `${y}%` }} />
        ))}
        {/* map label */}
        <div className="absolute top-3 right-3 text-[10px] text-white/30 font-mono">Floor 3 · Main Bldg</div>
        {/* zoom controls */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-0.5">
          {["+", "−"].map(z => <button key={z} className="size-7 rounded border border-border/50 bg-card/80 text-xs font-bold text-muted-foreground hover:bg-card transition-colors">{z}</button>)}
        </div>
        {/* site scope chip */}
        <div className="absolute top-3 right-14 rounded-full border border-border/60 bg-card/90 text-[10px] text-muted-foreground px-3 py-1 backdrop-blur-sm">
          🏢 HQ-MAIN
        </div>
      </div>
      {/* Rail */}
      <div className="absolute left-0 top-0 bottom-0 w-10 border-r border-border/50 bg-card/95 flex flex-col items-center py-3 gap-3 z-10">
        {[["🗺", "Map"], ["📍", "Locations"], ["📁", "Collections"], ["⚡", "Layers"], ["🕐", "Recents"]].map(([icon, label]) => (
          <button key={label} title={label} className="size-8 rounded-lg flex items-center justify-center hover:bg-muted transition-colors text-base">
            <span className="text-base">{icon}</span>
          </button>
        ))}
      </div>
      {/* Left panel */}
      <div className="absolute left-10 top-0 bottom-0 w-64 border-r border-border/50 bg-card/95 z-10 overflow-hidden">
        {/* Search bar */}
        <div className="p-2 border-b border-border/50 relative">
          <div className="rounded-lg border border-border bg-muted/50 px-2.5 py-1.5 text-xs text-muted-foreground">
            🔍 Search Verkada Maps…
          </div>
        </div>
        {panelContent()}
      </div>
    </div>
  )
}

function TabMock() {
  const [variant, setVariant] = useState("null-state")
  const current = MOCK_VARIANTS.find(v => v.id === variant)

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-300">
        <span className="font-semibold">Static wireframe preview. </span>
        The original canvas had a fully interactive 4,700-line prototype. This is a fidelity-accurate static rendering of the 6 key variants. Full port in progress.
      </div>
      <div className="flex flex-wrap gap-2">
        {MOCK_VARIANTS.map(v => (
          <button
            key={v.id}
            onClick={() => setVariant(v.id)}
            className={cn(
              "rounded-full border px-3.5 py-1 text-xs font-medium transition-colors",
              variant === v.id ? "bg-foreground text-background border-foreground" : "border-border text-muted-foreground hover:border-foreground/50",
            )}
          >
            {v.label}
          </button>
        ))}
      </div>
      {current && (
        <p className="text-sm text-muted-foreground -mt-2">{current.desc}</p>
      )}
      <MockPanel variant={variant} />
    </div>
  )
}

// ─── Tab 5 ───────────────────────────────────────────────────────────────────

function TabGMapsDeep() {
  const HEADLINES = [
    "Google gates almost everything personalized behind sign-in. We do not need to. Verkada users are already authenticated. Use that to show full state on first open.",
    "Place detail is the most information-dense surface in Maps and fully public. Hero + action bar + tabbed body is the pattern to copy for the Verkada Place card.",
    "Search autocomplete is plain text with mixed result types. No category icons. Verkada should add type icons because our result kinds are more heterogeneous.",
    "'Suggest an edit' is buried. Our analog (file-creates-Place) is a primary onboarding moment; prominence should invert: dropzone + on-map dragover, not a hidden button.",
    "Hours, price, reviews all use inline accordions, not modals. Verkada Place card should follow: collapse dense sections inline.",
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-1">GMaps panels deep audit</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Focused live re-audit of five Google Maps panels. Each card pairs Google's concrete behavior with a Verkada verdict. Three of the five panels were sign-in gated; public surface is what we have to work from.
        </p>
      </div>

      <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 p-5">
        <div className="text-xs font-semibold text-sky-300 uppercase tracking-wider mb-3">5 things to remember</div>
        <ol className="space-y-2">
          {HEADLINES.map((h, i) => (
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
              <div className="mx-4 mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-300">
                <span className="font-semibold">Note: </span>{p.flag}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <div className="font-medium mb-3">Decision checklist (maps to mock v3 changes)</div>
        <ul className="space-y-2">
          {[
            "Keep Collections at top-level in the left rail (Panel 1).",
            "Do not introduce a 'Your Places' aggregate. Recents + Collections + Site scope cover the same jobs (Panel 2).",
            "Search dropdown: add category icons per result type and group results by kind (Panel 3).",
            "Place card adopts hero + action bar + tabbed body. Add copy-to-clipboard for IDs (Panel 4).",
            "File-creates-Place is primary, not buried. Implemented via Files flyout dropzone (Path A) and on-map dragover (Path B) (Panel 5).",
            "No locked decisions conflict with the audit. Site separation, rail order, Editor-only-from-Place, and Permissions demotion all stand.",
          ].map((item, i) => (
            <li key={i} className="flex gap-2 text-sm text-muted-foreground">
              <span className="shrink-0 text-emerald-400 font-bold">✓</span>{item}
            </li>
          ))}
        </ul>
      </div>
    </div>
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
      <div className="font-medium mb-4">Verkada Maps 2.0 dictionary anchors</div>
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

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [tab, setTab] = useState<TabId>("full")
  const current = useMemo(() => TABS.find(t => t.id === tab), [tab])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div
        aria-hidden
        className="fixed inset-x-0 top-0 h-64 -z-10 opacity-30 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 80% 60% at 15% 0%, oklch(0.55 0.18 230 / 0.7), transparent), radial-gradient(ellipse 60% 50% at 85% 0%, oklch(0.6 0.18 160 / 0.5), transparent)" }}
      />

      <main className="mx-auto max-w-6xl px-4 md:px-6 py-10">
        <a href="https://ankush-rustagi.github.io/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="size-4" />Back to index
        </a>

        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight leading-tight mb-2">
            Google Maps → Verkada Maps 2.0<br />
            <span className="text-muted-foreground">Navigation Audit</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Surface-by-surface crosswalk of Google Maps navigation patterns against the proposed Verkada Maps 2.0 information architecture. Canvas built 2026-05-15.
          </p>
        </header>

        <DictionaryAnchor />

        <nav className="mt-8 mb-2 flex flex-wrap gap-2">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
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

        {tab === "full" && <TabFull />}
        {tab === "patterns" && <TabPatterns />}
        {tab === "verkada" && <TabVerkada />}
        {tab === "mock" && <TabMock />}
        {tab === "gmaps-deep" && <TabGMapsDeep />}

        <footer className="mt-20 pt-6 border-t border-border text-xs text-muted-foreground">
          Ankush Rustagi · Verkada Product · Canvas built 2026-05-15
        </footer>
      </main>
    </div>
  )
}
