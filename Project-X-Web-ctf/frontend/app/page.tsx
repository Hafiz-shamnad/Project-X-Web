'use client';
import { useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const res = await apiFetch('/auth/me');
      if (res && !res.error) router.replace('/dashboard');
      else router.replace('/login');
    };
    checkAuth();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-green-500">
      Checking session...
    </div>
  );
}
