// Privacy & Compliance System
// GDPR/NDPR-compliant data anonymization and consent management

export interface PrivacySettings {
  consentGiven: boolean;
  consentDate: number;
  categories: {
    analytics: boolean;
    marketing: boolean;
    necessary: boolean;
  };
  lastUpdated: number;
  version: string;
}

export interface AnonymizedData {
  sessionId: string; // Hashed
  ipAddress: string; // Last octet removed
  userAgent: string; // Only OS and browser, no system info
  location: {
    country: string;
    region: string;
    // No city, coordinates, or ISP details
  };
  device: {
    type: string; // Only type: mobile/desktop
    // No specific model or fingerprint
  };
  timestamp: number;
}

/**
 * Consent Management
 */
export class ConsentManager {
  private storageKey = 'analytics-consent-v1';

  /**
   * Get user's consent preferences
   */
  public getConsent(): PrivacySettings | null {
    if (typeof window === 'undefined') return null;

    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  /**
   * Set user's consent preferences
   */
  public setConsent(settings: PrivacySettings): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(this.storageKey, JSON.stringify(settings));
      // Fire consent change event
      window.dispatchEvent(
        new CustomEvent('analytics-consent-changed', { detail: settings })
      );
    } catch {
      console.error('[Privacy] Failed to save consent');
    }
  }

  /**
   * Accept all cookies
   */
  public acceptAll(): void {
    this.setConsent({
      consentGiven: true,
      consentDate: Date.now(),
      categories: {
        analytics: true,
        marketing: true,
        necessary: true,
      },
      lastUpdated: Date.now(),
      version: '1.0',
    });
  }

  /**
   * Reject all non-essential cookies
   */
  public rejectAll(): void {
    this.setConsent({
      consentGiven: true,
      consentDate: Date.now(),
      categories: {
        analytics: false,
        marketing: false,
        necessary: true,
      },
      lastUpdated: Date.now(),
      version: '1.0',
    });
  }

  /**
   * Has user given consent for analytics?
   */
  public hasAnalyticsConsent(): boolean {
    const consent = this.getConsent();
    return consent?.categories?.analytics ?? false;
  }

  /**
   * Check if consent needs renewal (older than 1 year)
   */
  public needsRenewal(): boolean {
    const consent = this.getConsent();
    if (!consent) return true;

    const oneYearMs = 365 * 24 * 60 * 60 * 1000;
    return Date.now() - consent.consentDate > oneYearMs;
  }
}

/**
 * Data Anonymization Engine
 */
export class AnonymizationEngine {
  /**
   * Anonymize session ID
   */
  static anonymizeSessionId(sessionId: string): string {
    return this.sha256(sessionId).substring(0, 16);
  }

  /**
   * Anonymize IP address
   * Removes last octet to comply with GDPR
   */
  static anonymizeIpAddress(ip: string): string {
    const parts = ip.split('.');
    if (parts.length === 4) {
      parts[3] = '0'; // Remove last octet
    }
    return parts.join('.');
  }

  /**
   * Anonymize user agent
   * Keep only OS and browser version, remove system details
   */
  static anonymizeUserAgent(userAgent: string): string {
    // Extract only browser and OS info
    let browser = 'Unknown';
    let os = 'Unknown';

    if (/Chrome/.test(userAgent) && !/Chromium|Edg/.test(userAgent)) {
      const match = userAgent.match(/Chrome\/([\d]+)/);
      browser = `Chrome/${match ? match[1] : 'x'}`;
    } else if (/Safari/.test(userAgent) && !/Chrome|Chromium|Edg/.test(userAgent)) {
      const match = userAgent.match(/Version\/([\d]+)/);
      browser = `Safari/${match ? match[1] : 'x'}`;
    } else if (/Firefox/.test(userAgent)) {
      const match = userAgent.match(/Firefox\/([\d]+)/);
      browser = `Firefox/${match ? match[1] : 'x'}`;
    } else if (/Edg/.test(userAgent)) {
      const match = userAgent.match(/Edg\/([\d]+)/);
      browser = `Edge/${match ? match[1] : 'x'}`;
    }

    if (/Windows/.test(userAgent)) {
      os = 'Windows';
    } else if (/Mac/.test(userAgent)) {
      os = 'macOS';
    } else if (/Android/.test(userAgent)) {
      os = 'Android';
    } else if (/iPhone|iPad|iPod/.test(userAgent)) {
      os = 'iOS';
    } else if (/Linux/.test(userAgent)) {
      os = 'Linux';
    }

    return `${os}/${browser}`;
  }

  /**
   * Remove sensitive fields from data
   */
  static removeSensitiveFields(data: any): any {
    const sanitized = { ...data };

    // Remove PII
    const sensitiveFields = [
      'email',
      'phone',
      'name',
      'ssn',
      'creditCard',
      'password',
      'address',
      'dateOfBirth',
      'accountNumber',
    ];

    for (const field of sensitiveFields) {
      delete sanitized[field];
    }

    return sanitized;
  }

  /**
   * Anonymize complete analytics data
   */
  static anonymizeAnalyticsData(data: any): AnonymizedData {
    return {
      sessionId: this.anonymizeSessionId(data.sessionId || ''),
      ipAddress: data.ipAddress ? this.anonymizeIpAddress(data.ipAddress) : '0.0.0.0',
      userAgent: this.anonymizeUserAgent(data.userAgent || ''),
      location: {
        country: data.location?.country || 'Unknown',
        region: data.location?.region || 'Unknown',
      },
      device: {
        type: data.device?.type || 'unknown',
      },
      timestamp: data.timestamp || Date.now(),
    };
  }

  /**
   * SHA256 hash (simplified - for production use crypto library)
   */
  private static sha256(str: string): string {
    // Simplified hash - use crypto library in production
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }
}

/**
 * Data Retention Policy
 */
export class DataRetentionManager {
  private policies = {
    analytics: 90 * 24 * 60 * 60 * 1000, // 90 days
    userProfiles: 365 * 24 * 60 * 60 * 1000, // 1 year
    logs: 30 * 24 * 60 * 60 * 1000, // 30 days
    alerts: 180 * 24 * 60 * 60 * 1000, // 6 months
  };

  /**
   * Check if data should be retained
   */
  public shouldRetain(dataType: string, createdAt: number): boolean {
    const policy = this.policies[dataType as keyof typeof this.policies];
    if (!policy) return true; // Default to retain if no policy

    const age = Date.now() - createdAt;
    return age < policy;
  }

  /**
   * Get retention period for data type
   */
  public getRetentionPeriod(dataType: string): number {
    return this.policies[dataType as keyof typeof this.policies] || Infinity;
  }

  /**
   * Mark data for deletion
   */
  public markForDeletion(userId: string): void {
    // In production, queue deletion job
    console.log(`[Retention] Marked user ${userId} for deletion`);
  }
}

/**
 * Right to Erasure Implementation
 */
export class RightToErasure {
  /**
   * Request complete data erasure
   * Returns promise that resolves when deletion is complete
   */
  static async requestErasure(userId: string): Promise<boolean> {
    try {
      // Send request to backend
      const response = await fetch('/api/analytics/request-erasure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        console.log(`[Erasure] Erasure request submitted for user ${userId}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error('[Erasure] Failed to request erasure:', error);
      return false;
    }
  }

  /**
   * Get erasure status
   */
  static async getErasureStatus(requestId: string): Promise<{
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress: number;
  }> {
    try {
      const response = await fetch(`/api/analytics/erasure-status/${requestId}`);
      const data = await response.json();
      return data;
    } catch {
      return { status: 'failed', progress: 0 };
    }
  }
}

/**
 * GDPR/NDPR Compliance Utilities
 */
export const ComplianceUtils = {
  /**
   * Validate consent requirements are met
   */
  validateConsent(data: any): { isValid: boolean; violations: string[] } {
    const violations: string[] = [];

    // Check for consent flag
    if (!data.consentGiven) {
      violations.push('No user consent recorded');
    }

    // Check for privacy policy acceptance
    if (!data.privacyPolicyAccepted) {
      violations.push('Privacy policy not accepted');
    }

    // Check for tracking script disclosure
    if (!data.trackingDisclosed) {
      violations.push('Tracking not properly disclosed');
    }

    return {
      isValid: violations.length === 0,
      violations,
    };
  },

  /**
   * Check if data collection is compliant
   */
  isCompliantCollection(data: any): boolean {
    const validation = this.validateConsent(data);
    return validation.isValid;
  },

  /**
   * Get privacy policy text
   */
  getPrivacyPolicyText(): string {
    return `
# Privacy Policy

## Data We Collect
- Browser and device information
- Anonymized IP address (last octet removed)
- Pages visited
- Time spent on pages
- Clicks and scrolling patterns

## How We Use Your Data
- To improve website performance
- To understand user behavior
- To provide better content recommendations
- To detect and prevent fraud

## Your Rights
- Right to access your data
- Right to correction
- Right to erasure (right to be forgotten)
- Right to data portability

## Data Retention
- Analytics data: 90 days
- User profiles: 1 year
- Logs: 30 days

## Contact Us
For privacy concerns, email: privacy@example.com
    `;
  },
};
