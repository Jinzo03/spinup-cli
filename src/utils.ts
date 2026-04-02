
import os from 'os';

export function validateProjectName(name: string): string | boolean {
  if (!name || name.trim() === '') {
    return 'Project name cannot be empty';
  }
  
  if (!/^[a-zA-Z0-9-_]+$/.test(name)) {
    return 'Use only letters, numbers, hyphens, and underscores';
  }
  
  return true;
}

export function getExecutableName(command: string): string {
  return os.platform() === 'win32' ? `${command}.cmd` : command;
}

export function getTemplateRepoUrl(templateRepo: string): string {
  return `https://github.com/${templateRepo}.git`;
}
