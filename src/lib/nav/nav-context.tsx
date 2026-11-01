"use client";

import * as React from "react";

export type AppLinkProps = Omit<React.ComponentProps<"a">, "href"> & { href: string };

export type NavApi = {
  pathname: string;
  push: (href: string) => void;
  Link: React.ComponentType<AppLinkProps>;
};

const NavContext = React.createContext<NavApi | null>(null);

/**
 * Gezinme soyutlaması: ekranlar Next.js'e doğrudan bağlı değil.
 * Asıl uygulamada next/link, önizlemede adres çubuğundaki #işaret kullanılır.
 */
export function NavProvider({ value, children }: { value: NavApi; children: React.ReactNode }) {
  return <NavContext value={value}>{children}</NavContext>;
}

export function useNav() {
  const ctx = React.use(NavContext);
  if (!ctx) throw new Error("useNav, NavProvider içinde kullanılmalı.");
  return ctx;
}

export function AppLink(props: AppLinkProps) {
  const { Link } = useNav();
  return <Link {...props} />;
}
