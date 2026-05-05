"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { bodyClassForPath } from "@/lib/body-class";

export default function BodyRouteClass() {
  const pathname = usePathname();

  useEffect(() => {
    document.body.className = bodyClassForPath(pathname);
  }, [pathname]);

  return null;
}
