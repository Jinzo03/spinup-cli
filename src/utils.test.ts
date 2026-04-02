
import os from 'os';
import { describe, it, expect } from 'vitest';
import { getExecutableName, getTemplateRepoUrl, validateProjectName } from './utils.js';

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

describe('getExecutableName', () => {
  it('should resolve platform-specific executable names', () => {
    const expected = os.platform() === 'win32' ? 'git.cmd' : 'git';
    expect(getExecutableName('git')).toBe(expected);
  });
});

describe('getTemplateRepoUrl', () => {
  it('should build a GitHub clone URL from the template repo slug', () => {
    expect(getTemplateRepoUrl('owner/repo')).toBe('https://github.com/owner/repo.git');
  });
});
