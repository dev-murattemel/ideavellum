import * as React from "react";

import { NavProvider, type AppLinkProps } from "@/lib/nav/nav-context";
import { hashToPath, pathToHash } from "@/lib/nav/hash-routes";

function HashLink({ href, onClick, ...props }: AppLinkProps) {
  return (
    <a
      href={`#${pathToHash(href)}`}
      onClick={(e) => {
        onClick?.(e);
        if (!e.defaultPrevented) window.scrollTo({ top: 0 });
      }}
      {...props}
    />
  );
}

/** Önizlemede sayfalar adres çubuğundaki #işaretle değişir (ör. #pano, #ders-…). */
export function HashNavProvider({ children }: { children: React.ReactNode }) {
  const [pathname, setPathname] = React.useState(() => hashToPath(window.location.hash));

  React.useEffect(() => {
    const onChange = () => setPathname(hashToPath(window.location.hash));
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  const value = React.useMemo(
    () => ({
      pathname,
      push: (href: string) => {
        window.location.hash = pathToHash(href);
        window.scrollTo({ top: 0 });
      },
      Link: HashLink,
    }),
    [pathname],
  );

  return <NavProvider value={value}>{children}</NavProvider>;
}
