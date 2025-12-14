import { CollectionItem } from "./types";

/**
 * Capitalizes the first letter of each word in a string, and lowercases the rest.
 * @param str The input string.
 * @returns The capitalized string.
 */
export const capitalizeWords = (str: unknown): string => {
  if (typeof str !== 'string' || !str) {
    return '';
  }
  return str.split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
};

/**
 * Calculates the Levenshtein distance between two strings.
 * @param s1 The first string.
 * @param s2 The second string.
 * @returns The Levenshtein distance.
 */
const levenshteinDistance = (s1: string, s2: string): number => {
  s1 = s1.toLowerCase();
  s2 = s2.toLowerCase();

  const costs: number[] = [];
  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= s2.length; j++) {
      if (i === 0) {
        costs[j] = j;
      } else {
        if (j > 0) {
          let newValue = costs[j - 1];
          if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          }
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
    }
    if (i > 0) {
      costs[s2.length] = lastValue;
    }
  }
  return costs[s2.length];
};

/**
 * Checks if two strings are similar based on Levenshtein distance.
 * @param s1 The first string.
 * @param s2 The second string.
 * @param threshold The similarity threshold (0 to 1). Defaults to 0.85.
 * @returns True if the strings are considered similar.
 */
export const areStringsSimilar = (s1: string, s2: string, threshold = 0.85): boolean => {
    if (!s1 || !s2) return false;
    const distance = levenshteinDistance(s1, s2);
    const maxLength = Math.max(s1.length, s2.length);
    if (maxLength === 0) return true;
    const similarity = 1 - (distance / maxLength);
    return similarity >= threshold;
};

/**
 * Heuristically determines the "best" item from a group of duplicates.
 * The "best" is determined by:
 * 1. Having cover art.
 * 2. Having the most non-empty fields.
 * 3. Being the most recently created entry.
 * @param items The group of items to compare.
 * @returns The item deemed to be the best choice.
 */
export const getBestItem = (items: CollectionItem[]): CollectionItem => {
  if (items.length === 0) {
    throw new Error("Cannot get best item from an empty array.");
  }
  if (items.length === 1) {
    return items[0];
  }

  const scoreItem = (item: CollectionItem): number => {
    let score = 0;
    if (item.coverArtUrl) score += 100;
    if (item.genre) score += 10;
    if (item.year) score += 10;
    if (item.recordLabel) score += 10;
    if (item.version) score += 5;
    if (item.notes) score += 5;
    if (item.tags && item.tags.length > 0) score += item.tags.length;
    return score;
  };

  return items.sort((a, b) => {
    const scoreA = scoreItem(a);
    const scoreB = scoreItem(b);
    if (scoreA !== scoreB) {
      return scoreB - scoreA; // Higher score first
    }
    // If scores are equal, prefer the newest one
    return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
  })[0];
};