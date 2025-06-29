# Cozy - cozy new tab

A cozy and beautiful browser extension that replaces your new tab page with a stylish interface featuring customizable widgets, beautiful backgrounds, and productivity tools.

## Screenshots

![Main Interface](Screenshots/Screen%200.png)

![Settings Panel](Screenshots/Screen%201.png)

![Background Options](Screenshots/Screen%202.png)

![Lists and Organization](Screenshots/Screen%203.png)

![Color Customization](Screenshots/Screen%204.png)

## Features

- 🎨 **Customizable Interface** - Personalize colors, layouts, and themes
- 🔗 **Quick Links** - Fast access to your favorite websites
- 📋 **Todo Lists** - Organize your tasks efficiently
- 🌅 **Beautiful Backgrounds** - Stunning wallpapers and gradients
- ⚡ **Fast Performance** - Built with React and optimized for speed
- 🌐 **Multi-Browser Support** - Works on Chrome, Firefox, and Edge

## Installation

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/TheLoserCoder/Cozy.git
   cd Cozy
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```
   This will start:
   - Vite development server at `http://localhost:3000`
   - Automatic extension building for all browsers in `build-dev/`
   - File watching for instant updates

### Building Extensions

#### Production builds (optimized, minified):

- **Chrome**: `npm run build:chrome`
- **Firefox**: `npm run build:firefox`
- **Edge**: `npm run build:edge`
- **All browsers**: `npm run build`

This creates optimized builds in the `build/` directory:
- `build/chrome/` - Chrome extension (Manifest V3)
- `build/firefox/` - Firefox extension (Manifest V2)
- `build/edge/` - Edge extension (Manifest V3)

#### Development builds (unminified, with source maps):

- **Chrome**: `npm run build:dev:chrome`
- **Firefox**: `npm run build:dev:firefox`
- **Edge**: `npm run build:dev:edge`
- **All browsers**: `npm run build:dev`

This creates development builds in the `build-dev/` directory with:
- Unminified code for easier debugging
- Source maps for development tools
- "(DEV)" suffix in extension name

#### Watch mode for development (automatic rebuilding):

- **Chrome**: `npm run watch:dev:chrome`
- **Firefox**: `npm run watch:dev:firefox`
- **Edge**: `npm run watch:dev:edge`

Watch mode automatically:
- Starts Vite in watch mode for React app
- Monitors changes in source files and manifests
- Rebuilds extension files automatically
- Updates `build-dev/{browser}/` directory in real-time

#### Package for distribution:
```bash
npm run package
```

This will build all extensions and create ZIP archives in the `packages/` directory:
- `newtab-chrome-extension.zip` - Chrome extension package
- `newtab-firefox-extension.zip` - Firefox extension package
- `newtab-edge-extension.zip` - Edge extension package
- `newtab-all-extensions.zip` - Combined package with all extensions

### Installing the Extension

#### Chrome/Edge:
1. Open Chrome/Edge and go to `chrome://extensions/` or `edge://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" and select the appropriate build folder:
   - Production: `build/chrome/` or `build/edge/`
   - Development: `build-dev/chrome/` or `build-dev/edge/`

#### Firefox:
1. Open Firefox and go to `about:debugging`
2. Click "This Firefox"
3. Click "Load Temporary Add-on"
4. Select the `manifest.json` file from:
   - Production: `build/firefox/`
   - Development: `build-dev/firefox/`

## Development

### Project Structure

```
├── src/                    # Source code
│   ├── components/         # React components
│   ├── store/             # Redux store and slices
│   ├── hooks/             # Custom React hooks
│   ├── utils/             # Utility functions
│   └── styles/            # CSS and styling
├── manifests/             # Extension manifests
│   ├── manifest.base.json     # Base manifest configuration
│   ├── manifest.chrome.json   # Chrome-specific manifest
│   ├── manifest.firefox.json  # Firefox-specific manifest
│   └── manifest.edge.json     # Edge-specific manifest
├── icons/                 # Extension icons
├── build.js              # Production build script
├── build-dev.js          # Development build script
├── vite.config.ts        # Production Vite configuration
└── vite.config.dev.ts    # Development Vite configuration
```

### Available Scripts

#### Development
- `npm run dev` - Start development server + auto-build extensions
- `npm run dev:server` - Start only Vite development server

#### Production Builds
- `npm run build:vite` - Build with Vite only
- `npm run build:chrome` - Build Chrome extension
- `npm run build:firefox` - Build Firefox extension
- `npm run build:edge` - Build Edge extension
- `npm run build` - Build all extensions

#### Development Builds
- `npm run build:vite:dev` - Build with Vite (dev config)
- `npm run build:dev:chrome` - Build Chrome extension (dev)
- `npm run build:dev:firefox` - Build Firefox extension (dev)
- `npm run build:dev:edge` - Build Edge extension (dev)
- `npm run build:dev` - Build all extensions (dev)

#### Watch Mode (Auto-rebuild)
- `npm run watch:dev:chrome` - Watch mode for Chrome extension
- `npm run watch:dev:firefox` - Watch mode for Firefox extension
- `npm run watch:dev:edge` - Watch mode for Edge extension

#### Packaging & Preview
- `npm run package` - Build and package all extensions as ZIP files
- `npm run preview` - Preview production build

### Manifest Configuration

The extension uses a modular manifest system located in the `manifests/` directory:

- **`manifest.base.json`** - Common configuration for all browsers
- **`manifest.chrome.json`** - Chrome-specific overrides (Manifest V3)
- **`manifest.firefox.json`** - Firefox-specific overrides (Manifest V2)
- **`manifest.edge.json`** - Edge-specific overrides (Manifest V3)

The build script automatically merges these files using `deepmerge`. The extension is designed as a simple new tab replacement with minimal permissions:

- **Storage permission** - For saving user preferences
- **Host permissions** - For fetching favicons and external resources
- **CSP policy** - Allows images and fetch requests from external sources

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions, please [open an issue](https://github.com/TheLoserCoder/Cozy/issues) on GitHub.
