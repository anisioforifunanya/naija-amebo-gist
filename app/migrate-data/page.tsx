"use client";

import { useState } from 'react';
import { migrateAdminToFirebase, migrateUserToFirebase } from '@/lib/migrationUtils';

export default function DataMigration() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [message, setMessage] = useState('');

  const handleMigrateAdmins = async () => {
    setLoading(true);
    setMessage('Migrating admins to Firebase...');
    setResults([]);

    try {
      // Data from admins.json
      const adminsData = [
        {
          id: "ifunanya-admin-001",
          firstName: "IFUNANYA",
          lastName: "ANISIOFOR",
          email: "ifunanya.anisiofor@gmail.com",
          username: "ifunanya",
          password: "somtoo11",
          bio: "Head Admin",
          role: "admin",
          isSuperAdmin: true,
          permissions: ["moderate_users", "manage_content", "manage_admins", "manage_news", "system_settings"]
        },
        {
          id: "admin-1",
          firstName: "Admin",
          lastName: "User",
          email: "admin@naijaambogist.com",
          username: "admin",
          password: "admin123",
          bio: "Moderator",
          role: "admin",
          isSuperAdmin: false,
          permissions: ["moderate_users", "manage_content"]
        }
      ];

      const migrationResults = [];
      for (const admin of adminsData) {
        const result = await migrateAdminToFirebase(admin);
        migrationResults.push(result);
      }

      setResults(migrationResults);
      setMessage('✅ Admins migration completed!');
    } catch (error: any) {
      setMessage(`❌ Error: ${error.message}`);
    }
    setLoading(false);
  };

  const handleMigrateUsers = async () => {
    setLoading(true);
    setMessage('Migrating users to Firebase...');
    setResults([]);

    try {
      // Data from users.json
      const usersData = [
        {
          id: "user-1",
          firstName: "Prince",
          lastName: "Anisiofor",
          username: "siralexking",
          email: "alex.anisiofor@gmail.com",
          password: "user123",
          bio: "Celebrity enthusiast"
        },
        {
          id: "user-2",
          firstName: "Alex",
          lastName: "King",
          username: "alexking",
          email: "alex@example.com",
          password: "user123",
          bio: "Professional news journalist"
        },
        {
          id: "user-3",
          firstName: "Test",
          lastName: "User",
          username: "testuser",
          email: "test@example.com",
          password: "user123",
          bio: "Test account"
        }
      ];

      const migrationResults = [];
      for (const user of usersData) {
        const result = await migrateUserToFirebase(user);
        migrationResults.push(result);
      }

      setResults(migrationResults);
      setMessage('✅ Users migration completed!');
    } catch (error: any) {
      setMessage(`❌ Error: ${error.message}`);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          🔄 Data Migration to Firebase
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Admins Migration */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              👮 Migrate Admins
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Sync admin accounts from local data to Firebase Authentication and Firestore
            </p>
            <button
              onClick={handleMigrateAdmins}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
            >
              {loading ? 'Migrating...' : 'Migrate Admins'}
            </button>
          </div>

          {/* Users Migration */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              👥 Migrate Users
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Sync user accounts from local data to Firebase Authentication and Firestore
            </p>
            <button
              onClick={handleMigrateUsers}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
            >
              {loading ? 'Migrating...' : 'Migrate Users'}
            </button>
          </div>
        </div>

        {/* Status Messages */}
        {message && (
          <div className="mt-6 p-4 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-lg">
            {message}
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Migration Results:
            </h3>
            <div className="space-y-2">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg ${
                    result.success
                      ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                      : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                  }`}
                >
                  <p className="font-semibold">{result.email}</p>
                  <p className="text-sm">
                    {result.success ? '✅ ' : '❌ '}
                    {result.message || result.error}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Important Notice */}
        <div className="mt-8 p-6 bg-yellow-50 dark:bg-yellow-900 rounded-lg border-l-4 border-yellow-400">
          <h3 className="text-lg font-bold text-yellow-800 dark:text-yellow-200 mb-2">
            ⚠️ Important Notice
          </h3>
          <ul className="text-yellow-700 dark:text-yellow-300 space-y-2 text-sm">
            <li>✓ This page syncs local user/admin data with Firebase</li>
            <li>✓ After migration, use the email and password to login</li>
            <li>✓ Firebase is now the source of truth for authentication</li>
            <li>✓ All data is stored in Firestore for persistence</li>
            <li>✓ This page should only be used once during setup</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
