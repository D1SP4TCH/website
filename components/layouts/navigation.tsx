"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Garden" },
  { href: "/projects", label: "Projects" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Navigation() {
  const pathname = usePathname();

  const lightNav = pathname === "/about";

  return (
    <motion.nav
      data-top-chrome
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed left-0 right-0 top-0 z-50 border-b border-transparent bg-transparent transition-all duration-300"
    >
      <div className="container mx-auto flex items-center justify-between px-6 py-6">
        <Link
          href="/"
          className={cn(
            "group relative text-xl font-medium tracking-tight md:text-2xl",
            lightNav ? "text-[#2f3731]" : "text-white"
          )}
          data-cursor-hover
        >
          <span className="relative z-10">Jason Chiu</span>
          <motion.span
            className={cn(
              "absolute -bottom-1 left-0 h-0.5",
              lightNav ? "bg-[#b4a84b]" : "bg-[#d2c22d]"
            )}
            initial={{ width: 0 }}
            whileHover={{ width: "100%" }}
            transition={{ duration: 0.3 }}
          />
        </Link>

        <ul className="flex items-center gap-8">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "relative text-xs font-medium uppercase tracking-[0.16em] transition-colors",
                    lightNav
                      ? isActive
                        ? "text-[#2f3731]"
                        : "text-[#758a7b] hover:text-[#2f3731]"
                      : isActive
                        ? "text-white"
                        : "text-white/65 hover:text-white/90"
                  )}
                  data-cursor-hover
                >
                  {item.label}
                  {isActive && (
                    <motion.span
                      layoutId="activeNav"
                      className={cn(
                        "absolute -bottom-1 left-0 right-0 h-0.5",
                        lightNav ? "bg-[#b4a84b]" : "bg-[#d2c22d]"
                      )}
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 30,
                      }}
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </motion.nav>
  );
}
