import LoginModule from "@/modules/login";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Managing People. Anywhere. Anytime",
};

export default function LoginPage() {
  return <LoginModule />;
}
