import { createFileRoute } from "@tanstack/react-router";
import { MedGuardApp } from "../components/MedGuardApp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MedGuard — Secure Clinical Access" },
      { name: "description", content: "Secure clinical access and suspicious patient-record activity monitoring for hospital teams." },
      { property: "og:title", content: "MedGuard — Secure Clinical Access" },
      { property: "og:description", content: "Secure clinical access and suspicious patient-record activity monitoring for hospital teams." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <MedGuardApp page="login" />,
});