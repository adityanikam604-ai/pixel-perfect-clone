import { createFileRoute } from "@tanstack/react-router";
import { MedGuardApp } from "../components/MedGuardApp";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [
    { title: "Sign in — MedGuard" },
    { name: "description", content: "Securely sign in to the MedGuard clinical access workspace." },
    { property: "og:title", content: "Sign in — MedGuard" },
    { property: "og:description", content: "Securely sign in to the MedGuard clinical access workspace." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: () => <MedGuardApp page="login" />,
});