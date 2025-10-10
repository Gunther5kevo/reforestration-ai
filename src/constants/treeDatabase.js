/**
 * Local Tree Species Database (Curated for East Africa)
 * This serves as the base dataset for fast, reliable recommendations
 * Can be enriched with API data when needed
 */

export const TREE_DATABASE = [
  {
    id: 'grevillea-robusta',
    commonName: 'Grevillea robusta',
    scientificName: 'Grevillea robusta',
    localName: 'Silky Oak',
    family: 'Proteaceae',
    
    // Climate requirements
    tempRange: { min: 15, max: 30 },
    rainfallRange: { min: 600, max: 1500 },
    altitudeRange: { min: 1000, max: 2400 },
    
    // Soil
    soilTypes: ['clay', 'loam', 'sandy'],
    soilPH: { min: 5.5, max: 7.5 },
    
    // Growth
    growthRate: 'fast',
    maxHeight: 30,
    lifespan: 50,
    
    // Impact
    carbonSequestration: 45,
    nitrogenFixing: true,
    biodiversityValue: 85,
    
    // Needs
    waterNeeds: 'moderate',
    sunlight: 'full',
    
    // Benefits
    benefits: [
      'Fast-growing timber',
      'Drought-resistant',
      'Nitrogen-fixing',
      'Good for agroforestry'
    ],
    
    // Planting
    plantingSeason: 'March-May',
    spacing: { min: 3, max: 5 }
  },
  
  {
    id: 'acacia-mearnsii',
    commonName: 'Acacia mearnsii',
    scientificName: 'Acacia mearnsii',
    localName: 'Black Wattle',
    family: 'Fabaceae',
    
    tempRange: { min: 10, max: 28 },
    rainfallRange: { min: 700, max: 1800 },
    altitudeRange: { min: 1200, max: 2800 },
    
    soilTypes: ['clay', 'loam'],
    soilPH: { min: 4.5, max: 7.0 },
    
    growthRate: 'very-fast',
    maxHeight: 25,
    lifespan: 30,
    
    carbonSequestration: 55,
    nitrogenFixing: true,
    biodiversityValue: 90,
    
    waterNeeds: 'high',
    sunlight: 'full',
    
    benefits: [
      'Excellent carbon sink',
      'Soil improvement',
      'Valuable tannin',
      'Bee-friendly'
    ],
    
    plantingSeason: 'April-June',
    spacing: { min: 2.5, max: 4 }
  },
  
  {
    id: 'croton-megalocarpus',
    commonName: 'Croton megalocarpus',
    scientificName: 'Croton megalocarpus',
    localName: 'Musine',
    family: 'Euphorbiaceae',
    
    tempRange: { min: 12, max: 26 },
    rainfallRange: { min: 800, max: 1600 },
    altitudeRange: { min: 1200, max: 2400 },
    
    soilTypes: ['loam', 'clay'],
    soilPH: { min: 5.5, max: 7.5 },
    
    growthRate: 'moderate',
    maxHeight: 35,
    lifespan: 100,
    
    carbonSequestration: 50,
    nitrogenFixing: false,
    biodiversityValue: 95,
    
    waterNeeds: 'moderate',
    sunlight: 'full-partial',
    
    benefits: [
      'Indigenous species',
      'Medicinal properties',
      'Premium timber',
      'Wildlife habitat'
    ],
    
    plantingSeason: 'March-May',
    spacing: { min: 6, max: 10 }
  },
  
  {
    id: 'melia-volkensii',
    commonName: 'Melia volkensii',
    scientificName: 'Melia volkensii',
    localName: 'Mukau',
    family: 'Meliaceae',
    
    tempRange: { min: 20, max: 35 },
    rainfallRange: { min: 300, max: 900 },
    altitudeRange: { min: 500, max: 1500 },
    
    soilTypes: ['sandy', 'loam', 'poor'],
    soilPH: { min: 6.0, max: 8.0 },
    
    growthRate: 'fast',
    maxHeight: 20,
    lifespan: 60,
    
    carbonSequestration: 38,
    nitrogenFixing: false,
    biodiversityValue: 80,
    
    waterNeeds: 'very-low',
    sunlight: 'full',
    
    benefits: [
      'Drought-resistant',
      'Dryland specialist',
      'Valuable timber',
      'Low maintenance'
    ],
    
    plantingSeason: 'March-April',
    spacing: { min: 4, max: 6 }
  },
  
  {
    id: 'markhamia-lutea',
    commonName: 'Markhamia lutea',
    scientificName: 'Markhamia lutea',
    localName: 'Muu',
    family: 'Bignoniaceae',
    
    tempRange: { min: 15, max: 30 },
    rainfallRange: { min: 900, max: 1800 },
    altitudeRange: { min: 800, max: 2200 },
    
    soilTypes: ['loam', 'clay'],
    soilPH: { min: 5.5, max: 7.5 },
    
    growthRate: 'fast',
    maxHeight: 25,
    lifespan: 70,
    
    carbonSequestration: 48,
    nitrogenFixing: false,
    biodiversityValue: 92,
    
    waterNeeds: 'moderate-high',
    sunlight: 'full',
    
    benefits: [
      'Beautiful flowers',
      'Quality timber',
      'Medicinal bark',
      'Attracts pollinators'
    ],
    
    plantingSeason: 'April-June',
    spacing: { min: 4, max: 6 }
  }
];

export default TREE_DATABASE;