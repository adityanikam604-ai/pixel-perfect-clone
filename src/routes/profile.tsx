import { createFileRoute } from "@tanstack/react-router";
import { MedGuardApp } from "../components/MedGuardApp";
export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "My profile — MedGuard" }, { name: "description", content: "View your MedGuard clinical access profile." }, { property: "og:title", content: "My profile — MedGuard" }, { property: "og:description", content: "View your MedGuard clinical access profile." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: () => <MedGuardApp page="profile" />,
});