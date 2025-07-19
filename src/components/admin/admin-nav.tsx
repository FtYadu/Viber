"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Users,
  FolderKanban,
  FileText,
  Globe,
  Mail,
  Workflow,
  BrainCircuit,
  MessageSquare,
  Activity,
  Zap,
  Settings,
} from "lucide-react";

const navItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: BarChart3,
  },
  {
    title: "Clients",
    href: "/admin/clients",
    icon: Users,
  },
  {
    title: "Projects",
    href: "/admin/projects",
    icon: FolderKanban,
  },
  {
    title: "Invoices",
    href: "/admin/invoices",
    icon: FileText,
  },
  {
    title: "DNS Management",
    href: "/admin/dns",
    icon: Globe,
  },
  {
    title: "Email Templates",
    href: "/admin/emails",
    icon: Mail,
  },
  {
    title: "Workflows",
    href: "/admin/workflows",
    icon: Workflow,
  },
  {
    title: "AI Tools",
    href: "/admin/ai",
    icon: BrainCircuit,
    submenu: [
      {
        title: "Content Generation",
        href: "/admin/ai/content",
      },
      {
        title: "Email Assistant",
        href: "/admin/ai/email",
      },
      {
        title: "Chatbot",
        href: "/admin/ai/chatbot",
      },
    ],
  },
  {
    title: "Monitoring",
    href: "/admin/monitoring",
    icon: Activity,
  },
  {
    title: "Performance",
    href: "/admin/performance",
    icon: Zap,
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="grid items-start gap-2">
      {navItems.map((item) => {
        const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
        
        return (
          <div key={item.href}>
            <Link
              href={item.href}
              className={cn(
                "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                isActive ? "bg-accent" : "transparent"
              )}
            >
              <item.icon className="mr-2 h-4 w-4" />
              <span>{item.title}</span>
            </Link>
            
            {item.submenu && isActive && (
              <div className="ml-6 mt-1 grid gap-1">
                {item.submenu.map((subitem) => {
                  const isSubActive = pathname === subitem.href;
                  
                  return (
                    <Link
                      key={subitem.href}
                      href={subitem.href}
                      className={cn(
                        "flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                        isSubActive ? "bg-accent/50" : "transparent"
                      )}
                    >
                      <span>{subitem.title}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}