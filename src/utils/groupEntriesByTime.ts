import { Entry } from '../types';

export interface EntrySection {
  title: string;
  data: Entry[];
}

/**
 * Groups entries by time categories: Today, Yesterday, This Week, Last Week, Earlier
 */
export function groupEntriesByTime(entries: Entry[]): EntrySection[] {
  const now = new Date();

  // Get start of today (midnight)
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  // Get start of yesterday
  const yesterdayStart = todayStart - 24 * 60 * 60 * 1000;

  // Get start of this week (Sunday)
  const dayOfWeek = now.getDay();
  const thisWeekStart = todayStart - dayOfWeek * 24 * 60 * 60 * 1000;

  // Get start of last week
  const lastWeekStart = thisWeekStart - 7 * 24 * 60 * 60 * 1000;

  const buckets: { [key: string]: Entry[] } = {
    'Today': [],
    'Yesterday': [],
    'This Week': [],
    'Last Week': [],
    'Earlier': [],
  };

  for (const entry of entries) {
    const ts = entry.timestamp;

    if (ts >= todayStart) {
      buckets['Today'].push(entry);
    } else if (ts >= yesterdayStart) {
      buckets['Yesterday'].push(entry);
    } else if (ts >= thisWeekStart) {
      buckets['This Week'].push(entry);
    } else if (ts >= lastWeekStart) {
      buckets['Last Week'].push(entry);
    } else {
      buckets['Earlier'].push(entry);
    }
  }

  // Build sections array, only including non-empty sections
  const sections: EntrySection[] = [];
  const order = ['Today', 'Yesterday', 'This Week', 'Last Week', 'Earlier'];

  for (const title of order) {
    if (buckets[title].length > 0) {
      // Sort entries within each bucket by timestamp, newest first
      buckets[title].sort((a, b) => b.timestamp - a.timestamp);
      sections.push({
        title,
        data: buckets[title],
      });
    }
  }

  return sections;
}
