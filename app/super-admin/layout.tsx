import React, { Suspense } from 'react';
import SuperAdminNavigation from '@/components/SuperAdminNavigation';

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Suspense fallback={<div className="h-16 bg-white dark:bg-gray-800"></div>}>
        <SuperAdminNavigation />
      </Suspense>
      {children}
    </div>
  );
}
