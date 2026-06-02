import {
  getImageIdForEvolution,
  getStageForLevel,
  inferEvolutionFromImage,
} from './pet-evolution.config';

describe('pet evolution config', () => {
  it('infers line and stage from existing image ids', () => {
    expect(inferEvolutionFromImage('1')).toEqual({
      evolutionLine: 1,
      stage: 1,
    });
    expect(inferEvolutionFromImage('4')).toEqual({
      evolutionLine: 1,
      stage: 4,
    });
    expect(inferEvolutionFromImage('5')).toEqual({
      evolutionLine: 2,
      stage: 1,
    });
    expect(inferEvolutionFromImage('40')).toEqual({
      evolutionLine: 10,
      stage: 4,
    });
  });

  it('maps line and stage to the staged image id', () => {
    expect(getImageIdForEvolution(1, 1)).toBe('1');
    expect(getImageIdForEvolution(1, 4)).toBe('4');
    expect(getImageIdForEvolution(2, 1)).toBe('5');
    expect(getImageIdForEvolution(10, 4)).toBe('40');
  });

  it('maps levels to evolution stages', () => {
    expect(getStageForLevel(1)).toBe(1);
    expect(getStageForLevel(4)).toBe(1);
    expect(getStageForLevel(5)).toBe(2);
    expect(getStageForLevel(9)).toBe(2);
    expect(getStageForLevel(10)).toBe(3);
    expect(getStageForLevel(19)).toBe(3);
    expect(getStageForLevel(20)).toBe(4);
  });
});
