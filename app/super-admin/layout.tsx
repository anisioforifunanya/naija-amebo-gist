import React from 'react';
import SuperAdminNavigation from '@/components/SuperAdminNavigation';

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <SuperAdminNavigation />
      {children}
    </div>
  );
}
