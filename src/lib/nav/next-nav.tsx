"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { NavProvider, type AppLinkProps } from "./nav-context";

function NextLink({ href, ...props }: AppLinkProps) {
  return <Link href={href} {...props} />;
}

export function NextNavProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const value = React.useMemo(
    () => ({ pathname, push: (href: string) => router.push(href), Link: NextLink }),
    [pathname, router],
  );
  return <NavProvider value={value}>{children}</NavProvider>;
}
