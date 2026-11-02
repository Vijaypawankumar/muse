"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  ["/", "Home"],
  ["/create", "Create"],
  ["/assistant", "Assistant"],
  ["/studio", "My Studio"],
  ["/growth", "Growth"],
];

export default function Nav() {
  const path = usePathname();
  return (
    <nav className="nav">
      {LINKS.map(([href, label]) => (
        <Link key={href} href={href} className={path === href ? "active" : ""}>
          {label}
        </Link>
      ))}
    </nav>
  );
}
