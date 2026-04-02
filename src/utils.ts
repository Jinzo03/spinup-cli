

export function validateProjectName(name: string): string | boolean {
  if (!name || name.trim() === '') {
    return 'Project name cannot be empty';
  }
  
  if (!/^[a-zA-Z0-9-_]+$/.test(name)) {
    return 'Use only letters, numbers, hyphens, and underscores';
  }
  
  return true;
}