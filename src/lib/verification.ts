import { demoDocuments } from "../content";
export function verifyDemo(id: string) {
  return (
    demoDocuments.find((doc) => doc.id === id.trim().toUpperCase()) ?? null
  );
}
