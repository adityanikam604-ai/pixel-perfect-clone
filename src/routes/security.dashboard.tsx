import { createFileRoute } from "@tanstack/react-router";
import { MedGuardApp } from "../components/MedGuardApp";
export const Route = createFileRoute("/security/dashboard")({
  head: () => ({ meta: [{ title: "Security operations — MedGuard" }, { name: "description", content: "Monitor clinical access patterns and investigate suspicious activity." }, { property: "og:title", content: "Security operations — MedGuard" }, { property: "og:description", content: "Monitor clinical access patterns and investigate suspicious activity." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: () => <MedGuardApp page="security-dashboard" />,
});