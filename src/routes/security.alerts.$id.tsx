import { createFileRoute } from "@tanstack/react-router";
import { MedGuardApp } from "../components/MedGuardApp";
export const Route = createFileRoute("/security/alerts/$id")({
  head: () => ({ meta: [{ title: "Alert investigation — MedGuard" }, { name: "description", content: "Investigate a suspicious clinical access alert." }, { property: "og:title", content: "Alert investigation — MedGuard" }, { property: "og:description", content: "Investigate a suspicious clinical access alert." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: () => <MedGuardApp page="investigation" />,
});