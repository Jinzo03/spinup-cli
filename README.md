# SpinUp CLI

SpinUp CLI is a fast, interactive command-line tool for scaffolding modern coding projects in seconds.

## Overview

Starting a new project from scratch often means repeating the same setup steps: creating folders, writing boilerplate, configuring Git, and initializing npm. SpinUp CLI automates that process so you can focus on building the application itself.

With a single command, SpinUp CLI generates a ready-to-code project structure tailored to your chosen stack.

## Features

- Interactive command-line prompts for a guided setup experience
- Automatic scaffolding for:
  - React with Vite
  - Express.js
  - Vanilla TypeScript
- Automatic Git repository initialization
- Automatic generation of a `.gitignore` file
- Internal npm initialization
- Built with modern ECMAScript Modules and TypeScript

## Tech Stack

- TypeScript with NodeNext module resolution
- Node.js
- commander for command parsing and routing
- fs/promises for asynchronous file and directory operations
- child_process for running setup commands
- ora for loading indicators
- chalk for terminal styling

## Installation

Install the package globally with npm:

```bash
npm install -g your-published-package-name
```

If you are testing locally before publishing, clone the repository and link it instead:

```bash
git clone https://github.com/Jinzo03/spinup-cli.git
cd spinup-cli
npm install
npm link
```

## Usage

Create a new project by running:

```bash
spinup new
```

Then follow the prompts:

1. Enter a project name
2. Choose a framework using the arrow keys
3. Wait for the setup to finish
4. Move into the generated project directory

```bash
cd your-project-name
```

You can then start developing immediately.

## Local Development

To work on SpinUp CLI locally:

```bash
git clone https://github.com/yourusername/spinup-cli.git
cd spinup-cli
npm install
npm run build
npm link
```

## Project Structure

The tool is designed to keep project generation simple, reliable, and easy to extend. Each template is generated automatically with the minimum setup needed to get started quickly.

## License

This project is released under the MIT License.
