/**
 * Seeded random number generator for deterministic plant generation
 * Same seed always produces same sequence of random numbers
 */

export class SeededRandom {
  private seed: number;
  
  constructor(seed: number) {
    this.seed = seed;
  }
  
  // Linear congruential generator
  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
  
  // Random float between min and max
  range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }
  
  // Random integer between min and max (inclusive)
  int(min: number, max: number): number {
    return Math.floor(this.range(min, max + 1));
  }
  
  // Random boolean with optional probability
  bool(probability: number = 0.5): boolean {
    return this.next() < probability;
  }
  
  // Pick random item from array
  pick<T>(array: T[]): T {
    return array[Math.floor(this.next() * array.length)];
  }
  
  // Gaussian distribution (approximate)
  gaussian(mean: number = 0, stdDev: number = 1): number {
    const u1 = this.next();
    const u2 = this.next();
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return z0 * stdDev + mean;
  }
}

/**
 * Hash a string to a number for use as seed
 */
export const hashString = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
};

/**
 * Create a seeded random from a string (like project ID)
 */
export const createSeededRandom = (str: string): SeededRandom => {
  return new SeededRandom(hashString(str));
};




