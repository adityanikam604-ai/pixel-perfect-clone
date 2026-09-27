import { patients } from "../lib/medguard-data";
export const listPatients = () => patients;
export const getPatient = (id: string) => patients.find((patient) => patient.id === id) ?? patients[0];