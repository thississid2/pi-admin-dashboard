"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Users,
  UserCheck,
  FileText,
  Palette,
  Link as LinkIcon,
  MessageSquare,
  ShieldAlert,
  Music,
  Shield,
  Settings,
} from "@/components/icons";

const sidebarItems = [
  {
    name: "Dashboard",
    href: "/",
    icon: BarChart3,
  },
  {
    name: "Applications",
    href: "/applications",
    icon: Users,
  },
  {
    name: "User Management",
    href: "/user-management",
    icon: UserCheck,
  },
  {
    name: "API Documentation",
    href: "/api-documentation",
    icon: FileText,
  },
  {
    name: "Checkout Designs",
    href: "/checkout-designs",
    icon: Palette,
  },
  {
    name: "API Integrations",
    href: "/api-integrations",
    icon: LinkIcon,
  },
  {
    name: "Communications",
    href: "/communications",
    icon: MessageSquare,
  },
  {
    name: "Risk Management",
    href: "/risk-management",
    icon: ShieldAlert,
  },
  {
    name: "Pi Symphony",
    href: "/pi-symphony",
    icon: Music,
  },
  {
    name: "Pi Shield",
    href: "/pi-shield",
    icon: Shield,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-56 bg-[#2C3E50] min-h-screen flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-[#34495E]">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 bg-[#1ABC9C] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">π</span>
          </div>
          <div>
            <h1 className="text-white font-semibold text-base">Client Admin</h1>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-3 border-b border-[#34495E]">
        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            className="w-full bg-[#34495E] text-white placeholder-gray-400 px-3 py-2 rounded-md border border-transparent focus:border-[#1ABC9C] focus:outline-none text-sm"
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3">
        <ul className="space-y-1 px-2">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors text-sm ${
                    isActive
                      ? "bg-[#1ABC9C] text-white"
                      : "text-gray-300 hover:bg-[#34495E] hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="font-medium truncate">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile */}
      <div className="p-3 border-t border-[#34495E]">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 bg-[#1ABC9C] rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-xs">JS</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-medium text-sm truncate">
              John Smith
            </p>
            <p className="text-gray-400 text-xs truncate">Admin</p>
          </div>
          <div className="w-2 h-2 bg-[#1ABC9C] rounded-full flex-shrink-0"></div>
        </div>
      </div>
    </div>
  );
}
