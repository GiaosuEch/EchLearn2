/**
 * RAVENHUB — CLOAKING DECOY ENGINE
 * ------------------------------------------------------------------
 * The root path returns a REAL 404 status with a realistic,
 * server-generated looking error page. Automated scanners, crawlers
 * and unauthorized inspectors conclude the host is offline or
 * unconfigured — the true admin surface lives at the secret route.
 */
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default function HomePage() {
  notFound();
}
