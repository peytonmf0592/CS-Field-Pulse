# Adjuster Dashboard

A React application for tracking and managing interactions with insurance adjusters.

## Features

- Dashboard with key metrics and visualizations
- Adjuster directory with detailed profiles
- Encounter logging and tracking
- Sentiment analysis
- Carrier distribution analytics

## Technologies Used

- React
- Tailwind CSS
- Headless UI
- React Router
- Heroicons

## Getting Started

### Prerequisites

- Node.js (v14+)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:

```bash
cd adjuster-dashboard
npm install
```

3. Start the development server:

```bash
npm start
```

The application will be available at http://localhost:3000

## Usage

The application provides several key screens:

1. **Dashboard** - Overview of adjuster metrics and recent encounters
2. **Adjusters** - Complete listing of all adjusters with filtering and sorting
3. **Adjuster Details** - In-depth information about each adjuster
4. **Adjuster Form** - Add or edit adjuster information
5. **Encounters** - Track and manage interactions with adjusters

## Project Structure

```
adjuster-dashboard/
├── public/             # Static files
├── src/                # Source code
│   ├── components/     # React components
│   │   ├── adjusters/  # Adjuster-related components
│   │   ├── dashboard/  # Dashboard components 
│   │   ├── encounters/ # Encounter-related components
│   ├── context/        # React context providers
│   ├── hooks/          # Custom React hooks
│   ├── utils/          # Utility functions
│   ├── App.js          # Main application component
│   ├── index.js        # Application entry point
├── README.md           # Project documentation
└── package.json        # Dependencies and scripts
```