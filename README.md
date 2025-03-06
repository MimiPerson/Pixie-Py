# Pixie-Py

Pixie-Py is a React application built with Vite and TypeScript, utilizing PixiJS for rendering and TailwindCSS for styling. The application integrates with Twitch to display and interact with chat messages in real-time.

## Features

- **Real-time Twitch Chat Integration**: Displays chat messages from Twitch and allows interaction with chatters.
- **PixiJS Rendering**: Utilizes PixiJS for high-performance rendering of graphical elements.
- **TailwindCSS**: Uses TailwindCSS for styling.
- **TypeScript**: Written in TypeScript for type safety and better developer experience.

## Project Structure

- **src**: Contains the source code for the application.
  - **components**: React components used in the application.
  - **types**: TypeScript type definitions.
  - **websocket**: WebSocket integration for real-time communication.
- **public**: Static assets.
- **index.html**: The main HTML file.
- **package.json**: Project dependencies and scripts.
- **tsconfig.json**: TypeScript configuration.

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- bun or yarn

### Installation

1. Clone the repository:

   ```sh
   git clone https://github.com/yourusername/pixie-py.git
   cd pixie-py
   ```

2. Install dependencies:
   ```sh
   bun install
   # or
   yarn install
   ```

### Running the Application

To start the development server:

```sh
bun run dev
# or
yarn dev
```

### Building the Application

To build the application for production:

```sh
bun run build
# or
yarn build
```

### Linting

To lint the codebase:

```sh
bun run lint
# or
yarn lint
```

### Previewing the Production Build

To preview the production build:

```sh
bun run preview
# or
yarn preview
```

## License

This project is licensed under the MIT License.

## Acknowledgements

- [Vite](https://vitejs.dev/)
- [React](https://reactjs.org/)
- [PixiJS](https://pixijs.com/)
- [TailwindCSS](https://tailwindcss.com/)
- [TypeScript](https://www.typescriptlang.org/)
