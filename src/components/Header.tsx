import { SidebarTrigger } from '@/components/ui/sidebar';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border/30">
      <div className="flex h-14 items-center gap-3 px-4">
        <SidebarTrigger className="md:hidden" />
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#1E88E5] to-[#2E7D32] text-white text-sm font-bold shadow-sm">
            皖
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-foreground">皖山智探</span>
            <span className="text-[11px] text-muted-foreground">安徽山脉AI地质科普助手</span>
          </div>
        </div>
      </div>
    </header>
  );
}
