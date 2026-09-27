import { createFileRoute } from "@tanstack/react-router";
import { MedGuardApp } from "../components/MedGuardApp";
export const Route = createFileRoute("/security/logs")({
  head: () => ({ meta: [{ title: "Access logs — MedGuard" }, { name: "description", content: "Audit monitored access to synthetic patient records." }, { property: "og:title", content: "Access logs — MedGuard" }, { property: "og:description", content: "Audit monitored access to synthetic patient records." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: () => <MedGuardApp page="logs" />,
});