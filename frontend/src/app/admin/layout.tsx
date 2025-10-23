'use client';

import { AdminAuthProvider } from '@/contexts/AdminAuthContext';
import React from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminAuthProvider>{children}</AdminAuthProvider>;
}
