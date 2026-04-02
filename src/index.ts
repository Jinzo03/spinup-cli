#!/usr/bin/env node

import { Command } from 'commander';
import { input, select } from '@inquirer/prompts';
import fs from 'fs/promises';
import path from 'path';
import { spawnSync } from 'child_process';
import chalk from 'chalk';
import ora from 'ora';
import { getExecutableName, getTemplateRepoUrl, validateProjectName } from './utils.js';

const program = new Command();

const TEMPLATE_MAP: Record<string, string> = {
  'vanilla-ts': 'stemmlerjs/simple-typescript-starter',
  react: 'coding-in-public/vite-react-starter',
  express: 'w3cj/express-api-starter',
};

function runCommand(command: string, args: string[], options: { cwd?: string; stdio?: 'ignore' | 'inherit' } = {}) {
  return spawnSync(getExecutableName(command), args, {
    cwd: options.cwd,
    stdio: options.stdio ?? 'ignore',
  });
}

async function updatePackageName(projectDir: string, projectName: string) {
  const packageJsonPath = path.join(projectDir, 'package.json');
  const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8')) as Record<string, unknown>;
  packageJson.name = projectName;
  await fs.writeFile(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`);
}

async function ensureGitignore(projectDir: string) {
  const gitignorePath = path.join(projectDir, '.gitignore');
  const desiredEntries = ['node_modules/', 'dist/', '.DS_Store', 'Thumbs.db', '.env', '.env.*', '!.env.example'];

  try {
    const currentGitignore = await fs.readFile(gitignorePath, 'utf8');
    const existingEntries = new Set(currentGitignore.split(/\r?\n/).map((line) => line.trim()).filter(Boolean));
    const missingEntries = desiredEntries.filter((entry) => !existingEntries.has(entry));

    if (missingEntries.length === 0) {
      return;
    }

    const separator = currentGitignore.length === 0 || currentGitignore.endsWith('\n') ? '' : '\n';
    await fs.writeFile(gitignorePath, `${currentGitignore}${separator}${missingEntries.join('\n')}\n`);
  } catch {
    await fs.writeFile(gitignorePath, `${desiredEntries.join('\n')}\n`);
  }
}

program
  .name('spinup')
  .description('A professional CLI tool to scaffold new coding projects')
  .version('1.0.0');

program
  .command('new')
  .description('Create a new project setup')
  .action(async () => {
    console.log(chalk.cyan.bold("\nLet's set up a new project!\n"));

    const projectName = await input({
      message: 'What is the name of your project?',
      validate: validateProjectName,
    });

    const framework = await select({
      message: 'Which framework do you want to use?',
      choices: [
        { name: 'Vanilla TypeScript', value: 'vanilla-ts' },
        { name: 'React (Vite)', value: 'react' },
        { name: 'Express Backend API', value: 'express' },
      ],
    });

    const pkgManager = await select({
      message: 'Which package manager do you want to use?',
      choices: [
        { name: 'npm', value: 'npm' },
        { name: 'yarn', value: 'yarn' },
        { name: 'pnpm', value: 'pnpm' },
        { name: 'bun', value: 'bun' },
      ],
    });

    const projectDir = path.join(process.cwd(), projectName);

    try {
      await fs.access(projectDir);
      console.log(chalk.red(`\nFolder "${projectName}" already exists.`));
      process.exit(1);
    } catch {
      // The target directory does not exist yet.
    }

    const spinner = ora('Starting project setup...').start();

    try {
      const templateRepo = TEMPLATE_MAP[framework];

      if (!templateRepo) {
        throw new Error('Invalid framework selected');
      }

      spinner.text = `Downloading ${framework} template...`;

      const cloneTemplate = runCommand('git', [
        'clone',
        '--depth',
        '1',
        getTemplateRepoUrl(templateRepo),
        projectName,
      ]);

      if (cloneTemplate.status !== 0) {
        throw new Error('Failed to download template. Please make sure git is installed and GitHub is reachable.');
      }

      await fs.rm(path.join(projectDir, '.git'), { recursive: true, force: true });

      spinner.text = 'Preparing project files...';

      try {
        await updatePackageName(projectDir, projectName);
      } catch {
        // Some templates may not include package.json, so we leave them unchanged.
      }

      await ensureGitignore(projectDir);

      spinner.text = 'Initializing git...';

      const gitInit = runCommand('git', ['init'], {
        cwd: projectDir,
      });

      if (gitInit.status !== 0) {
        throw new Error('Git initialization failed');
      }

      spinner.text = `Installing dependencies using ${pkgManager}... This might take a minute.`;

      const installDeps = runCommand(pkgManager, ['install'], {
        cwd: projectDir,
      });

      if (installDeps.status !== 0) {
        throw new Error(`${pkgManager} install failed. Do you have it installed on your machine?`);
      }

      spinner.succeed(chalk.green.bold('Project successfully created!'));

      console.log(`\n${chalk.bold('Next steps:')}`);
      console.log(chalk.cyan(`  cd ${projectName}`));

      if (pkgManager === 'npm' || pkgManager === 'bun') {
        console.log(chalk.cyan(`  ${pkgManager} run dev\n`));
      } else {
        console.log(chalk.cyan(`  ${pkgManager} dev\n`));
      }
    } catch (error) {
      spinner.fail(chalk.red.bold('Project creation failed.'));
      if (error instanceof Error) {
        console.error(chalk.red(error.message));
      } else {
        console.error(chalk.red(String(error)));
      }
      process.exit(1);
    }
  });

await program.parseAsync(process.argv);
