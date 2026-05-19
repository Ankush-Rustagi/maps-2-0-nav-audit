import { useState } from "react"
import { cn } from "@/lib/utils"
import { Callout } from "@/components/callout"

// ============================================================================
// Types (mirrors canvases/maps-2-0-nav-audit.canvas.tsx)
// ============================================================================

type MockVariant =
  | "null-state"
  | "rail-expanded"
  | "recents-flyout"
  | "locations-flyout"
  | "collections-flyout"
  | "files-flyout"
  | "place-selected"
  | "editor"
  | "search-active"
  | "site-picker"
  | "file-first-dropzone"
  | "place-with-drop"
  | "file-attaching"
  | "collection-detail"

type RailItem = "recents" | "locations" | "collections" | "files"

type PlacePanelTab = "overview" | "markers" | "layouts" | "permissions"

type DeviceKind =
  | "cameras"
  | "doors"
  | "access"
  | "sensors"
  | "intercoms"
  | "speakers"
  | "alarms"

type DataMode = "none" | "device-health" | "coverage" | "alerts-events"

type Basemap = "streets" | "satellite"

type EntityKind =
  | "Location"
  | "Building"
  | "Floor"
  | "Area"
  | "Camera"
  | "Door"
  | "Sensor"
  | "Entity"
  | "Collection"
  | "File"
  | "Site"

// ============================================================================
// Data constants (mirror canvas 1:1)
// ============================================================================

const VARIANTS: { id: MockVariant; label: string; short: string; sub: string }[] = [
  { id: "null-state", label: "A · Null state", short: "Null state", sub: "Map only. Hamburger + floating search + Alerts overlay." },
  { id: "rail-expanded", label: "B · Rail expanded", short: "Rail expanded", sub: "Hamburger clicked. Icon column visible." },
  { id: "recents-flyout", label: "C · Recents flyout", short: "Recents", sub: "Recents list flyout, filterable, same shape as other lists." },
  { id: "locations-flyout", label: "D · Locations flyout", short: "Locations", sub: "Locations list with filter chips + free-text. Site context strip on top." },
  { id: "collections-flyout", label: "E · Collections flyout", short: "Collections", sub: "Collections list. Same shape as Locations." },
  { id: "files-flyout", label: "F · Files flyout", short: "Files", sub: "Files list with drag-to-canvas affordance for first-time builders." },
  { id: "place-selected", label: "G · Place selected", short: "Place selected", sub: "Place card pinned bottom-left. Search collapsed to icon." },
  { id: "editor", label: "H · Editor mode", short: "Editor", sub: "Toolbar + marker detail. Search collapsed. Alerts hidden." },
  { id: "search-active", label: "I · Search active", short: "Search", sub: "Navigator search. Results dropdown. Site scope is read-only context here." },
  { id: "site-picker", label: "J · Site picker open", short: "Site picker", sub: "Site chip clicked. Shows only sites with map presence in current view." },
  { id: "file-first-dropzone", label: "K · File-first dropzone", short: "File dropzone", sub: "Files flyout open. Dropzone at top of list. Path A flow." },
  { id: "place-with-drop", label: "L · Place + drag accelerator", short: "Place + drag", sub: "Place card open. Browser detects dragover. Drop hint over map. Path B." },
  { id: "file-attaching", label: "M · File attaching / aligning", short: "File attaching", sub: "Post-drop. Progress card + alignment prompt over the map." },
  { id: "collection-detail", label: "N · Collection detail", short: "Collection", sub: "Inside a Collection. Children render as a flat nav list." },
]

const RAIL_ITEMS: { id: RailItem; label: string; glyph: string }[] = [
  { id: "recents", label: "Recents", glyph: "↺" },
  { id: "locations", label: "Locations", glyph: "≡" },
  { id: "collections", label: "Collections", glyph: "◇" },
  { id: "files", label: "Files", glyph: "▤" },
]

const DEFAULT_DEVICE_VIS: Record<DeviceKind, boolean> = {
  cameras: true,
  doors: true,
  access: true,
  sensors: true,
  intercoms: false,
  speakers: false,
  alarms: false,
}

const DEVICE_KIND_META: { id: DeviceKind; label: string; count: number }[] = [
  { id: "cameras", label: "Cameras", count: 12 },
  { id: "doors", label: "Doors", count: 6 },
  { id: "access", label: "Access readers", count: 9 },
  { id: "sensors", label: "Sensors", count: 4 },
  { id: "intercoms", label: "Intercoms", count: 2 },
  { id: "speakers", label: "Speakers", count: 3 },
  { id: "alarms", label: "Alarms", count: 0 },
]

const DATA_MODE_META: { id: DataMode; label: string; help: string }[] = [
  { id: "none", label: "None", help: "Identity only. Markers show name + site." },
  { id: "device-health", label: "Device health", help: "Markers colored by online / offline / degraded." },
  { id: "coverage", label: "Coverage", help: "FOV cones + read range drawn from each visible device." },
  { id: "alerts-events", label: "Alerts and events", help: "Active alerts pinned over sources; per-device event counts." },
]

const SITE_PLACE_COUNTS: Record<string, number> = {
  "HQ-MAIN": 12,
  "HQ-LAB": 4,
  "WAREHOUSE-A": 6,
  "WAREHOUSE-B": 8,
  "RETAIL-PA": 2,
  "RETAIL-MV": 2,
}

const SITES: { id: string; placeCount: number }[] = [
  { id: "HQ-MAIN", placeCount: 12 },
  { id: "HQ-LAB", placeCount: 4 },
  { id: "WAREHOUSE-A", placeCount: 6 },
  { id: "WAREHOUSE-B", placeCount: 8 },
  { id: "RETAIL-PA", placeCount: 2 },
  { id: "RETAIL-MV", placeCount: 2 },
]

// ─── Spatial tree ────────────────────────────────────────────────────────────

type SpatialNode = {
  id: string
  kind: EntityKind
  name: string
  summary: string
  site: string
  children: SpatialNode[]
}

const SPATIAL_TREE: SpatialNode[] = [
  {
    id: "loc-hq",
    kind: "Location",
    name: "HQ Campus",
    summary: "3 buildings · 12 floors · 47 areas",
    site: "HQ-MAIN",
    children: [
      {
        id: "bldg-hq-main",
        kind: "Building",
        name: "Main Bldg",
        summary: "5 floors · 22 areas",
        site: "HQ-MAIN",
        children: [
          {
            id: "floor-hq-main-1",
            kind: "Floor",
            name: "Floor 1",
            summary: "4 areas",
            site: "HQ-MAIN",
            children: [
              { id: "area-hq-main-1-lobby", kind: "Area", name: "Lobby", summary: "12 markers", site: "HQ-MAIN", children: [] },
              { id: "area-hq-main-1-cafe", kind: "Area", name: "Cafeteria", summary: "8 markers", site: "HQ-MAIN", children: [] },
              { id: "area-hq-main-1-mail", kind: "Area", name: "Mailroom", summary: "3 markers", site: "HQ-MAIN", children: [] },
              { id: "area-hq-main-1-recv", kind: "Area", name: "Receiving", summary: "5 markers", site: "HQ-MAIN", children: [] },
            ],
          },
          {
            id: "floor-hq-main-2",
            kind: "Floor",
            name: "Floor 2",
            summary: "5 areas",
            site: "HQ-MAIN",
            children: [
              { id: "area-hq-main-2-pilot", kind: "Area", name: "Pilot zone", summary: "Q2 roadmap test bed", site: "HQ-MAIN", children: [] },
              { id: "area-hq-main-2-eng", kind: "Area", name: "Eng pod", summary: "14 markers", site: "HQ-MAIN", children: [] },
            ],
          },
          {
            id: "floor-hq-main-3",
            kind: "Floor",
            name: "Floor 3",
            summary: "3 areas · 47 markers",
            site: "HQ-MAIN",
            children: [
              { id: "area-hq-main-3-lobby", kind: "Area", name: "Lobby", summary: "12 markers", site: "HQ-MAIN", children: [] },
              { id: "area-hq-main-3-north", kind: "Area", name: "North Wing", summary: "16 markers", site: "HQ-MAIN", children: [] },
              { id: "area-hq-main-3-cafe", kind: "Area", name: "Cafeteria", summary: "8 markers", site: "HQ-MAIN", children: [] },
            ],
          },
          { id: "floor-hq-main-4", kind: "Floor", name: "Floor 4", summary: "5 areas", site: "HQ-MAIN", children: [] },
          {
            id: "floor-hq-main-roof",
            kind: "Floor",
            name: "Roof",
            summary: "1 area · perimeter",
            site: "HQ-MAIN",
            children: [
              { id: "area-hq-main-roof-perim", kind: "Area", name: "Perimeter", summary: "12 cameras", site: "HQ-MAIN", children: [] },
            ],
          },
        ],
      },
      {
        id: "bldg-hq-lab",
        kind: "Building",
        name: "Lab Bldg",
        summary: "3 floors · 12 areas",
        site: "HQ-LAB",
        children: [
          {
            id: "floor-hq-lab-1",
            kind: "Floor",
            name: "Floor 1",
            summary: "4 areas",
            site: "HQ-LAB",
            children: [
              { id: "area-hq-lab-1-lobby", kind: "Area", name: "Lobby (north)", summary: "6 markers", site: "HQ-LAB", children: [] },
            ],
          },
          { id: "floor-hq-lab-2", kind: "Floor", name: "Floor 2", summary: "4 areas", site: "HQ-LAB", children: [] },
          { id: "floor-hq-lab-3", kind: "Floor", name: "Floor 3", summary: "4 areas", site: "HQ-LAB", children: [] },
        ],
      },
      {
        id: "bldg-hq-annex",
        kind: "Building",
        name: "Annex",
        summary: "Outdoor + 1 floor",
        site: "HQ-MAIN",
        children: [
          { id: "area-hq-annex-yard", kind: "Area", name: "Loading yard", summary: "Outdoor · 4 cameras", site: "HQ-MAIN", children: [] },
        ],
      },
    ],
  },
  {
    id: "loc-warehouse-a",
    kind: "Location",
    name: "Warehouse A",
    summary: "1 building · 4 docks · 8 sub-areas",
    site: "WAREHOUSE-A",
    children: [
      {
        id: "bldg-wha-1",
        kind: "Building",
        name: "Building 1",
        summary: "1 floor · 4 docks",
        site: "WAREHOUSE-A",
        children: [
          {
            id: "floor-wha-1-1",
            kind: "Floor",
            name: "Floor 1",
            summary: "4 docks",
            site: "WAREHOUSE-A",
            children: [
              { id: "area-wha-dock-1", kind: "Area", name: "Dock 1", summary: "4 markers", site: "WAREHOUSE-A", children: [] },
              { id: "area-wha-dock-2", kind: "Area", name: "Dock 2", summary: "4 markers", site: "WAREHOUSE-A", children: [] },
              { id: "area-wha-dock-3", kind: "Area", name: "Dock 3", summary: "4 markers", site: "WAREHOUSE-A", children: [] },
              { id: "area-wha-dock-4", kind: "Area", name: "Dock 4", summary: "6 markers", site: "WAREHOUSE-A", children: [] },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "loc-warehouse-b",
    kind: "Location",
    name: "Warehouse B",
    summary: "1 building · 6 docks",
    site: "WAREHOUSE-B",
    children: [
      {
        id: "bldg-whb-dock",
        kind: "Building",
        name: "Dock building",
        summary: "1 floor · 6 docks",
        site: "WAREHOUSE-B",
        children: [
          { id: "floor-whb-dock-1", kind: "Floor", name: "Floor 1", summary: "6 docks", site: "WAREHOUSE-B", children: [] },
        ],
      },
    ],
  },
  {
    id: "loc-retail-pa",
    kind: "Location",
    name: "Retail · Palo Alto",
    summary: "Storefront + back-of-house",
    site: "RETAIL-PA",
    children: [
      {
        id: "bldg-retail-pa-store",
        kind: "Building",
        name: "Storefront",
        summary: "1 floor",
        site: "RETAIL-PA",
        children: [
          { id: "area-retail-pa-entry", kind: "Area", name: "Storefront entry", summary: "4 markers", site: "RETAIL-PA", children: [] },
        ],
      },
    ],
  },
  {
    id: "loc-retail-mv",
    kind: "Location",
    name: "Retail · Mountain View",
    summary: "Storefront + back-of-house",
    site: "RETAIL-MV",
    children: [
      {
        id: "bldg-retail-mv-store",
        kind: "Building",
        name: "Storefront",
        summary: "1 floor",
        site: "RETAIL-MV",
        children: [
          { id: "area-retail-mv-entry", kind: "Area", name: "Storefront entry", summary: "3 markers", site: "RETAIL-MV", children: [] },
        ],
      },
    ],
  },
  {
    id: "loc-popup-soma",
    kind: "Location",
    name: "Pop-up · SOMA",
    summary: "Outdoor only (Areas, no Building)",
    site: "RETAIL-PA",
    children: [
      { id: "area-popup-soma-yard", kind: "Area", name: "Yard", summary: "2 cameras", site: "RETAIL-PA", children: [] },
    ],
  },
]

function findNode(id: string): SpatialNode | undefined {
  const walk = (nodes: SpatialNode[]): SpatialNode | undefined => {
    for (const n of nodes) {
      if (n.id === id) return n
      const found = walk(n.children)
      if (found) return found
    }
    return undefined
  }
  return walk(SPATIAL_TREE)
}

function pathFor(id: string): SpatialNode[] {
  const walk = (nodes: SpatialNode[], trail: SpatialNode[]): SpatialNode[] | null => {
    for (const n of nodes) {
      const nextTrail = [...trail, n]
      if (n.id === id) return nextTrail
      const found = walk(n.children, nextTrail)
      if (found) return found
    }
    return null
  }
  return walk(SPATIAL_TREE, []) ?? []
}

type RecentItem = { id: string; when: string }
const RECENTS: RecentItem[] = [
  { id: "floor-hq-main-3", when: "2 min ago" },
  { id: "area-hq-main-1-lobby", when: "12 min ago" },
  { id: "area-wha-dock-4", when: "Yesterday" },
  { id: "bldg-retail-pa-store", when: "Mon" },
  { id: "floor-hq-main-roof", when: "Last week" },
]

type CollectionDef = { id: string; name: string; summary: string; memberIds: string[] }
const COLLECTIONS: CollectionDef[] = [
  {
    id: "col-lobbies",
    name: "Lobbies (all sites)",
    summary: "5 places · Floors + Areas, mixed",
    memberIds: [
      "area-hq-main-1-lobby",
      "area-hq-main-3-lobby",
      "area-retail-pa-entry",
      "area-retail-mv-entry",
      "area-hq-lab-1-lobby",
    ],
  },
  {
    id: "col-warehouses",
    name: "Warehouses",
    summary: "5 places · Locations + sub-areas",
    memberIds: [
      "loc-warehouse-a",
      "loc-warehouse-b",
      "bldg-whb-dock",
      "floor-whb-dock-1",
      "area-wha-dock-4",
    ],
  },
  {
    id: "col-q2-pilot",
    name: "Q2 Roadmap pilot sites",
    summary: "4 places · Shared with PM org",
    memberIds: [
      "loc-hq",
      "bldg-hq-lab",
      "floor-hq-main-2",
      "area-hq-main-2-pilot",
    ],
  },
]

// ─── Markers on the map ──────────────────────────────────────────────────────

type MapMarker = {
  id: string
  x: number
  y: number
  kind: "camera" | "door" | "sensor"
  deviceKey: DeviceKind
  eventCount: number
  status: "online" | "offline" | "degraded"
}

const MAP_MARKERS: MapMarker[] = [
  { id: "Cam-Lobby-01", x: 28, y: 42, kind: "camera", deviceKey: "cameras", eventCount: 3, status: "online" },
  { id: "Cam-Lobby-02", x: 42, y: 38, kind: "camera", deviceKey: "cameras", eventCount: 0, status: "online" },
  { id: "Door-Lobby-N", x: 35, y: 28, kind: "door", deviceKey: "doors", eventCount: 2, status: "online" },
  { id: "Motion-3F-N", x: 55, y: 55, kind: "sensor", deviceKey: "sensors", eventCount: 0, status: "degraded" },
  { id: "Cam-East-3F", x: 70, y: 48, kind: "camera", deviceKey: "cameras", eventCount: 5, status: "offline" },
]

// ============================================================================
// Glyphs / palette helpers
// ============================================================================

function entityGlyph(kind: EntityKind): string {
  switch (kind) {
    case "Location": return "⌂"
    case "Building": return "▢"
    case "Floor": return "▭"
    case "Area": return "◰"
    case "Camera": return "◉"
    case "Door": return "▤"
    case "Sensor": return "◇"
    case "Entity": return "◆"
    case "Collection": return "◇"
    case "File": return "▥"
    case "Site": return "⊙"
  }
}

// ============================================================================
// Primitives: Pill, EntityRow, EntityListPanel
// ============================================================================

function Pill({
  children, active, tone = "neutral", onClick, size = "md", className,
}: {
  children: React.ReactNode
  active?: boolean
  tone?: "neutral" | "info" | "success" | "warning"
  onClick?: () => void
  size?: "sm" | "md"
  className?: string
}) {
  const toneCls = {
    neutral: active ? "border-foreground/40 bg-muted text-foreground" : "border-border bg-muted/40 text-muted-foreground",
    info: active ? "border-sky-500/50 bg-sky-500/20 text-sky-200" : "border-sky-500/30 bg-sky-500/10 text-sky-300",
    success: active ? "border-emerald-500/50 bg-emerald-500/20 text-emerald-200" : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    warning: active ? "border-amber-500/50 bg-amber-500/20 text-amber-200" : "border-amber-500/30 bg-amber-500/10 text-amber-300",
  }[tone]
  const sizeCls = size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-0.5 text-xs"
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border font-medium transition-colors whitespace-nowrap inline-flex items-center gap-1",
        sizeCls,
        toneCls,
        onClick && "hover:brightness-125 cursor-pointer",
        className,
      )}
    >
      {children}
    </button>
  )
}

function EntityRow({
  kind, name, path, trailing, actions, onClick, density = "comfortable", showKindPill = true,
}: {
  kind: EntityKind
  name: string
  path?: string
  trailing?: React.ReactNode
  actions?: React.ReactNode
  onClick?: () => void
  density?: "comfortable" | "roomy" | "compact"
  showKindPill?: boolean
}) {
  const pad = density === "roomy" ? "p-3" : density === "compact" ? "px-2.5 py-1.5" : "p-2.5"
  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-md border border-border/50 bg-muted/30 flex flex-col gap-1.5",
        pad,
        onClick && "cursor-pointer hover:bg-muted/60 transition-colors",
      )}
    >
      <div className="flex items-center gap-2.5">
        <span className="w-3.5 text-center text-xs text-muted-foreground/60 shrink-0">{entityGlyph(kind)}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-semibold truncate">{name}</span>
            {showKindPill && <Pill size="sm" tone="info">{kind}</Pill>}
          </div>
          {path && <div className="text-[10px] text-muted-foreground mt-0.5">{path}</div>}
        </div>
        {trailing}
      </div>
      {actions && <div className="flex gap-1.5">{actions}</div>}
    </div>
  )
}

function EntityListPanel({
  filterText, onFilterText, filterChips, activeChip, onChipChange, sortLabel, countLine, siteContext, children,
}: {
  filterText: string
  onFilterText: (v: string) => void
  filterChips: string[]
  activeChip: string
  onChipChange: (chip: string) => void
  sortLabel: string
  countLine: string
  siteContext: string
  children?: React.ReactNode
}) {
  return (
    <div className="flex flex-col">
      <div className="px-3 pt-2.5 pb-2 border-b border-border/50 bg-card/40 flex flex-col gap-2">
        <input
          value={filterText}
          onChange={e => onFilterText(e.target.value)}
          placeholder="Filter this list…"
          className="w-full rounded-md border border-border bg-background/40 px-2 py-1 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-foreground/40"
        />
        <div className="flex gap-1 flex-wrap">
          {filterChips.map(chip => (
            <Pill key={chip} size="sm" active={activeChip === chip} onClick={() => onChipChange(chip)}>{chip}</Pill>
          ))}
        </div>
        <div className="flex items-center text-[10px] text-muted-foreground/70">
          <span>{countLine}</span>
          <span className="ml-auto">Sort: {sortLabel}</span>
        </div>
      </div>
      <div className="px-3 py-1.5 border-b border-border/40 bg-sky-500/[0.06]">
        <span className="text-[10px] text-muted-foreground">Filtered by </span>
        <span className="text-[10px] font-semibold text-foreground">{siteContext}</span>
      </div>
      <div className="flex flex-col gap-1.5 p-3">
        {children}
      </div>
    </div>
  )
}

// ============================================================================
// Map chrome: surface, label, fly-to banner
// ============================================================================

function MapSurface({
  showMarkers, pickedMarker, onPickMarker, dimmed, draggingFile, deviceVis, dataMode, basemap, darkMode,
}: {
  showMarkers: boolean
  pickedMarker: string
  onPickMarker: (id: string) => void
  dimmed?: boolean
  draggingFile?: boolean
  deviceVis: Record<DeviceKind, boolean>
  dataMode: DataMode
  basemap: Basemap
  darkMode: boolean
}) {
  const basemapBg = darkMode
    ? (basemap === "satellite" ? "#0d130f" : "#0e1116")
    : (basemap === "satellite" ? "#1f2a23" : "#1a2330")
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: basemapBg }}>
      {/* Grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.06) 0 1px, transparent 1px 40px), repeating-linear-gradient(90deg, rgba(255,255,255,0.06) 0 1px, transparent 1px 40px)",
          opacity: dimmed ? 0.3 : 0.55,
        }}
      />

      {/* Files drag hint */}
      {draggingFile && (
        <div className="absolute inset-y-[20%] inset-x-[25%] border-2 border-dashed border-sky-400 rounded-xl bg-sky-500/10 flex items-center justify-center">
          <div className="text-center px-4">
            <div className="text-sm font-semibold">Drop here to start placing this layout</div>
            <div className="text-xs text-muted-foreground mt-1">You'll be asked which Place to attach it to.</div>
          </div>
        </div>
      )}

      {/* Markers */}
      {showMarkers &&
        MAP_MARKERS.filter(m => deviceVis[m.deviceKey]).map(m => {
          const isCam = m.kind === "camera"
          const isSelected = m.id === pickedMarker
          const showEventBadge = dataMode === "alerts-events" && m.eventCount > 0
          const showAlertPin = dataMode === "alerts-events" && m.eventCount >= 2
          const showCoverageCone = dataMode === "coverage" && isCam
          const statusColor =
            m.status === "online" ? "#3a9d5d" :
            m.status === "offline" ? "#c14242" : "#d49a2e"
          const kindColor = isCam ? "#38bdf8" : m.kind === "door" ? "#cbd5e1" : "#94a3b8"
          const color = dataMode === "device-health" ? statusColor : kindColor
          return (
            <div
              key={m.id}
              className="absolute z-10"
              style={{ left: `${m.x}%`, top: `${m.y}%`, transform: "translate(-50%, -50%)" }}
            >
              {showCoverageCone && (
                <div
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
                  style={{ width: 80, height: 80, background: "rgba(56,189,248,0.13)", border: "1px solid rgba(56,189,248,0.33)" }}
                />
              )}
              <div
                onClick={e => { e.stopPropagation(); onPickMarker(m.id) }}
                title={m.id}
                style={{
                  position: "relative",
                  width: isSelected ? 18 : 14,
                  height: isSelected ? 18 : 14,
                  borderRadius: isCam ? 999 : 3,
                  background: color,
                  border: isSelected ? "2px solid white" : "1px solid rgba(0,0,0,0.4)",
                  cursor: "pointer",
                }}
              />
              {showEventBadge && (
                <div
                  className="absolute -top-2 -right-2.5 min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center border border-background"
                >
                  {m.eventCount}
                </div>
              )}
              {showAlertPin && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-1.5 py-px rounded bg-red-500 text-white text-[9px] font-bold whitespace-nowrap border border-background">
                  ! ALERT
                </div>
              )}
            </div>
          )
        })}
    </div>
  )
}

function MapLabel({ text, top = 14, right = 70 }: { text: string; top?: number; right?: number }) {
  return (
    <div
      className="absolute z-20 px-2 py-0.5 bg-card/95 border border-border/60 rounded text-[10px] text-muted-foreground"
      style={{ top, right }}
    >
      {text}
    </div>
  )
}

function FlyToBanner({ target, onDismiss }: { target: string; onDismiss: () => void }) {
  return (
    <button
      onClick={onDismiss}
      className="absolute top-3.5 left-1/2 -translate-x-1/2 z-30 px-3 py-1.5 rounded-full bg-card/95 border border-sky-500/60 flex items-center gap-2 shadow-lg text-[11px]"
    >
      <span className="text-sky-400">↗</span>
      <span className="font-semibold">Flew to</span>
      <span className="text-muted-foreground">{target}</span>
      <span className="text-muted-foreground/60">✕</span>
    </button>
  )
}

// ============================================================================
// Command band (top header)
// ============================================================================

function CommandShellBand() {
  return (
    <div className="relative flex items-center gap-2.5 h-9 px-2.5 border-b border-border/70 bg-card/95 z-40 text-xs">
      <span className="font-semibold">⊞</span>
      <span className="font-semibold">Verkada Command</span>
      <span className="text-muted-foreground/60">/</span>
      <span className="font-semibold">Maps</span>
      <span className="ml-auto text-muted-foreground">ankush.rustagi</span>
    </div>
  )
}

// ============================================================================
// Floating chrome: hamburger, rail, search, alerts, layers, zoom
// ============================================================================

function HamburgerButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      title="Open menu"
      className="absolute top-3.5 left-3.5 z-30 size-9 rounded-md bg-card/95 border border-border flex items-center justify-center text-base hover:bg-card transition-colors"
    >
      ☰
    </button>
  )
}

function FloatingRail({
  active, onPick, onClose,
}: {
  active: RailItem | null
  onPick: (id: RailItem) => void
  onClose: () => void
}) {
  return (
    <div className="absolute top-3.5 left-3.5 z-30 w-14 rounded-lg bg-card/95 border border-border flex flex-col items-center py-1.5 gap-0.5">
      <button
        onClick={onClose}
        title="Close menu"
        className="size-9 flex items-center justify-center cursor-pointer text-base hover:bg-muted/50 rounded transition-colors"
      >
        ☰
      </button>
      <div className="w-9 h-px bg-border/60 my-0.5" />
      {RAIL_ITEMS.map(item => {
        const isActive = active === item.id
        return (
          <button
            key={item.id}
            onClick={() => onPick(item.id)}
            title={item.label}
            className={cn(
              "w-12 h-12 flex flex-col items-center justify-center cursor-pointer rounded-md gap-0.5 transition-colors",
              isActive ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/50",
            )}
          >
            <span className="text-base leading-none">{item.glyph}</span>
            <span className="text-[8.5px] tracking-wide">{item.label}</span>
          </button>
        )
      })}
    </div>
  )
}

function CollapsedSearchAffordance({ leftOffset, onExpand }: { leftOffset: number; onExpand: () => void }) {
  return (
    <button
      onClick={onExpand}
      title="Search"
      className="absolute top-3.5 z-25 size-9 rounded-md bg-card/95 border border-border flex items-center justify-center text-sm hover:bg-card transition-colors"
      style={{ left: leftOffset }}
    >
      ⌕
    </button>
  )
}

function FloatingSearch({
  search, onSearch, leftOffset, focused, onFocus, onBlur, resultsBelow, siteScopeChip,
}: {
  search: string
  onSearch: (v: string) => void
  leftOffset: number
  focused: boolean
  onFocus: () => void
  onBlur: () => void
  resultsBelow?: boolean
  siteScopeChip: string
}) {
  return (
    <div
      className="absolute top-3.5 z-25"
      style={{ left: leftOffset, width: 380 }}
    >
      <div
        onClick={onFocus}
        className={cn(
          "bg-card/95 border px-2.5 py-1.5 flex items-center gap-2 cursor-text",
          focused ? "border-sky-500/60" : "border-border",
          resultsBelow && focused ? "rounded-t-md" : "rounded-md",
        )}
      >
        <span className="text-muted-foreground text-xs">⌕</span>
        <input
          value={search}
          onChange={e => onSearch(e.target.value)}
          onClick={e => e.stopPropagation()}
          autoFocus={focused}
          placeholder="Search places, devices, entities, collections…"
          className="flex-1 bg-transparent outline-none text-foreground text-xs placeholder:text-muted-foreground min-w-0"
        />
        {focused && (
          <button
            onClick={e => { e.stopPropagation(); onBlur() }}
            className="text-muted-foreground hover:text-foreground"
          >
            ✕
          </button>
        )}
      </div>
      {focused && siteScopeChip && (
        <div className="px-2.5 py-1 bg-sky-500/10 border-x border-sky-500/40 text-[10px] text-muted-foreground">
          Scoped by <span className="font-semibold text-foreground">{siteScopeChip}</span>
          <span className="text-muted-foreground/60"> · change above in the Command band</span>
        </div>
      )}
    </div>
  )
}

function SearchDropdown({ query, leftOffset }: { query: string; leftOffset: number }) {
  return (
    <div
      className="absolute z-25 max-h-96 overflow-auto bg-card/95 border border-t-0 border-border rounded-b-md"
      style={{ top: 78, left: leftOffset, width: 380 }}
    >
      <div className="px-3 py-2 border-b border-border/50">
        <div className="flex gap-1 flex-wrap">
          {["All", "Devices", "Entities", "Places", "Collections"].map((c, i) => (
            <Pill key={c} size="sm" active={i === 0}>{c}</Pill>
          ))}
        </div>
      </div>
      <div className="p-2.5 flex flex-col gap-1.5">
        <div className="text-[10px] text-muted-foreground/70">
          {query ? `Results for "${query}"` : "Start typing to search"}
        </div>
        <EntityRow kind="Camera" name="Cam-Lobby-01" path="HQ › Main Bldg › Floor 3 › Lobby" />
        <EntityRow kind="Camera" name="Cam-Lobby-02" path="HQ › Main Bldg › Floor 3 › Lobby" />
        <EntityRow kind="Camera" name="Cam-Dock-04" path="Warehouse A › Dock 4 (Area)" />
        <EntityRow kind="Floor" name="Floor 3" path="HQ › Main Bldg" />
        <EntityRow kind="Collection" name="Lobbies (12)" path="Pinned · shared with PM org" />
      </div>
    </div>
  )
}

// ============================================================================
// Top-right Site + Alerts cluster
// ============================================================================

function SiteAlertsCluster({
  siteScope, placeCount, pickerOpen, onTogglePicker, alertsCollapsed, onToggleAlerts, recentlyChanged, onDismissChanged,
}: {
  siteScope: string
  placeCount: number
  pickerOpen: boolean
  onTogglePicker: () => void
  alertsCollapsed: boolean
  onToggleAlerts: () => void
  recentlyChanged: boolean
  onDismissChanged: () => void
}) {
  return (
    <div className="absolute top-3.5 right-3.5 z-25 w-[340px] bg-card/95 border border-border rounded-lg overflow-hidden">
      {/* Site row */}
      <button
        onClick={onTogglePicker}
        className={cn(
          "w-full px-3 py-2.5 flex items-center gap-2 text-left border-b border-border/50 transition-colors",
          pickerOpen ? "bg-muted/60" : "hover:bg-muted/30",
        )}
      >
        <span className="text-sky-400 text-sm">⊙</span>
        <span className="text-xs text-muted-foreground">Sites:</span>
        <span className="text-xs font-semibold">{siteScope}</span>
        <Pill size="sm" tone="info">{`${placeCount} places`}</Pill>
        <span className="ml-auto text-xs text-muted-foreground/70">{pickerOpen ? "▲" : "▼"}</span>
      </button>
      {/* Alerts row */}
      <button
        onClick={() => { if (recentlyChanged) onDismissChanged(); onToggleAlerts() }}
        className={cn(
          "w-full px-3 py-2.5 flex items-center gap-2 text-left transition-colors hover:bg-muted/30",
          !alertsCollapsed && "border-b border-border/50",
        )}
      >
        <span className="text-sky-400 text-sm">◉</span>
        <span className="text-xs font-semibold">Alerts &amp; Events</span>
        <Pill size="sm" tone="warning" active>2</Pill>
        {recentlyChanged && <Pill size="sm" tone="info">Re-scoped</Pill>}
        <span className="ml-auto text-xs text-muted-foreground/70">{alertsCollapsed ? "▼" : "▲"}</span>
      </button>
      {/* Alert list */}
      {!alertsCollapsed && (
        <div className="p-2.5 flex flex-col gap-2 max-h-60 overflow-auto">
          <div className="rounded-md border border-border bg-muted/30 p-2.5">
            <div className="flex items-center gap-1.5">
              <Pill size="sm" tone="warning" active>Active</Pill>
              <span className="text-[10px] text-muted-foreground/70">3 min</span>
            </div>
            <div className="text-xs font-semibold mt-1">Door forced open</div>
            <div className="text-[11px] text-muted-foreground">HQ › Floor 2 › Lobby</div>
          </div>
          <div className="rounded-md border border-border bg-muted/30 p-2.5">
            <div className="flex items-center gap-1.5">
              <Pill size="sm" tone="info" active>Recent</Pill>
              <span className="text-[10px] text-muted-foreground/70">17 min</span>
            </div>
            <div className="text-xs font-semibold mt-1">After-hours motion</div>
            <div className="text-[11px] text-muted-foreground">Warehouse A › Dock 4</div>
          </div>
          <div className="text-[10px] text-muted-foreground italic">
            Showing alerts scoped to <span className="font-semibold text-foreground">{siteScope}</span>.
          </div>
        </div>
      )}
    </div>
  )
}

function SitePicker({
  scope, onChangeScope, onClose,
}: {
  scope: string
  onChangeScope: (s: string) => void
  onClose: () => void
}) {
  return (
    <div className="absolute top-16 right-3.5 z-45 w-[340px] bg-card/95 border border-border rounded-lg overflow-hidden">
      <div className="px-3 py-2.5 border-b border-border/50 flex items-center gap-2">
        <span className="text-sm font-semibold">Filter by Site</span>
        <button onClick={onClose} className="ml-auto"><Pill size="sm">✕</Pill></button>
      </div>
      <div className="p-2.5 flex flex-col gap-2">
        <div className="text-[11px] text-muted-foreground/80">
          Sites with map presence in the current view. Multi-select to widen visibility.
        </div>
        <input
          placeholder="Filter sites…"
          className="w-full rounded-md border border-border bg-background/40 px-2 py-1 text-xs outline-none focus:border-foreground/40"
        />
        <div className="flex flex-col gap-1">
          {SITES.map(s => (
            <label key={s.id} className="flex items-center gap-2 px-1 py-1 rounded hover:bg-muted/40 cursor-pointer">
              <input
                type="checkbox"
                checked={s.id === scope}
                onChange={() => onChangeScope(s.id)}
                className="accent-sky-500"
              />
              <span className="text-xs">{s.id}</span>
              <span className="ml-auto text-[10px] text-muted-foreground/70">{s.placeCount} places</span>
            </label>
          ))}
        </div>
      </div>
      <div className="px-3 py-2 border-t border-border/50 bg-muted/20 text-[10px] text-muted-foreground/80">
        Don't see a site? Sites only appear here after they've been tied to a Place.{" "}
        <span className="font-semibold text-foreground">Go to Maps setup</span>
      </div>
    </div>
  )
}

// ============================================================================
// Bottom-left layers cluster
// ============================================================================

function FloatingLayerCluster({
  open, onToggle, deviceVis, setDeviceVis, dataMode, setDataMode, basemap, setBasemap, darkMode, setDarkMode,
}: {
  open: boolean
  onToggle: () => void
  deviceVis: Record<DeviceKind, boolean>
  setDeviceVis: (next: Record<DeviceKind, boolean>) => void
  dataMode: DataMode
  setDataMode: (m: DataMode) => void
  basemap: Basemap
  setBasemap: (b: Basemap) => void
  darkMode: boolean
  setDarkMode: (v: boolean) => void
}) {
  const toggleDevice = (k: DeviceKind) => setDeviceVis({ ...deviceVis, [k]: !deviceVis[k] })
  const visibleCount = DEVICE_KIND_META.filter(d => deviceVis[d.id]).reduce((s, d) => s + d.count, 0)
  const modeMeta = DATA_MODE_META.find(m => m.id === dataMode) ?? DATA_MODE_META[0]

  if (!open) {
    return (
      <button
        onClick={onToggle}
        title="Layers"
        className="absolute bottom-3.5 left-3.5 z-25 px-3 py-2 rounded-lg bg-card/95 border border-border flex items-center gap-2 hover:bg-card transition-colors"
      >
        <span className="text-sky-400 text-sm">◐</span>
        <span className="flex flex-col items-start leading-tight">
          <span className="text-xs font-semibold">Layers</span>
          <span className="text-[10px] text-muted-foreground/70">{visibleCount} devices · {modeMeta.label}</span>
        </span>
      </button>
    )
  }

  return (
    <div
      className="absolute bottom-3.5 left-3.5 z-25 w-80 max-h-[420px] overflow-hidden bg-card/95 border border-border rounded-lg flex flex-col"
    >
      <div className="px-3 py-2 border-b border-border/50 flex items-center gap-2">
        <span className="text-sky-400 text-sm">◐</span>
        <span className="text-xs font-semibold">Layers</span>
        <button onClick={onToggle} className="ml-auto"><Pill size="sm">✕</Pill></button>
      </div>
      <div className="flex flex-1 min-h-0">
        {/* Devices column */}
        <div className="flex-1 p-2.5 border-r border-border/50 overflow-y-auto">
          <div className="flex flex-col gap-2">
            <div className="flex items-center">
              <span className="text-xs font-semibold">Devices</span>
              <span className="ml-auto text-[10px] text-muted-foreground/70">multi</span>
            </div>
            <div className="flex flex-col gap-1.5">
              {DEVICE_KIND_META.map(d => (
                <label key={d.id} className={cn("flex items-center gap-1.5 cursor-pointer", d.count === 0 && "opacity-40 cursor-not-allowed")}>
                  <input
                    type="checkbox"
                    checked={deviceVis[d.id]}
                    disabled={d.count === 0}
                    onChange={() => toggleDevice(d.id)}
                    className="accent-sky-500"
                  />
                  <span className="text-[11px]">{d.label}</span>
                  <span className="ml-auto text-[10px] text-muted-foreground/70">{d.count}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        {/* Data overlay column */}
        <div className="flex-1 p-2.5 overflow-y-auto">
          <div className="flex flex-col gap-2">
            <div className="flex items-center">
              <span className="text-xs font-semibold">Data overlay</span>
              <span className="ml-auto text-[10px] text-muted-foreground/70">single</span>
            </div>
            <div className="flex flex-col gap-1">
              {DATA_MODE_META.map(m => {
                const active = m.id === dataMode
                return (
                  <button
                    key={m.id}
                    onClick={() => setDataMode(m.id)}
                    className={cn(
                      "px-2 py-1 rounded text-left flex items-center gap-2 transition-colors",
                      active ? "border border-sky-500/60 bg-muted/60" : "border border-transparent hover:bg-muted/40",
                    )}
                  >
                    <span
                      className={cn("size-2.5 rounded-full border-2 shrink-0", active ? "bg-sky-500 border-sky-500" : "border-border")}
                    />
                    <span className={cn("text-[11px]", active && "font-semibold")}>{m.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
      {/* Footer */}
      <div className="px-3 py-1.5 border-t border-border/50 bg-muted/20 flex items-center gap-3">
        <label className="flex items-center gap-1.5 cursor-pointer">
          <span className="text-[10px] text-muted-foreground/80">Satellite</span>
          <input
            type="checkbox"
            checked={basemap === "satellite"}
            onChange={e => setBasemap(e.target.checked ? "satellite" : "streets")}
            className="accent-sky-500"
          />
        </label>
        <label className="flex items-center gap-1.5 ml-auto cursor-pointer">
          <span className="text-[10px] text-muted-foreground/80">Dark</span>
          <input
            type="checkbox"
            checked={darkMode}
            onChange={e => setDarkMode(e.target.checked)}
            className="accent-sky-500"
          />
        </label>
      </div>
    </div>
  )
}

function FloatingZoom() {
  return (
    <div className="absolute bottom-3.5 right-3.5 z-25 flex flex-col bg-card/95 border border-border rounded-md overflow-hidden">
      <button className="size-8 flex items-center justify-center hover:bg-muted/50 border-b border-border/50">+</button>
      <button className="size-8 flex items-center justify-center hover:bg-muted/50">−</button>
    </div>
  )
}

// ============================================================================
// File drop overlays (Path B + post-drop)
// ============================================================================

function DropZoneOnMap({
  placeLabel, onSimulateDrop, onCancel,
}: {
  placeLabel: string
  onSimulateDrop: () => void
  onCancel: () => void
}) {
  return (
    <div className="absolute inset-3 z-35 rounded-xl border-[3px] border-dashed border-sky-400 bg-sky-500/10 flex items-center justify-center">
      <div className="text-center flex flex-col items-center gap-2 p-5">
        <div className="text-sm font-semibold">Drop here to add a layout to {placeLabel}</div>
        <div className="text-xs text-muted-foreground">The file will upload, attach to this Place, and jump to alignment.</div>
        <div className="text-[10px] text-muted-foreground/70">Release to attach. Drag off the map to cancel.</div>
        <div className="flex gap-1.5 mt-1">
          <button onClick={onSimulateDrop} className="rounded-md border border-sky-500/40 bg-sky-500/20 hover:bg-sky-500/30 text-sky-200 px-3 py-1 text-xs font-medium transition-colors">
            Simulate release (drop)
          </button>
          <button onClick={onCancel} className="rounded-md border border-border bg-muted/40 hover:bg-muted/60 text-muted-foreground px-3 py-1 text-xs transition-colors">
            Cancel drag
          </button>
        </div>
      </div>
    </div>
  )
}

function FileAttachingOverlay({
  fileName, placeLabel, onComplete, onCancel,
}: {
  fileName: string
  placeLabel: string
  onComplete: () => void
  onCancel: () => void
}) {
  return (
    <div className="absolute inset-0 z-35 bg-background/70 flex items-center justify-center">
      <div className="w-[420px] bg-card/95 border border-border rounded-lg overflow-hidden">
        <div className="px-3.5 py-2.5 border-b border-border/50">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">Attaching file</span>
            <button onClick={onCancel} className="ml-auto"><Pill size="sm">✕</Pill></button>
          </div>
          <div className="text-[11px] text-muted-foreground">{fileName}</div>
        </div>
        <div className="p-3.5 flex flex-col gap-2.5">
          <div className="flex items-center gap-2">
            <Pill size="sm" tone="success" active>Uploaded</Pill>
            <span className="text-[11px] text-muted-foreground">2.4 MB · 100%</span>
          </div>
          <div className="flex items-center gap-2">
            <Pill size="sm" tone="success" active>Attached</Pill>
            <span className="text-[11px] text-muted-foreground">to {placeLabel}</span>
          </div>
          <div className="h-px bg-border/50 my-1" />
          <div className="text-xs font-semibold">Next: align this floorplan</div>
          <div className="text-[11px] text-muted-foreground">
            Drag the corners of the placed image to match real-world geometry. Use the Align tool in the floating editor toolbar.
          </div>
          <div className="flex gap-1.5 mt-1">
            <button onClick={onComplete} className="rounded-md border border-sky-500/40 bg-sky-500/20 hover:bg-sky-500/30 text-sky-200 px-3 py-1 text-xs font-medium transition-colors">Start aligning</button>
            <button onClick={onCancel} className="rounded-md border border-border bg-muted/40 hover:bg-muted/60 text-muted-foreground px-3 py-1 text-xs transition-colors">Skip for now</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Rail flyout shell + flyout bodies
// ============================================================================

function RailFlyout({
  title, leftOffset, onClose, children,
}: {
  title: string
  leftOffset: number
  onClose: () => void
  children?: React.ReactNode
}) {
  return (
    <div
      className="absolute z-20 bg-card/95 border border-border rounded-lg flex flex-col overflow-hidden"
      style={{ top: 14, left: leftOffset, bottom: 14, width: 360 }}
    >
      <div className="px-3 py-2.5 border-b border-border/50 flex items-center gap-2 shrink-0">
        <span className="text-xs font-semibold">{title}</span>
        <button onClick={onClose} className="ml-auto"><Pill size="sm">✕</Pill></button>
      </div>
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  )
}

// ─── Recents body ────────────────────────────────────────────────────────────

function RecentsFlyoutBody({
  siteContext, onJumpId,
}: {
  siteContext: string
  onJumpId: (id: string) => void
}) {
  const [text, setText] = useState("")
  const [chip, setChip] = useState("All")
  return (
    <EntityListPanel
      filterText={text}
      onFilterText={setText}
      filterChips={["All", "Places", "Devices", "Collections"]}
      activeChip={chip}
      onChipChange={setChip}
      sortLabel="Most recent"
      countLine={`${RECENTS.length} recents`}
      siteContext={siteContext}
    >
      {RECENTS.map(r => {
        const trail = pathFor(r.id)
        const node = trail[trail.length - 1]
        if (!node) return null
        const parentPath = trail.slice(0, -1).map(n => n.name).join(" › ")
        return (
          <EntityRow
            key={r.id}
            kind={node.kind}
            name={node.name}
            path={parentPath || node.summary}
            density="roomy"
            trailing={<span className="text-[10px] text-muted-foreground/70">{r.when}</span>}
            onClick={() => onJumpId(r.id)}
          />
        )
      })}
    </EntityListPanel>
  )
}

// ─── Spatial nav body (used by Locations and Collections drill-down) ─────────

function SpatialNavBody({
  siteContext, trail, topLabel, topItems, topItemKind, onPushId, onSetTrail, onClearAll, onExitTop, exitTopLabel,
}: {
  siteContext: string
  trail: SpatialNode[]
  topLabel: string
  topItems: { id: string; name: string; summary: string; kind?: EntityKind }[]
  topItemKind: EntityKind
  onPushId: (id: string) => void
  onSetTrail: (newTrail: SpatialNode[]) => void
  onClearAll: () => void
  onExitTop?: () => void
  exitTopLabel?: string
}) {
  const [text, setText] = useState("")
  const [chip, setChip] = useState("All")
  const [crumbExpanded, setCrumbExpanded] = useState(false)
  const current = trail[trail.length - 1]
  const childKindChips = current
    ? Array.from(new Set(current.children.map(c => `${c.kind}s`)))
    : ["Locations", "Buildings", "Floors", "Areas"]
  const chips = ["All", ...childKindChips]

  const renderCrumbs = () => {
    const segs: React.ReactNode[] = [
      <Pill key="top" size="sm" active={trail.length === 0} onClick={onClearAll}>{topLabel}</Pill>,
    ]
    const sep = (k: string) =>
      segs.push(<span key={`sep-${k}`} className="text-[10px] text-muted-foreground/60">›</span>)
    const crumb = (n: SpatialNode, i: number) => {
      const isCurrent = i === trail.length - 1
      segs.push(
        <Pill
          key={n.id}
          size="sm"
          active={isCurrent}
          tone={isCurrent ? "info" : "neutral"}
          onClick={() => onSetTrail(trail.slice(0, i + 1))}
        >
          {n.name}
        </Pill>,
      )
    }
    if (trail.length <= 3 || crumbExpanded) {
      trail.forEach((n, i) => { sep(`b-${i}`); crumb(n, i) })
    } else {
      sep("b-first")
      crumb(trail[0], 0)
      sep("b-collapse")
      segs.push(<Pill key="ellipsis" size="sm" onClick={() => setCrumbExpanded(true)}>…</Pill>)
      const parentIdx = trail.length - 2
      const currentIdx = trail.length - 1
      sep("b-parent")
      crumb(trail[parentIdx], parentIdx)
      sep("b-current")
      crumb(trail[currentIdx], currentIdx)
    }
    return segs
  }

  return (
    <div className="flex flex-col">
      <div className="px-3 py-2.5 border-b border-border/50">
        {onExitTop && (
          <div className="mb-1.5">
            <Pill size="sm" onClick={onExitTop}>← {exitTopLabel ?? "Back"}</Pill>
          </div>
        )}
        <div className="flex items-center gap-1 flex-wrap">
          {renderCrumbs()}
          {trail.length > 3 && crumbExpanded && (
            <Pill size="sm" className="ml-auto" onClick={() => setCrumbExpanded(false)}>collapse</Pill>
          )}
        </div>
        {current && (
          <div className="text-[11px] text-muted-foreground mt-1">
            {current.kind} · {current.summary} · Site: {current.site}
          </div>
        )}
      </div>
      <EntityListPanel
        filterText={text}
        onFilterText={setText}
        filterChips={chips}
        activeChip={chip}
        onChipChange={setChip}
        sortLabel={trail.length === 0 ? "A → Z" : "Custom order"}
        countLine={current ? `${current.children.length} children` : `${topItems.length} items`}
        siteContext={siteContext}
      >
        {current
          ? current.children.length === 0
            ? (
              <Callout variant="info" title="Leaf node">
                {current.name} has no sub-entities. Use the Place card on the right to view markers, layouts, and permissions.
              </Callout>
            )
            : current.children.map(c => (
                <EntityRow
                  key={c.id}
                  kind={c.kind}
                  name={c.name}
                  path={c.summary}
                  density="roomy"
                  onClick={() => onPushId(c.id)}
                />
              ))
          : topItems.map(t => (
              <EntityRow
                key={t.id}
                kind={t.kind ?? topItemKind}
                name={t.name}
                path={t.summary}
                density="roomy"
                onClick={() => onPushId(t.id)}
              />
            ))}
      </EntityListPanel>
    </div>
  )
}

function CollectionsTopList({
  siteContext, onOpen,
}: {
  siteContext: string
  onOpen: (id: string) => void
}) {
  const [text, setText] = useState("")
  const [chip, setChip] = useState("All")
  return (
    <EntityListPanel
      filterText={text}
      onFilterText={setText}
      filterChips={["All", "Mine", "Shared", "Pinned"]}
      activeChip={chip}
      onChipChange={setChip}
      sortLabel="Last edited"
      countLine={`${COLLECTIONS.length} collections`}
      siteContext={siteContext}
    >
      {COLLECTIONS.map(c => (
        <EntityRow
          key={c.id}
          kind="Collection"
          name={c.name}
          path={c.summary}
          density="roomy"
          trailing={<Pill size="sm" tone="info">{String(c.memberIds.length)}</Pill>}
          onClick={() => onOpen(c.id)}
        />
      ))}
    </EntityListPanel>
  )
}

// ─── Files body ──────────────────────────────────────────────────────────────

function FilesDropzone() {
  return (
    <div className="rounded-md border-2 border-dashed border-sky-500/60 bg-sky-500/10 p-4 flex flex-col items-center gap-2">
      <div className="text-xs font-semibold">Drag floorplans here, or upload</div>
      <button className="rounded-md border border-sky-500/40 bg-sky-500/20 hover:bg-sky-500/30 text-sky-200 px-3 py-1 text-xs font-medium">
        Upload
      </button>
    </div>
  )
}

function BindWizardCallout({ fileName, onClose }: { fileName: string; onClose: () => void }) {
  return (
    <Callout variant="info" title={`Bind to Place: ${fileName} (Step 1 of 3)`}>
      <div className="flex flex-col gap-1.5">
        <div className="text-xs">
          Step 1: Choose a Location. Step 2: Pick or create a Building/Floor. Step 3: Align the file to the map.
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Pill size="sm" active>HQ Campus</Pill>
          <Pill size="sm">Warehouse A</Pill>
          <Pill size="sm">Retail · Palo Alto</Pill>
          <Pill size="sm">+ New Location</Pill>
        </div>
        <div className="flex gap-1.5 mt-1">
          <button className="rounded-md border border-sky-500/40 bg-sky-500/20 hover:bg-sky-500/30 text-sky-200 px-3 py-1 text-xs font-medium">Next: choose Building/Floor</button>
          <button onClick={onClose} className="rounded-md border border-border bg-muted/40 hover:bg-muted/60 px-3 py-1 text-xs text-muted-foreground">Cancel</button>
        </div>
      </div>
    </Callout>
  )
}

function FilesFlyoutBody({ siteContext }: { siteContext: string }) {
  const [text, setText] = useState("")
  const [chip, setChip] = useState("Unplaced")
  const [wizardFile, setWizardFile] = useState("")
  return (
    <EntityListPanel
      filterText={text}
      onFilterText={setText}
      filterChips={["All", "Unplaced", "Active"]}
      activeChip={chip}
      onChipChange={setChip}
      sortLabel="Newest"
      countLine="3 unplaced · 3 active"
      siteContext={siteContext}
    >
      <FilesDropzone />
      {wizardFile && <BindWizardCallout fileName={wizardFile} onClose={() => setWizardFile("")} />}
      <div className="text-[10px] font-semibold text-muted-foreground/80 mt-1">Unplaced</div>
      {[
        "main-bldg-floor-2-DRAFT.pdf",
        "main-bldg-floor-4.pdf",
        "warehouse-b-layout-v1.pdf",
      ].map(name => (
        <EntityRow
          key={name}
          kind="File"
          name={name}
          showKindPill={false}
          density="comfortable"
          actions={
            <button
              onClick={() => setWizardFile(name)}
              className="rounded-md border border-border bg-muted/40 hover:bg-muted/60 px-2 py-0.5 text-[10px] text-muted-foreground transition-colors"
            >
              Bind to Place
            </button>
          }
        />
      ))}
      <div className="text-[10px] font-semibold text-muted-foreground/80 mt-1">Active</div>
      <EntityRow kind="File" name="main-bldg-floor-3-v4.pdf" path="HQ › Main Bldg › Floor 3" showKindPill={false} />
      <EntityRow kind="File" name="main-bldg-floor-1-v2.pdf" path="HQ › Main Bldg › Floor 1" showKindPill={false} />
      <EntityRow kind="File" name="warehouse-a-dock-layout.dwg" path="Warehouse A" showKindPill={false} />
    </EntityListPanel>
  )
}

// ============================================================================
// Floating place card
// ============================================================================

function FloatingPlaceCard({
  tab, onChangeTab, onClose, onOpenInEditor, showDragHint, onSimulateDragOver, focusLabel, focusKind, leftOffset = 14,
}: {
  tab: PlacePanelTab
  onChangeTab: (t: PlacePanelTab) => void
  onClose: () => void
  onOpenInEditor: () => void
  showDragHint?: boolean
  onSimulateDragOver?: () => void
  focusLabel?: string
  focusKind?: EntityKind
  leftOffset?: number
}) {
  const tabs: { id: PlacePanelTab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "markers", label: "Markers (47)" },
    { id: "layouts", label: "Layouts" },
    { id: "permissions", label: "Permissions" },
  ]
  const fullPath = focusLabel ?? "HQ › Main Bldg › Floor 3"
  const lastSeg = fullPath.split(" › ").slice(-1)[0]
  return (
    <div
      className="absolute z-25 bg-card/95 border border-border rounded-lg overflow-auto"
      style={{ bottom: 14, left: leftOffset, width: 400, maxHeight: 420 }}
    >
      <div className="px-3 py-2.5 border-b border-border/50">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">{lastSeg}</span>
          <Pill size="sm" tone="info">{focusKind ?? "Floor"}</Pill>
          <Pill size="sm" className="ml-auto">★ Save</Pill>
          <button onClick={onClose}><Pill size="sm">✕</Pill></button>
        </div>
        <div className="text-[11px] text-muted-foreground mt-0.5">{fullPath} · Site: HQ-MAIN</div>
        <div className="flex flex-wrap gap-1.5 mt-2">
          <button onClick={onOpenInEditor} className="rounded-md border border-sky-500/40 bg-sky-500/20 hover:bg-sky-500/30 text-sky-200 px-3 py-1 text-xs font-medium transition-colors">Open in Editor</button>
          <button className="rounded-md border border-border bg-muted/40 hover:bg-muted/60 px-3 py-1 text-xs text-muted-foreground transition-colors">Share</button>
          <button className="rounded-md border border-border bg-muted/40 hover:bg-muted/60 px-3 py-1 text-xs text-muted-foreground transition-colors">Permissions</button>
        </div>
      </div>
      <div className="px-3 py-2 border-b border-border/50">
        <div className="flex flex-wrap gap-1.5">
          {tabs.map(t => (
            <Pill key={t.id} active={tab === t.id} tone={tab === t.id ? "info" : "neutral"} onClick={() => onChangeTab(t.id)}>{t.label}</Pill>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-2.5 p-3">
        {tab === "overview" && (
          <>
            <div className="text-[10px] font-semibold text-muted-foreground/80 uppercase tracking-wider">
              Children (mixed Floors + Areas as siblings)
            </div>
            <div className="flex flex-col gap-1.5">
              <EntityRow kind="Area" name="Lobby" path="Area · Floor 3" />
              <EntityRow kind="Area" name="North Wing" path="Area · Floor 3" />
              <EntityRow kind="Area" name="Cafeteria" path="Area · Floor 3" />
            </div>
            <div className="grid grid-cols-3 gap-2 mt-1">
              <div className="rounded-md border border-border bg-muted/30 p-2">
                <div className="text-base font-bold">47</div>
                <div className="text-[10px] text-muted-foreground">Markers</div>
              </div>
              <div className="rounded-md border border-sky-500/30 bg-sky-500/10 p-2">
                <div className="text-base font-bold text-sky-300">12</div>
                <div className="text-[10px] text-sky-300/80">Cameras</div>
              </div>
              <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-2">
                <div className="text-base font-bold text-amber-300">2</div>
                <div className="text-[10px] text-amber-300/80">Alerts</div>
              </div>
            </div>
          </>
        )}
        {tab === "markers" && (
          <div className="flex flex-col gap-1.5">
            <EntityRow kind="Camera" name="Cam-Lobby-01" path="Online · HQ-MAIN" />
            <EntityRow kind="Camera" name="Cam-Lobby-02" path="Online · HQ-MAIN" />
            <EntityRow kind="Door" name="Door-Lobby-N" path="Locked · HQ-MAIN" />
            <EntityRow kind="Sensor" name="Motion-3F-N" path="Idle · HQ-MAIN" />
          </div>
        )}
        {tab === "layouts" && (
          <div className="rounded-md border border-border bg-muted/30 p-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold">main-bldg-floor-3-v4.pdf</span>
              <Pill size="sm" tone="success" active className="ml-auto">Active</Pill>
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">Uploaded May 02 · Aligned</div>
          </div>
        )}
        {tab === "permissions" && (
          <>
            <div className="text-[11px] text-muted-foreground">
              Permissions flow through Sites. This Floor is in <span className="font-semibold text-foreground">Site: HQ-MAIN</span>.
            </div>
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-muted-foreground/80 border-b border-border/50">
                  <th className="py-1 font-normal">Principal</th>
                  <th className="py-1 font-normal">Role</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Security Ops", "Admin"],
                  ["Facilities", "Editor"],
                  ["All employees", "Viewer"],
                ].map(([p, r]) => (
                  <tr key={p} className="border-b border-border/30">
                    <td className="py-1">{p}</td>
                    <td className="py-1 text-muted-foreground">{r}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
      {showDragHint && (
        <div className="px-3 py-2 border-t border-border/50 bg-sky-500/10 flex items-center gap-2">
          <div className="text-[11px] text-muted-foreground flex-1">
            Drag a floorplan from your computer onto the map to attach it here.
          </div>
          {onSimulateDragOver && <Pill size="sm" tone="info" onClick={onSimulateDragOver}>Simulate drag-over</Pill>}
        </div>
      )}
    </div>
  )
}

// ============================================================================
// Editor overlays
// ============================================================================

function FloatingEditorToolbar({ onExit }: { onExit: () => void }) {
  return (
    <div className="absolute top-3.5 left-1/2 -translate-x-1/2 z-30 bg-card/95 border border-border rounded-lg p-1.5 flex items-center gap-1.5">
      <Pill size="sm" active tone="info">Editor</Pill>
      <div className="h-4 w-px bg-border/60" />
      <Pill size="sm" active>Select</Pill>
      <Pill size="sm">Wall</Pill>
      <Pill size="sm">Door</Pill>
      <Pill size="sm">Camera</Pill>
      <Pill size="sm">Sensor</Pill>
      <Pill size="sm">Label</Pill>
      <div className="h-4 w-px bg-border/60" />
      <Pill size="sm">Align</Pill>
      <Pill size="sm">Snap: on</Pill>
      <div className="h-4 w-px bg-border/60" />
      <Pill size="sm" onClick={onExit}>Exit editor</Pill>
    </div>
  )
}

function FloatingMarkerDetail({ markerId, onClose }: { markerId: string; onClose: () => void }) {
  return (
    <div
      className="absolute z-25 bg-card/95 border border-border rounded-lg overflow-auto"
      style={{ top: 70, right: 14, width: 340, maxHeight: 460 }}
    >
      <div className="px-3 py-2.5 border-b border-border/50">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold">{markerId}</span>
          <Pill size="sm" tone="info">Device</Pill>
          <Pill size="sm" tone="success" active className="ml-auto">Online</Pill>
          <button onClick={onClose}><Pill size="sm">✕</Pill></button>
        </div>
        <div className="text-[11px] text-muted-foreground mt-0.5">Camera · CD52 · HQ-MAIN · Floor 3 › Lobby</div>
      </div>
      <div className="p-3 flex flex-col gap-2.5">
        <div className="flex flex-wrap gap-1.5">
          <button className="rounded-md border border-sky-500/40 bg-sky-500/20 hover:bg-sky-500/30 text-sky-200 px-3 py-1 text-xs font-medium transition-colors">Open footage</button>
          <button className="rounded-md border border-border bg-muted/50 hover:bg-muted/70 px-3 py-1 text-xs transition-colors">Live view</button>
          <button className="rounded-md border border-border bg-muted/40 hover:bg-muted/60 px-3 py-1 text-xs text-muted-foreground transition-colors">Configure</button>
        </div>
        <div className="h-px bg-border/50" />
        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80">
          Marker identity (always on)
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr className="text-left text-muted-foreground/80 border-b border-border/50">
              <th className="py-1 font-normal">Field</th>
              <th className="py-1 font-normal">Value</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Name", markerId],
              ["Site", "HQ-MAIN"],
              ["Kind", "Camera (CD52)"],
              ["Status", "Online"],
            ].map(([k, v]) => (
              <tr key={k} className="border-b border-border/30">
                <td className="py-1 text-muted-foreground">{k}</td>
                <td className="py-1">{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ============================================================================
// Main prototype component
// ============================================================================

export function MockPrototype() {
  // Core state (canvas equivalents in comments)
  const [variant, setVariantRaw] = useState<MockVariant>("null-state")
  const [railOpen, setRailOpen] = useState(false)
  const [activeRail, setActiveRail] = useState<RailItem | null>(null)
  const [siteScope, setSiteScopeRaw] = useState("HQ-MAIN")
  const [sitePickerOpen, setSitePickerOpen] = useState(false)
  const [siteRecentlyChanged, setSiteRecentlyChanged] = useState(false)
  const [placeTab, setPlaceTab] = useState<PlacePanelTab>("overview")
  const [deviceVis, setDeviceVis] = useState<Record<DeviceKind, boolean>>(DEFAULT_DEVICE_VIS)
  const [dataMode, setDataMode] = useState<DataMode>("none")
  const [basemap, setBasemap] = useState<Basemap>("streets")
  const [darkMode, setDarkMode] = useState(false)
  const [layersOpen, setLayersOpen] = useState(false)
  const [alertsCollapsed, setAlertsCollapsed] = useState(false)
  const [search, setSearch] = useState("")
  const [searchFocused, setSearchFocused] = useState(false)
  const [searchCollapsedByUser, setSearchCollapsedByUser] = useState(false)
  const [pickedMarker, setPickedMarker] = useState("Cam-Lobby-01")
  const [placeOpen, setPlaceOpen] = useState(false)
  const [filesEverOpened, setFilesEverOpened] = useState(false)
  const [navStackIds, setNavStackIds] = useState<string[]>([])
  const [activeCollection, setActiveCollection] = useState("")
  const [flyTarget, setFlyTarget] = useState("")

  const navTrail = navStackIds.map(id => findNode(id)).filter((n): n is SpatialNode => Boolean(n))
  const currentNode = navTrail[navTrail.length - 1]
  const breadcrumbText = (extra?: SpatialNode) => {
    const nodes = extra ? [...navTrail.slice(0, -1), extra] : navTrail
    return nodes.map(n => n.name).join(" › ")
  }

  function setSiteScope(s: string) {
    if (s !== siteScope) {
      setSiteScopeRaw(s)
      setSiteRecentlyChanged(true)
    }
  }

  function pushNavId(id: string) {
    const trail = pathFor(id)
    if (trail.length === 0) return
    const newStack = trail.map(n => n.id)
    setNavStackIds(newStack)
    setFlyTarget(trail.map(n => n.name).join(" › "))
    setPlaceOpen(true)
    setSitePickerOpen(false)
    setSearchFocused(false)
    setVariantRaw("place-selected")
    if (!activeCollection) {
      setActiveRail("locations")
    }
    setRailOpen(true)
    setSearchCollapsedByUser(true)
  }

  function setNavTrailTo(newTrail: SpatialNode[]) {
    setNavStackIds(newTrail.map(n => n.id))
    if (newTrail.length === 0) {
      setPlaceOpen(false)
      setVariantRaw("locations-flyout")
      setFlyTarget("")
      return
    }
    setFlyTarget(newTrail.map(n => n.name).join(" › "))
    setPlaceOpen(true)
    setVariantRaw("place-selected")
  }

  function clearNav() {
    setNavStackIds([])
    setPlaceOpen(false)
    setFlyTarget("")
    if (activeCollection) {
      setVariantRaw("collection-detail")
    } else {
      setVariantRaw("locations-flyout")
    }
  }

  function setVariant(next: MockVariant) {
    setVariantRaw(next)
    setSearchCollapsedByUser(false)
    if (next === "null-state") {
      setRailOpen(false); setActiveRail(null); setSearchFocused(false); setPlaceOpen(false); setLayersOpen(false); setSitePickerOpen(false)
    }
    if (next === "rail-expanded") {
      setRailOpen(true); setActiveRail(null); setSearchFocused(false); setPlaceOpen(false); setSitePickerOpen(false)
    }
    if (next === "recents-flyout") {
      setRailOpen(true); setActiveRail("recents"); setSearchFocused(false); setPlaceOpen(false); setSitePickerOpen(false)
    }
    if (next === "locations-flyout") {
      setRailOpen(true); setActiveRail("locations"); setSearchFocused(false); setPlaceOpen(false); setSitePickerOpen(false)
    }
    if (next === "collections-flyout") {
      setRailOpen(true); setActiveRail("collections"); setSearchFocused(false); setPlaceOpen(false); setSitePickerOpen(false); setActiveCollection("")
    }
    if (next === "files-flyout") {
      setRailOpen(true); setActiveRail("files"); setSearchFocused(false); setPlaceOpen(false); setSitePickerOpen(false); setFilesEverOpened(true)
    }
    if (next === "place-selected") {
      setRailOpen(false); setActiveRail(null); setSearchFocused(false); setPlaceOpen(true); setLayersOpen(true); setSitePickerOpen(false)
    }
    if (next === "editor") {
      setRailOpen(false); setActiveRail(null); setSearchFocused(false); setPlaceOpen(false); setSitePickerOpen(false)
    }
    if (next === "search-active") {
      setRailOpen(false); setActiveRail(null); setSearchFocused(true); setPlaceOpen(false); setSitePickerOpen(false)
      if (!search) setSearch("cameras")
    }
    if (next === "site-picker") {
      setRailOpen(false); setActiveRail(null); setSearchFocused(false); setPlaceOpen(false); setSitePickerOpen(true)
    }
    if (next === "file-first-dropzone") {
      setRailOpen(true); setActiveRail("files"); setSearchFocused(false); setPlaceOpen(false); setSitePickerOpen(false); setFilesEverOpened(true)
    }
    if (next === "place-with-drop") {
      setRailOpen(false); setActiveRail(null); setSearchFocused(false); setPlaceOpen(true); setLayersOpen(true); setSitePickerOpen(false)
    }
    if (next === "file-attaching") {
      setRailOpen(false); setActiveRail(null); setSearchFocused(false); setPlaceOpen(false); setLayersOpen(false); setSitePickerOpen(false)
    }
    if (next === "collection-detail") {
      setRailOpen(true); setActiveRail("collections"); setSearchFocused(false); setPlaceOpen(false); setSitePickerOpen(false)
      if (!activeCollection) setActiveCollection(COLLECTIONS[0].id)
    }
    if (next === "locations-flyout" || next === "collections-flyout") {
      setNavStackIds([])
      setFlyTarget("")
    }
  }

  // Positioning
  const railLeft = 14
  const railWidth = railOpen ? 56 : 36
  const railGap = 12
  const flyoutLeft = railLeft + railWidth + railGap
  const flyoutWidth = 360
  const searchLeft = activeRail ? flyoutLeft + flyoutWidth + railGap : flyoutLeft

  // Dynamic UI flags
  const inDetailView = placeOpen || variant === "editor" || variant === "place-with-drop" || variant === "file-attaching"
  const searchVisible = !inDetailView && !searchCollapsedByUser
  const searchCollapsedIcon = inDetailView || searchCollapsedByUser
  const inEditor = variant === "editor"
  const inFilesDrag = variant === "files-flyout" || variant === "file-first-dropzone"
  const inPlaceWithDrop = variant === "place-with-drop"
  const inFileAttaching = variant === "file-attaching"
  const showAlerts = !inEditor && !inFilesDrag && !inFileAttaching
  const showLayerControl = !inEditor && !inFileAttaching
  const showZoom = !inFileAttaching
  const showMarkers = variant === "place-selected" || variant === "editor" || variant === "place-with-drop" || variant === "file-attaching"
  const dimMap = (activeRail !== null && !placeOpen) || sitePickerOpen
  const siteContextLabel = `Site: ${siteScope}`

  // Active collection memberNodes for spatial nav body
  const activeCollectionDef = COLLECTIONS.find(c => c.id === activeCollection)
  const memberNodes = activeCollectionDef
    ? activeCollectionDef.memberIds.map(id => findNode(id)).filter((n): n is SpatialNode => Boolean(n))
    : []

  const currentVariantMeta = VARIANTS.find(v => v.id === variant)

  return (
    <div className="space-y-4">
      <Callout variant="info" title="Interactive prototype">
        Functional state-machine prototype of the Maps 2.0 IA, mirrored 1:1 from the Cursor Canvas. Click the rail icons, search bar, recents,
        place items, layer cluster, and Site picker to navigate between states. Or use the &ldquo;Jump to state&rdquo; rail on the left to snap into any of the 14 variants. Hover the ⓘ icon next to any state for its description.
      </Callout>

      {/* Two-column layout: state rail on left, prototype on right */}
      <div className="flex gap-4 items-start">
        {/* Jump-to-state rail */}
        <aside className="shrink-0 w-44 rounded-xl border border-border bg-card sticky top-4 flex flex-col relative z-[60]">
          <div className="px-3 py-2.5 border-b border-border/50">
            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Jump to state
            </div>
            <div className="text-[10px] text-muted-foreground/70 mt-0.5">
              Hover ⓘ for detail
            </div>
          </div>
          <nav className="flex flex-col gap-0.5 p-1.5">
            {VARIANTS.map((v, i) => {
              const isActive = variant === v.id
              const letter = String.fromCharCode(65 + i)
              return (
                <div
                  key={v.id}
                  className={cn(
                    "group flex items-center gap-1.5 rounded-md border transition-colors",
                    isActive
                      ? "bg-sky-500/15 border-sky-500/50"
                      : "border-transparent hover:bg-muted/40 hover:border-border/60",
                  )}
                >
                  <button
                    onClick={() => setVariant(v.id)}
                    className="flex-1 min-w-0 flex items-center gap-1.5 text-left px-2 py-1.5"
                  >
                    <span className={cn(
                      "size-4 rounded text-[10px] font-bold flex items-center justify-center shrink-0",
                      isActive
                        ? "bg-sky-500/40 text-sky-50"
                        : "bg-muted/50 text-muted-foreground/80 group-hover:text-foreground/70",
                    )}>
                      {letter}
                    </span>
                    <span className={cn(
                      "text-[11px] font-medium whitespace-nowrap truncate",
                      isActive ? "text-sky-100" : "text-muted-foreground",
                    )}>
                      {v.short}
                    </span>
                  </button>
                  <div className="relative shrink-0 mr-1.5">
                    <button
                      type="button"
                      onClick={() => setVariant(v.id)}
                      aria-label={`Show description for ${v.short}`}
                      className={cn(
                        "peer size-4 rounded-full border flex items-center justify-center text-[10px] font-semibold transition-colors cursor-help",
                        isActive
                          ? "border-sky-500/40 text-sky-300 hover:bg-sky-500/20"
                          : "border-border text-muted-foreground/60 hover:text-foreground hover:border-foreground/40",
                      )}
                    >
                      i
                    </button>
                    <div
                      role="tooltip"
                      className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2 z-[70] w-56 rounded-md border border-border bg-card px-2.5 py-1.5 text-[11px] leading-snug text-foreground shadow-lg opacity-0 translate-x-1 transition-all duration-100 peer-hover:opacity-100 peer-hover:translate-x-0 peer-focus-visible:opacity-100 peer-focus-visible:translate-x-0"
                    >
                      <div className="font-semibold text-sky-200 mb-0.5">{v.label}</div>
                      <div className="text-muted-foreground">{v.sub}</div>
                    </div>
                  </div>
                </div>
              )
            })}
          </nav>
        </aside>

        {/* Prototype frame */}
        <div className="relative flex-1 min-w-0 rounded-xl border border-border overflow-hidden bg-background flex flex-col" style={{ height: 720 }}>
        <CommandShellBand />
        <div className="relative flex-1 min-h-0">
          <MapSurface
            showMarkers={showMarkers}
            pickedMarker={pickedMarker}
            onPickMarker={id => {
              setPickedMarker(id)
              if (variant === "place-selected") setVariant("editor")
            }}
            dimmed={dimMap}
            draggingFile={inFilesDrag}
            deviceVis={deviceVis}
            dataMode={dataMode}
            basemap={basemap}
            darkMode={darkMode}
          />

          <MapLabel
            text={
              inEditor || placeOpen
                ? (currentNode ? breadcrumbText() : "HQ › Main Bldg › Floor 3")
                : inFilesDrag
                ? "Drag to place a layout"
                : "Org overview"
            }
          />

          {dataMode !== "none" && (
            <div className="absolute z-20" style={{ top: 42, right: 70 }}>
              <Pill size="sm" tone="info" active onClick={() => setLayersOpen(true)}>
                Mode: {DATA_MODE_META.find(m => m.id === dataMode)?.label}
              </Pill>
            </div>
          )}

          {flyTarget && <FlyToBanner target={flyTarget} onDismiss={() => setFlyTarget("")} />}

          {!railOpen && (
            <HamburgerButton
              onClick={() => {
                setRailOpen(true)
                setVariantRaw("rail-expanded")
              }}
            />
          )}

          {railOpen && (
            <FloatingRail
              active={activeRail}
              onPick={id => {
                const isToggleOff = activeRail === id
                if (isToggleOff) {
                  setActiveRail(null)
                  setVariantRaw("rail-expanded")
                } else {
                  setActiveRail(id)
                  if (id === "recents") setVariantRaw("recents-flyout")
                  if (id === "locations") setVariantRaw("locations-flyout")
                  if (id === "collections") setVariantRaw("collections-flyout")
                  if (id === "files") setVariantRaw("files-flyout")
                }
              }}
              onClose={() => {
                setRailOpen(false)
                setActiveRail(null)
                setVariantRaw("null-state")
              }}
            />
          )}

          {activeRail === "recents" && (
            <RailFlyout title="Recents" leftOffset={flyoutLeft} onClose={() => { setActiveRail(null); setVariantRaw("rail-expanded") }}>
              <RecentsFlyoutBody siteContext={siteContextLabel} onJumpId={pushNavId} />
            </RailFlyout>
          )}

          {activeRail === "locations" && (
            <RailFlyout
              title={navTrail.length === 0 ? "Locations" : navTrail[navTrail.length - 1].name}
              leftOffset={flyoutLeft}
              onClose={() => {
                setActiveRail(null); setNavStackIds([]); setFlyTarget(""); setPlaceOpen(false); setVariantRaw("rail-expanded")
              }}
            >
              <SpatialNavBody
                siteContext={siteContextLabel}
                trail={navTrail}
                topLabel="Locations"
                topItems={SPATIAL_TREE.map(n => ({ id: n.id, name: n.name, summary: n.summary, kind: n.kind }))}
                topItemKind="Location"
                onPushId={pushNavId}
                onSetTrail={setNavTrailTo}
                onClearAll={clearNav}
              />
            </RailFlyout>
          )}

          {activeRail === "collections" && !activeCollection && (
            <RailFlyout title="Collections" leftOffset={flyoutLeft} onClose={() => { setActiveRail(null); setVariantRaw("rail-expanded") }}>
              <CollectionsTopList
                siteContext={siteContextLabel}
                onOpen={id => {
                  setActiveCollection(id)
                  setNavStackIds([])
                  setVariantRaw("collection-detail")
                }}
              />
            </RailFlyout>
          )}

          {activeRail === "collections" && activeCollection && activeCollectionDef && (
            <RailFlyout
              title={navTrail.length === 0 ? activeCollectionDef.name : navTrail[navTrail.length - 1].name}
              leftOffset={flyoutLeft}
              onClose={() => {
                setActiveRail(null); setActiveCollection(""); setNavStackIds([]); setFlyTarget(""); setPlaceOpen(false); setVariantRaw("rail-expanded")
              }}
            >
              <SpatialNavBody
                siteContext={siteContextLabel}
                trail={navTrail}
                topLabel={activeCollectionDef.name}
                topItems={memberNodes.map(n => {
                  const trail = pathFor(n.id)
                  const parent = trail.slice(0, -1).map(t => t.name).join(" › ")
                  return { id: n.id, name: n.name, summary: parent || n.summary, kind: n.kind }
                })}
                topItemKind="Area"
                onPushId={pushNavId}
                onSetTrail={setNavTrailTo}
                onClearAll={() => {
                  setNavStackIds([]); setPlaceOpen(false); setFlyTarget(""); setVariantRaw("collection-detail")
                }}
                onExitTop={() => {
                  setActiveCollection(""); setNavStackIds([]); setPlaceOpen(false); setFlyTarget(""); setVariantRaw("collections-flyout")
                }}
                exitTopLabel="All Collections"
              />
            </RailFlyout>
          )}

          {activeRail === "files" && (
            <RailFlyout title="Files" leftOffset={flyoutLeft} onClose={() => { setActiveRail(null); setVariantRaw("rail-expanded") }}>
              <FilesFlyoutBody siteContext={siteContextLabel} />
            </RailFlyout>
          )}

          {searchVisible && (
            <FloatingSearch
              search={search}
              onSearch={setSearch}
              leftOffset={searchLeft}
              focused={searchFocused}
              onFocus={() => {
                setSearchFocused(true)
                if (variant !== "search-active") setVariantRaw("search-active")
              }}
              onBlur={() => setSearchFocused(false)}
              resultsBelow={searchFocused}
              siteScopeChip={siteContextLabel}
            />
          )}
          {searchVisible && searchFocused && (
            <SearchDropdown query={search} leftOffset={searchLeft} />
          )}
          {searchCollapsedIcon && (
            <CollapsedSearchAffordance
              leftOffset={searchLeft}
              onExpand={() => {
                if (inDetailView) {
                  if (variant === "editor") setVariant("place-selected")
                  setPlaceOpen(false)
                }
                setSearchCollapsedByUser(false)
                setSearchFocused(true)
                setVariantRaw("search-active")
              }}
            />
          )}

          {showAlerts && (
            <SiteAlertsCluster
              siteScope={siteScope}
              placeCount={SITE_PLACE_COUNTS[siteScope] ?? 0}
              pickerOpen={sitePickerOpen}
              onTogglePicker={() => {
                if (sitePickerOpen) {
                  setSitePickerOpen(false)
                  setVariantRaw("null-state")
                } else {
                  setSitePickerOpen(true)
                  setVariantRaw("site-picker")
                }
              }}
              alertsCollapsed={alertsCollapsed}
              onToggleAlerts={() => setAlertsCollapsed(!alertsCollapsed)}
              recentlyChanged={siteRecentlyChanged}
              onDismissChanged={() => setSiteRecentlyChanged(false)}
            />
          )}

          {showLayerControl && (
            <FloatingLayerCluster
              open={layersOpen}
              onToggle={() => setLayersOpen(!layersOpen)}
              deviceVis={deviceVis}
              setDeviceVis={setDeviceVis}
              dataMode={dataMode}
              setDataMode={setDataMode}
              basemap={basemap}
              setBasemap={setBasemap}
              darkMode={darkMode}
              setDarkMode={setDarkMode}
            />
          )}

          {showZoom && <FloatingZoom />}

          {(placeOpen && (variant === "place-selected" || variant === "place-with-drop")) && (
            <FloatingPlaceCard
              tab={placeTab}
              onChangeTab={setPlaceTab}
              onClose={() => {
                setPlaceOpen(false)
                setVariantRaw("null-state")
              }}
              onOpenInEditor={() => setVariant("editor")}
              showDragHint={variant === "place-selected" && !filesEverOpened}
              onSimulateDragOver={() => setVariant("place-with-drop")}
              focusLabel={currentNode ? breadcrumbText() : "HQ › Main Bldg › Floor 3"}
              focusKind={currentNode ? currentNode.kind : "Floor"}
              leftOffset={
                activeRail
                  ? flyoutLeft + flyoutWidth + railGap
                  : layersOpen
                  ? 14 + 320 + railGap
                  : 14 + 180 + railGap
              }
            />
          )}

          {inPlaceWithDrop && (
            <DropZoneOnMap
              placeLabel="Floor 3"
              onSimulateDrop={() => setVariant("file-attaching")}
              onCancel={() => setVariant("place-selected")}
            />
          )}

          {inFileAttaching && (
            <FileAttachingOverlay
              fileName="main-bldg-floor-4.pdf"
              placeLabel="Floor 3"
              onComplete={() => setVariant("editor")}
              onCancel={() => setVariant("place-selected")}
            />
          )}

          {inEditor && <FloatingEditorToolbar onExit={() => setVariant("place-selected")} />}
          {inEditor && <FloatingMarkerDetail markerId={pickedMarker} onClose={() => setVariant("place-selected")} />}

          {sitePickerOpen && (
            <SitePicker
              scope={siteScope}
              onChangeScope={s => setSiteScope(s)}
              onClose={() => {
                setSitePickerOpen(false)
                setVariantRaw("null-state")
              }}
            />
          )}
        </div>
        </div>
      </div>

      {/* What you're looking at */}
      {currentVariantMeta && (
        <Callout variant="info" title={`What you're looking at: ${currentVariantMeta.label}`}>
          <div className="space-y-2 text-sm">
            {variant === "null-state" && (
              <p>Pure map. Hamburger top-left, floating Search top-left of map, top-right Site + Alerts cluster. No site picker open. Site filtering is a global control that never moves; Search is a separate, navigator-only control.</p>
            )}
            {variant === "rail-expanded" && (
              <p>Hamburger clicked. Rail icon column slides in: Recents, Locations, Collections, Files. Search shifts right. Nothing selected yet.</p>
            )}
            {variant === "recents-flyout" && (
              <p>Recents flyout open. Same shape as every other list: filter text box, type chips, sort, count. A site-context strip at the top of the panel reflects the current global Site scope. Click any row to deep-link into the spatial hierarchy.</p>
            )}
            {variant === "locations-flyout" && (
              <p>Locations flyout. Filter-first. Top items are Locations; click one to drill into its Buildings, then Floors, then Areas. Compact breadcrumb at the top.</p>
            )}
            {variant === "collections-flyout" && (
              <p>Collections flyout. Same list shape as Locations. Clicking a collection enters Collection detail (variant N) where members render as a flat nav list.</p>
            )}
            {variant === "files-flyout" && (
              <p>Files flyout. Permanent dropzone at the top (Path A). Unplaced files have a Bind to Place wizard. Map shows a centered drop hint so a first-time builder knows what to do.</p>
            )}
            {variant === "place-selected" && (
              <p>A Place is selected. Place card pinned bottom-left over the map. The floating search box collapsed to a magnifier icon to give the Place card and map more breathing room.</p>
            )}
            {variant === "editor" && (
              <p>Editor mode. Search hidden (collapsed to icon), Alerts hidden. Editor toolbar top-center. Marker detail floats top-right. Map is the workspace.</p>
            )}
            {variant === "search-active" && (
              <p>Search has focus. Results dropdown shows places, devices, entities, and collections as a single results list. The Site scope chip below the input is read-only context.</p>
            )}
            {variant === "site-picker" && (
              <p>Site picker open from the top-right cluster. Lists only sites with map presence in the current view. Multi-select. This is the only place to change Site scope; Search never edits this filter.</p>
            )}
            {variant === "file-first-dropzone" && (
              <p>Files flyout with the dashed dropzone highlighted, plus a centered drop hint over the map. The Path A flow for unbound files: upload, land in Unplaced, then click "Bind to Place".</p>
            )}
            {variant === "place-with-drop" && (
              <p>Place card open AND the browser detects file dragover. A full-bleed dashed overlay covers the map: "Drop here to add a layout to Floor 3". Release jumps straight to upload, attach, align.</p>
            )}
            {variant === "file-attaching" && (
              <p>Post-drop. Progress card centered over the map showing Uploaded / Attached / Next: align. Search and Alerts are hidden, layers are hidden — the user's focus is the alignment step.</p>
            )}
            {variant === "collection-detail" && (
              <p>Inside a Collection. Members render as a flat list, but clicking one drills into the SpatialTree from that member, with breadcrumb showing Collection name &gt; member &gt; descendant.</p>
            )}
          </div>
        </Callout>
      )}

      {/* What changed in v3 */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="text-sm font-semibold mb-3">What changed in v3</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          {[
            ["SiteAlertsCluster, top-right", "Sites and Alerts are one card. Site row opens the SitePicker below it. Alerts row sits under with count + live list. A \u201cRe-scoped\u201d pill flashes whenever site changes."],
            ["Command band is identity-only", "Site chip moved out of the Command band. Top strip shows the Command waffle, the Maps breadcrumb, and the signed-in user. Site scope lives in the top-right cluster."],
            ["Files flyout: permanent dropzone (Path A)", "The Files flyout opens to a clear dropzone with Upload button. Anything dropped lands in Unplaced. Each unplaced file has a Bind to Place action that launches a three-step wizard."],
            ["Place + dragover accelerator (Path B)", "When a Place is selected and the browser detects file dragover, a full-bleed drop hint covers the map. Release jumps to upload + attach + align. Cuts 3 steps to one drop."],
            ["Place card learns from session", "The \u201cDrag a floorplan onto the map\u201d footer hint hides once the user has opened the Files flyout in this session."],
            ["Unified spatial nav, compact breadcrumb", "Locations and Collections share one SpatialNavBody. Header is a Finder-style breadcrumb: Top \u203a first \u203a \u2026 \u203a parent \u203a current. Middle segments collapse to \u201c\u2026\u201d when deeper than 3."],
            ["Layers cluster, bottom-left", "Narrow 320px panel. Two side-by-side vertical lists: Devices (multi-select with counts) and Data overlay (single-select). Footer toggles for Satellite and Dark."],
            ["Recents is a deep link", "Clicking any Recents row looks up the entity\u2019s full ancestor chain, opens the Locations rail with the breadcrumb pre-populated at that depth, flies the map, and opens the Place card."],
          ].map(([title, body]) => (
            <div key={title}>
              <div className="text-sm font-medium mb-1">{title}</div>
              <div className="text-xs text-muted-foreground leading-relaxed">{body}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
