/**
 * L-System Plant Generator
 * Procedurally generates unique plant species using Lindenmayer Systems
 * Based on real botanical structures with genetic variation
 */

import { SeededRandom } from './seeded-random';

// ============================================
// TYPES
// ============================================

export interface LSystemRule {
  [symbol: string]: string | string[];
}

export interface LSystemParams {
  axiom: string;
  rules: LSystemRule;
  angle: number;
  segmentLength: number;
  segmentDecay: number; // How much segments shrink each iteration (0.6-0.9)
  iterations: number;
  thickness: number;
  thicknessDecay: number;
}

export type PlantSpecies = 
  | 'fern'
  | 'tree'
  | 'bush'
  | 'flower'
  | 'succulent'
  | 'palm'
  | 'grass'
  | 'vine';

export interface PlantGeneProfile {
  species: PlantSpecies;
  hybridWith?: PlantSpecies;
  params: LSystemParams;
  colors: {
    stem: string;
    leaf: string;
    flower: string;
    accent: string;
  };
  name: string;
  scientificName: string;
}

// ============================================
// SPECIES TEMPLATES
// Based on real plant growth patterns
// ============================================

const SPECIES_TEMPLATES: Record<PlantSpecies, LSystemParams> = {
  // Fern - Barnsley fern inspired, fractal fronds with 3D spread
  fern: {
    axiom: 'X',
    rules: {
      X: 'F+[[&X]-X]-F[-FX]+&X',
      F: 'FF',
    },
    angle: 25,
    segmentLength: 0.15,
    segmentDecay: 0.75,
    iterations: 3, // Reduced from 4
    thickness: 0.02,
    thicknessDecay: 0.7,
  },

  // Tree - 3D branching with pitch and roll
  tree: {
    axiom: 'F',
    rules: {
      F: 'FF+[&+F-F]-[&-F+F][/F]', // Reduced branching
    },
    angle: 22.5,
    segmentLength: 0.2,
    segmentDecay: 0.7,
    iterations: 3, // Reduced from 4
    thickness: 0.04,
    thicknessDecay: 0.65,
  },

  // Bush - Multi-directional 3D spreading
  bush: {
    axiom: 'F',
    rules: {
      F: 'F[&+F][&-F][/F]', // Reduced from 4 branches to 3
    },
    angle: 20,
    segmentLength: 0.12,
    segmentDecay: 0.8,
    iterations: 3, // Reduced from 4
    thickness: 0.025,
    thicknessDecay: 0.75,
  },

  // Flower - Radial 3D symmetry
  flower: {
    axiom: 'X',
    rules: {
      X: 'F[&+X][&-X][^+X]', // Reduced from 4 petals to 3
      F: 'FF',
    },
    angle: 30,
    segmentLength: 0.1,
    segmentDecay: 0.85,
    iterations: 3,
    thickness: 0.015,
    thicknessDecay: 0.8,
  },

  // Succulent - 3D rosette with pitch variations
  succulent: {
    axiom: 'F',
    rules: {
      F: 'F[&&+F][&&-F][/F]', // Reduced from 4 to 3
    },
    angle: 35,
    segmentLength: 0.08,
    segmentDecay: 0.9,
    iterations: 3,
    thickness: 0.03,
    thicknessDecay: 0.8,
  },

  // Palm - Drooping fronds in 3D space
  palm: {
    axiom: 'X',
    rules: {
      X: 'F[&&+X]F[&&-X][&/X]', // Reduced from 4 fronds to 3
      F: 'FF',
    },
    angle: 28,
    segmentLength: 0.18,
    segmentDecay: 0.65,
    iterations: 3, // Reduced from 4
    thickness: 0.035,
    thicknessDecay: 0.6,
  },

  // Grass - Slight 3D variation in blade angles
  grass: {
    axiom: 'F',
    rules: {
      F: 'F[&+F][-F]', // Reduced from 3 blades to 2
    },
    angle: 15,
    segmentLength: 0.25,
    segmentDecay: 0.85,
    iterations: 3,
    thickness: 0.01,
    thicknessDecay: 0.9,
  },

  // Vine - Twisting climber with roll
  vine: {
    axiom: 'F',
    rules: {
      F: 'F[/+F][\\-F]', // Reduced from 3 to 2
    },
    angle: 18,
    segmentLength: 0.16,
    segmentDecay: 0.78,
    iterations: 3, // Reduced from 4
    thickness: 0.02,
    thicknessDecay: 0.75,
  },
};

// ============================================
// COLOR PALETTES
// Based on real plant colorations
// ============================================

const PLANT_COLOR_PALETTES = {
  stems: [
    '#8B7355', '#9C8B7A', '#7A6B5A', '#A69585', // Browns
    '#5C7A4A', '#6B8A5A', '#4A6B3A', // Green stems
  ],
  leaves: [
    '#7BA05B', '#8BC06B', '#6B9A5B', '#9DB5A0', // Light greens
    '#5A8A4A', '#4A7A3A', '#6A8A5A', // Deep greens
    '#B5C4A8', '#A8C4B5', // Sage/seafoam
  ],
  flowers: [
    '#E8A0B0', '#F0C0A0', '#A0C8E8', '#D0A8E0', // Pastels
    '#F8E0A0', '#FFB6C1', '#98FB98', '#DDA0DD', // Brights
    '#F5B7C5', '#E6C5D5', '#C5E6D5', '#FFD1DC', // Soft pinks
  ],
  accents: [
    '#E8D5C4', '#D5E8E4', '#E8E4D5', // Whites/creams
    '#FFD700', '#FFA500', '#FF6B6B', // Vibrant accents
  ],
};

// ============================================
// NAME GENERATION
// ============================================

const NAME_PREFIXES = [
  'Crimson', 'Emerald', 'Azure', 'Golden', 'Silver', 'Violet',
  'Spiral', 'Dancing', 'Weeping', 'Royal', 'Wild', 'Frost',
  'Sunset', 'Dawn', 'Midnight', 'Radiant', 'Mystic', 'Ancient',
];

const NAME_MODIFIERS = [
  'Spiral', 'Branching', 'Cascading', 'Twisted', 'Elegant',
  'Delicate', 'Mighty', 'Graceful', 'Luminous', 'Whispering',
];

const LATIN_PREFIXES = [
  'Flora', 'Phyto', 'Chloro', 'Dendro', 'Botano',
  'Thallo', 'Rhizo', 'Phyllo', 'Antho', 'Carpo',
];

const LATIN_SUFFIXES = [
  'genesis', 'morphus', 'phyllum', 'dendron', 'anthus',
  'phyta', 'carpa', 'flora', 'viridis', 'elegans',
];

// ============================================
// L-SYSTEM GENERATOR
// ============================================

export class LSystemGenerator {
  private rng: SeededRandom;

  constructor(seed: number) {
    this.rng = new SeededRandom(seed);
  }

  /**
   * Generate a complete plant with genetics
   */
  generatePlant(): PlantGeneProfile {
    // Select base species
    const species = this.selectSpecies();
    
    // Optionally create hybrid
    const hybridWith = this.rng.bool(0.25) ? this.selectSpecies() : undefined;
    
    // Get base parameters
    const params = this.mutateParams(species, hybridWith);
    
    // Generate color palette
    const colors = this.generateColors();
    
    // Generate names
    const name = this.generateCommonName(species, hybridWith);
    const scientificName = this.generateScientificName();

    return {
      species,
      hybridWith,
      params,
      colors,
      name,
      scientificName,
    };
  }

  /**
   * Select a random species
   */
  private selectSpecies(): PlantSpecies {
    const species: PlantSpecies[] = [
      'fern', 'tree', 'bush', 'flower', 
      'succulent', 'palm', 'grass', 'vine'
    ];
    return this.rng.pick(species);
  }

  /**
   * Mutate and hybridize L-system parameters
   */
  private mutateParams(
    species: PlantSpecies,
    hybridWith?: PlantSpecies
  ): LSystemParams {
    const base = { ...SPECIES_TEMPLATES[species] };
    
    // If hybrid, blend with second species
    if (hybridWith) {
      const hybrid = SPECIES_TEMPLATES[hybridWith];
      base.angle = (base.angle + hybrid.angle) / 2 + this.rng.range(-5, 5);
      base.segmentLength = (base.segmentLength + hybrid.segmentLength) / 2;
      base.segmentDecay = (base.segmentDecay + hybrid.segmentDecay) / 2;
      
      // Possibly mix rules
      if (this.rng.bool(0.5)) {
        base.rules = { ...base.rules, ...hybrid.rules };
      }
    }

    // Mutate parameters with safety limits
    return {
      ...base,
      angle: Math.max(15, Math.min(60, base.angle + this.rng.range(-8, 8))),
      segmentLength: base.segmentLength * this.rng.range(0.8, 1.2),
      segmentDecay: Math.max(0.6, Math.min(0.95, base.segmentDecay + this.rng.range(-0.1, 0.1))),
      // Strict iteration limit: max 4 to prevent exponential explosion
      iterations: Math.max(2, Math.min(4, base.iterations + this.rng.int(-1, 0))),
      thickness: base.thickness * this.rng.range(0.7, 1.3),
      thicknessDecay: Math.max(0.5, Math.min(0.9, base.thicknessDecay + this.rng.range(-0.1, 0.1))),
      rules: this.mutateRules(base.rules),
    };
  }

  /**
   * Mutate L-system rules slightly with safeguards
   */
  private mutateRules(rules: LSystemRule): LSystemRule {
    const mutated: LSystemRule = {};
    const MAX_RULE_LENGTH = 50; // Prevent rules from becoming too long
    
    for (const [symbol, production] of Object.entries(rules)) {
      let mutatedProduction = production as string;
      
      // Only mutate if rule isn't already too long
      if (mutatedProduction.length < MAX_RULE_LENGTH && this.rng.bool(0.15)) {
        // Reduced chance: 0.2 -> 0.15
        // Only add simple symbols (no branching to avoid explosion)
        const additions = ['F', '+', '-'];
        const toAdd = this.rng.pick(additions);
        const insertPos = this.rng.int(0, mutatedProduction.length);
        mutatedProduction = 
          mutatedProduction.slice(0, insertPos) + 
          toAdd + 
          mutatedProduction.slice(insertPos);
      }
      
      mutated[symbol] = mutatedProduction;
    }
    
    return mutated;
  }

  /**
   * Generate color palette
   */
  private generateColors() {
    return {
      stem: this.rng.pick(PLANT_COLOR_PALETTES.stems),
      leaf: this.rng.pick(PLANT_COLOR_PALETTES.leaves),
      flower: this.rng.pick(PLANT_COLOR_PALETTES.flowers),
      accent: this.rng.pick(PLANT_COLOR_PALETTES.accents),
    };
  }

  /**
   * Generate common name
   */
  private generateCommonName(species: PlantSpecies, hybrid?: PlantSpecies): string {
    const prefix = this.rng.pick(NAME_PREFIXES);
    const modifier = this.rng.bool(0.5) ? this.rng.pick(NAME_MODIFIERS) + ' ' : '';
    
    const baseName = hybrid 
      ? `${species.charAt(0).toUpperCase() + species.slice(1)}-${hybrid.charAt(0).toUpperCase() + hybrid.slice(1)}`
      : species.charAt(0).toUpperCase() + species.slice(1);
    
    return `${prefix} ${modifier}${baseName}`;
  }

  /**
   * Generate scientific name
   */
  private generateScientificName(): string {
    const genus = this.rng.pick(LATIN_PREFIXES);
    const species = this.rng.pick(LATIN_SUFFIXES);
    return `${genus}${species}`;
  }

  /**
   * Expand L-system to final string with safety limits
   */
  static expand(axiom: string, rules: LSystemRule, iterations: number): string {
    const MAX_STRING_LENGTH = 10000; // Safety limit to prevent browser crash
    let current = axiom;
    
    for (let i = 0; i < iterations; i++) {
      let next = '';
      
      for (const symbol of current) {
        const production = rules[symbol];
        if (production) {
          // If production is array, pick randomly (stochastic L-system)
          next += Array.isArray(production) 
            ? production[Math.floor(Math.random() * production.length)]
            : production;
        } else {
          next += symbol;
        }
        
        // Safety check: stop if string gets too long
        if (next.length > MAX_STRING_LENGTH) {
          console.warn(`L-system exceeded max length (${MAX_STRING_LENGTH}). Stopping at iteration ${i + 1}/${iterations}`);
          return next.slice(0, MAX_STRING_LENGTH);
        }
      }
      
      current = next;
      
      // Safety check after each iteration
      if (current.length > MAX_STRING_LENGTH) {
        console.warn(`L-system exceeded max length (${MAX_STRING_LENGTH}). Stopping at iteration ${i + 1}/${iterations}`);
        return current.slice(0, MAX_STRING_LENGTH);
      }
    }
    
    return current;
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Generate a random plant with a seed
 */
export const generateRandomPlant = (seed: number): PlantGeneProfile => {
  const generator = new LSystemGenerator(seed);
  return generator.generatePlant();
};

/**
 * Get expanded L-system string for rendering
 */
export const getExpandedLSystem = (profile: PlantGeneProfile): string => {
  return LSystemGenerator.expand(
    profile.params.axiom,
    profile.params.rules,
    profile.params.iterations
  );
};

