#!/usr/bin/env node

import { Command } from 'commander';
import { input, select } from '@inquirer/prompts';
import fs from 'fs/promises';
import path from 'path';
import { spawnSync } from 'child_process';
import chalk from 'chalk';
import ora from 'ora';
import { validateProjectName } from './utils.js';

// Initialize CLI
const program = new Command();

program
  .name('spinup')
  .description('A professional CLI tool to scaffold new coding projects')
  .version('1.0.0');

// Framework → template mapping
const TEMPLATE_MAP: Record<string, string> = {
  'vanilla-ts': 'vitejs/vite/packages/create-vite/template-vanilla-ts',
  'react': 'vitejs/vite/packages/create-vite/template-react',
  'express': 'expressjs/express/examples/hello-world', // safer fallback example
};

program
  .command('new')
  .description('Create a new project setup')
  .action(async () => {
    console.log(chalk.cyan.bold('\nLet\'s set up a new project!\n'));

    // 1. Project name input with validation
    const projectName = await input({
     message: 'What is the name of your project?',
     validate: validateProjectName // Use the extracted function
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
      message: 'Which package manaegr do you want to use?',
      choices : [
        { name: 'npm', value: 'npm' },
        { name: 'yarn', value: 'yarn' },
        { name: 'pnpm', value: 'pnpm' },
        { name: 'bun', value: 'bun' }
      ],
    });

    const currentDir = process.cwd();
    const projectDir = path.join(currentDir, projectName);

    // 2. Prevent overwrite
    try {
      await fs.access(projectDir);
      console.log(chalk.red(`\n❌ Folder "${projectName}" already exists.`));
      process.exit(1);
    } catch {
      // Folder does not exist → OK
    }

    const spinner = ora('Starting project setup...').start();

    try {
      const templateRepo = TEMPLATE_MAP[framework];

      if (!templateRepo) {
        throw new Error('Invalid framework selected');
      }

      spinner.text = `Downloading ${framework} template...`;

      // 3. Safe command execution (no injection)
      const tiged = spawnSync(
        'npx',
        ['tiged', templateRepo, projectName, '--force'],
        { stdio: 'ignore' }
      );

      if (tiged.status !== 0) {
        throw new Error('Failed to download template');
      }

      spinner.text = 'Initializing npm and git...';

      const npmInit = spawnSync('npm', ['init', '-y'], {
        cwd: projectDir,
        stdio: 'ignore',
      });

      const gitInit = spawnSync('git', ['init'], {
        cwd: projectDir,
        stdio: 'ignore',
      });

      if (npmInit.status !== 0 || gitInit.status !== 0) {
        throw new Error('npm or git initialization failed');
      }

      spinner.text = `Initializing dependencies using ${pkgManager}... This might take a minute.`;

      const installDeps = spawnSync(pkgManager, ['install'], {
        cwd: projectDir,
        stdio: 'ignore',
      });

      if (installDeps.status !==0) {
        throw new Error(`${pkgManager} install failed. Do you have it installed on your machine?`);
      }
      // 4. Create .gitignore
      await fs.writeFile(
        path.join(projectDir, '.gitignore'),
        'node_modules\n.DS_Store\n.env\n'
      );

      spinner.succeed(chalk.green.bold('Project successfully created!'));

      console.log(`\n${chalk.bold('Next steps:')}`);
      console.log(chalk.cyan(`  cd ${projectName}`));
      console.log(chalk.cyan(`  npm install`));
      console.log(chalk.cyan(`  npm run dev\n`));

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

// Proper async parsing
await program.parseAsync(process.argv);