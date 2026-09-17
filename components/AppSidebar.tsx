"use client";

import {
  CreditCard,
  GitBranch,
  LayoutDashboard,
  LogOut,
  MessageSquareCheck,
  Moon,
  Settings,
  Sun,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import github from "@/public/github.svg";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Image from "next/image";
import Logo from "@/module/logo/components/Logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import Logout from "@/app/(auth)/logout/Logout";
import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import { useTheme } from "next-themes";

const AppSidebar = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { data: session } = useSession();
  const pathname = usePathname();

  const navigationItems = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Repository",
      url: "/dashboard/repository",
      icon: GitBranch,
    },
    {
      title: "Reviews",
      url: "/dashboard/reviews",
      icon: MessageSquareCheck,
    },
    {
      title: "Subscription",
      url: "/dashboard/subscription",
      icon: CreditCard,
    },
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: Settings,
    },
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !session) return null;
  const user = session.user;
  const userName = user.name || "GUEST";
  const userEmail = user.email || "";
  const userAvatar = user.image || "";
  const userinitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex flex-col gap-4 px-2 py-6">
          <div className="w-full flex items-center justify-center">
            <Logo />
          </div>
          <div className="flex items-center gap-4 rounded-lg bg-sidebar-accent/50 px-3 py-4 transition-colors hover:bg-sidebar-accent/70">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Image
                src={github}
                className='w-10 h-10 fill-current" viewBox="0 0 24 24'
                alt="github"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold tracking-wide text-sidebar-foreground">
                Connected Account
              </p>
              <p className="text-sm font-medium text-sidebar-foreground">
                @{userName}
              </p>
            </div>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu className="gap-2">
          {navigationItems.map((item) => {
            const isActive = (url: string) => {
              return (
                pathname === url || pathname.startsWith(url + "/dashboard")
              );
            };
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  // asChild
                  tooltip={item.title}
                  className={`h-11 rounded-lg px-4 transition-all duration-200 ${isActive(item.url) ? "bg-sidebar-accent font-semibold text-sidebar-accent-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent/60"}`}
                >
                  <Link href={item.url} className="flex items-center gap-3 ">
                    <item.icon className="h-5 w-5 shrink-0" />
                    <span className="text-sm font-medium">{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="border-t px-3 py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <SidebarMenuButton
                    size={"lg"}
                    className="h-12 rounded-lg px-4 transition-colors hover:bg-sidebar-accent/50 data-state-open:bg-sidebar-accent data-state-open:text-sidebar-accent-foreground"
                  />
                }
              >
                <Avatar className={"h-10 w-10 shrink-0 rounded-lg"}>
                  <AvatarImage
                    src={userAvatar || "/placeholder.svg"}
                    alt={userName}
                  />
                  <AvatarFallback className={"rounded-lg"}>
                    {userinitials}
                  </AvatarFallback>
                </Avatar>
                <div className="grid min-w-0 flex-1 text-left text-sm leading-relaxed">
                  <span className="truncate text-base font-semibold">
                    {userName}
                  </span>
                  <span className="truncate text-xs text-sidebar-foreground/70">
                    {userEmail}
                  </span>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className={"w-80 rounded-lg"}
                align="end"
                side="right"
                sideOffset={8}
              >
                <div className="border-t border-b px-2 py-3">
                  <div className="flex gap-3 px-2 py-2">
                    <Avatar className={"h-10 w-10 shrink-0 rounded-lg"}>
                      <AvatarImage
                        src={userAvatar || "/placeholder.svg"}
                        alt={userName}
                      />
                      <AvatarFallback className={"rounded-lg"}>
                        {userinitials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid min-w-0 flex-1 text-left text-sm leading-relaxed">
                      <span className="truncate text-base font-semibold">
                        {userName}
                      </span>
                      <span className="truncate text-xs text-sidebar-foreground/70">
                        {userEmail}
                      </span>
                    </div>
                  </div>

                  <DropdownMenuItem>
                    <button
                      onClick={() =>
                        setTheme(theme === "dark" ? "light" : "dark")
                      }
                      className="flex w-full cursor-pointer items-center gap-3 rounded-md px-1 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent/50"
                    >
                      {theme === "dark" ? (
                        <>
                          <Sun className="h-5 w-5 shrink-0" />
                          <span>Light Mode</span>
                        </>
                      ) : (
                        <>
                          <Moon className="h-5 w-5 shrink-0" />
                          <span>Dark Mode</span>
                        </>
                      )}
                    </button>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className={
                      "my-1 cursor-pointer rounded-md px-3 py-3 font-medium transition-colors hover:bg-red-500/10 hover:text-red-600"
                    }
                  >
                    <LogOut className="mr-3 h-5 w-5 shrink-0" />
                    <Logout>Logout</Logout>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
