# LogAnalyzer

A comprehensive Electron desktop application for analyzing telecom network logs, managing test cases, and integrating with JIRA/Zephyr for test management. Built with React, TypeScript, and Electron.

## Features

- **Log Analysis**: Process and analyze telecom network log files (.txt, .log, .cap)
- **Network Tools**: Point code converters, hex/decimal/binary utilities, IP converters
- **JIRA Integration**: Fetch issues, manage test executions, and update test steps
- **Test Management**: Bulk update test cases, post test results, manage test steps
- **Multiple Protocol Support**: SCCP, SIP, MCPM, IPSM, SFAPP, ENUM, DEIR, IPSG, MEAT
- **How-To Guides**: Built-in guides for running specific traffic logs
- **Cross-Platform**: Available for Windows, macOS, and Linux

## Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

## Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

## Project Setup

### Install Dependencies

```bash
npm install
```

### Development

Start the development server with hot reload:

```bash
npm run dev
```

This will launch the Electron app in development mode with live reloading enabled.

### Build

Build the application for your target platform:

```bash
# For Windows
npm run build:win

# For macOS
npm run build:mac

# For Linux
npm run build:linux
```

The built executables will be available in the `dist/` directory.

## Usage

1. Launch the application after running `npm run dev` or installing a built version
2. Use the sidebar to navigate between different sections:
   - **Logs**: Upload and analyze log files
   - **Cards**: Access protocol-specific tools and information
   - **Tools**: Use conversion utilities and replicators
   - **How-To**: Follow guides for specific operations
   - **Manage PAT**: Configure JIRA Personal Access Tokens
   - **Post Results**: Submit test execution results
   - **Bulk Update**: Update multiple test cases at once

## Development Scripts

```bash
# Format code
npm run format

# Lint code
npm run lint

# Type checking
npm run typecheck

# Preview built app
npm run start
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
