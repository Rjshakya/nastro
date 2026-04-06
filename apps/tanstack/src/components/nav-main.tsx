import { IconPlus, IconTemplateFilled, type Icon } from "@tabler/icons-react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useCreateSiteStore } from "#/stores/create-site";
import { Link, useLocation, useNavigate, useRouter } from "@tanstack/react-router";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: Icon;
  }[];
}) {
  const { setOpenDialog } = useCreateSiteStore((s) => s);
  const location = useLocation();
  const navigate = useNavigate();

  const handleOuickCreate = (pathName: string) => {
    if (!pathName.includes("site")) {
      setOpenDialog(true);
      return;
    }

    navigate({ to: "/dashboard" });
    setOpenDialog(true);
  };

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2 ">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton
              onClick={() => handleOuickCreate(location.pathname)}
              tooltip="Quick Create"
              className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
            >
              <IconPlus />

              <span>Quick Create</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <Link to={item?.url}>
                <SidebarMenuButton tooltip={item.title}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}

          <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton>
              <Link className="w-full flex items-center gap-2" to="/templates">
                <IconTemplateFilled />
                <span>Templates</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
