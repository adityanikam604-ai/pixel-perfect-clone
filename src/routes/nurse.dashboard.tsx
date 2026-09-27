import { createFileRoute } from "@tanstack/react-router";
import { MedGuardApp } from "../components/MedGuardApp";
export const Route = createFileRoute("/nurse/dashboard")({
  head: () => ({ meta: [{ title: "Clinical dashboard — MedGuard" }, { name: "description", content: "A secure clinical access dashboard for hospital teams." }, { property: "og:title", content: "Clinical dashboard — MedGuard" }, { property: "og:description", content: "A secure clinical access dashboard for hospital teams." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: () => <MedGuardApp page="dashboard" />,
});