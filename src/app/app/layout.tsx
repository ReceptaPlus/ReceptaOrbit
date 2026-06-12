import { Sidebar } from "@/components/sidebar";
import { BottomTabs } from "@/components/bottom-tabs";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1">
      <Sidebar />
      <main className="flex-1 min-w-0 p-4 pb-24 md:p-6 md:pb-6 xl:p-8">{children}</main>
      <BottomTabs />
    </div>
  );
}
