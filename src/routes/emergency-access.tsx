import { createFileRoute } from "@tanstack/react-router";
import { MedGuardApp } from "../components/MedGuardApp";
export const Route = createFileRoute("/emergency-access")({
  head: () => ({ meta: [{ title: "Emergency access — MedGuard" }, { name: "description", content: "Request monitored emergency access to a patient record." }, { property: "og:title", content: "Emergency access — MedGuard" }, { property: "og:description", content: "Request monitored emergency access to a patient record." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: () => <MedGuardApp page="emergency" />,
});