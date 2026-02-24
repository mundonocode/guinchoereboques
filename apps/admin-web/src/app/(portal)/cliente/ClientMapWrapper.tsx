'use client';

import { usePathname } from 'next/navigation';
import { ClienteMapClient } from './ClienteMapClient';

export function ClientMapWrapper() {
    const pathname = usePathname();
    const isMapPage = pathname === '/cliente';

    return (
        <div
            className="absolute inset-0 w-full h-full z-0"
            style={{ display: isMapPage ? 'block' : 'none' }}
        >
            <ClienteMapClient />
        </div>
    );
}
