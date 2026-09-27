import { createFileRoute } from "@tanstack/react-router";
import { MedGuardApp } from "../components/MedGuardApp";
export const Route = createFileRoute("/security/rules")({
  head: () => ({ meta: [{ title: "Security rules — MedGuard" }, { name: "description", content: "Review the suspicious activity detection rules used by MedGuard." }, { property: "og:title", content: "Security rules — MedGuard" }, { property: "og:description", content: "Review the suspicious activity detection rules used by MedGuard." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: () => <MedGuardApp page="rules" />,
});