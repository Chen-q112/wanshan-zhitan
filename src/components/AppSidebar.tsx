import { NavLink, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import {
  MessageSquare,
  Image,
  GitGraph,
  PenTool,
  GraduationCap,
  Info,
} from 'lucide-react';

interface NavItem {
  path: string;
  label: string;
  icon: typeof MessageSquare;
}

const NAV_ITEMS: NavItem[] = [
  { path: '/ai-chat', label: 'AI智能问答', icon: MessageSquare },
  { path: '/image-recognition', label: '山峰图像识别', icon: Image },
  { path: '/knowledge-graph', label: '地质知识图谱', icon: GitGraph },
  { path: '/content-generator', label: '科普内容生成', icon: PenTool },
  { path: '/quiz', label: '智能知识测验', icon: GraduationCap },
  { path: '/about', label: '关于我们', icon: Info },
];

export default function AppSidebar() {
  const { pathname } = useLocation();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-3 group-data-[state=collapsed]:px-0 group-data-[state=collapsed]:justify-center">
          <div className="size-8 shrink-0 rounded-md bg-gradient-to-br from-primary to-accent-foreground text-primary-foreground flex items-center justify-center text-sm font-bold shadow-sm">
            皖
          </div>
          <div className="flex-1 min-w-0 group-data-[state=collapsed]:hidden">
            <div className="text-sm font-semibold truncate">皖山智探</div>
            <div className="text-xs text-muted-foreground truncate">AI地质科普助手</div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className="p-2">
          <SidebarMenu>
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.path === '/'
                  ? pathname === '/'
                  : pathname === item.path || pathname.startsWith(`${item.path}/`);

              return (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton asChild tooltip={item.label} isActive={isActive}>
                    <NavLink
                      to={item.path}
                      end={item.path === '/'}
                      className="flex items-center gap-2"
                    >
                      <Icon className="size-4 shrink-0" />
                      <span className="group-data-[state=collapsed]:hidden">
                        {item.label}
                      </span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <div className="px-2 py-2 group-data-[state=collapsed]:px-0 group-data-[state=collapsed]:justify-center">
          <div className="text-xs text-muted-foreground text-center group-data-[state=collapsed]:hidden">
            科创兴皖 · 科普育人
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
