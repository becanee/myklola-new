import ClientModules from "@/modules/client/dashboard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Client Dashboard",
  description: "Managing People. Anywhere. Anytime",
};

export default function ClientPage() {
  return <ClientModules />;
}
