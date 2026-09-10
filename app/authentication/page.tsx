import type { Metadata } from "next";
import LoginPageLayout from "@/modules/auth/login";
import LoginForm from "@/modules/auth/login/comp-form";

export const metadata: Metadata = {
  title: "Masuk — Klola Indonesia",
  description: "Masuk ke portal Klola untuk mengelola tim dan tiket support.",
};

export default function LoginPage() {
  return (
    <LoginPageLayout>
      <LoginForm />
    </LoginPageLayout>
  );
}
