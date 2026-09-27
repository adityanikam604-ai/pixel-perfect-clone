import { alerts } from "../lib/medguard-data";
export const listAlerts = () => alerts;
export const getAlert = (id: string) => alerts.find((alert) => alert.id === id) ?? alerts[0];