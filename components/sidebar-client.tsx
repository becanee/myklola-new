"use client";

import {
  AnimatedSidebar as _Sidebar,
  AnimatedSidebarClose,
  AnimatedSidebarContent,
  AnimatedSidebarGroup,
  AnimatedSidebarGroupContent,
  AnimatedSidebarGroupLabel,
  AnimatedSidebarHeader,
  AnimatedSidebarInset,
  AnimatedSidebarMenu,
  AnimatedSidebarMenuButton,
  AnimatedSidebarMenuItem,
  AnimatedSidebarMenuSub,
  AnimatedSidebarMenuSubButton,
  AnimatedSidebarMenuSubItem,
  AnimatedSidebarProvider,
  AnimatedSidebarRail,
  AnimatedSidebarTrigger,
} from "@/components/motion/animated-sidebar";
import { getUserFromCookie } from "@/lib/utils";
import {
  ChevronDown,
  Command,
  FileStack,
  LayoutGrid,
  LogOut,
  MessageSquare,
  PanelLeft,
  Search,
  Settings,
  Sparkles,
  Target,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useRef, useState } from "react";
import Footer from "./footer";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

const AnimatedSidebar = _Sidebar as React.FC<{
  side?: "left" | "right";
  variant?: "sidebar" | "floating" | "inset";
  collapsible?: "offcanvas" | "icon" | "none";
  ariaLabel?: string;
  panelClassName?: string;
  children?: ReactNode;
}>;

interface NavItem {
  label: string;
  icon: typeof LayoutGrid;
  href?: string;
  badge?: string;
  children?: NavItem[];
}

const navigation: NavItem[] = [
  { label: "Dashboard", icon: LayoutGrid, href: "/" },
  { label: "Tickets", icon: FileStack, href: "/tickets" },
  // {
  //   label: "Manajemen",
  //   icon: Building2,
  //   href: "/client/companies",
  //   children: [
  //     { label: "Perusahaan", icon: Building2, href: "/client/companies" },
  //     { label: "Tim", icon: Users, href: "/client/team" },
  //     { label: "Proyek", icon: Target, href: "/client/projects" },
  //   ],
  // },
];

function matchPath(pathname: string, href?: string, children?: NavItem[]) {
  if (href && pathname === href) return true;
  if (children) return children.some((c) => c.href && pathname === c.href);
  return false;
}

export default function SidebarClient({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [active, setActive] = useState("Dashboard");
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const user: any = getUserFromCookie();

  const initials = user?.name ? String(user.name).charAt(0).toUpperCase() : "?";

  const handleLogout = async () => {
    try {
      await fetch("/api/v1/logout", { method: "POST" });
    } catch {
      /* noop */
    }
    // Clear remaining client-side cookies
    document.cookie = "_T=; path=/; max-age=0";
    document.cookie = "_C=; path=/; max-age=0";
    document.cookie = "_U=; path=/; max-age=0";
    router.push("/forbidden");
  };

  return (
    <AnimatedSidebarProvider className="h-screen min-h-0">
      <AnimatedSidebar
        ariaLabel="Klola workspace"
        collapsible="icon"
        panelClassName="border-border/40 bg-background"
      >
        <AnimatedSidebarHeader className="p-3 pb-2">
          <div className="flex min-h-11 items-center gap-3 overflow-hidden px-2">
            {/* <div className="grid size-7 shrink-0 place-items-center">
              <img src="/logo-dashboard.svg" alt="logo" />
            </div> */}
            <Link
              href="/"
              className="flex min-w-0 flex-1 items-center gap-2 rounded-lg text-left outline-none focus-visible:ring-2 focus-visible:ring-ring group-data-[state=collapsed]/sidebar:hidden"
            >
              <img src="/logo-dashboard.svg" className="w-24" alt="logo" />
              <span className="truncate text-md font-semibold text-foreground mt-1 -ml-1">
                HelpDesk
              </span>
            </Link>
            <AnimatedSidebarClose className="ml-auto text-muted-foreground hover:bg-muted md:hidden">
              <X aria-hidden="true" className="size-4" />
            </AnimatedSidebarClose>
          </div>
        </AnimatedSidebarHeader>

        <AnimatedSidebarContent className="px-2 pt-1">
          {/* <AnimatedSidebarGroup className="pb-2">
            <AnimatedSidebarGroupContent>
              <AnimatedSidebarMenu>
                {topBar.map((item) => (
                  <AnimatedSidebarMenuItem key={item.label}>
                    <AnimatedSidebarMenuButton
                      icon={<item.icon className="size-4" />}
                      badge={item.badge}
                      href={item.href}
                      onSelect={() => setActive(item.label)}
                    >
                      {item.label}
                    </AnimatedSidebarMenuButton>
                  </AnimatedSidebarMenuItem>
                ))}
              </AnimatedSidebarMenu>
            </AnimatedSidebarGroupContent>
          </AnimatedSidebarGroup> */}

          <AnimatedSidebarGroup className="pt-1">
            <AnimatedSidebarGroupLabel>Main Menu</AnimatedSidebarGroupLabel>
            <AnimatedSidebarGroupContent>
              <AnimatedSidebarMenu>
                {navigation.map(
                  ({ label, icon: Icon, href, children: navChildren }) => {
                    const isActive = matchPath(pathname, href, navChildren);
                    return (
                      <AnimatedSidebarMenuItem key={label}>
                        <AnimatedSidebarMenuButton
                          isActive={isActive}
                          ariaExpanded={
                            navChildren ? openSection === label : undefined
                          }
                          icon={<Icon className="size-4" />}
                          href={href}
                          onSelect={() => {
                            if (navChildren) {
                              setOpenSection((prev) =>
                                prev === label ? null : label,
                              );
                            } else {
                              setActive(label);
                            }
                          }}
                        >
                          {label}
                        </AnimatedSidebarMenuButton>
                        {navChildren ? (
                          <AnimatedSidebarMenuSub open={openSection === label}>
                            {navChildren.map((child) => {
                              const childActive = pathname === child.href;
                              return (
                                <AnimatedSidebarMenuSubItem key={child.label}>
                                  <AnimatedSidebarMenuSubButton
                                    isActive={childActive}
                                    href={child.href}
                                    icon={<child.icon className="size-4" />}
                                    onSelect={() => setActive(child.label)}
                                  >
                                    {child.label}
                                  </AnimatedSidebarMenuSubButton>
                                </AnimatedSidebarMenuSubItem>
                              );
                            })}
                          </AnimatedSidebarMenuSub>
                        ) : null}
                      </AnimatedSidebarMenuItem>
                    );
                  },
                )}
              </AnimatedSidebarMenu>
            </AnimatedSidebarGroupContent>
          </AnimatedSidebarGroup>

          {/* <AnimatedSidebarGroup className="pt-1">
            <AnimatedSidebarGroupLabel>Tiket Support</AnimatedSidebarGroupLabel>
            <AnimatedSidebarGroupContent>
              <AnimatedSidebarMenu>
                {quickLinks.map((item) => {
                  const itemActive = pathname === item.href;
                  return (
                    <AnimatedSidebarMenuItem key={item.label}>
                      <AnimatedSidebarMenuSubButton
                        isActive={itemActive}
                        href={item.href}
                        icon={<item.icon className="size-4" />}
                        onSelect={() => setActive(item.label)}
                      >
                        {item.label}
                      </AnimatedSidebarMenuSubButton>
                    </AnimatedSidebarMenuItem>
                  );
                })}
              </AnimatedSidebarMenu>
            </AnimatedSidebarGroupContent>
          </AnimatedSidebarGroup> */}
        </AnimatedSidebarContent>

        {/* <AnimatedSidebarFooter className="gap-3 border-t border-border/40 p-3">
          <button
            type="button"
            className="flex min-h-11 w-full items-center gap-3 overflow-hidden rounded-xl p-1 text-left outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#0B3464] text-xs font-semibold text-white">
              {initials}
            </span>
            <span className="min-w-0 flex-1 group-data-[state=collapsed]/sidebar:hidden">
              <span className="block truncate text-sm font-medium text-foreground">
                {String(user?.name ?? "")}
              </span>
              <span className="block truncate text-xs text-muted-foreground">
                {String(user?.email ?? "")}
              </span>
            </span>
          </button>
          <AnimatedSidebarMenuButton
            icon={<Settings className="size-4" />}
            href="/client/settings"
            onSelect={() => setActive("Pengaturan")}
          >
            Pengaturan
          </AnimatedSidebarMenuButton>
        </AnimatedSidebarFooter> */}

        <AnimatedSidebarRail />
      </AnimatedSidebar>

      {/* Main area: header with user dropdown + content */}
      <AnimatedSidebarInset className="min-h-0 flex-1 bg-background">
        <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-border border-b px-6">
          <div className="flex items-center gap-4">
            <AnimatedSidebarTrigger className="text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
              <PanelLeft aria-hidden="true" className="size-4" />
            </AnimatedSidebarTrigger>
            <div className="h-5 w-px bg-border" />
            {/* <h1 className="text-sm font-medium text-foreground">{active}</h1> */}
          </div>

          {/* User dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen((o) => !o)}
              className="flex items-center gap-2 rounded-lg p-1.5 text-left outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#0B3464] text-xs font-semibold text-white">
                <Avatar>
                  <AvatarImage src={user?.avatar_url ?? ""} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
              </span>
              <span className="hidden min-w-0 sm:block">
                <span className="block truncate text-sm font-medium text-foreground">
                  {String(user?.name ?? "")}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {String(user?.pangkat ?? "")}
                </span>
              </span>
              <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
            </button>

            {dropdownOpen && (
              <>
                {/* Backdrop to close */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setDropdownOpen(false)}
                />
                <div className="absolute right-0 top-full z-50 mt-1 w-56 overflow-hidden rounded-xl border border-border/50 bg-popover shadow-lg">
                  <div className="border-b border-border/40 px-3 py-2.5">
                    <p className="truncate text-sm font-medium text-foreground">
                      {String(user?.name ?? "")}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {String(user?.email ?? "")}
                    </p>
                  </div>
                  <div className="p-1">
                    <Link
                      href="#"
                      onClick={handleLogout}
                      className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-foreground transition-colors hover:bg-muted"
                    >
                      <LogOut className="size-4" />
                      Logout
                    </Link>
                    {/* <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-foreground transition-colors hover:bg-muted"
                    >
                      <LogOut className="size-4" />
                      Keluar
                    </button> */}
                  </div>
                </div>
              </>
            )}
          </div>
        </header>

        <div className="flex min-h-0 flex-1 overflow-auto scrollbar-none">{children}</div>
        <Footer />
      </AnimatedSidebarInset>
    </AnimatedSidebarProvider>
  );
}
