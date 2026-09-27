import { createFileRoute } from "@tanstack/react-router";
import { MedGuardApp } from "../components/MedGuardApp";
export const Route = createFileRoute("/security/users")({
  head: () => ({ meta: [{ title: "User management — MedGuard" }, { name: "description", content: "Manage MedGuard hospital workspace users." }, { property: "og:title", content: "User management — MedGuard" }, { property: "og:description", content: "Manage MedGuard hospital workspace users." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: () => <MedGuardApp page="users" />,
});