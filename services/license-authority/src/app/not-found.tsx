/**
 * RAVENHUB — DECOY 404 (Fake "Not Found" terminal page)
 * ------------------------------------------------------------------
 * Generic-looking error page with no project branding. Rendered with
 * an authentic 404 status code for every unknown/public route.
 */
export const dynamic = "force-dynamic";

export default function NotFound() {
  return (
    <main
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: "var(--bg)", color: "var(--text)" }}
    >
      <div className="panel scanlines relative w-full max-w-xl p-8 fade-up">
        <div className="flex items-center gap-2 mb-6">
          <span className="term-dot" style={{ background: "#f87171" }} />
          <span className="term-dot" style={{ background: "#fbbf24" }} />
          <span className="term-dot" style={{ background: "#34d399" }} />
          <span className="mono text-[11px] ml-3" style={{ color: "var(--text-faint)" }}>
            request · /
          </span>
        </div>

        <h1 className="mono text-5xl font-bold" style={{ color: "var(--violet-soft)" }}>
          404
        </h1>
        <h2 className="mono text-sm mt-3 tracking-[0.25em] uppercase" style={{ color: "var(--text-dim)" }}>
          Not Found
        </h2>

        <pre
          className="mono text-[11.5px] leading-relaxed mt-6 overflow-x-auto"
          style={{ color: "var(--text-dim)" }}
        >
{`The requested URL was not found on this server.

$ curl -s -o /dev/null -w "%{http_code}" http://host/
404

Troubleshooting suggestions:
  · Verify the address was typed correctly.
  · The resource may have been moved or never existed.
  · This endpoint serves no public content.`}
        </pre>

        <div
          className="mt-6 pt-4 border-t text-[10.5px] mono"
          style={{ borderColor: "var(--border)", color: "var(--text-faint)" }}
        >
          <span className="blink">▌</span> upstream server · connection reset by peer
        </div>
      </div>
    </main>
  );
}
