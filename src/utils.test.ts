
import { describe, it, expect } from 'vitest';
import { validateProjectName } from './utils.js';

describe('validateProjectName', () => {
  it('should return true for valid project names', () => {
    expect(validateProjectName('my-awesome-project')).toBe(true);
    expect(validateProjectName('project_123')).toBe(true);
    expect(validateProjectName('reactApp')).toBe(true);
  });

  it('should return an error message for empty strings', () => {
    expect(validateProjectName('')).toBe('Project name cannot be empty');
    expect(validateProjectName('   ')).toBe('Project name cannot be empty');
  });

  it('should return an error message for invalid characters', () => {
    expect(validateProjectName('my project')).toBe('Use only letters, numbers, hyphens, and underscores');
    expect(validateProjectName('project@123')).toBe('Use only letters, numbers, hyphens, and underscores');
    expect(validateProjectName('react/app')).toBe('Use only letters, numbers, hyphens, and underscores');
  });
});