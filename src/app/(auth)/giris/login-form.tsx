"use client";

import { useActionState } from "react";
import { ArrowRight, LoaderCircle, MailCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sendMagicLink, type MagicLinkState } from "@/server/actions/auth";

const initialState: MagicLinkState = { status: "idle" };

export function LoginForm() {
  const [state, formAction, pending] = useActionState(sendMagicLink, initialState);
  if (state.status === "sent") {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <span data-course="mint" className="flex size-12 items-center justify-center rounded-xl bg-course text-course-fg">
          <MailCheck className="size-6" strokeWidth={1.8} aria-hidden />
        </span>
        <div className="flex flex-col gap-1.5">
          <h1 className="text-xl font-semibold tracking-[-0.01em]">Gelen kutunu kontrol et</h1>
          <p className="text-sm text-ink-muted">
            <span className="font-medium text-foreground">{state.email}</span> adresine bir giriş bağlantısı
            gönderdik. E-postadaki bağlantıya tıkladığında doğrudan Bugün ekranına geleceksin.
          </p>
        </div>
        <form action={formAction} className="contents">
          <input type="hidden" name="email" value={state.email} />
          <Button type="submit" variant="link" disabled={pending} className="text-13">
            Bağlantıyı tekrar gönder
          </Button>
        </form>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-6" noValidate>
      <div className="flex flex-col gap-1.5">
        <h1 className="text-xl font-semibold tracking-[-0.01em]">Giriş yap</h1>
        <p className="text-sm text-ink-muted">
          E-posta adresini yaz; şifresiz, tek tıkla giriş yapabileceğin bir bağlantı gönderelim.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="email">E-posta adresi</Label>
        <Input
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="murat@ornek.com"
          required
          autoFocus
          // Form gönderilince React alanı temizler; hata varsa yazılanı geri koy.
          key={state.status === "error" ? `err-${state.message}-${state.email}` : "idle"}
          defaultValue={state.status === "error" ? state.email : undefined}
          aria-invalid={state.status === "error" || undefined}
          aria-describedby={state.status === "error" ? "email-error" : undefined}
        />
        {state.status === "error" && (
          <p id="email-error" role="alert" className="text-13 text-destructive">
            {state.message}
          </p>
        )}
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? (
          <>
            <LoaderCircle className="animate-spin" aria-hidden />
            Gönderiliyor…
          </>
        ) : (
          <>
            Giriş bağlantısı gönder
            <ArrowRight aria-hidden />
          </>
        )}
      </Button>
    </form>
  );
}
