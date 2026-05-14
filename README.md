# CMS Login System

A software-based approach for error detection and correction in surveying instruments — featuring differential leveling computation, two-peg calibration, and automated closure error checking.

## Features

- 🔐 **Secure Authentication** - 6-digit passcode login with session management
- 📊 **Dashboard** - Overview of projects, calibration status, and activity logs
- 📝 **Data Input** - Leveling observations table with add/delete functionality
- 🧮 **Computation** - Differential leveling computation with Rise & Fall method
- 🎯 **Calibration** - Two-peg calibration test with auto-calculating results
- 📄 **Reports** - Generate and manage survey reports
- 🚪 **Logout** - Secure logout with confirmation modal and session clearing

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Backend**: Express.js
- **Styling**: Custom CSS with Poppins font
- **State Management**: React Hooks

## Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Project Structure

```
cms-login/
├── src/
│   ├── components/
│   │   ├── LoginPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── DataInputPage.tsx
│   │   ├── ComputationPage.tsx
│   │   ├── CalibrationPage.tsx
│   │   ├── ReportsPage.tsx
│   │   └── LogoutModal.tsx
│   ├── index.tsx
│   └── index.css
├── public/
├── server.js
└── package.json
```

## Usage

1. **Login**: Enter 6-digit passcode
2. **Navigate**: Use sidebar to access different modules
3. **Input Data**: Add leveling observations
4. **Compute**: Calculate differential leveling results
5. **Calibrate**: Perform two-peg calibration tests
6. **Generate Reports**: View and export survey reports
7. **Logout**: Click logout icon and confirm

## License

© 2026 Survey Leveling System V1.1

## Author

Ronald Talagtag - Engineer
