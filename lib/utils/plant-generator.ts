/**
 * Plant Gene Generator
 * Converts project properties into plant "DNA" for procedural generation
 */

import { SeededRandom, hashString } from './seeded-random';
import { GardenProject, PlantGenes, GARDEN_PALETTE } from '../data/garden-portfolio';

/**
 * Generate plant genes from a project
 * Same project always generates same genes
 */
export const projectToGenes = (project: GardenProject): PlantGenes => {
  const seed = hashString(project.id);
  const rng = new SeededRandom(seed);
  
  // Height based on project duration (1-8 months → 1-5 units)
  const height = Math.max(1, Math.min(5, project.monthsDuration / 1.5));
  
  // Complexity based on tech stack count (more tech = more branches)
  const complexity = Math.min(project.techStack.length, 4);
  
  // Branch properties
  const branchCount = rng.int(2, 2 + complexity);
  const branchAngle = rng.range(20, 50);
  
  // Appearance
  const leafDensity = project.featured ? 1.5 : rng.range(0.8, 1.2);
  const thickness = 0.03 + (height * 0.01);
  
  // Colors from palette (or custom if provided)
  const stemColor = project.colors?.branch || rng.pick(GARDEN_PALETTE.stems);
  const leafColor = project.colors?.leaf || rng.pick(GARDEN_PALETTE.leaves);
  const accentColor = project.colors?.flower || rng.pick(GARDEN_PALETTE.accents);
  
  // Special effects
  const hasGlow = project.featured;
  const hasParticles = project.type === 'experiment';
  
  return {
    seed,
    height,
    complexity,
    branchCount,
    branchAngle,
    leafDensity,
    thickness,
    stemColor,
    leafColor,
    accentColor,
    hasGlow,
    hasParticles,
  };
};

/**
 * Get plant type name based on project type
 */
export const getPlantTypeName = (project: GardenProject): string => {
  switch (project.type) {
    case 'web': return 'Flowering Shrub';
    case 'design': return 'Ornamental Tree';
    case 'experiment': return 'Wild Growth';
    case 'game': return 'Bamboo Grove';
    case 'backend': return 'Root System';
    default: return 'Plant';
  }
};



