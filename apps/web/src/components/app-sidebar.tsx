import * as React from "react";
import { IconCode, IconLayoutDashboardFilled, IconTemplate, IconTemplateFilled } from "@tabler/icons-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Link } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";
import { Avatar, AvatarImage } from "@/components/ui/avatar";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconLayoutDashboardFilled,
    },
    {
      title: "Templates",
      url: "/templates",
      icon: IconTemplateFilled,
    },
    {
      title: "Developer",
      url: "/developer",
      icon: IconCode,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = authClient.useSession();

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="data-[slot=sidebar-menu-button]:p-1.5!">
              <Link className="flex items-center gap-2" to="/">
                <Avatar className={"size-5 "}>
                  <AvatarImage src="/icon.png" className={" rounded-sm"} />
                </Avatar>
                <span className="text-base font-semibold">Nastro</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            name: session?.user?.name || data?.user?.name,
            email: session?.user?.email || data?.user?.email,
            avatar: session?.user?.image || data?.user?.avatar,
          }}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
