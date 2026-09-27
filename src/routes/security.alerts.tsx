import { createFileRoute } from "@tanstack/react-router";
import { MedGuardApp } from "../components/MedGuardApp";
export const Route = createFileRoute("/security/alerts")({
  head: () => ({ meta: [{ title: "Security alerts — MedGuard" }, { name: "description", content: "Review suspicious clinical access alerts." }, { property: "og:title", content: "Security alerts — MedGuard" }, { property: "og:description", content: "Review suspicious clinical access alerts." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: () => <MedGuardApp page="alerts" />,
});