# P000280SE Completion of Focus Bear Chrome Extension

**Focus Bear** is a Chrome extension designed to help users minimise distractions and stay focused by blocking access and areas of chosen websites.

## Technologies

- **React/JavaScript**
- **TypeScript**
- **Vite**
- **HTML/CSS**

## Features

- Clean React-based UI using TSX components
- Lightweight and fast with Vite build
- Website blocker to help maintain focus
- Popup interface asking the users intention

## Getting Started

These instructions will help you get a local copy of the project up and running for development/testing.

**Clone the repository**: git clone <https://github.com/Kiran-K4/chrome_extension>

### How to run

1. Navigate to directory
    - cd focus-bear-extension/hide_distractions

2. Install dependencies
    - npm install
    - npm install --save-dev shx
    - npm install --save-dev cpx

3. Build the extension (Generates dist/ folder and contents)
    - npm run build

4. Load the extension in Chrome
    - Open Chrome and navigate to chrome://extensions/
    - Enable Developer Mode toggle
    - Press “Load unpacked”
    - Select the generated dist/ folder

### Troubleshooting

If you’re running into issues like missing build files or unexpected behaviour, try the following steps:

- The dist/ folder exists and contains a manifest.json
- You are loading the correct folder in chrome://extensions/
- You have enabled Developer Mode toggle
- If these are not the issue try:
    1. rm -rf dist
    2. npm run build
    3. ls dist/

## Project Structure

```text
hide_distractions/
│
├── public/                # Static files
│   ├── icons/             # Extension icons
│   └── manifest.json      # Chrome Extension manifest
│
├── src/                   # Source files
│   ├── popup.html         # HTML for popup interface
│   ├── popup.tsx          # React popup UI
│   ├── background.ts      # Background script (Runs continuously in the background)
│   ├── content.ts         # Content script (Injected into websites)
│
├── package.json           # Project metadata and scripts
├── package-lock.json      # Dependency lockfile
├── tsconfig.json          # TypeScript configuration
├── vite.config.ts         # Vite bundler configuration
└── README.md              # You're reading it!
```

## License

This project is licensed under ???
