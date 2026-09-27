import { createFileRoute } from "@tanstack/react-router";
import { MedGuardApp } from "../components/MedGuardApp";
export const Route = createFileRoute("/patients/$id")({
  head: () => ({ meta: [{ title: "Patient record — MedGuard" }, { name: "description", content: "A monitored synthetic patient record for the MedGuard demo." }, { property: "og:title", content: "Patient record — MedGuard" }, { property: "og:description", content: "A monitored synthetic patient record for the MedGuard demo." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: PatientDetailsRoute,
});
function PatientDetailsRoute() {
  const { id } = Route.useParams();
  return <MedGuardApp page="patient-detail" patientId={id} />;
}