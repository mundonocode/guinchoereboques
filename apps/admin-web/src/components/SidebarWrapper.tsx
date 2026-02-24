'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Sidebar } from './Sidebar';
import { usePathname } from 'next/navigation';

export function SidebarWrapper() {
    const { session, userRole } = useAuth();
    const pathname = usePathname();

    // Don't show sidebar on login page or if not logged in
    if (pathname === '/login' || !session) return null;

    // Only show the Admin Sidebar if the user is an admin
    // For now, we only have one Sidebar component, but we'll eventually have different ones for each portal
    if (userRole === 'admin') {
        return <Sidebar />;
    }

    return null;
}
