import { SidebarWrapper } from "@/components/SidebarWrapper";

export default function PortalLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen">
            <SidebarWrapper />
            <main className="flex-1 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
