"use client";

import { Dock, DockIcon } from "@/components/magicui/dock";
import { Home, ClipboardList, PenLine, Brain, Mail } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

const navItems = [
  { icon: Home, label: "home", path: "/" },
  { icon: ClipboardList, label: "project management", path: "/projects" },
  { icon: PenLine, label: "content & seo", path: "/content" },
  { icon: Brain, label: "business intelligence", path: "/bi" },
  { icon: Mail, label: "contact me", path: "/contact" },
];

export function NavDock() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="fixed bottom-6 left-0 right-0 flex justify-center z-50">
      <Dock>
        {navItems.map(({ icon: Icon, label, path }) => {
          const isActive = pathname === path;
          return (
            <DockIcon
              key={path}
              label={label}
              onClick={() => router.push(path)}
              className={`${
                isActive
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-800"
              }`}
            >
              <Icon size={20} />
            </DockIcon>
          );
        })}
      </Dock>
    </div>
  );
}
