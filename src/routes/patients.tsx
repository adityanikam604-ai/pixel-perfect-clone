import { createFileRoute } from "@tanstack/react-router";
import { MedGuardApp } from "../components/MedGuardApp";
export const Route = createFileRoute("/patients")({
  head: () => ({ meta: [{ title: "Patient records — MedGuard" }, { name: "description", content: "Search and review synthetic patient records within authorized clinical scope." }, { property: "og:title", content: "Patient records — MedGuard" }, { property: "og:description", content: "Search and review synthetic patient records within authorized clinical scope." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: () => <MedGuardApp page="patients" />,
});