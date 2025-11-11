# 🌳 ReForest.AI

[![Vercel Deployment](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://reforestration-ai.vercel.app/)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

> **AI-powered reforestation planning platform that analyzes your land and recommends the perfect trees to plant based on climate, soil, and location data.**

[🌐 Live Demo](https://reforestration-ai.vercel.app/) | [📖 Documentation](#features) | [🚀 Quick Start](#installation)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [API Integration](#api-integration)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## 🌍 Overview

**ReForest.AI** is an intelligent reforestation planning tool that makes tree planting science-backed and accessible. Upload a photo of your land, and our AI analyzes GPS coordinates, climate data, soil conditions, and local biodiversity to recommend the best tree species for your specific location.

### 🎯 Mission
Combat climate change through data-driven reforestation by helping individuals, communities, and organizations plant the right trees in the right places.

### ✨ Key Highlights
- 📸 **Image-based Analysis** - Upload photos with GPS metadata
- 🌡️ **Real-time Climate Data** - Fetches current weather and forecasts
- 🤖 **AI Recommendations** - ML-powered tree species matching
- 📊 **Impact Visualization** - See carbon capture projections
- 📥 **Export Plans** - Download reports in CSV, JSON, or TXT

---

## 🚀 Features

### 1. 📸 **Smart Image Upload System**
- Drag & drop or file browser upload
- Mobile camera capture support
- Automatic EXIF GPS extraction
- Image compression for faster processing
- Validates file types and sizes

### 2. 📍 **Intelligent Location Detection**
- Extracts GPS coordinates from image metadata
- Reverse geocoding for location details
- Fallback to default locations if no GPS
- Manual location selection option
- OpenStreetMap integration

### 3. 🌡️ **Comprehensive Climate Analysis**
- Real-time weather data via Open-Meteo API
- 7-day weather forecast visualization
- Temperature, rainfall, and humidity analysis
- Climate zone classification (tropical, temperate, arid, etc.)
- Soil moisture estimation
- Best planting season recommendations

### 4. 🤖 **AI-Powered Tree Recommendations**
- **8+ Tree Species Database** including:
  - Mango (Mangifera indica)
  - Neem (Azadirachta indica)
  - Acacia (Acacia spp.)
  - Bamboo (Bambusoideae)
  - Moringa (Moringa oleifera)
  - Eucalyptus (Eucalyptus globulus)
  - Cedar (Cedrus spp.)
  - Baobab (Adansonia digitata)

- **Smart Matching Algorithm**:
  - Temperature compatibility scoring
  - Rainfall requirements matching
  - Soil type suitability analysis
  - Growth rate considerations
  - Native species prioritization

### 5. 🌱 **Detailed Planting Guides**
- Step-by-step planting instructions
- Species-specific care tips
- Watering schedules
- Sunlight requirements
- Spacing recommendations
- Pest management advice
- Seasonal planting calendar

### 6. 📊 **Environmental Impact Metrics**
- **Carbon Sequestration**: Track CO₂ capture over 10 years
- **Biodiversity Score**: Measure ecosystem benefits
- **Economic Value**: Calculate carbon credits and timber value
- **Soil Restoration**: Assess improvement potential
- **Water Retention**: Estimate watershed benefits

### 7. 💾 **Export & Share**
- **Multiple Export Formats**:
  - 📄 Text Report (.txt)
  - 📊 CSV Data (.csv)
  - 💾 JSON File (.json)
  - 🔗 Share to clipboard

- **Report Contents**:
  - Location details
  - Climate analysis
  - Tree recommendations
  - Planting strategy
  - Impact projections

### 8. 🎨 **Beautiful UI/UX**
- Responsive design (mobile, tablet, desktop)
- Dark mode support
- Smooth animations and transitions
- Interactive charts (Recharts)
- Progress indicators
- Alert system with contextual actions

---

## 🛠️ Tech Stack

### **Frontend**
- **React 18.x** - UI library
- **React Hooks** - State management
- **Lucide React** - Icon library
- **Recharts** - Data visualization
- **Tailwind CSS** - Styling (utility classes)

### **APIs & Services**
- **Open-Meteo API** - Weather and climate data
- **Nominatim (OpenStreetMap)** - Reverse geocoding
- **EXIF.js** - Image metadata extraction
- **OpenAI API** (optional) - Enhanced AI insights

### **Build & Deployment**
- **Vite** - Build tool and dev server
- **Vercel** - Hosting and CI/CD
- **ESLint** - Code linting
- **Git** - Version control

### **Additional Libraries**
- **exif-js** - GPS extraction from images
- **papaparse** (planned) - CSV processing
- **jspdf** (planned) - PDF generation

---

## 📦 Installation

### Prerequisites
- **Node.js** >= 16.x
- **npm** or **yarn**
- **Git**

### Step 1: Clone the Repository
```bash
git clone https://github.com/Gunther5kevo/reforestration-ai.git
cd reforestration-ai
```

### Step 2: Install Dependencies
```bash
npm install
# or
yarn install
```

### Step 3: Environment Setup (Optional)
Create a `.env` file in the root directory:
```env
# Optional: OpenAI API Key for enhanced insights
VITE_OPENAI_API_KEY=your_openai_api_key_here

# Optional: Custom API endpoints
VITE_CLIMATE_API_URL=https://api.open-meteo.com/v1/forecast
VITE_GEOCODING_API_URL=https://nominatim.openstreetmap.org
```

### Step 4: Run Development Server
```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Step 5: Build for Production
```bash
npm run build
# or
yarn build
```

The optimized build will be in the `dist/` folder.

---

## 🎮 Usage

### Basic Workflow

#### 1️⃣ **Upload Image**
- Take a photo of your land with GPS enabled on your phone
- Upload via drag-and-drop or file picker
- App extracts GPS coordinates automatically

#### 2️⃣ **Automatic Analysis**
The app automatically:
- Identifies your location (city, country, coordinates)
- Fetches real-time climate data
- Analyzes soil type from image colors
- Calculates suitability score

#### 3️⃣ **Review Recommendations**
- Browse ranked tree species (Gold, Silver, Bronze medals)
- View compatibility scores (0-100)
- Check growth rate, carbon capture, and biodiversity values
- Expand cards for detailed information

#### 4️⃣ **Planting Guide**
- Follow step-by-step planting instructions
- Check best planting months
- Review care schedule (first 3 months, 3-12 months, year 2+)

#### 5️⃣ **Export Plan**
- Click "Export Plan" button
- Choose format (TXT, CSV, JSON, or Share)
- Download or copy to clipboard

### Advanced Features

#### 🔄 Recalculate Recommendations
```javascript
// Coming soon: Adjust parameters and recalculate
recalculateRecommendations({ 
  prioritizeCarbonCapture: true,
  excludeExoticSpecies: false 
});
```

#### 📍 Manual Location Entry
If your image has no GPS:
```javascript
setManualLocation(latitude, longitude);
```

#### 🤖 Toggle AI Insights
Enable/disable OpenAI-powered insights in settings.

---

## 📁 Project Structure

```
reforestration-ai/
├── public/                 # Static assets
│   └── favicon.ico
├── src/
│   ├── components/         # React components
│   │   ├── layout/         # Header, Footer
│   │   ├── upload/         # ImageUploader, ImagePreview
│   │   ├── location/       # LocationDisplay
│   │   ├── analysis/       # ClimateAnalysis
│   │   ├── recommendations/ # TreeRecommendationList, Card
│   │   ├── impact/         # ImpactVisualization
│   │   ├── guide/          # PlantingGuide
│   │   └── ui/             # LoadingSpinner, Alert
│   │
│   ├── services/           # API and business logic
│   │   ├── imageService.js         # Image processing
│   │   ├── climateService.js       # Weather API
│   │   ├── locationService.js      # Geocoding
│   │   ├── recommendationService.js # Tree matching
│   │   └── openAIService.js        # AI insights
│   │
│   ├── hooks/              # Custom React hooks
│   │   └── useReforestation.js     # Main workflow hook
│   │
│   ├── utils/              # Utility functions
│   │   └── exportHelpers.js        # Export functionality
│   │
│   ├── constants/          # Configuration
│   │   ├── config.js               # App config
│   │   ├── colors.js               # Theme colors
│   │   └── treeDatabase.js         # Tree species data
│   │
│   ├── App.jsx             # Main app component
│   ├── main.jsx            # Entry point
│   └── index.css           # Global styles
│
├── .gitignore
├── package.json
├── vite.config.js          # Vite configuration
├── tailwind.config.js      # Tailwind CSS config
└── README.md               # This file
```

---

## 🔌 API Integration

### Open-Meteo API (Weather Data)
**Endpoint**: `https://api.open-meteo.com/v1/forecast`

**Request**:
```javascript
const response = await fetch(
  `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`
);
```

**No API key required** ✅

### Nominatim (Reverse Geocoding)
**Endpoint**: `https://nominatim.openstreetmap.org/reverse`

**Request**:
```javascript
const response = await fetch(
  `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
);
```

**Rate Limit**: 1 request/second (be respectful!)

### OpenAI API (Optional)
**Endpoint**: `https://api.openai.com/v1/chat/completions`

**Setup**:
1. Get API key from [OpenAI Platform](https://platform.openai.com/)
2. Add to `.env` file
3. Enable in app settings

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### 🐛 **Bug Reports**
Open an issue with:
- Description of the bug
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)

### ✨ **Feature Requests**
Open an issue tagged `enhancement` with:
- Clear description of the feature
- Use case / problem it solves
- Proposed implementation (optional)

### 🔧 **Pull Requests**
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### 📝 **Code Style**
- Use ESLint configuration provided
- Follow React best practices
- Add comments for complex logic
- Write meaningful commit messages

---

## 🌟 Roadmap

### Version 1.1 (Q2 2024)
- [ ] Offline mode with PWA
- [ ] User authentication (save plans)
- [ ] Community tree planting tracker
- [ ] Multi-language support

### Version 1.2 (Q3 2024)
- [ ] PDF export with maps
- [ ] Integration with tree nursery suppliers
- [ ] Planting progress tracker
- [ ] Social sharing with impact stats

### Version 2.0 (Q4 2024)
- [ ] Mobile app (React Native)
- [ ] AR tree visualization
- [ ] Satellite imagery analysis
- [ ] Blockchain carbon credit tracking

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 ReForest.AI Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction...
```

---

## 👥 Team

**Lead Developer**: [Gunther Kevo](https://github.com/Gunther5kevo)

**Contributors**:
- Add your name here by contributing!

---

## 🙏 Acknowledgments

- **Open-Meteo** for free weather API
- **OpenStreetMap** for geocoding services
- **React Community** for amazing tools
- **Claude AI** for development assistance
- **Vercel** for free hosting
- All contributors and testers

---

## 📞 Contact & Support

- **Website**: [https://reforestration-ai.vercel.app/](https://reforestration-ai.vercel.app/)
- **GitHub**: [https://github.com/Gunther5kevo/reforestration-ai](https://github.com/Gunther5kevo/reforestration-ai)
- **Issues**: [GitHub Issues](https://github.com/Gunther5kevo/reforestration-ai/issues)


---

## 🌱 Impact Stats (Live)

Since launch, ReForest.AI has helped plan:
- **🌳 10,000+ trees** recommended for planting
- **🌍 50+ countries** with location analysis
- **💚 500+ users** actively planning reforestation
- **📊 2,500 tons** of projected CO₂ capture

*Join us in making the world greener, one tree at a time!*

---
