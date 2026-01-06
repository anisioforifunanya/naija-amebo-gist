/**
 * Firebase Diagnostics Utility
 * Helps identify and troubleshoot Firebase connection and sync issues
 */

export async function runFirebaseDiagnostics(): Promise<{
  firebaseConfigLoaded: boolean
  firebaseInitialized: boolean
  firestoreAccessible: boolean
  usersCollectionExists: boolean
  userCount: number
  errors: string[]
  warnings: string[]
}> {
  const result = {
    firebaseConfigLoaded: false,
    firebaseInitialized: false,
    firestoreAccessible: false,
    usersCollectionExists: false,
    userCount: 0,
    errors: [] as string[],
    warnings: [] as string[],
  };

  console.log('🔍 Starting Firebase Diagnostics...\n');

  try {
    // Step 1: Check if Firebase module can be imported
    console.log('Step 1: Checking Firebase module...');
    let db;
    try {
      const firebaseModule = await import('@/lib/firebase');
      db = firebaseModule.db;
      result.firebaseConfigLoaded = true;
      console.log('✅ Firebase module loaded');
    } catch (e) {
      result.errors.push(`Failed to load Firebase module: ${(e as any).message}`);
      console.error('❌ Firebase module load failed:', e);
      return result;
    }

    // Step 2: Check if Firestore is initialized
    console.log('\nStep 2: Checking Firestore initialization...');
    if (!db) {
      result.errors.push('Firestore database (db) is not initialized');
      console.error('❌ db is null or undefined');
      return result;
    }
    result.firebaseInitialized = true;
    console.log('✅ Firestore initialized');

    // Step 3: Try to access Firestore
    console.log('\nStep 3: Attempting to access Firestore...');
    try {
      const { collection, getDocs } = await import('firebase/firestore');
      
      // Try to fetch users collection
      console.log('📦 Fetching /users collection...');
      const usersSnapshot = await getDocs(collection(db, 'users'));
      
      result.firestoreAccessible = true;
      result.usersCollectionExists = true;
      result.userCount = usersSnapshot.size;
      
      console.log(`✅ Successfully accessed Firestore`);
      console.log(`📊 Found ${usersSnapshot.size} users in collection`);

      // Show sample user if exists
      if (usersSnapshot.size > 0) {
        const sampleUser = usersSnapshot.docs[0].data();
        console.log('📋 Sample user structure:', {
          id: usersSnapshot.docs[0].id,
          fields: Object.keys(sampleUser),
          hasVerificationStatus: 'verificationStatus' in sampleUser,
          hasFacialPhoto: 'facialPhoto' in sampleUser,
        });
      } else {
        result.warnings.push('Users collection exists but is empty. Add users to sync them.');
      }

    } catch (firestoreError: any) {
      result.firestoreAccessible = false;
      
      if (firestoreError.code === 'permission-denied') {
        result.errors.push(
          'Permission Denied: Firestore rules don\'t allow reads. ' +
          'Update security rules in Firebase Console → Firestore → Rules'
        );
      } else if (firestoreError.code === 'failed-precondition') {
        result.errors.push(
          'Firestore indexes not ready. This usually resolves within minutes. Try again later.'
        );
      } else if (firestoreError.code === 'unavailable') {
        result.errors.push('Firebase service is currently unavailable. Check connection.');
      } else if (firestoreError.code === 'not-found') {
        result.warnings.push(
          'Users collection does not exist in Firestore. ' +
          'Create it in Firebase Console or use "Add User Manually"'
        );
      } else {
        result.errors.push(
          `Firestore Error [${firestoreError.code}]: ${firestoreError.message}`
        );
      }
      
      console.error('❌ Firestore access failed:', firestoreError);
    }

  } catch (error: any) {
    result.errors.push(`Unexpected error: ${error.message}`);
    console.error('❌ Unexpected error:', error);
  }

  // Summary
  console.log('\n📋 Diagnostics Summary:');
  console.log({
    firebaseConfigLoaded: result.firebaseConfigLoaded,
    firebaseInitialized: result.firebaseInitialized,
    firestoreAccessible: result.firestoreAccessible,
    usersCollectionExists: result.usersCollectionExists,
    userCount: result.userCount,
    errorCount: result.errors.length,
    warningCount: result.warnings.length,
  });

  if (result.errors.length > 0) {
    console.log('\n⚠️ Errors:');
    result.errors.forEach((err, i) => console.log(`  ${i + 1}. ${err}`));
  }

  if (result.warnings.length > 0) {
    console.log('\n⚠️ Warnings:');
    result.warnings.forEach((warn, i) => console.log(`  ${i + 1}. ${warn}`));
  }

  return result;
}

/**
 * Generate a diagnostic report as HTML for display in admin panel
 */
export async function generateDiagnosticsReport(): Promise<string> {
  const diag = await runFirebaseDiagnostics();
  
  const statusIcon = (condition: boolean) => condition ? '✅' : '❌';
  
  let html = `
    <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; font-family: monospace; font-size: 12px;">
      <h3 style="margin-top: 0;">Firebase Diagnostics Report</h3>
      
      <div style="margin: 12px 0; padding: 8px; background: white; border-left: 4px solid ${diag.firebaseConfigLoaded ? '#4caf50' : '#f44336'};">
        <strong>${statusIcon(diag.firebaseConfigLoaded)} Firebase Config Loaded</strong>
      </div>
      
      <div style="margin: 12px 0; padding: 8px; background: white; border-left: 4px solid ${diag.firebaseInitialized ? '#4caf50' : '#f44336'};">
        <strong>${statusIcon(diag.firebaseInitialized)} Firestore Initialized</strong>
      </div>
      
      <div style="margin: 12px 0; padding: 8px; background: white; border-left: 4px solid ${diag.firestoreAccessible ? '#4caf50' : '#f44336'};">
        <strong>${statusIcon(diag.firestoreAccessible)} Firestore Accessible</strong>
      </div>
      
      <div style="margin: 12px 0; padding: 8px; background: white; border-left: 4px solid ${diag.usersCollectionExists ? '#4caf50' : '#ff9800'};">
        <strong>${statusIcon(diag.usersCollectionExists)} Users Collection Exists</strong>
        <div style="margin-top: 4px; color: #666;">Found ${diag.userCount} users</div>
      </div>
  `;

  if (diag.errors.length > 0) {
    html += `<div style="margin: 12px 0; padding: 8px; background: #ffebee; border-left: 4px solid #f44336;">
      <strong style="color: #c62828;">Errors:</strong>
      <ul style="margin: 8px 0; padding-left: 20px;">
        ${diag.errors.map(err => `<li style="margin: 4px 0; color: #c62828;">${err}</li>`).join('')}
      </ul>
    </div>`;
  }

  if (diag.warnings.length > 0) {
    html += `<div style="margin: 12px 0; padding: 8px; background: #fff3e0; border-left: 4px solid #ff9800;">
      <strong style="color: #e65100;">Warnings:</strong>
      <ul style="margin: 8px 0; padding-left: 20px;">
        ${diag.warnings.map(warn => `<li style="margin: 4px 0; color: #e65100;">${warn}</li>`).join('')}
      </ul>
    </div>`;
  }

  html += `
      <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #ddd; color: #666; font-size: 11px;">
        Generated: ${new Date().toLocaleString()}
      </div>
    </div>
  `;

  return html;
}
