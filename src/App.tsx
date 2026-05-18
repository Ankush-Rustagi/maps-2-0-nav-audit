import { ArrowLeft, MapPin, Layers, Search, Sparkles } from "lucide-react"

const SCOPE = [
  {
    icon: Search,
    title: "Full audit table",
    desc: "Every Google Maps surface pattern catalogued and verdicted: adopt, adapt, reject, or new.",
  },
  {
    icon: Layers,
    title: "Pattern library",
    desc: "Reusable interaction patterns lifted from Google Maps with notes on Verkada fit.",
  },
  {
    icon: MapPin,
    title: "Verkada NAV tree",
    desc: "Information architecture proposal for Maps 2.0, mapped to existing Command surfaces.",
  },
  {
    icon: Sparkles,
    title: "Interactive mock",
    desc: "Clickable prototype of the proposed Maps 2.0 chrome, rail, search, and place panels.",
  },
]

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-[420px] -z-10 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 20% 0%, oklch(0.45 0.15 230 / 0.6), transparent), radial-gradient(ellipse 60% 50% at 80% 10%, oklch(0.55 0.16 160 / 0.45), transparent)",
        }}
      />

      <main className="relative mx-auto max-w-3xl px-6 py-16 md:py-24">
        <a
          href="https://ankush-rustagi.github.io/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-12"
        >
          <ArrowLeft className="size-4" />
          Back to index
        </a>

        <header className="mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs font-medium uppercase tracking-wider mb-6">
            <span className="size-1.5 rounded-full bg-amber-400 animate-pulse" />
            Work in progress
          </div>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight leading-[1.05] mb-6">
            Google Maps
            <span className="text-muted-foreground"> → </span>
            <br className="md:hidden" />
            Verkada Maps 2.0
            <br />
            <span className="text-muted-foreground">navigation audit.</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-prose leading-relaxed">
            A comparative analysis of Google Maps navigation patterns, mapped
            against the Verkada Maps 2.0 information architecture. Built to
            answer one question: <em className="text-foreground/80 not-italic">which patterns earn their place
            in Command, and which don't?</em>
          </p>
        </header>

        <section className="mb-16">
          <h2 className="text-sm font-medium uppercase tracking-widest text-muted-foreground mb-6">
            What's coming
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {SCOPE.map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-border bg-card p-5"
              >
                <item.icon className="size-5 text-muted-foreground mb-3" />
                <h3 className="font-medium mb-1.5">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-dashed border-border bg-card/30 p-6">
          <h2 className="text-sm font-medium uppercase tracking-widest text-muted-foreground mb-3">
            Status
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-1">
            Source canvas built in Cursor: <span className="text-foreground/80 font-mono text-xs">2026-05-15</span>
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Porting the 4,700-line canvas to a standalone interactive web
            experience. Check back soon.
          </p>
        </section>

        <footer className="mt-24 pt-6 border-t border-border text-xs text-muted-foreground">
          <p>Ankush Rustagi · Verkada Product</p>
        </footer>
      </main>
    </div>
  )
}

export default App
