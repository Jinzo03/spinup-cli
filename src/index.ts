#!/usr/bin/env node

import { Command } from 'commander';
import { input, select } from '@inquirer/prompts';
import fs from 'fs/promises';
import path from 'path';
import { exec, execSync} from 'child_process';
import chalk from 'chalk';
import ora from 'ora';

// Initialize a new Command instance
const program = new Command();

// Set up basic info about your tool
program
  .name('spinup')
  .description('A professional CLI tool to scaffold new coding projects')
  .version('1.0.0');

// Create the 'new' command
program
  .command('new')
  .description('Create a new project setup')
  .action(async () => {
    console.log(chalk.cyan.bold('\n Let\'s set up a new project!\n'));

    // 1. Ask for the project name (Text input)
    const projectName = await input({ 
        message: 'What is the name of your project?' 
    });
    
    // 2. Ask for the framework (Multiple choice)
    const framework = await select({
      message: 'Which framework do you want to use?',
      choices: [
        { name: 'Vanilla TypeScript', value: 'vanilla-ts' },
        { name: 'React (Vite)', value: 'react' },
        { name: 'Express Backend API', value: 'express' },
      ],
    });

    const spinner = ora(`Scaffolding ${chalk.green(framework)} project in ${chalk.blue('./' + projectName)}...`).start();
    
    try {
        // 1. Define the path where the user ran the command
        const currentDir = process.cwd();
        const projectDir = path.join(currentDir, projectName);

        // 2. Create the main project folder
        await fs.mkdir(projectDir, { recursive: true });

        // 3. Create a customized README.md
        const readmeContent = `# ${projectName}\n\nThis project was generated using SpinUp CLI.\n\nFramework: ${framework}`;
        await fs.writeFile(path.join(projectDir, 'README.md'), readmeContent);

        // 4. Create a basic entry file based on their choice
        let entryFileName = 'index.js';
        let entryFileContent = 'console.log("Hello World")';

        if (framework === 'vanilla-ts') {
            entryFileName = 'index.ts';
            entryFileContent = 'const greeting: string = "Hello TypeScript"; \nconsole.log(greeting);';  
        } else if (framework === 'react') {
        entryFileName = 'App.jsx';
        entryFileContent = 'export default function App() { return <h1>Hello React</h1>; }';
      } else if (framework === 'express') {
        entryFileName = 'server.js';
        entryFileContent = 'const express = require("express");\nconst app = express();\n\napp.listen(3000, () => console.log("Server running"));';
      }

      // 5. Write the entry file inside the new project folder
      await fs.writeFile(path.join(projectDir, entryFileName), entryFileContent);

      // 6. Run terminal commands inside the new project folder
      // We pass { cwd: projeDir } so the command runs inside the new folder
      // We pass { stdio: 'ignore' } so it doesn't clutter the user's terminal
      spinner.text = 'Initializing Git and npm...';

      execSync('npm init -y', {cwd: projectDir, stdio: 'ignore' });
      execSync('git init', { cwd : projectDir, stdio: 'ignore' });

      // Create a basic .gitignore so they don't commt node_modules
      await fs.writeFile(path.join(projectDir, '.gitignore'), 'node_modules\n.DS_Store');

      spinner.succeed(chalk.green.bold('Project successfully generated!'))
    
      console.log(`\n${chalk.bold('Next steps:')}`);
      console.log(chalk.cyan(`  cd ${projectName}`));
      console.log(chalk.cyan(`  npm install\n`));
    } catch (error) {
        spinner.fail(chalk.red.bold('An erro occured while creating the project. '));
        console.error(error);
    }
});
// Tell commander to parse the arguments from the terminal
program.parse(process.argv);