import { db } from './firebase';
import { collection, doc, updateDoc, increment, getDoc, setDoc } from 'firebase/firestore';

interface MetricsData {
  views: number;
  shares: number;
  reactions: number;
}

/**
 * Increment view count for a story
 */
export const recordView = async (storyId: string) => {
  try {
    const metricsRef = doc(db, 'metrics', storyId);
    const metricsDoc = await getDoc(metricsRef);

    if (metricsDoc.exists()) {
      await updateDoc(metricsRef, {
        views: increment(1),
      });
    } else {
      await setDoc(metricsRef, {
        views: 1,
        shares: 0,
        reactions: 0,
        createdAt: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error('Error recording view:', error);
  }
};

/**
 * Increment share count for a story
 */
export const recordShare = async (storyId: string, platform: string) => {
  try {
    const metricsRef = doc(db, 'metrics', storyId);
    const metricsDoc = await getDoc(metricsRef);

    if (metricsDoc.exists()) {
      await updateDoc(metricsRef, {
        shares: increment(1),
        [`shares_${platform}`]: increment(1),
      });
    } else {
      await setDoc(metricsRef, {
        views: 0,
        shares: 1,
        reactions: 0,
        [`shares_${platform}`]: 1,
        createdAt: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error('Error recording share:', error);
  }
};

/**
 * Increment reaction count for a story
 */
export const recordReaction = async (storyId: string, reactionType: string) => {
  try {
    const metricsRef = doc(db, 'metrics', storyId);
    const metricsDoc = await getDoc(metricsRef);

    if (metricsDoc.exists()) {
      await updateDoc(metricsRef, {
        reactions: increment(1),
        [`reactions_${reactionType}`]: increment(1),
      });
    } else {
      await setDoc(metricsRef, {
        views: 0,
        shares: 0,
        reactions: 1,
        [`reactions_${reactionType}`]: 1,
        createdAt: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error('Error recording reaction:', error);
  }
};

/**
 * Get metrics for a story
 */
export const getStoryMetrics = async (storyId: string): Promise<MetricsData> => {
  try {
    const metricsRef = doc(db, 'metrics', storyId);
    const metricsDoc = await getDoc(metricsRef);

    if (metricsDoc.exists()) {
      const data = metricsDoc.data();
      return {
        views: data.views || 0,
        shares: data.shares || 0,
        reactions: data.reactions || 0,
      };
    } else {
      return {
        views: 0,
        shares: 0,
        reactions: 0,
      };
    }
  } catch (error) {
    console.error('Error getting story metrics:', error);
    return {
      views: 0,
      shares: 0,
      reactions: 0,
    };
  }
};

/**
 * Get trending stories based on metrics
 */
export const getTrendingStories = async (limit: number = 5) => {
  try {
    const metricsRef = collection(db, 'metrics');
    // In a real implementation, you would query and sort by metrics
    // For now, this is a placeholder
    return [];
  } catch (error) {
    console.error('Error getting trending stories:', error);
    return [];
  }
};

/**
 * Track hashtag usage
 */
export const trackHashtag = async (hashtag: string) => {
  try {
    const hashtagRef = doc(db, 'hashtags', hashtag.toLowerCase());
    const hashtagDoc = await getDoc(hashtagRef);

    if (hashtagDoc.exists()) {
      await updateDoc(hashtagRef, {
        count: increment(1),
        lastUsed: new Date().toISOString(),
      });
    } else {
      await setDoc(hashtagRef, {
        count: 1,
        createdAt: new Date().toISOString(),
        lastUsed: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error('Error tracking hashtag:', error);
  }
};

/**
 * Get trending hashtags
 */
export const getTrendingHashtags = async (limit: number = 6) => {
  try {
    const hashtagsRef = collection(db, 'hashtags');
    // In a real implementation, you would query and sort by count
    // For now, this is a placeholder
    return [];
  } catch (error) {
    console.error('Error getting trending hashtags:', error);
    return [];
  }
};
