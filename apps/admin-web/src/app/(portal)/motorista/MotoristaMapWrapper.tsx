'use client';

import { usePathname } from 'next/navigation';
import { MotoristaMapClient } from './MotoristaMapClient';

export function MotoristaMapWrapper() {
    const pathname = usePathname();
    const isMapPage = pathname === '/motorista';

    return (
        <div
            className="absolute inset-0 w-full h-full z-0"
            style={{ display: isMapPage ? 'block' : 'none' }}
        >
            <MotoristaMapClient />
        </div>
    );
}
