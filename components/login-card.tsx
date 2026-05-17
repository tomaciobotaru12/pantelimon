"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";

type Mode = "signin" | "signup";

export function LoginCard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/";

  const [mode, setMode] = useState<Mode>("signin");
  const [pending, start] = useTransition();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const switchMode = (m: Mode) => {
    setMode(m);
    setError(null);
    setInfo(null);
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    start(async () => {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        if (error.message.toLowerCase().includes("email not confirmed")) {
          setError("Email-ul nu a fost încă confirmat. Verifică inbox-ul pentru link.");
        } else if (error.message.toLowerCase().includes("invalid")) {
          setError("Email sau parolă greșite.");
        } else {
          setError(error.message);
        }
        return;
      }
      router.push(next);
      router.refresh();
    });
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (password.length < 6) {
      setError("Parola trebuie să aibă cel puțin 6 caractere.");
      return;
    }

    start(async () => {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username: username.trim() || email.split("@")[0] },
        },
      });
      if (error) {
        setError(error.message);
        return;
      }
      // Cu „Confirm email" dezactivat în Supabase, signUp returnează sesiune direct.
      if (data.session) {
        router.push(next);
        router.refresh();
        return;
      }
      // Fallback: dacă pe undeva mai e confirmarea activă, încercăm sign-in cu parola
      // (funcționează doar dacă utilizatorul există deja sau confirmarea e off).
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) {
        setError(
          "Contul a fost creat, dar autentificarea automată a eșuat. Încearcă din tab-ul Intră cu același email și parolă.",
        );
        setMode("signin");
        return;
      }
      router.push(next);
      router.refresh();
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md rounded-lg border border-sepia-700/30 bg-sepia-900/60 p-8 backdrop-blur-sm"
    >
      <p className="text-xs uppercase tracking-[0.3em] text-sepia-300/70 text-center">
        Aici Era
      </p>
      <h1 className="mt-2 font-display text-3xl text-sepia-50 text-center">
        {mode === "signin" ? "Intră în arhivă" : "Cont nou"}
      </h1>
      <p className="mt-2 text-sepia-200/80 font-serif text-center text-sm">
        {mode === "signin"
          ? "Bun venit înapoi."
          : "Câteva date — și gata, poți lăsa prima amintire."}
      </p>

      {/* Tabs */}
      <div className="mt-6 grid grid-cols-2 gap-1 rounded-md bg-sepia-50/5 p-1">
        <button
          type="button"
          onClick={() => switchMode("signin")}
          className={`text-sm py-2 rounded transition-colors ${
            mode === "signin"
              ? "bg-sepia-700 text-sepia-50"
              : "text-sepia-300 hover:text-sepia-100"
          }`}
        >
          Intră
        </button>
        <button
          type="button"
          onClick={() => switchMode("signup")}
          className={`text-sm py-2 rounded transition-colors ${
            mode === "signup"
              ? "bg-sepia-700 text-sepia-50"
              : "text-sepia-300 hover:text-sepia-100"
          }`}
        >
          Cont nou
        </button>
      </div>

      <form
        onSubmit={mode === "signin" ? handleSignIn : handleSignUp}
        className="mt-6 space-y-4"
      >
        {mode === "signup" ? (
          <div className="space-y-2">
            <Label htmlFor="username">Nume afișat (opțional)</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="ex: ion.popescu"
              autoComplete="username"
            />
          </div>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="numele.tau@email.ro"
            autoComplete="email"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Parolă</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="minim 6 caractere"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              required
              minLength={6}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-sepia-300/70 hover:text-sepia-100"
              aria-label={showPassword ? "Ascunde parola" : "Arată parola"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {info ? (
          <div className="rounded-md border border-sepia-300/30 bg-sepia-300/10 p-3 text-sm text-sepia-100 flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-sepia-200" />
            <span>{info}</span>
          </div>
        ) : null}

        {error ? (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <Button type="submit" size="lg" disabled={pending} className="w-full">
          {pending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {mode === "signin" ? "Se intră…" : "Se creează contul…"}
            </>
          ) : mode === "signin" ? (
            "Intră"
          ) : (
            "Creează cont"
          )}
        </Button>

        <p className="text-center text-xs text-sepia-300/60">
          {mode === "signin" ? (
            <>
              Nu ai cont încă?{" "}
              <button
                type="button"
                onClick={() => switchMode("signup")}
                className="text-sepia-200 hover:text-sepia-50 underline underline-offset-2"
              >
                Creează unul
              </button>
            </>
          ) : (
            <>
              Ai deja cont?{" "}
              <button
                type="button"
                onClick={() => switchMode("signin")}
                className="text-sepia-200 hover:text-sepia-50 underline underline-offset-2"
              >
                Intră aici
              </button>
            </>
          )}
        </p>
      </form>
    </motion.div>
  );
}
