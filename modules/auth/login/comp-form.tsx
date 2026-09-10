"use client";

import { AnimatePresence, motion } from "motion/react";
import {
  Building2,
  CheckCircle,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  User,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/motion/tabs";
import { Input } from "@/components/motion/input";

/* ─── button preset ─── */
function SubmitButton({
  busy,
  label,
}: {
  busy: boolean;
  label: string;
}) {
  return (
    <button
      type="submit"
      disabled={busy}
      className="relative inline-flex h-11 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-[#0B3464] text-sm font-medium text-white transition-all duration-150 active:scale-[0.98] hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3464]/40 disabled:cursor-not-allowed disabled:opacity-55"
    >
      <AnimatePresence mode="wait">
        {busy ? (
          <motion.span
            key="spinner"
            className="flex items-center gap-2"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15 }}
          >
            <Loader2 className="size-4 animate-spin" />
            Memproses…
          </motion.span>
        ) : (
          <motion.span
            key="label"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15 }}
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

/* ─── validation helpers ─── */
function validateEmail(v: string) {
  if (!v) return "Email wajib diisi";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Format email tidak valid";
  return "";
}
function validatePassword(v: string) {
  if (!v) return "Password wajib diisi";
  if (v.length < 6) return "Minimal 6 karakter";
  return "";
}

/* ─── form field map ─── */
interface Field {
  label: string;
  type: string;
  placeholder: string;
  autoComplete: string;
  icon: typeof Mail;
  key: string;
  validate?: (v: string, all?: Record<string, string>) => string;
}

const loginFields: Field[] = [
  {
    label: "Email", type: "email", placeholder: "nama@perusahaan.com",
    autoComplete: "email", icon: Mail, key: "email",
    validate: validateEmail,
  },
  {
    label: "Password", type: "password", placeholder: "••••••••",
    autoComplete: "current-password", icon: Lock, key: "password",
    validate: (v) => (!v ? "Password wajib diisi" : ""),
  },
];

const registerFields: Field[] = [
  {
    label: "Nama lengkap", type: "text", placeholder: "Nama Anda",
    autoComplete: "name", icon: User, key: "name",
    validate: (v) => (!v ? "Nama wajib diisi" : ""),
  },
  {
    label: "Email", type: "email", placeholder: "nama@perusahaan.com",
    autoComplete: "email", icon: Mail, key: "email",
    validate: validateEmail,
  },
  {
    label: "Perusahaan", type: "text", placeholder: "Nama perusahaan (opsional)",
    autoComplete: "organization", icon: Building2, key: "company",
  },
  {
    label: "Password", type: "password", placeholder: "Minimal 6 karakter",
    autoComplete: "new-password", icon: Lock, key: "password",
    validate: validatePassword,
  },
  {
    label: "Konfirmasi password", type: "password", placeholder: "Ulangi password",
    autoComplete: "new-password", icon: CheckCircle, key: "confirm",
    validate: (v, all) => {
      if (!v) return "Konfirmasi wajib diisi";
      if (v !== all?.password) return "Password tidak cocok";
      return "";
    },
  },
];

/* ─── form field component ─── */
function FormField({
  field,
  value,
  onChange,
  showPassword,
  onTogglePassword,
  error,
}: {
  field: Field;
  value: string;
  onChange: (v: string) => void;
  showPassword?: boolean;
  onTogglePassword?: () => void;
  error?: string;
}) {
  const Icon = field.icon;
  const isPass = field.type === "password";

  return (
    <Input
      label={field.label}
      type={isPass && showPassword ? "text" : field.type}
      placeholder={field.placeholder}
      autoComplete={field.autoComplete}
      value={value}
      onChange={onChange}
      error={error}
      leftIcon={<Icon className="size-4 text-muted-foreground" />}
      rightIcon={
        field.key === "password" || field.key === "confirm" ? (
          <button
            type="button"
            tabIndex={-1}
            onClick={onTogglePassword}
            aria-label={showPassword ? "Sembunyikan" : "Tampilkan"}
            className="grid size-11 place-items-center text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        ) : undefined
      }
      reserveErrorLine
    />
  );
}

/* ─── tab content wrapper ─── */
function AnimatedTabContent({
  value,
  children,
}: {
  value: string;
  children: React.ReactNode;
}) {
  return (
    <TabsContent value={value}>
      <AnimatePresence mode="wait">
        <motion.div
          key={value}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </TabsContent>
  );
}

/* ─── main export ─── */
export default function LoginForm() {
  const [tab, setTab] = useState("login");

  /* login state */
  const [login, setLogin] = useState({ email: "", password: "" });
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [loginErr, setLoginErr] = useState<string | null>(null);
  const [loginBusy, setLoginBusy] = useState(false);
  const [loginFieldErrs, setLoginFieldErrs] = useState<Record<string, string>>({});

  /* register state */
  const [reg, setReg] = useState({
    name: "", email: "", company: "", password: "", confirm: "",
  });
  const [showRegPass, setShowRegPass] = useState(false);
  const [regErr, setRegErr] = useState<string | null>(null);
  const [regBusy, setRegBusy] = useState(false);
  const [regFieldErrs, setRegFieldErrs] = useState<Record<string, string>>({});

  /* ── login submit ── */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    loginFields.forEach((f) => {
      if (f.validate) {
        const msg = f.validate(login[f.key as keyof typeof login]);
        if (msg) errs[f.key] = msg;
      }
    });
    setLoginFieldErrs(errs);
    if (Object.keys(errs).length) return;

    setLoginErr(null);
    setLoginBusy(true);
    try {
      await new Promise((r) => setTimeout(r, 1000));
      // TODO: API call
    } catch {
      setLoginErr("Email atau password salah. Coba lagi.");
    } finally {
      setLoginBusy(false);
    }
  };

  /* ── register submit ── */
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    registerFields.forEach((f) => {
      if (f.validate) {
        const msg = f.validate(reg[f.key as keyof typeof reg], reg);
        if (msg) errs[f.key] = msg;
      }
    });
    setRegFieldErrs(errs);
    if (Object.keys(errs).length) return;

    setRegErr(null);
    setRegBusy(true);
    try {
      await new Promise((r) => setTimeout(r, 1000));
      // TODO: API call
    } catch {
      setRegErr("Terjadi kesalahan. Coba lagi.");
    } finally {
      setRegBusy(false);
    }
  };

  return (
    <div className="flex flex-col">
      <Tabs value={tab} onValueChange={setTab} variant="pill">
        <TabsList>
          <TabsTrigger value="login">Masuk</TabsTrigger>
          <TabsTrigger value="register">Daftar</TabsTrigger>
        </TabsList>

        {/* ── Login ── */}
        <AnimatedTabContent value="login">
          <div className="flex flex-col gap-5">
            {loginErr && (
              <motion.div
                role="alert"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg border border-destructive/20 bg-destructive/[0.06] px-3 py-2.5 text-xs text-destructive"
              >
                {loginErr}
              </motion.div>
            )}

            <form onSubmit={handleLogin} className="flex flex-col gap-1">
              {loginFields.map((f) => (
                <FormField
                  key={f.key}
                  field={f}
                  value={login[f.key as keyof typeof login]}
                  onChange={(v) => setLogin((p) => ({ ...p, [f.key]: v }))}
                  showPassword={showLoginPass}
                  onTogglePassword={() => setShowLoginPass((s) => !s)}
                  error={loginFieldErrs[f.key]}
                />
              ))}

              <div className="mt-2 flex items-center justify-between">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    className="size-4 rounded border-border accent-[#0B3464]"
                  />
                  Ingat saya
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-[#0B3464] underline-offset-4 hover:underline"
                >
                  Lupa password?
                </Link>
              </div>

              <div className="mt-4">
                <SubmitButton busy={loginBusy} label="Masuk" />
              </div>
            </form>
          </div>
        </AnimatedTabContent>

        {/* ── Register ── */}
        <AnimatedTabContent value="register">
          <div className="flex flex-col gap-5">
            {regErr && (
              <motion.div
                role="alert"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg border border-destructive/20 bg-destructive/[0.06] px-3 py-2.5 text-xs text-destructive"
              >
                {regErr}
              </motion.div>
            )}

            <form onSubmit={handleRegister} className="flex flex-col gap-1">
              {registerFields.map((f) => (
                <FormField
                  key={f.key}
                  field={f}
                  value={reg[f.key as keyof typeof reg]}
                  onChange={(v) => setReg((p) => ({ ...p, [f.key]: v }))}
                  showPassword={showRegPass}
                  onTogglePassword={() => setShowRegPass((s) => !s)}
                  error={regFieldErrs[f.key]}
                />
              ))}

              <label className="mt-3 flex cursor-pointer items-start gap-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  className="mt-0.5 size-4 shrink-0 rounded border-border accent-[#0B3464]"
                />
                <span className="leading-5">
                  Saya menyetujui{" "}
                  <Link href="/terms" className="text-[#0B3464] hover:underline">
                    Syarat & Ketentuan
                  </Link>{" "}
                  dan{" "}
                  <Link href="/privacy" className="text-[#0B3464] hover:underline">
                    Kebijakan Privasi
                  </Link>
                </span>
              </label>

              <div className="mt-3">
                <SubmitButton busy={regBusy} label="Buat akun" />
              </div>
            </form>
          </div>
        </AnimatedTabContent>
      </Tabs>

      {/* Tab-switch footer link */}
      <motion.p
        className="mt-6 text-center text-xs text-muted-foreground/60"
        key={tab}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        {tab === "login" ? (
          <>
            Belum punya akun?{" "}
            <button
              type="button"
              onClick={() => setTab("register")}
              className="font-medium text-[#0B3464] hover:underline"
            >
              Daftar sekarang
            </button>
          </>
        ) : (
          <>
            Sudah punya akun?{" "}
            <button
              type="button"
              onClick={() => setTab("login")}
              className="font-medium text-[#0B3464] hover:underline"
            >
              Masuk
            </button>
          </>
        )}
      </motion.p>
    </div>
  );
}
