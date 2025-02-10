'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const router = useRouter();

    useEffect(() => {
        const isAdmin = localStorage.getItem('isAdmin');
        const adminToken = localStorage.getItem('adminToken');
        
        if (!isAdmin || !adminToken) {
            router.push('/admin');
        }
    }, [router]);

    return <>{children}</>;
}