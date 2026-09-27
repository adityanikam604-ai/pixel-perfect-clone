import { createFileRoute } from "@tanstack/react-router";
import { MedGuardApp } from "../components/MedGuardApp";
export const Route = createFileRoute("/activity")({
  head: () => ({ meta: [{ title: "My activity — MedGuard" }, { name: "description", content: "Review your monitored patient-record access history." }, { property: "og:title", content: "My activity — MedGuard" }, { property: "og:description", content: "Review your monitored patient-record access history." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: () => <MedGuardApp page="activity" />,
});