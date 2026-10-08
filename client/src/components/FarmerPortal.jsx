import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import LanguageSelector from './LanguageSelector';
import { productAPI, orderAPI, notificationAPI, aiAPI, bargainAPI, authAPI, weatherAPI } from '../services/api';
import usePolling from '../hooks/usePolling';
import LiveTrackingMap from './LiveTrackingMap';
import MapPicker from './MapPicker';
import MedicineFertilizerHub from './MedicineFertilizerHub';
import ThreeDPortViewer from './ThreeDPortViewer';
import OtpNotificationModal from './OtpNotificationModal';
import AgriLinkLogo from './AgriLinkLogo';
import ProductDetailsModal from './ProductDetailsModal';
import FarmerMobileProfileSheet from './FarmerMobileProfileSheet';
import ProfileEmailOtpModal from './ProfileEmailOtpModal';
import AskAgriLinkAi from './AskAgriLinkAi';
import {
  ShoppingCart,
  Sprout,
  Apple,
  MapPin,
  Phone,
  Mail,
  User,
  CheckCircle,
  Package,
  RotateCw,
  Search,
  SlidersHorizontal,
  Plus,
  Minus,
  Trash2,
  AlertCircle,
  Truck,
  Sparkles,
  Zap,
  ArrowRight,
  UploadCloud,
  Edit2,
  ShieldCheck,
  Info,
  Home,
  LayoutDashboard,
  Smartphone,
  BarChart2,
  Sun,
  Cloud,
  CloudRain,
  CloudLightning,
  Droplets,
  Wind,
  Thermometer,
  AlertTriangle,
  FileText,
  Bell,
  ChevronRight,
  Sliders,
  Settings,
  LogOut,
  RefreshCw,
  Image as ImageIcon,
  Check,
  Layers,
  Clock,
  X,
  IndianRupee,
  FlaskConical,
  Volume2,
  Box,
  Camera,
  KeyRound,
  Eye,
  CheckCircle2,
  Radio,
  Lock,
  MessageSquare,
  Bot
} from 'lucide-react';
import '../farmer.css';

// Preset images for adding produce
const PRESET_IMAGES = {
  seed: [
    { label: 'Wheat Seeds', url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80' },
    { label: 'Basmati Paddy', url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80' },
    { label: 'Sunflower Seeds', url: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=600&q=80' },
    { label: 'Golden Corn Kernels', url: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=600&q=80' }
  ],
  fruit: [
    { label: 'Organic Apples', url: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=600&q=80' },
    { label: 'Fresh Strawberries', url: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=600&q=80' },
    { label: 'Sun-ripened Bananas', url: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80' },
    { label: 'Juicy Oranges', url: 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?auto=format&fit=crop&w=600&q=80' }
  ],
  vegetable: [
    { label: 'Vine Tomatoes', url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80' },
    { label: 'Fresh Spinach', url: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80' },
    { label: 'Crunchy Carrots', url: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=600&q=80' },
    { label: 'Bell Peppers', url: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=600&q=80' }
  ]
};

const QUICK_TEMPLATES = [
  {
    title: 'Crisp Honeycrisp Apples',
    category: 'fruit',
    price: '160',
    unit: 'kg',
    stock: '150',
    description: 'Sweet, juicy, tree-ripened organic Honeycrisp apples with red blush.',
    image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=600&q=80',
    icon: '🍎'
  },
  {
    title: 'Vine-Ripened Cherry Tomatoes',
    category: 'vegetable',
    price: '45',
    unit: 'kg',
    stock: '200',
    description: 'Freshly harvested sweet organic vine cherry tomatoes, zero chemicals.',
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80',
    icon: '🍅'
  },
  {
    title: 'Farm-Fresh Baby Spinach',
    category: 'vegetable',
    price: '30',
    unit: 'bunch',
    stock: '300',
    description: 'Crisp organic tender baby spinach leaves picked at sunrise.',
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80',
    icon: '🥬'
  },
  {
    title: 'Crunchy Garden Carrots',
    category: 'vegetable',
    price: '50',
    unit: 'kg',
    stock: '250',
    description: 'Sweet garden-grown organic carrots packed with carotene and vitamins.',
    image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=600&q=80',
    icon: '🥕'
  },
  {
    title: 'Sweet Golden Corn',
    category: 'vegetable',
    price: '40',
    unit: 'dozen',
    stock: '180',
    description: 'Sweet golden ears of corn freshly harvested from certified organic stalks.',
    image: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=600&q=80',
    icon: '🌽'
  },
  {
    title: 'Hybrid Wheat Seeds',
    category: 'seed',
    price: '185',
    unit: 'kg',
    stock: '500',
    description: 'Certified drought-tolerant high-germination hybrid seed grain.',
    image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80',
    icon: '🌾'
  }
];

// Pre-loaded Plant Disease Samples with farmer-friendly solutions & Medicine linkages
const DISEASE_PRESETS = [
  {
    id: 'early_blight',
    name: 'Tomato Early Blight (இலைக்கருகல் நோய்)',
    tamilName: 'தக்காளி இலைக்கருகல் நோய்',
    crop: 'Tomato',
    severity: '65% Moderate',
    confidence: '98.4%',
    linkedMedicineId: 'med_mancozeb_75',
    organicMedicineId: 'med_neem_oil',
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80',
    summary: 'Dark brown spots with concentric target-board rings on older leaves. Foliage turns yellow and defoliates prematurely.',
    organicRemedy: '🌿 Mix 50ml fresh neem oil (10,000 PPM) + 1 spoon mild soap powder in 10 liters of clean water. Spray on both upper and lower leaf sides every 7 days in the early morning.',
    chemicalMedicine: '💊 Mancozeb 75% WP — Mix 2 grams per 1 liter of water (approx 30g for 1 pump/15L tank). Spray thoroughly on all plants.',
    farmerTips: [
      'Immediately pluck and burn or bury infected bottom leaves so fungal spores do not spread.',
      'Water only the soil at the roots; avoid splashing dirty water onto the foliage.',
      'Maintain 2 feet space between rows so sunlight and fresh air dry leaves quickly.'
    ]
  },
  {
    id: 'leaf_blast',
    name: 'Rice Leaf Blast (நெல் குலை நோய்)',
    tamilName: 'நெல் இலை குலை நோய்',
    crop: 'Paddy / Rice',
    severity: '78% High',
    confidence: '99.1%',
    linkedMedicineId: 'med_tricyclazole',
    organicMedicineId: 'med_panchagavya',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
    summary: 'Spindle-shaped elliptical lesions with grey/whitish center and reddish-brown margins on paddy leaves, leading to complete drying.',
    organicRemedy: '🌿 Spray 10% fermented sour buttermilk solution (1 liter sour buttermilk + 9 liters water) or raw cow dung water filtrate once a week.',
    chemicalMedicine: '💊 Tricyclazole 75% WP (Beam) — Mix 1 gram per 1 liter of water (15g per 15L spray tank). Spray at the first appearance of leaf spots.',
    farmerTips: [
      'Do not apply excessive urea or chemical nitrogen fertilizer during humid cloudy days.',
      'Keep water drained from field corners for 2 days to aerate the soil and reduce humidity.',
      'Always treat seeds with Pseudomonas fluorescens (10g/kg) before future nursery sowing.'
    ]
  },
  {
    id: 'cotton_leaf_curl',
    name: 'Cotton Leaf Curl & Whitefly (பருத்தி இலைச்சுருள்)',
    tamilName: 'பருத்தி இலைச்சுருள் & வெள்ளை ஈ தாக்குதல்',
    crop: 'Cotton',
    severity: '70% High',
    confidence: '97.2%',
    linkedMedicineId: 'med_imidacloprid',
    organicMedicineId: 'med_neem_oil',
    image: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=600&q=80',
    summary: 'Upward or downward leaf curling, thickened veins, enations on underside, transmitted by sucking whiteflies (Bemisia tabaci).',
    organicRemedy: '🌿 Spray Dashparni Ark (10-herb fermented extract) or Neem Oil 10,000 PPM @ 3ml/L with yellow sticky sticky insect traps (15 traps/acre).',
    chemicalMedicine: '💊 Imidacloprid 17.8% SL — Mix 0.5 ml per 1 liter of water (7.5 ml per 15L spray tank) targeted at leaf undersides.',
    farmerTips: [
      'Install bright yellow sticky traps along field perimeter to catch vector whiteflies.',
      'Eradicate Parthenium and weed hosts around field borders.',
      'Avoid continuous single insecticide spray; rotate chemical classes.'
    ]
  },
  {
    id: 'chilli_anthracnose',
    name: 'Chilli Anthracnose & Die-back (மிளகாய் பழ அழுகல்)',
    tamilName: 'மிளகாய் பழ அழுகல் மற்றும் நுனிக் கருகல்',
    crop: 'Chilli',
    severity: '60% Moderate',
    confidence: '96.5%',
    linkedMedicineId: 'med_mancozeb_75',
    organicMedicineId: 'med_trichoderma',
    image: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=600&q=80',
    summary: 'Circular sunken dark lesions with orange/pink fungal spore concentric rings on green and red chilli fruits, causing branch die-back.',
    organicRemedy: '🌿 Foliar spray of Trichoderma viride culture (5g/L) + Panchagavya (30ml/L) early morning before flower drop.',
    chemicalMedicine: '💊 Mancozeb 75% WP @ 2.5g/L or Azoxystrobin 23% SC @ 1ml/L during fruit set.',
    farmerTips: [
      'Collect and destroy infected mummified chilli fruits from plants and soil.',
      'Use drip irrigation instead of sprinkler to avoid wetting fruit clusters.',
      'Ensure seed treatment with Trichoderma viride (10g/kg) before nursery.'
    ]
  },
  {
    id: 'powdery_mildew',
    name: 'Powdery Mildew (சாம்பல் நோய்)',
    tamilName: 'காய்கறி & பழப் பயிர் சாம்பல் நோய்',
    crop: 'Vegetables & Fruits',
    severity: '45% Mild',
    confidence: '95.8%',
    linkedMedicineId: 'med_npk_19',
    organicMedicineId: 'med_neem_oil',
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80',
    summary: 'White talcum powder-like dusting patches covering leaves, tender shoots, and flowers, preventing photosynthesis.',
    organicRemedy: '🌿 Baking Soda Formulation: Dissolve 1 tablespoon baking soda + 1 tablespoon vegetable oil in 4 liters of water. Spray weekly.',
    chemicalMedicine: '💊 Wettable Sulphur 80% WP — Mix 2.5 grams per 1 liter of water. Spray in cool morning hours (never in hot midday sun).',
    farmerTips: [
      'Prune overcrowded branches to allow direct morning sunlight into the center of the crop.',
      'Avoid high humidity around the plants by cutting weeds underneath.',
      'Wash your pruning clippers with soap water before touching healthy neighboring crops.'
    ]
  },
  {
    id: 'sugarcane_red_rot',
    name: 'Sugarcane Red Rot (கரும்பு செவ்வழுகல்)',
    tamilName: 'கரும்பு செவ்வழுகல் நோய்',
    crop: 'Sugarcane',
    severity: '85% Critical',
    confidence: '98.9%',
    linkedMedicineId: 'med_bio_npk',
    organicMedicineId: 'med_trichoderma',
    image: 'https://images.unsplash.com/photo-1527842891421-42eec6e703ea?auto=format&fit=crop&w=600&q=80',
    summary: 'Third and fourth leaves wither from tip down; internal stem pith shows deep blood-red discoloration with white cross-patches and alcohol odor.',
    organicRemedy: '🌿 Dip sugarcane setts in Trichoderma viride slurry (20g/L) for 30 minutes before planting; apply 500kg neem cake per acre.',
    chemicalMedicine: '💊 Carbendazim 50% WP sett soaking @ 1g/L for 15 minutes before furrow placement.',
    farmerTips: [
      'Uproot and burn diseased clumps immediately; do not take ratoon crop from infected field.',
      'Ensure proper drainage to prevent waterlogging in furrows.',
      'Select disease-resistant varieties like Co 86032 or CoG 6.'
    ]
  },
  {
    id: 'banana_sigatoka',
    name: 'Banana Yellow Sigatoka (வாழை சிகடோகா இலைப்புள்ளி)',
    tamilName: 'வாழை மஞ்சள் சிகடோகா இலைப்புள்ளி நோய்',
    crop: 'Banana',
    severity: '55% Moderate',
    confidence: '97.0%',
    linkedMedicineId: 'med_mancozeb_75',
    organicMedicineId: 'med_panchagavya',
    image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80',
    summary: 'Small yellowish-green streaks parallel to leaf veins that enlarge into spindle-shaped brown spots with grey center and yellow halo.',
    organicRemedy: '🌿 Spray 3% Panchagavya + 1% Neem Oil emulsion covering both lower and upper surface of all green leaves.',
    chemicalMedicine: '💊 Propiconazole 25% EC (Tilt) @ 1 ml/L or Mancozeb 75% WP @ 2.5 g/L with mineral oil additive (10 ml/L).',
    farmerTips: [
      'De-leaf and safely dispose of severely spotted dried lower leaves.',
      'Maintain proper suckering by keeping only one follower sucker per clump.',
      'Keep drainage trenches deep (minimum 1.5 ft) to drain stagnant delta waters.'
    ]
  },
  {
    id: 'groundnut_tikka',
    name: 'Groundnut Tikka Leaf Spot (நிலக்கடலை டிக்கா நோய்)',
    tamilName: 'நிலக்கடலை டிக்கா இலைப்புள்ளி நோய்',
    crop: 'Groundnut',
    severity: '62% Moderate',
    confidence: '96.2%',
    linkedMedicineId: 'med_mancozeb_75',
    organicMedicineId: 'med_bio_npk',
    image: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=600&q=80',
    summary: 'Early and late circular dark reddish-brown to black spots with bright yellow halo causing heavy leaf shedding before pod maturation.',
    organicRemedy: '🌿 Spray fermented sour buttermilk (10%) mixed with 1% cow urine twice at 35 and 50 days after sowing.',
    chemicalMedicine: '💊 Mancozeb 75% WP @ 2g/L or Carbendazim 12% + Mancozeb 63% WP (SAAF) @ 2g/L.',
    farmerTips: [
      'Spray at first notice of lower leaf spots to save pod-filling energy.',
      'Rotate groundnut with pearl millet (Bajra) or sorghum.',
      'Incorporate gypsum @ 200 kg/acre at flowering stage for strong shell hardening.'
    ]
  },
  {
    id: 'potato_late_blight',
    name: 'Potato Late Blight (உருளைக்கிழங்கு பின் பருவ கருகல்)',
    tamilName: 'உருளைக்கிழங்கு லேட் பிளைட் கருகல்',
    crop: 'Potato',
    severity: '80% High',
    confidence: '99.3%',
    linkedMedicineId: 'med_mancozeb_75',
    organicMedicineId: 'med_neem_oil',
    image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80',
    summary: 'Water-soaked irregular lesions on leaf edges that rapidly turn dark brown/black with white downy fungal growth on underside in foggy weather.',
    organicRemedy: '🌿 Bio-fungicide spray of Pseudomonas fluorescens (10g/L) + Neem seed kernel extract (5%).',
    chemicalMedicine: '💊 Metalaxyl 8% + Mancozeb 64% WP (Ridomil MZ) @ 2.5g/L or Cymoxanil + Mancozeb @ 2g/L.',
    farmerTips: [
      'Spray prophylactic protectant before fog/frost spells in hill tracks.',
      'Earthing up should be thick so fungal spores washed by rain do not reach tubers.',
      'Cut foliage 10 days before harvesting to harden tuber skin.'
    ]
  },
  {
    id: 'citrus_canker',
    name: 'Citrus Bacterial Canker (எலுமிச்சை திட்டு நோய்)',
    tamilName: 'எலுமிச்சை பாக்டீரியல் கேன்கர் நோய்',
    crop: 'Citrus / Lemon',
    severity: '50% Moderate',
    confidence: '95.4%',
    linkedMedicineId: 'med_chelated_micronutrient',
    organicMedicineId: 'med_neem_oil',
    image: 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?auto=format&fit=crop&w=600&q=80',
    summary: 'Raised corky blister-like lesions with yellow halos on leaves, twigs, and lemon rinds, spread by citrus leaf miner larvae and rain splashes.',
    organicRemedy: '🌿 Spray Neem Oil 10,000 PPM @ 4ml/L to control leaf miners + Copper Oxychloride (COC) @ 2.5g/L.',
    chemicalMedicine: '💊 Streptocycline (90% Streptomycin sulphate) @ 1 gram in 10 liters water + Copper Oxychloride @ 30 grams per 10L tank.',
    farmerTips: [
      'Prune and burn canker-infected twigs before monsoon rains begin.',
      'Control citrus leaf miner during new flush emergence with bio-pesticides.',
      'Spray windbreak trees around orchard borders.'
    ]
  },
  {
    id: 'maize_armyworm',
    name: 'Maize Fall Armyworm (மக்காச்சோள படைப்புழு)',
    tamilName: 'மக்காச்சோள படைப்புழு தாக்குதல்',
    crop: 'Maize / Corn',
    severity: '72% High',
    confidence: '98.1%',
    linkedMedicineId: 'med_imidacloprid',
    organicMedicineId: 'med_neem_oil',
    image: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=600&q=80',
    summary: 'Severe whorl leaf skeletonization, ragged shot-holes, and sawdust-like larval frass packed inside central leaf whorl.',
    organicRemedy: '🌿 Apply dry river sand or wood ash + lime powder (9:1 ratio) directly into central whorl @ 15-20 days after emergence, or Bacillus thuringiensis (Bt) @ 2g/L.',
    chemicalMedicine: '💊 Emamectin Benzoate 5% SG @ 0.4 g/L or Chlorantraniliprole 18.5% SC @ 0.4 ml/L targeted straight into the leaf whorl.',
    farmerTips: [
      'Install pheromone traps @ 5 traps/acre for adult moth monitoring.',
      'Early detection at 10-20 DAS is critical before larvae enter deep whorl.',
      'Intercrop maize with cowpea or pulses to host natural predatory wasps.'
    ]
  },
  {
    id: 'healthy_leaf',
    name: 'Certified Healthy Crop (ஆரோக்கியமான பயிர்)',
    tamilName: 'ஆரோக்கியமான பயிர் - நோய் இல்லை',
    crop: 'All Field Crops',
    severity: '0% Clean',
    confidence: '99.8%',
    linkedMedicineId: 'med_npk_19',
    organicMedicineId: 'med_panchagavya',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80',
    summary: 'Vibrant green chlorophyll pigment with strong cellular integrity and zero active fungal, bacterial, or pest infestation detected.',
    organicRemedy: '🌿 Continue routine maintenance with Jeevamrutham (200L/acre via irrigation) or Panchagavya (3% spray) every 15 days to maximize immunity.',
    chemicalMedicine: '💊 No chemical pesticide required! Crop is in peak physiological health.',
    farmerTips: [
      'Keep up regular inspection of leaf undersides once every 3 days.',
      'Maintain steady drip or furrow irrigation schedule according to weather.',
      'Mulch the base with dried straw to preserve soil microbes and prevent weed growth.'
    ]
  }
];

// Meteorological coordinate mapping for true real-time satellite telemetry
const WEATHER_LOCATIONS = {
  'My Farm Location (GPS)': {
    name: 'My Farm Location (GPS)',
    label: '📍 My Farm Location (GPS Default)',
    lat: 11.2189,
    lon: 78.1674,
    region: 'Namakkal Agro Microclimate',
    soilType: 'Red Loam Soil',
    defaultTemp: 30,
    defaultFeelsLike: 33,
    defaultCondition: 'sunny',
    defaultHumidity: 62,
    defaultRainChance: 15,
    defaultWind: '14 km/h SW',
    defaultAdvisory: 'Microclimate sensor active in Namakkal. Favorable for morning agricultural operations.'
  },
  Namakkal: {
    name: 'Namakkal',
    label: '📍 Namakkal (Agro Gateway)',
    lat: 11.2189,
    lon: 78.1674,
    region: 'Namakkal Agro Gateway',
    soilType: 'Red Loam Soil',
    defaultTemp: 30,
    defaultFeelsLike: 33,
    defaultCondition: 'sunny',
    defaultHumidity: 62,
    defaultRainChance: 15,
    defaultWind: '14 km/h SW',
    defaultAdvisory: 'Favorable solar radiation over Namakkal agro farms. Excellent conditions for harvest and sun-drying.'
  },
  Chidambaram: {
    name: 'Chidambaram',
    label: '📍 Chidambaram (Delta Basin)',
    lat: 11.3992,
    lon: 79.6935,
    region: 'Cauvery Delta Basin',
    soilType: 'Alluvial Soil',
    defaultTemp: 30,
    defaultFeelsLike: 33,
    defaultCondition: 'cloudy',
    defaultHumidity: 68,
    defaultRainChance: 25,
    defaultWind: '15 km/h S',
    defaultAdvisory: 'Partly cloudy sky over Cauvery delta. Favorable for morning transplanting and nursery watering. Moderate humidity.'
  },
  Thanjavur: {
    name: 'Thanjavur',
    label: '📍 Thanjavur (Paddy Granary)',
    lat: 10.7870,
    lon: 79.1378,
    region: 'Cauvery Delta Rice Bowl',
    soilType: 'Alluvial Soil',
    defaultTemp: 31,
    defaultFeelsLike: 35,
    defaultCondition: 'rainy',
    defaultHumidity: 82,
    defaultRainChance: 65,
    defaultWind: '18 km/h SW',
    defaultAdvisory: 'Rain alerts active! Delay pesticide and fertilizer spraying. Clear drainage channels around paddy fields.'
  },
  Coimbatore: {
    name: 'Coimbatore',
    label: '📍 Coimbatore (Kongu Agro)',
    lat: 11.0168,
    lon: 76.9558,
    region: 'Kongu Agro Plateau',
    soilType: 'Black Soil',
    defaultTemp: 26,
    defaultFeelsLike: 27,
    defaultCondition: 'cloudy',
    defaultHumidity: 72,
    defaultRainChance: 20,
    defaultWind: '12 km/h NW',
    defaultAdvisory: 'Cool morning breeze. Good day for weed removal and field cultivation. Monitor for fungal leaf spots.'
  },
  Madurai: {
    name: 'Madurai',
    label: '📍 Madurai (Vaigai Basin)',
    lat: 9.9252,
    lon: 78.1198,
    region: 'Vaigai Basin',
    soilType: 'Red Soil',
    defaultTemp: 32,
    defaultFeelsLike: 35,
    defaultCondition: 'sunny',
    defaultHumidity: 60,
    defaultRainChance: 15,
    defaultWind: '12 km/h S',
    defaultAdvisory: 'Warm sunny weather. Ideal for jasmine and vegetable harvesting.'
  },
  Tiruchirappalli: {
    name: 'Tiruchirappalli',
    label: '📍 Trichy (Delta Junction)',
    lat: 10.7905,
    lon: 78.7047,
    region: 'Cauvery Central Junction',
    soilType: 'Alluvial Soil',
    defaultTemp: 31,
    defaultFeelsLike: 34,
    defaultCondition: 'cloudy',
    defaultHumidity: 65,
    defaultRainChance: 20,
    defaultWind: '14 km/h SE',
    defaultAdvisory: 'Favorable delta climate. Great day for intercultural field operations.'
  },
  Salem: {
    name: 'Salem',
    label: '📍 Salem (Mango & Tapioca)',
    lat: 11.6643,
    lon: 78.1460,
    region: 'Shevaroy Agro Foothills',
    soilType: 'Red Loam Soil',
    defaultTemp: 29,
    defaultFeelsLike: 31,
    defaultCondition: 'sunny',
    defaultHumidity: 62,
    defaultRainChance: 10,
    defaultWind: '10 km/h W',
    defaultAdvisory: 'Stable warm temperatures. Favorable for tapioca, mango, and fruit harvesting.'
  },
  Tirunelveli: {
    name: 'Tirunelveli',
    label: '📍 Tirunelveli (Thamirabarani)',
    lat: 8.7139,
    lon: 77.7567,
    region: 'Thamirabarani River Basin',
    soilType: 'Alluvial Red',
    defaultTemp: 30,
    defaultFeelsLike: 33,
    defaultCondition: 'sunny',
    defaultHumidity: 66,
    defaultRainChance: 15,
    defaultWind: '15 km/h E',
    defaultAdvisory: 'Good river water availability and moderate humidity. Suitable for paddy transplanting.'
  },
  Erode: {
    name: 'Erode',
    label: '📍 Erode (Turmeric & Spices)',
    lat: 11.3410,
    lon: 77.7172,
    region: 'Bhavani River Basin',
    soilType: 'Black & Red Loam',
    defaultTemp: 28,
    defaultFeelsLike: 30,
    defaultCondition: 'cloudy',
    defaultHumidity: 64,
    defaultRainChance: 15,
    defaultWind: '11 km/h SW',
    defaultAdvisory: 'Optimal microclimate conditions for turmeric, banana, and sugarcane.'
  },
  Mandya: {
    name: 'Mandya',
    label: '📍 Mandya (Sugarcane Basin)',
    lat: 12.5244,
    lon: 76.8958,
    region: 'Cauvery Sugarcane Basin',
    soilType: 'Red Loam Soil',
    defaultTemp: 27,
    defaultFeelsLike: 28,
    defaultCondition: 'sunny',
    defaultHumidity: 58,
    defaultRainChance: 10,
    defaultWind: '11 km/h E',
    defaultAdvisory: 'Bright sunny conditions. Excellent for sugarcane irrigation and drying harvested grains in open yards.'
  },
  Guntur: {
    name: 'Guntur',
    label: '📍 Guntur (Chilli & Cotton)',
    lat: 16.3067,
    lon: 80.4365,
    region: 'Krishna Agro Basin',
    soilType: 'Black Cotton Soil',
    defaultTemp: 33,
    defaultFeelsLike: 36,
    defaultCondition: 'sunny',
    defaultHumidity: 58,
    defaultRainChance: 10,
    defaultWind: '13 km/h SE',
    defaultAdvisory: 'Dry and hot conditions suitable for chilli pod picking and open sun-drying.'
  },
  Nashik: {
    name: 'Nashik',
    label: '📍 Nashik (Grape & Onion Hub)',
    lat: 19.9975,
    lon: 73.7898,
    region: 'Godavari Basin Agro',
    soilType: 'Black Soil',
    defaultTemp: 25,
    defaultFeelsLike: 26,
    defaultCondition: 'cloudy',
    defaultHumidity: 70,
    defaultRainChance: 20,
    defaultWind: '10 km/h NW',
    defaultAdvisory: 'Pleasant temperatures favorable for grape vineyards and onion nursery maintenance.'
  },
  Punjab: {
    name: 'Punjab',
    label: '📍 Punjab (Wheat Bowl)',
    lat: 30.9010,
    lon: 75.8573,
    region: 'Indo-Gangetic Wheat Plains',
    soilType: 'Alluvial Loam',
    defaultTemp: 32,
    defaultFeelsLike: 35,
    defaultCondition: 'sunny',
    defaultHumidity: 50,
    defaultRainChance: 15,
    defaultWind: '14 km/h NW',
    defaultAdvisory: 'Favorable sunny conditions across Punjab plains. Suitable for wheat field preparation and sowing.'
  },
  Haryana: {
    name: 'Haryana',
    label: '📍 Haryana (Basmati Granary)',
    lat: 29.6857,
    lon: 76.9905,
    region: 'Gharaunda Agro Belt',
    soilType: 'Alluvial Loam',
    defaultTemp: 31,
    defaultFeelsLike: 34,
    defaultCondition: 'sunny',
    defaultHumidity: 52,
    defaultRainChance: 10,
    defaultWind: '12 km/h NW',
    defaultAdvisory: 'Favorable conditions for basmati paddy nursery irrigation and land preparation.'
  }
};

// Standard WMO Weather Code to Agri Condition Parser
const parseWmoWeather = (code) => {
  if (code === 0) return { condition: 'sunny', label: 'Clear Sky', icon: '☀️' };
  if (code === 1) return { condition: 'sunny', label: 'Mainly Clear Sky', icon: '🌤️' };
  if (code === 2) return { condition: 'cloudy', label: 'Partly Cloudy', icon: '⛅' };
  if (code === 3) return { condition: 'cloudy', label: 'Overcast Cumulus', icon: '☁️' };
  if (code === 45 || code === 48) return { condition: 'mist', label: 'Morning Fog & Dew', icon: '🌫️' };
  if (code >= 51 && code <= 55) return { condition: 'rainy', label: 'Light Drizzle', icon: '🌦️' };
  if (code >= 61 && code <= 65) return { condition: 'rainy', label: 'Rain Showers', icon: '🌧️' };
  if (code >= 80 && code <= 82) return { condition: 'rainy', label: 'Heavy Downpour', icon: '🌧️' };
  if (code >= 95) return { condition: 'stormy', label: 'Thunderstorm Warning', icon: '⛈️' };
  return { condition: 'cloudy', label: 'Scattered Clouds', icon: '⛅' };
};

// Compass heading converter
const getWindDirection = (deg) => {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return directions[Math.round((deg % 360) / 45) % 8];
};

// Dynamically compute authentic agricultural guidance from real meteorological measurements
const generateAgriGuidance = ({ temp, humidity, rainChance, windSpeed, conditionLabel, city }) => {
  if (temp === null || temp === undefined || humidity === null || humidity === undefined) {
    return 'Live weather data unavailable. Microclimate field guidance paused until verified satellite sync is re-established.';
  }

  const parts = [];

  if (rainChance !== null && rainChance !== undefined) {
    if (rainChance >= 60) {
      parts.push(`⛈️ Active precipitation alert (${rainChance}% rain probability in ${city}). Suspend all pesticide spraying and foliar top-dressing. Open farm bund drainage trenches to prevent standing water in nurseries.`);
    } else if (rainChance >= 30) {
      parts.push(`🌦️ Moderate precipitation window (${rainChance}% chance). Favorable for manual seedling transplanting and bed preparation; hold off deep irrigation.`);
    } else {
      parts.push(`☀️ Stable clear weather (${rainChance}% precipitation risk). Ideal window for routine intercultural operations, drip/furrow irrigation, pesticide application, and open yard grain drying.`);
    }
  }

  if (windSpeed > 22) {
    parts.push(`💨 High wind gusts (${windSpeed} km/h). Suspend high-pressure sprayers to prevent chemical drift; reinforce nursery shade nets and provide bamboo stakes for tall crops.`);
  } else {
    parts.push(`🍃 Mild wind velocity (${windSpeed} km/h) safe for spraying operations.`);
  }

  if (temp >= 35) {
    parts.push(`🌡️ Daytime thermal peak (${temp}°C). Irrigate during twilight or dawn hours to protect roots from thermal transpiration stress.`);
  } else if (temp <= 18) {
    parts.push(`❄️ Cool thermal regime (${temp}°C). Watch out for sluggish seed germination.`);
  }

  if (humidity >= 80) {
    parts.push(`💧 High relative humidity (${humidity}%). Enhanced risk of foliar fungal pathogens (leaf blast/early blight); inspect lower canopy foliage daily.`);
  } else if (humidity <= 40) {
    parts.push(`🌵 Dry ambient air (${humidity}%). Monitor topsoil moisture closely for shallow-rooted crops.`);
  }

  return parts.join(' ');
};

/* ─────────────────────────────────────────────────────────────
   3D Real-Time Soil & Microclimate Digital Twin Component
───────────────────────────────────────────────────────────── */
function SoilDigitalTwin3D({ onTriggerDrip }) {
  const canvasRef = useRef(null);
  const [dripActive, setDripActive] = useState(false);
  const [moisture, setMoisture] = useState(74);

  const handleDripToggle = () => {
    setDripActive(true);
    setMoisture(85);
    if (onTriggerDrip) onTriggerDrip();
    setTimeout(() => setDripActive(false), 6000);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    // Percolating water droplets
    const drops = Array.from({ length: 30 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * (canvas.height * 0.4),
      speed: Math.random() * 1.5 + 0.8,
      alpha: Math.random() * 0.6 + 0.3
    }));

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Soil Layers Background
      // Layer 1: Surface Humus (Top 30%)
      const g1 = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.3);
      g1.addColorStop(0, '#2e1c0c');
      g1.addColorStop(1, '#3d2612');
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, canvas.width, canvas.height * 0.3);

      // Layer 2: Rich Loam Root Horizon (30% - 70%)
      const g2 = ctx.createLinearGradient(0, canvas.height * 0.3, 0, canvas.height * 0.7);
      g2.addColorStop(0, '#4a2f16');
      g2.addColorStop(1, '#5c3a1b');
      ctx.fillStyle = g2;
      ctx.fillRect(0, canvas.height * 0.3, canvas.width, canvas.height * 0.4);

      // Layer 3: Subsoil Minerals (70% - 100%)
      const g3 = ctx.createLinearGradient(0, canvas.height * 0.7, 0, canvas.height);
      g3.addColorStop(0, '#6e4722');
      g3.addColorStop(1, '#3b2410');
      ctx.fillStyle = g3;
      ctx.fillRect(0, canvas.height * 0.7, canvas.width, canvas.height * 0.3);

      // Draw Root Strands in 3D Perspective
      ctx.strokeStyle = 'rgba(254, 240, 138, 0.4)';
      ctx.lineWidth = 1.5;
      const roots = [30, 80, 140, 190, 240];
      roots.forEach(rx => {
        ctx.beginPath();
        ctx.moveTo(rx, 0);
        ctx.bezierCurveTo(rx - 15, 40, rx + 20, 80, rx + (Math.sin(Date.now() * 0.001) * 5), 110);
        ctx.stroke();
      });

      // Draw Percolating Moisture
      drops.forEach(d => {
        d.y += d.speed * (dripActive ? 2.5 : 1);
        if (d.y > canvas.height) {
          d.y = 0;
          d.x = Math.random() * canvas.width;
        }
        ctx.fillStyle = dripActive ? `rgba(56, 189, 248, ${d.alpha})` : `rgba(74, 222, 128, ${d.alpha})`;
        ctx.beginPath();
        ctx.arc(d.x, d.y, 2, 0, Math.PI * 2);
        ctx.fill();
      });

      if (document.visibilityState === 'visible') {
        animId = requestAnimationFrame(render);
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        cancelAnimationFrame(animId);
        animId = requestAnimationFrame(render);
      } else {
        cancelAnimationFrame(animId);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    render();
    return () => {
      cancelAnimationFrame(animId);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [dripActive]);

  const [showExplainer, setShowExplainer] = useState(false);

  return (
    <div style={{
      background: 'linear-gradient(145deg, rgba(20, 26, 18, 0.95), rgba(10, 16, 12, 0.98))',
      border: '1.5px solid rgba(74, 222, 128, 0.4)',
      borderRadius: '20px',
      padding: '22px',
      boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Simulation Notice Banner */}
      <div style={{
        background: 'rgba(245, 158, 11, 0.12)',
        border: '1px solid rgba(245, 158, 11, 0.35)',
        borderRadius: '8px',
        padding: '6px 12px',
        marginBottom: '14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '11px',
        color: '#fef08a'
      }}>
        <span>📡 <strong>SIMULATION MODE</strong> — Educational Subsoil Model (No physical IoT probe connected)</span>
        <button
          onClick={() => setShowExplainer(true)}
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: '#fff',
            borderRadius: '6px',
            padding: '2px 8px',
            fontSize: '10.5px',
            fontWeight: '700',
            cursor: 'pointer'
          }}
        >
          What is this?
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'rgba(74, 222, 128, 0.15)',
            border: '1px solid rgba(74, 222, 128, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Sprout size={22} color="#4ade80" />
          </div>
          <div>
            <h3 style={{ margin: 0, color: '#effbe7', fontSize: '16px', fontWeight: '800' }}>
              3D Real-Time Soil Digital Twin
            </h3>
            <p style={{ margin: '2px 0 0 0', color: '#86efac', fontSize: '11px', fontWeight: '700' }}>
              Subsoil Horizon • Moisture Percolation Model
            </p>
          </div>
        </div>

        <button
          onClick={handleDripToggle}
          disabled={dripActive}
          style={{
            background: dripActive ? 'linear-gradient(135deg, #0284c7, #0369a1)' : 'rgba(74, 222, 128, 0.2)',
            border: '1px solid rgba(74, 222, 128, 0.5)',
            color: '#effbe7',
            padding: '7px 16px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '800',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Droplets size={14} color="#38bdf8" />
          <span>{dripActive ? '💧 Drip Valve Active...' : 'Simulate Targeted Bio-Drip'}</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', alignItems: 'center' }}>
        <div style={{ height: '140px', borderRadius: '14px', overflow: 'hidden', border: '1px solid rgba(74, 222, 128, 0.2)', position: 'relative' }}>
          <canvas ref={canvasRef} width={280} height={140} style={{ width: '100%', height: '100%' }} />
          <div style={{
            position: 'absolute',
            bottom: '8px',
            left: '10px',
            fontSize: '10px',
            color: '#dcfce7',
            fontWeight: '700',
            background: 'rgba(0,0,0,0.6)',
            padding: '2px 8px',
            borderRadius: '6px'
          }}>
            3D Soil Strata: 0-40cm Depth
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#a3c2b0', fontSize: '12px' }}>Simulated Moisture (0-20cm)</span>
            <span style={{ color: '#38bdf8', fontWeight: '800', fontSize: '15px' }}>{moisture}% (Simulated)</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#a3c2b0', fontSize: '12px' }}>Soil Temperature</span>
            <span style={{ color: '#fbbf24', fontWeight: '800', fontSize: '14px' }}>22.4°C Microbial Safe</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#a3c2b0', fontSize: '12px' }}>NPK Horizon Benchmark</span>
            <span style={{ color: '#4ade80', fontWeight: '800', fontSize: '13px' }}>N: 82% • P: 76% • K: 88%</span>
          </div>
        </div>
      </div>

      {/* What is this Modal */}
      {showExplainer && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 99999,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(16px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }} onClick={() => setShowExplainer(false)}>
          <div style={{
            maxWidth: '520px',
            width: '100%',
            background: 'linear-gradient(145deg, #092b27, #061917)',
            border: '1.5px solid #4ade80',
            borderRadius: '20px',
            padding: '24px',
            color: '#effbe7'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', color: '#86efac' }}>🌱 What is the 3D Soil Digital Twin?</h3>
              <button onClick={() => setShowExplainer(false)} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '18px' }}>✕</button>
            </div>
            <div style={{ fontSize: '12.5px', lineHeight: '1.5', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <p><strong>🎯 Purpose:</strong> Helps farmers understand how subterranean moisture and nutrients disperse through root horizons during drip irrigation.</p>
              <p><strong>🖱️ How to use:</strong> Click "Simulate Targeted Bio-Drip" to trigger water droplet percolation through the topsoil humus layer into the root zone.</p>
              <p><strong>👁️ What you see:</strong> The top brown layer is organic humus (0-12cm), the middle layer is the active crop root horizon (12-28cm), and the bottom layer is mineral subsoil (28-40cm).</p>
              <p><strong>🚜 Farmer Benefit:</strong> Prevents over-watering and nutrient leaching below the root zone, saving water and fertilizer costs.</p>
              <p style={{ background: 'rgba(245, 158, 11, 0.15)', padding: '8px', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                <strong>⚠️ Data Source:</strong> This component is an <em>Educational Computational Simulation</em>. No physical subsoil IoT probe hardware is currently installed on this farm.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Real-Time Delivery Summon Beacon Modal
───────────────────────────────────────────────────────────── */
function DeliverySummonModal({ isOpen, orderId, onClose, onDriverConfirmed }) {
  const [stage, setStage] = useState('searching'); // 'searching' | 'assigned'
  const [submittingDispatch, setSubmittingDispatch] = useState(false);
  const [dispatchError, setDispatchError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setStage('searching');
    setDispatchError('');
    const timer = setTimeout(() => {
      setStage('assigned');
    }, 1800);
    return () => clearTimeout(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirmDispatch = async () => {
    setSubmittingDispatch(true);
    setDispatchError('');
    try {
      if (orderId) {
        await orderAPI.confirmDispatchSignal(orderId, {
          driverName: 'David Swift',
          vehicleNumber: 'KA-04-EA-2026'
        });
      }
      const driver = { name: 'David Swift', vehicle: 'KA-04-EA-2026', eta: '6 Minutes' };
      if (onDriverConfirmed) onDriverConfirmed(driver);
      onClose();
    } catch (err) {
      console.error('Dispatch signal error:', err);
      setDispatchError(err.response?.data?.message || 'Failed to dispatch order. Please verify connectivity.');
    } finally {
      setSubmittingDispatch(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      background: 'rgba(2, 10, 8, 0.88)',
      backdropFilter: 'blur(20px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }} onClick={onClose}>
      <div style={{
        maxWidth: '500px',
        width: '100%',
        background: 'linear-gradient(145deg, rgba(8, 28, 22, 0.98), rgba(4, 16, 13, 0.99))',
        border: '1.5px solid rgba(251, 191, 36, 0.5)',
        borderRadius: '24px',
        padding: '28px',
        boxShadow: '0 25px 60px rgba(0,0,0,0.8), 0 0 35px rgba(251,191,36,0.25)',
        textAlign: 'center'
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Radio size={18} color="#fbbf24" />
            <h3 style={{ margin: 0, color: '#effbe7', fontSize: '17px', fontWeight: '800' }}>
              Real-Time Delivery Dispatch Summon
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {stage === 'searching' ? (
          <div style={{ padding: '30px 10px' }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'rgba(251, 191, 36, 0.15)',
              border: '2px solid #fbbf24',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              animation: 'pulse 1.2s infinite'
            }}>
              <Truck size={36} color="#fbbf24" />
            </div>
            <h4 style={{ color: '#effbe7', fontSize: '18px', margin: '0 0 8px 0' }}>
              Pinging Regional Logistics Fleet...
            </h4>
            <p style={{ color: '#a3c2b0', fontSize: '13px', margin: 0 }}>
              Triangulating nearest verified cold-chain delivery vehicle near your farm.
            </p>
          </div>
        ) : (
          <div style={{ padding: '20px 10px' }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              boxShadow: '0 0 30px #10b981'
            }}>
              <Check size={42} color="#fff" />
            </div>
            <h4 style={{ color: '#86efac', fontSize: '20px', fontWeight: '900', margin: '0 0 6px 0' }}>
              Partner Driver Dispatched!
            </h4>
            <p style={{ color: '#effbe7', fontSize: '14px', fontWeight: '700', margin: '0 0 16px 0' }}>
              Driver David Swift (Vehicle: KA-04-EA-2026)
            </p>
            <div style={{
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '12px',
              padding: '12px',
              fontSize: '12.5px',
              color: '#dcfce7',
              marginBottom: '16px'
            }}>
              ⏱️ Estimated Arrival at Farm Gate: <strong>6 Minutes</strong> • ❄️ Cold-Chain Ready
            </div>

            {dispatchError && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid #ef4444',
                borderRadius: '8px',
                padding: '8px 12px',
                color: '#fca5a5',
                fontSize: '12px',
                marginBottom: '14px'
              }}>
                ⚠️ {dispatchError}
              </div>
            )}

            <button
              onClick={handleConfirmDispatch}
              disabled={submittingDispatch}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #16a34a, #15803d)',
                border: 'none',
                color: '#fff',
                padding: '12px',
                borderRadius: '12px',
                fontWeight: '800',
                cursor: 'pointer'
              }}
            >
              {submittingDispatch ? 'Confirming Dispatch Signal...' : 'Confirm Dispatch Signal'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function FarmerPortal({ onLogout }) {
  const { user, logout, showToast, updateUserProfile, updateUserLocation } = useAuth();
  const { t } = useLanguage();
  const [farmerProducts, setFarmerProducts] = useState([]);
  const [incomingOrders, setIncomingOrders] = useState([]);
  
  // Navigation State
  // 'home' | 'before_cultivation' | 'after_cultivation' | 'products' | 'orders' | 'market_prices' | 'disease_detection' | 'profile' | 'settings'
  const [activeNav, setActiveNav] = useState('home');
  const [cultivationStage, setCultivationStage] = useState('before'); // 'before' | 'after'
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

  // Real Live Weather State (Fetched from High-Precision Satellite Telemetry)
  const [weatherCondition, setWeatherCondition] = useState('cloudy');
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherMode, setWeatherMode] = useState('live'); // 'live' | 'simulated'
  const [weatherData, setWeatherData] = useState({
    temp: null,
    feelsLike: null,
    condition: 'cloudy',
    conditionLabel: 'Connecting Telemetry...',
    icon: '🛰️',
    humidity: null,
    rainChance: null,
    peakRainChance: null,
    todayRainMm: null,
    wind: '--',
    windSpeed: null,
    windDirection: '',
    pressure: null,
    uvIndex: null,
    uvMax: null,
    dewPoint: null,
    advisory: 'Syncing live microclimate telemetry for your farm coordinates...',
    hourly: [],
    daily: [],
    lastUpdated: 'Connecting...',
    isLive: false,
    isCached: false,
    dataSource: 'pending',
    error: null
  });

  const [selectedCity, setSelectedCity] = useState('My Farm Location (GPS)');
  const [customLocations, setCustomLocations] = useState([]);
  const [isSearchingCity, setIsSearchingCity] = useState(false);
  const [citySearchQuery, setCitySearchQuery] = useState('');
  const [citySearchResults, setCitySearchResults] = useState([]);
  const [searchingLoading, setSearchingLoading] = useState(false);

  // Fetch real, true meteorological predictions from Open-Meteo API with backend proxy fallback
  const fetchRealForecast = async (cityName = selectedCity, customLat = null, customLon = null) => {
    setWeatherLoading(true);
    try {
      const locInfo = customLocations.find(l => l.name === cityName) || WEATHER_LOCATIONS[cityName] || WEATHER_LOCATIONS['My Farm Location (GPS)'];
      const lat = customLat !== null ? Number(customLat) : Number(locInfo?.lat || 11.2189);
      const lon = customLon !== null ? Number(customLon) : Number(locInfo?.lon || 78.1674);

      if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
        throw new Error('Invalid geographical coordinates for weather station');
      }

      let data = null;
      let isFromBackendCache = false;

      // 1. Attempt direct Open-Meteo API with 8-second timeout
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure,uv_index&hourly=temperature_2m,precipitation_probability,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,uv_index_max&timezone=auto`;
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (res.ok) {
          data = await res.json();
        }
      } catch (directErr) {
        console.warn('Direct Open-Meteo ping unverified, routing through backend satellite proxy:', directErr.message);
      }

      // 2. Fallback: Query backend server proxy (/api/weather/forecast)
      if (!data) {
        try {
          const proxyRes = await weatherAPI.getForecast({ latitude: lat, longitude: lon, cityName });
          if (proxyRes.data && proxyRes.data.data) {
            data = proxyRes.data.data;
            isFromBackendCache = Boolean(proxyRes.data.isCached);
          }
        } catch (proxyErr) {
          console.warn('Backend weather proxy unavailable:', proxyErr.message);
        }
      }

      if (!data || !data.current) {
        throw new Error('Live weather data unavailable');
      }

      const current = data.current || {};
      const wmo = parseWmoWeather(current.weather_code);
      const windDir = getWindDirection(current.wind_direction_10m ?? 180);
      const windSpeed = Math.round(current.wind_speed_10m ?? 14);
      const temp = Math.round(current.temperature_2m);
      const feelsLike = Math.round(current.apparent_temperature ?? temp);
      const humidity = Math.round(current.relative_humidity_2m);
      const uvIndex = current.uv_index !== undefined ? Number(current.uv_index.toFixed(1)) : 0;
      const pressure = Math.round(current.surface_pressure ?? 1009);

      // Hourly predictive timeline (next 12 hours starting from current local hour)
      const times = data.hourly?.time || [];
      const temps = data.hourly?.temperature_2m || [];
      const rainProbs = data.hourly?.precipitation_probability || [];
      const codes = data.hourly?.weather_code || [];

      const now = new Date();
      const pad = (n) => String(n).padStart(2, '0');
      const currentIsoPrefix = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:00`;
      let startIdx = times.findIndex(t => t === currentIsoPrefix || t.startsWith(currentIsoPrefix.slice(0, 13)));
      if (startIdx === -1) {
        const nowMs = Date.now();
        startIdx = times.findIndex(t => new Date(t).getTime() >= nowMs - 1800000);
        if (startIdx === -1) startIdx = 0;
      }

      const hourlyList = [];
      for (let i = startIdx; i < Math.min(startIdx + 12, times.length); i++) {
        const d = new Date(times[i]);
        const hourLabel = i === startIdx ? 'Now' : d.toLocaleTimeString([], { hour: 'numeric', hour12: true });
        const hWmo = parseWmoWeather(codes[i]);
        hourlyList.push({
          time: hourLabel,
          temp: Math.round(temps[i]),
          rainProb: rainProbs[i] ?? 0,
          condition: hWmo.condition,
          conditionLabel: hWmo.label,
          icon: hWmo.icon
        });
      }

      // 5-Day Agriculture Sowing Forecast
      const dailyList = [];
      const dTimes = data.daily?.time || [];
      for (let i = 0; i < Math.min(5, dTimes.length); i++) {
        const d = new Date(dTimes[i]);
        const dayLabel = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString([], { weekday: 'short' });
        const dWmo = parseWmoWeather(data.daily?.weather_code?.[i]);
        const rainAmount = data.daily?.precipitation_sum?.[i] !== undefined
          ? Number(data.daily.precipitation_sum[i]).toFixed(1)
          : '0.0';
        dailyList.push({
          day: dayLabel,
          date: d.toLocaleDateString([], { month: 'short', day: 'numeric' }),
          maxTemp: Math.round(data.daily?.temperature_2m_max?.[i] ?? temp + 2),
          minTemp: Math.round(data.daily?.temperature_2m_min?.[i] ?? temp - 3),
          rainProb: data.daily?.precipitation_probability_max?.[i] ?? 0,
          rainAmount,
          icon: dWmo.icon,
          label: dWmo.label
        });
      }

      // Current hour precipitation probability vs day's maximum peak probability
      const currentHourRainProb = hourlyList[0]?.rainProb ?? 0;
      const peakRainChance = data.daily?.precipitation_probability_max?.[0] ?? currentHourRainProb;
      const todayRainMm = data.daily?.precipitation_sum?.[0] !== undefined
        ? Number(data.daily.precipitation_sum[0]).toFixed(1)
        : '0.0';

      // Dynamically compute scientifically sound field guidance
      const guidance = generateAgriGuidance({
        temp,
        humidity,
        rainChance: currentHourRainProb,
        windSpeed,
        conditionLabel: wmo.label,
        city: locInfo?.name || cityName
      });

      const updated = {
        temp,
        feelsLike,
        condition: wmo.condition,
        conditionLabel: wmo.label,
        icon: wmo.icon,
        humidity,
        rainChance: currentHourRainProb,
        peakRainChance,
        todayRainMm,
        wind: `${windSpeed} km/h ${windDir}`,
        windSpeed,
        windDirection: windDir,
        pressure,
        uvIndex,
        uvMax: data.daily?.uv_index_max?.[0] ?? uvIndex,
        dewPoint: Math.round(temp - ((100 - humidity) / 5)),
        advisory: guidance,
        hourly: hourlyList,
        daily: dailyList,
        lastUpdated: isFromBackendCache ? 'Cached weather data' : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isLive: !isFromBackendCache,
        isCached: isFromBackendCache,
        dataSource: isFromBackendCache ? 'cached' : 'live',
        error: null
      };

      setWeatherData(updated);
      setWeatherCondition(wmo.condition);
      setWeatherMode('live');
    } catch (err) {
      console.warn('Real weather telemetry fetch error:', err);
      // DO NOT fabricate fake 30°C or 68% humidity. Keep values honest.
      setWeatherData({
        temp: null,
        feelsLike: null,
        condition: 'cloudy',
        conditionLabel: 'Live weather data unavailable',
        icon: '⚠️',
        humidity: null,
        rainChance: null,
        peakRainChance: null,
        todayRainMm: null,
        wind: '--',
        windSpeed: null,
        windDirection: '',
        pressure: null,
        uvIndex: null,
        uvMax: null,
        dewPoint: null,
        advisory: 'Live weather data unavailable. Microclimate field guidance paused until verified satellite sync is re-established.',
        hourly: [],
        daily: [],
        lastUpdated: 'Unavailable',
        isLive: false,
        isCached: false,
        dataSource: 'unavailable',
        error: 'Live weather data unavailable'
      });
      setWeatherMode('live');
    } finally {
      setWeatherLoading(false);
    }
  };

  // Farmer Live GPS Auto-Detection (Default on Launch & Manual Trigger)
  const detectCurrentGpsLocation = (isSilent = false) => {
    if (!navigator.geolocation) {
      if (!isSilent) showToast('Geolocation is not supported by your browser', 'warning');
      fetchRealForecast(selectedCity);
      return;
    }
    if (!isSilent) showToast('Detecting your live farm coordinates...', 'info');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        
        let placeTitle = 'My Farm Location';
        try {
          const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
          if (res.ok) {
            const data = await res.json();
            const town = data.locality || data.city || data.principalSubdivision;
            if (town) {
              placeTitle = `${town} Farm`;
            }
          }
        } catch (e) {
          // ignore
        }

        const cleanTitle = placeTitle.replace(/^[📍\s]+/, '');
        const label = `📍 ${cleanTitle} (GPS)`;
        const newLoc = { name: label, label, lat, lon, region: 'Live Farm Microclimate' };
        
        setCustomLocations(prev => {
          const filtered = prev.filter(p => p.name !== label);
          return [newLoc, ...filtered];
        });
        setSelectedCity(label);
        fetchRealForecast(label, lat, lon);
        if (!isSilent) {
          showToast(`Synced live telemetry for ${cleanTitle}`, 'success');
        }
      },
      (err) => {
        console.warn('GPS detection note:', err);
        if (!isSilent) {
          showToast('Could not access device GPS. Defaulting to registered farm location.', 'info');
        }
        fetchRealForecast(selectedCity);
      },
      { timeout: 8000 }
    );
  };

  // Live Location Autocomplete Search (Open-Meteo Global Geocoding Registry)
  const handleSearchCityInput = async (query) => {
    setCitySearchQuery(query);
    if (!query || query.trim().length < 2) {
      setCitySearchResults([]);
      return;
    }
    setSearchingLoading(true);
    try {
      const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query.trim())}&count=6&language=en&format=json`);
      if (res.ok) {
        const data = await res.json();
        const results = (data.results || []).map(r => ({
          name: `${r.name}, ${r.admin1 || r.country || ''}`,
          label: `${r.name}${r.admin1 ? ', ' + r.admin1 : ''} (${r.country || ''})`,
          cityName: r.name,
          lat: r.latitude,
          lon: r.longitude,
          admin1: r.admin1,
          country: r.country
        }));
        setCitySearchResults(results);
      }
    } catch (err) {
      console.warn('Geocoding search note:', err);
    } finally {
      setSearchingLoading(false);
    }
  };

  const handleSelectSearchResult = (loc) => {
    const cleanLabel = (loc.label || loc.name || '').replace(/^[📍\s]+/, '');
    const customItem = {
      name: loc.cityName,
      label: `📍 ${cleanLabel}`,
      lat: loc.lat,
      lon: loc.lon,
      region: `${loc.admin1 || ''}, ${loc.country || ''}`
    };
    setCustomLocations(prev => {
      const filtered = prev.filter(p => p.name !== loc.cityName);
      return [customItem, ...filtered];
    });
    setSelectedCity(loc.cityName);
    setIsSearchingCity(false);
    setCitySearchQuery('');
    setCitySearchResults([]);
    fetchRealForecast(loc.cityName, loc.lat, loc.lon);
    showToast(`Weather radar synced for ${loc.cityName}`, 'success');
  };

  // Crop Recommendation State
  const [soilType, setSoilType] = useState('Alluvial Soil');
  const [waterCapacity, setWaterCapacity] = useState('Medium'); // 'Low' | 'Medium' | 'High'
  const [season, setSeason] = useState('Monsoon (Kharif)');
  const [recommendedCrops, setRecommendedCrops] = useState([]);

  // Phase 6 States
  const [selectedProductForDetails, setSelectedProductForDetails] = useState(null);
  const [showMobileProfileSheet, setShowMobileProfileSheet] = useState(false);
  const [showEmailOtpModal, setShowEmailOtpModal] = useState(false);
  const [cropAdvisoryResult, setCropAdvisoryResult] = useState(null);
  const [cropAdvisoryLoading, setCropAdvisoryLoading] = useState(false);

  const handleGetCropAdvisory = async () => {
    setCropAdvisoryLoading(true);
    try {
      const res = await aiAPI.cropAdvisory({
        soilType,
        season,
        waterAvailability: waterCapacity,
        location: farmerCityName,
        temperature: `${weatherData?.temp || 30}°C`,
        humidity: `${weatherData?.humidity || 65}%`
      });
      if (res.data?.success) {
        setCropAdvisoryResult(res.data.data);
        showToast('AI Crop Recommendation Advisory updated', 'success');
      }
    } catch (err) {
      showToast('AI is temporarily unavailable. Please try again.', 'error');
    } finally {
      setCropAdvisoryLoading(false);
    }
  };

  // Disease Detection & 3D Diagnostic State
  const [selectedDisease, setSelectedDisease] = useState(DISEASE_PRESETS[0]);
  const [analyzingImage, setAnalyzingImage] = useState(false);
  const [uploadedImagePreview, setUploadedImagePreview] = useState(null);
  const [diseaseView3D, setDiseaseView3D] = useState(false);
  const [heatMapActive, setHeatMapActive] = useState(false);
  const [aiScanConfidence, setAiScanConfidence] = useState('98.4%');
  const [isTtsPlaying, setIsTtsPlaying] = useState(false);
  const [prescriptionMedicine, setPrescriptionMedicine] = useState(null);
  const fileInputRef = useRef(null);

  // OTP Verification Modal & Notifications State
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [currentOtpNotif, setCurrentOtpNotif] = useState(null);
  const [notificationsList, setNotificationsList] = useState([]);

  // Add Product Form State (Progressive Disclosure)
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('vegetable');
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState('kg');
  const [stock, setStock] = useState('100');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(PRESET_IMAGES.vegetable[0].url);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Phase 1 / Phase 2 Agricultural Fields
  const [variety, setVariety] = useState('');
  const [harvestDate, setHarvestDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [qualityGrade, setQualityGrade] = useState('');
  const [cultivationType, setCultivationType] = useState('');
  const [irrigationMethod, setIrrigationMethod] = useState('');
  const [minOrderQty, setMinOrderQty] = useState('1');
  const [allowBargain, setAllowBargain] = useState(true);

  // Progressive Disclosure Accordions & Live Preview
  const [showHarvestSection, setShowHarvestSection] = useState(false);
  const [showCultivationSection, setShowCultivationSection] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Farm Location Picker State
  const [farmLocation, setFarmLocation] = useState(
    user?.location || { lat: 11.2189, lng: 78.1674, address: 'AgriLink Agro Farm Gate, Mohanur Road, Namakkal, Tamil Nadu 637001, India' }
  );
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [showDeliverySummon, setShowDeliverySummon] = useState(false);
  const [selectedDispatchOrderId, setSelectedDispatchOrderId] = useState(null);

  // AI Plant Diagnosis Mode ('reference_demo' | 'gemini_vision')
  const [aiDiagnosisMode, setAiDiagnosisMode] = useState('reference_demo');
  const [aiDiagnosisNotice, setAiDiagnosisNotice] = useState('');

  // Buyer Bulk Bargains State
  const [farmerBargains, setFarmerBargains] = useState([]);
  const [loadingBargains, setLoadingBargains] = useState(false);
  const [counterInputs, setCounterInputs] = useState({});

  // Edit Product Modal State
  const [editingProduct, setEditingProduct] = useState(null);
  const [editPrice, setEditPrice] = useState('');
  const [editStock, setEditStock] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('vegetable');
  const [editUnit, setEditUnit] = useState('kg');
  const [editDescription, setEditDescription] = useState('');
  const [editImage, setEditImage] = useState('');
  const [editHarvestDate, setEditHarvestDate] = useState('');
  const [editVariety, setEditVariety] = useState('');
  const [editQualityGrade, setEditQualityGrade] = useState('');
  const [editCultivationType, setEditCultivationType] = useState('');
  const [editIrrigationMethod, setEditIrrigationMethod] = useState('');
  const [editMinOrderQty, setEditMinOrderQty] = useState('1');
  const [editAllowBargain, setEditAllowBargain] = useState(true);
  const [editShowHarvestSection, setEditShowHarvestSection] = useState(false);
  const [editShowCultivationSection, setEditShowCultivationSection] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);

  // Profile Edit State
  const [profileFirstName, setProfileFirstName] = useState(user?.firstName || '');
  const [profileLastName, setProfileLastName] = useState(user?.lastName || 'ms');
  const [profileFarmName, setProfileFarmName] = useState(user?.farmName || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '9952712633');
  const [profileNativePlace, setProfileNativePlace] = useState(user?.nativePlace || 'Namakkal, Tamil Nadu');
  const [profileDescription, setProfileDescription] = useState(user?.description || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [showProfileMapPicker, setShowProfileMapPicker] = useState(false);

  const isFarmer = user?.role === 'farmer';

  useEffect(() => {
    // Default to the farmer's live location on initial launch
    detectCurrentGpsLocation(true);
    fetchFarmerProducts();
    fetchIncomingOrders();
    fetchFarmerNotifications();
    fetchFarmerBargains();
  }, []);

  // Periodic polling using visibility-aware hook: stops on hidden tab, prevents overlaps
  usePolling(() => fetchIncomingOrders(), 20000, {
    enabled: activeNav === 'orders'
  });

  usePolling(() => fetchFarmerBargains(), 30000, {
    enabled: activeNav === 'bargains'
  });

  usePolling(() => fetchFarmerProducts(), 30000, {
    enabled: activeNav === 'products' || activeNav === 'after_cultivation' || activeNav === 'home'
  });

  // Compute crop recommendation whenever soil, water, or weather changes
  useEffect(() => {
    computeCropRecommendations(soilType, waterCapacity, season, weatherCondition);
  }, [soilType, waterCapacity, season, weatherCondition]);

  const handleCityChange = (cityName) => {
    setSelectedCity(cityName);
    fetchRealForecast(cityName);
    showToast(`Live radar telemetry synced for ${cityName}`, 'info');
  };

  const handleManualWeatherToggle = (cond) => {
    setWeatherMode('simulated');
    setWeatherCondition(cond);
    setWeatherData(prev => ({
      ...prev,
      condition: cond,
      conditionLabel: cond === 'sunny' ? 'Clear & Sunny Sky' : cond === 'rainy' ? 'Heavy Rain Showers' : cond === 'stormy' ? 'Thunderstorm Warning' : cond === 'mist' ? 'Morning Dew & Mist' : 'Overcast Cumulus Clouds',
      temp: cond === 'sunny' ? 34 : cond === 'rainy' ? 24 : cond === 'stormy' ? 22 : cond === 'mist' ? 23 : 28,
      rainChance: cond === 'rainy' ? 88 : cond === 'stormy' ? 92 : cond === 'cloudy' ? 30 : 5,
      humidity: cond === 'rainy' ? 88 : cond === 'stormy' ? 82 : cond === 'mist' ? 90 : 55,
      wind: cond === 'stormy' ? '32 km/h NW' : cond === 'rainy' ? '22 km/h SW' : '12 km/h S',
      advisory: cond === 'rainy' ? '🌧️ High rain chance active! Halt pesticide spraying & open drainage trenches around paddy fields.' : cond === 'stormy' ? '⛈️ Severe squall & thunder warning! Provide bamboo stakes for tall crops and secure polytunnels.' : cond === 'sunny' ? '☀️ Bright sun with low humidity. Ideal day for field tillage, weeding, and drying grains in farm yards.' : '⛅ Moderate cloud cover. Suitable for transplanting, nursery watering, and routine farm scouting.',
      lastUpdated: 'Simulated weather',
      isLive: false,
      isCached: false,
      dataSource: 'simulated',
      error: null
    }));
  };

  const computeCropRecommendations = (soil, water, ssn, weather) => {
    let list = [];
    if (soil.includes('Alluvial')) {
      if (water === 'High') {
        list = [
          { name: 'Basmati Paddy (Rice)', match: 98, yield: '28-32 Qtl/Acre', duration: '120 Days', profit: '₹62,000 / Acre', icon: '🌾', notes: 'Best suited for alluvial beds with regular water supply.' },
          { name: 'Sugarcane (Co 86032)', match: 92, yield: '45-55 Tons/Acre', duration: '300 Days', profit: '₹85,000 / Acre', icon: '🎋', notes: 'High biomass return; thrives in deep fertile alluvial soils.' },
          { name: 'Vine Tomatoes', match: 86, yield: '18-22 Tons/Acre', duration: '85 Days', profit: '₹48,000 / Acre', icon: '🍅', notes: 'High market demand in local mandis; harvest begins in 8 weeks.' }
        ];
      } else {
        list = [
          { name: 'Hybrid Maize / Corn', match: 94, yield: '24-28 Qtl/Acre', duration: '95 Days', profit: '₹42,000 / Acre', icon: '🌽', notes: 'Drought-tolerant grain requiring moderate furrow watering.' },
          { name: 'Green Gram / Pulses', match: 89, yield: '8-10 Qtl/Acre', duration: '65 Days', profit: '₹34,000 / Acre', icon: '🌱', notes: 'Enriches soil nitrogen naturally while giving fast cash returns.' },
          { name: 'Crisp Baby Spinach', match: 85, yield: '6-8 Tons/Acre', duration: '40 Days', profit: '₹28,000 / Acre', icon: '🥬', notes: 'Short rotation leafy crop suitable for intercropping.' }
        ];
      }
    } else if (soil.includes('Black')) {
      list = [
        { name: 'Bt Cotton (Long Staple)', match: 96, yield: '14-16 Qtl/Acre', duration: '150 Days', profit: '₹72,000 / Acre', icon: '🌿', notes: 'Black clayey soil holds deep moisture, perfect for cotton boll formation.' },
        { name: 'Soybean (JS 335)', match: 91, yield: '10-12 Qtl/Acre', duration: '90 Days', profit: '₹38,000 / Acre', icon: '🥜', notes: 'Excellent oilseed crop with strong wholesale market tie-ups.' },
        { name: 'Onions (Nashik Red)', match: 88, yield: '12-15 Tons/Acre', duration: '110 Days', profit: '₹55,000 / Acre', icon: '🧅', notes: 'Great bulb expansion in well-aerated black loam.' }
      ];
    } else if (soil.includes('Red')) {
      list = [
        { name: 'Groundnut / Peanut', match: 95, yield: '12-14 Qtl/Acre', duration: '105 Days', profit: '₹46,000 / Acre', icon: '🥜', notes: 'Porous red soil allows easy pod penetration and harvesting.' },
        { name: 'Finger Millet (Ragi)', match: 93, yield: '16-18 Qtl/Acre', duration: '115 Days', profit: '₹36,000 / Acre', icon: '🌾', notes: 'High nutritional grain, low water need, naturally pest-resistant.' },
        { name: 'Green Chilli (G4 Hybrid)', match: 87, yield: '8-10 Tons/Acre', duration: '120 Days', profit: '₹58,000 / Acre', icon: '🌶️', notes: 'Continuous picking crop providing weekly recurring revenue.' }
      ];
    } else {
      list = [
        { name: 'Carrots & Root Crops', match: 92, yield: '10-12 Tons/Acre', duration: '75 Days', profit: '₹40,000 / Acre', icon: '🥕', notes: 'Soft soil structure ensures straight and sweet root development.' },
        { name: 'Watermelon & Muskmelon', match: 88, yield: '20-25 Tons/Acre', duration: '80 Days', profit: '₹65,000 / Acre', icon: '🍉', notes: 'Fast fruit development in warm sandy loam.' },
        { name: 'Sesame (Til Seeds)', match: 84, yield: '5-6 Qtl/Acre', duration: '85 Days', profit: '₹32,000 / Acre', icon: '🌻', notes: 'Lowest water need; resilient against dry spells.' }
      ];
    }
    setRecommendedCrops(list);
  };

  const handleDiseaseImageUpload = (e) => {
    const file = e.target?.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image file size must be less than 5MB', 'error');
        return;
      }
      const url = URL.createObjectURL(file);
      setUploadedImagePreview(url);
      setAnalyzingImage(true);

      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = reader.result;
        try {
          const res = await aiAPI.diagnoseCrop({
            image: base64Data,
            cropContext: 'Crop Leaf Sample'
          });

          if (res.data.mode === 'gemini_vision' && res.data.diagnosis) {
            setAiDiagnosisMode('gemini_vision');
            setAiDiagnosisNotice(res.data.disclaimer);
            setSelectedDisease({
              id: 'ai_detected',
              name: res.data.diagnosis.possibleDisease,
              crop: res.data.diagnosis.detectedCrop || 'Field Sample',
              severity: res.data.diagnosis.confidence > 75 ? 'Moderate to High' : 'Observational',
              summary: res.data.diagnosis.explanation,
              organicRemedy: res.data.diagnosis.treatmentGuidance,
              chemicalMedicine: res.data.diagnosis.preventionGuidance,
              farmerTips: [
                `Next Step: ${res.data.diagnosis.recommendedNextStep}`,
                `Visible Symptoms: ${res.data.diagnosis.visibleSymptoms}`,
                res.data.disclaimer
              ],
              confidence: `${res.data.diagnosis.confidence}%`
            });
            setAiScanConfidence(`${res.data.diagnosis.confidence}%`);
            showToast(`AI Vision Diagnosis: ${res.data.diagnosis.possibleDisease} (${res.data.diagnosis.confidence}%)`, 'success');
          } else {
            // Reference / Demo Mode
            setAiDiagnosisMode('reference_demo');
            setAiDiagnosisNotice(res.data.message || 'Reference / Demo Mode: Visual AI provider is not active or GEMINI_API_KEY is not configured.');
            
            const fileNameLower = file.name.toLowerCase();
            let detected = DISEASE_PRESETS.find(
              (p) =>
                fileNameLower.includes(p.crop.toLowerCase()) ||
                fileNameLower.includes(p.id.split('_')[0]) ||
                fileNameLower.includes(p.id.split('_')[1] || '')
            ) || DISEASE_PRESETS[1] || DISEASE_PRESETS[0];

            setSelectedDisease({
              ...detected,
              name: `[Reference Mode] ${detected.name}`
            });
            setAiScanConfidence('Demo Mode (85%)');
            showToast('Operating in Reference / Demo Mode. Live vision requires GEMINI_API_KEY.', 'info');
          }
        } catch (err) {
          console.warn('AI diagnose crop note:', err);
          setAiDiagnosisMode('reference_demo');
          setAiDiagnosisNotice('AI Provider offline. Displaying reference botanical sample database.');
          const detected = DISEASE_PRESETS[0];
          setSelectedDisease(detected);
          setAiScanConfidence('Reference (90%)');
        } finally {
          setAnalyzingImage(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectDiseasePreset = (preset) => {
    setUploadedImagePreview(null);
    setAnalyzingImage(true);
    setTimeout(() => {
      setSelectedDisease(preset);
      setAiScanConfidence(preset.confidence || '98.0%');
      setAnalyzingImage(false);
      showToast(`Analyzed sample: ${preset.name.split('(')[0]}`, 'info');
    }, 650);
  };

  const handleSpeakDiseaseRemedy = () => {
    if (!('speechSynthesis' in window)) {
      showToast('Audio text-to-speech not supported on this browser', 'info');
      return;
    }
    if (isTtsPlaying) {
      window.speechSynthesis.cancel();
      setIsTtsPlaying(false);
      return;
    }

    const textToSpeak = `Plant Doctor Diagnosis for ${selectedDisease.crop}. Infection detected: ${selectedDisease.name}. Severity level: ${selectedDisease.severity}. Organic treatment: ${selectedDisease.organicRemedy}. Chemical spray: ${selectedDisease.chemicalMedicine}`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 0.88;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsTtsPlaying(false);
    utterance.onerror = () => setIsTtsPlaying(false);
    setIsTtsPlaying(true);
    window.speechSynthesis.speak(utterance);
    showToast('🔊 Playing treatment diagnosis audio...', 'info');
  };

  const handleSendToMedicineHub = () => {
    setActiveNav('medicines_fertilizers');
    showToast(`Loaded prescription for ${selectedDisease.name.split('(')[0]} into Medicine Center`, 'success');
  };

  const handleOrderMedicineWithOtp = (medicine) => {
    const notifObj = {
      id: `order_med_${medicine?.id || 'chem'}_${Date.now()}`,
      title: `🚜 Confirm Order: ${medicine?.name || 'Agrochemical Spray'}`,
      category: 'medicine_safety',
      priority: medicine?.type === 'organic' ? 'NORMAL' : 'URGENT',
      message: `Farmer authentication required for direct dispatch of ${medicine?.name || 'Agri Medicine'} (Price: ₹${medicine?.price || '350'}).`,
      details: medicine?.type === 'organic' ? '100% Organic certified Bio-item' : 'Chemical safety mandate: OTP verification required before sealed chemical release.',
      requiresOtp: true,
      otpType: 'PESTICIDE_SAFETY'
    };
    setCurrentOtpNotif(notifObj);
    setIsOtpModalOpen(true);
  };

  const handleOpenOtpNotification = (notif) => {
    setCurrentOtpNotif(notif);
    setIsOtpModalOpen(true);
  };

  const fetchFarmerProducts = async () => {
    try {
      const farmerId = isFarmer ? String(user?._id || user?.id || '') : '';
      const res = await productAPI.getProducts(farmerId ? { farmerId } : {});
      setFarmerProducts(res.data);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to load products';
      console.warn(msg);
    }
  };

  const fetchIncomingOrders = async () => {
    try {
      const res = await orderAPI.getOrders();
      setIncomingOrders(res.data);
    } catch (err) {
      console.warn('Orders fetch note:', err.message);
    }
  };

  const fetchFarmerNotifications = async () => {
    try {
      const fId = user?._id || user?.id;
      const res = await notificationAPI.getNotifications(fId ? { userId: fId, role: 'farmer' } : { role: 'farmer' });
      if (res.data?.notifications) {
        setNotificationsList(res.data.notifications);
      }
    } catch (err) {
      console.warn('Notifications fetch note:', err.message);
    }
  };

  const fetchFarmerBargains = async () => {
    try {
      setLoadingBargains(true);
      const res = await bargainAPI.getFarmerBargains();
      setFarmerBargains(res.data?.bargains || []);
    } catch (err) {
      console.warn('Bargains fetch note:', err.message);
    } finally {
      setLoadingBargains(false);
    }
  };

  const handleUpdateBargain = async (bargainId, action, counterPrice = null) => {
    try {
      const payload = { action };
      if (action === 'counter') {
        if (!counterPrice || Number(counterPrice) <= 0) {
          showToast('Please enter a valid counter offer price', 'warning');
          return;
        }
        payload.counterPrice = Number(counterPrice);
      }
      const res = await bargainAPI.updateBargainStatus(bargainId, payload);
      showToast(res.data.message || `Bargain ${action}ed!`, 'success');
      fetchFarmerBargains();
    } catch (err) {
      showToast(err.response?.data?.message || `Failed to ${action} bargain`, 'error');
    }
  };

  const handleRefreshAll = async () => {
    setRefreshing(true);
    await Promise.all([fetchFarmerProducts(), fetchIncomingOrders(), fetchFarmerNotifications(), fetchFarmerBargains()]);
    setRefreshing(false);
    showToast('Farmer dashboard synchronized with live marketplace', 'info');
  };

  const handleCategoryChange = (newCategory) => {
    setCategory(newCategory);
    const presets = PRESET_IMAGES[newCategory] || [];
    if (presets.length > 0) {
      setImage(presets[0].url);
    }
  };

  const applyQuickTemplate = (tpl) => {
    setTitle(tpl.title);
    setCategory(tpl.category);
    setPrice(tpl.price);
    setUnit(tpl.unit);
    setStock(tpl.stock);
    setDescription(tpl.description);
    setImage(tpl.image);
    showToast(`Loaded ${tpl.title} template!`, 'info');
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!isFarmer) {
      showToast('Responsibility check: Only registered Farmer accounts can publish produce.', 'error');
      return;
    }
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      showToast('Please enter the produce name (e.g. Country Tomato)', 'error');
      return;
    }
    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      showToast('Please enter a valid price greater than ₹0', 'error');
      return;
    }
    const numStock = Number(stock);
    if (isNaN(numStock) || numStock <= 0) {
      showToast('Available quantity must be greater than 0', 'error');
      return;
    }
    const numMinOrder = Number(minOrderQty);
    if (isNaN(numMinOrder) || numMinOrder <= 0) {
      showToast('Minimum order quantity must be at least 1', 'error');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: trimmedTitle,
        category,
        price: numPrice,
        unit: unit.trim() || 'kg',
        stock: numStock,
        description: description.trim(),
        image: image || PRESET_IMAGES[category]?.[0]?.url || PRESET_IMAGES.vegetable[0].url,
        harvestDate: harvestDate ? new Date(harvestDate) : new Date(),
        farmerName: user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Verified Regional Farmer',
        farmerPhone: user?.phone || '',
        farmerEmail: user?.email || '',
        farmerNative: user?.nativePlace || selectedCity || 'Tamil Nadu',
        location: farmLocation,
        // Agricultural fields (Phase 1 & 2)
        variety: variety.trim(),
        qualityGrade: qualityGrade.trim(),
        cultivationType: cultivationType.trim(),
        irrigationMethod: irrigationMethod.trim(),
        minOrderQty: numMinOrder,
        allowBargain: Boolean(allowBargain)
      };

      const res = await productAPI.addProduct(payload);
      setFarmerProducts([res.data, ...farmerProducts]);
      showToast(`Successfully published ${trimmedTitle} to live marketplace!`, 'success');

      // Reset form states
      setTitle('');
      setPrice('');
      setStock('100');
      setDescription('');
      setVariety('');
      setQualityGrade('');
      setCultivationType('');
      setIrrigationMethod('');
      setMinOrderQty('1');
      setAllowBargain(true);
      setShowAddForm(false);
      setShowPreview(false);
      setShowHarvestSection(false);
      setShowCultivationSection(false);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to publish produce';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (prod) => {
    setEditingProduct(prod);
    setEditTitle(prod.title || '');
    setEditCategory(prod.category || 'vegetable');
    setEditPrice(String(prod.price || ''));
    setEditUnit(prod.unit || 'kg');
    setEditStock(String(prod.stock || '0'));
    setEditDescription(prod.description || '');
    setEditImage(prod.image || '');
    setEditHarvestDate(prod.harvestDate ? new Date(prod.harvestDate).toISOString().split('T')[0] : '');
    // Agricultural fields (Phase 1 & 2)
    setEditVariety(prod.variety || '');
    setEditQualityGrade(prod.qualityGrade || '');
    setEditCultivationType(prod.cultivationType || '');
    setEditIrrigationMethod(prod.irrigationMethod || '');
    setEditMinOrderQty(String(prod.minOrderQty || '1'));
    setEditAllowBargain(prod.allowBargain !== false);
    setEditShowHarvestSection(Boolean(prod.variety || prod.qualityGrade || prod.harvestDate));
    setEditShowCultivationSection(Boolean(prod.cultivationType || prod.irrigationMethod));
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;
    const numPrice = Number(editPrice);
    if (isNaN(numPrice) || numPrice <= 0) {
      showToast('Price must be greater than ₹0', 'error');
      return;
    }
    const numStock = Number(editStock);
    if (isNaN(numStock) || numStock < 0) {
      showToast('Stock quantity cannot be negative', 'error');
      return;
    }
    const numMinOrder = Number(editMinOrderQty);
    if (isNaN(numMinOrder) || numMinOrder <= 0) {
      showToast('Minimum order quantity must be at least 1', 'error');
      return;
    }

    setSavingEdit(true);
    try {
      const prodId = editingProduct._id || editingProduct.id;
      const payload = {
        title: editTitle.trim(),
        category: editCategory,
        price: numPrice,
        unit: editUnit.trim() || 'kg',
        stock: Math.max(0, numStock),
        description: editDescription.trim(),
        image: editImage || editingProduct.image,
        harvestDate: editHarvestDate ? new Date(editHarvestDate) : undefined,
        // Agricultural fields (Phase 1 & 2)
        variety: editVariety.trim(),
        qualityGrade: editQualityGrade.trim(),
        cultivationType: editCultivationType.trim(),
        irrigationMethod: editIrrigationMethod.trim(),
        minOrderQty: numMinOrder,
        allowBargain: Boolean(editAllowBargain)
      };
      const res = await productAPI.updateProduct(prodId, payload);
      setFarmerProducts(farmerProducts.map(p =>
        (String(p._id || p.id) === String(prodId)) ? res.data : p
      ));
      showToast(`Produce "${editTitle}" updated successfully!`, 'success');
      setEditingProduct(null);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to update produce';
      showToast(msg, 'error');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteProduct = async (prodId, prodTitle) => {
    if (!isFarmer) {
      showToast('Responsibility check: Only Farmers can delete produce.', 'error');
      return;
    }
    if (!window.confirm(`Are you sure you want to remove "${prodTitle}" from your active marketplace catalog?`)) {
      return;
    }
    try {
      await productAPI.deleteProduct(prodId);
      setFarmerProducts(farmerProducts.filter(p => (String(p._id || p.id) !== String(prodId))));
      showToast(`Removed "${prodTitle}" from catalog`, 'info');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to delete produce';
      showToast(msg, 'error');
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    if (!isFarmer) {
      showToast('Responsibility check: Only Farmer accounts can pack & dispatch dispatches.', 'error');
      return;
    }
    try {
      await orderAPI.updateStatus(orderId, { status: newStatus });
      setIncomingOrders(incomingOrders.map(o =>
        (String(o._id || o.id) === String(orderId)) ? { ...o, status: newStatus } : o
      ));
      showToast(`Order status updated to ${newStatus.toUpperCase()}`, 'success');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to update order status';
      showToast(msg, 'error');
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!isFarmer) return;
    if (!window.confirm('Are you sure you want to reject / cancel this order? Reserved stock will automatically be returned to your inventory.')) {
      return;
    }
    try {
      await orderAPI.updateStatus(orderId, { status: 'cancelled' });
      setIncomingOrders(incomingOrders.map(o =>
        (String(o._id || o.id) === String(orderId)) ? { ...o, status: 'cancelled' } : o
      ));
      showToast('Order cancelled and reserved inventory replenished.', 'info');
      fetchFarmerProducts(); // refresh products to show replenished inventory
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to cancel order';
      showToast(msg, 'error');
    }
  };

  const handleLogoutFarmer = () => {
    if (onLogout) {
      onLogout();
    } else {
      logout();
    }
  };

  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();
    setSavingProfile(true);
    try {
      const payload = {
        firstName: profileFirstName.trim(),
        lastName: profileLastName.trim(),
        farmName: profileFarmName.trim(),
        phone: profilePhone.trim(),
        nativePlace: profileNativePlace.trim(),
        description: profileDescription.trim()
      };
      const res = await updateUserProfile(payload);
      if (res && res.success) {
        showToast(res.message || 'Farmer profile and farm bio updated successfully', 'success');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to update profile';
      showToast(msg, 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpdateFarmGps = async (selectedLoc) => {
    try {
      const locPayload = {
        lat: selectedLoc.lat,
        lng: selectedLoc.lng,
        address: selectedLoc.address || selectedLoc.placeName || 'Farm Gate Coordinates'
      };
      await updateUserLocation(locPayload);
      setFarmLocation(locPayload);
      setShowProfileMapPicker(false);
      showToast('Farm GPS coordinates saved to registry!', 'success');
    } catch (err) {
      showToast('Failed to save farm GPS', 'error');
    }
  };

  // Real Database Metrics & Analytics
  const totalStockUnits = farmerProducts.reduce((sum, p) => sum + (Number(p.stock) || 0), 0);
  const totalInventoryValuation = farmerProducts.reduce((sum, p) => sum + ((Number(p.price) || 0) * (Number(p.stock) || 0)), 0);
  const pendingOrdersCount = incomingOrders.filter(o => o.status === 'pending').length;
  const confirmedOrdersCount = incomingOrders.filter(o => o.status === 'confirmed' || o.status === 'accepted').length;
  const packedOrdersCount = incomingOrders.filter(o => o.status === 'packed').length;
  const transitOrdersCount = incomingOrders.filter(o => ['assigned', 'driver_assigned', 'picked_up', 'in_transit', 'arrived'].includes(o.status)).length;
  const completedOrdersCount = incomingOrders.filter(o => o.status === 'delivered').length;
  const cancelledOrdersCount = incomingOrders.filter(o => o.status === 'cancelled').length;
  const pendingBargainsCount = (farmerBargains || []).filter(b => b.status === 'PENDING').length;

  const realDeliveredEarnings = incomingOrders
    .filter(o => o.status === 'delivered')
    .reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);

  const realPendingRevenue = incomingOrders
    .filter(o => o.status !== 'delivered' && o.status !== 'cancelled')
    .reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);

  const lowStockProducts = farmerProducts.filter(p => Number(p.stock) > 0 && Number(p.stock) <= 10);
  const outOfStockProducts = farmerProducts.filter(p => Number(p.stock) <= 0);
  const recentOrdersList = [...incomingOrders].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 5);

  const farmerDisplayName = user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Farmer';
  const farmerCityName = user?.nativePlace || selectedCity || 'Tamil Nadu';

  // Filtered products for search
  const displayedProducts = farmerProducts.filter(p =>
    (p.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.category || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="farmer-layout">
      {/* =========================================================================
          LEFT SIDEBAR (Matches Screenshots 1 & 2)
          ========================================================================= */}
      <aside className="farmer-sidebar">
        <div>
          {/* Brand Header */}
          <div className="farmer-brand" style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <AgriLinkLogo size="sm" showText={true} showBadge={false} interactive={false} />
          </div>

          {/* Navigation Links */}
          <nav className="farmer-nav-list">
            <button
              className={`farmer-nav-item ${activeNav === 'home' ? 'active' : ''}`}
              onClick={() => setActiveNav('home')}
            >
              <Home size={18} />
              <span>{t('Home')}</span>
            </button>

            <button
              className={`farmer-nav-item ${activeNav === 'before_cultivation' ? 'active' : ''}`}
              onClick={() => {
                setActiveNav('before_cultivation');
                setCultivationStage('before');
              }}
            >
              <Sprout size={18} />
              <span>{t('Before Cultivation')}</span>
            </button>

            <button
              className={`farmer-nav-item ${activeNav === 'after_cultivation' ? 'active' : ''}`}
              onClick={() => {
                setActiveNav('after_cultivation');
                setCultivationStage('after');
              }}
            >
              <Layers size={18} />
              <span>{t('After Cultivation')}</span>
            </button>

            <button
              className={`farmer-nav-item ${activeNav === 'products' ? 'active' : ''}`}
              onClick={() => setActiveNav('products')}
            >
              <Package size={18} />
              <span>{t('My Products')}</span>
              <span className="farmer-nav-badge">{farmerProducts.length}</span>
            </button>

            <button
              className={`farmer-nav-item ${activeNav === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveNav('orders')}
            >
              <Truck size={18} />
              <span>{t('Buyer Orders')}</span>
              {pendingOrdersCount > 0 && (
                <span className="farmer-nav-badge" style={{ background: '#ef4444' }}>
                  {pendingOrdersCount}
                </span>
              )}
            </button>

            <button
              className={`farmer-nav-item ${activeNav === 'bargains' ? 'active' : ''}`}
              onClick={() => {
                setActiveNav('bargains');
                fetchFarmerBargains();
              }}
              style={{
                background: activeNav === 'bargains' ? 'rgba(245, 158, 11, 0.25)' : undefined,
                borderColor: activeNav === 'bargains' ? '#f59e0b' : undefined
              }}
            >
              <IndianRupee size={18} color="#fbbf24" />
              <span>{t('Bulk Bargains')}</span>
              {pendingBargainsCount > 0 && (
                <span className="farmer-nav-badge" style={{ background: '#f59e0b' }}>
                  {pendingBargainsCount}
                </span>
              )}
            </button>

            <button
              className={`farmer-nav-item ${activeNav === 'market_prices' ? 'active' : ''}`}
              onClick={() => setActiveNav('market_prices')}
            >
              <BarChart2 size={18} />
              <span>{t('Market Prices')}</span>
            </button>

            <button
              className={`farmer-nav-item ${activeNav === 'disease_detection' ? 'active' : ''}`}
              onClick={() => setActiveNav('disease_detection')}
            >
              <ShieldCheck size={18} />
              <span>{t('Disease Detection')}</span>
            </button>

            <button
              className={`farmer-nav-item ${activeNav === 'medicines_fertilizers' ? 'active' : ''}`}
              onClick={() => setActiveNav('medicines_fertilizers')}
              style={{
                background: activeNav === 'medicines_fertilizers' ? 'rgba(16, 185, 129, 0.25)' : undefined,
                borderColor: activeNav === 'medicines_fertilizers' ? '#10b981' : undefined
              }}
            >
              <FlaskConical size={18} color="#34d399" />
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>{t('Medicines & Fertilizers')}</span>
                <span style={{ fontSize: '9px', background: 'rgba(52, 211, 153, 0.25)', color: '#34d399', padding: '1px 5px', borderRadius: '6px', fontWeight: '800' }}>NEW</span>
              </span>
            </button>

            <button
              className={`farmer-nav-item ${activeNav === 'three_d_farm_port' ? 'active' : ''}`}
              onClick={() => setActiveNav('three_d_farm_port')}
              style={{
                background: activeNav === 'three_d_farm_port' ? 'rgba(56, 189, 248, 0.25)' : undefined,
                borderColor: activeNav === 'three_d_farm_port' ? '#38bdf8' : undefined
              }}
            >
              <Box size={18} color="#38bdf8" />
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>3D Farm Simulation Port</span>
                <span style={{ fontSize: '9px', background: 'rgba(56, 189, 248, 0.25)', color: '#38bdf8', padding: '1px 5px', borderRadius: '6px', fontWeight: '800' }}>3D</span>
              </span>
            </button>

            <button
              className={`farmer-nav-item ${activeNav === 'soil_digital_twin' ? 'active' : ''}`}
              onClick={() => setActiveNav('soil_digital_twin')}
              style={{
                background: activeNav === 'soil_digital_twin' ? 'rgba(74, 222, 128, 0.25)' : undefined,
                borderColor: activeNav === 'soil_digital_twin' ? '#4ade80' : undefined
              }}
            >
              <Sprout size={18} color="#4ade80" />
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>3D Soil Digital Twin</span>
                <span style={{ fontSize: '9px', background: 'rgba(74, 222, 128, 0.25)', color: '#4ade80', padding: '1px 5px', borderRadius: '6px', fontWeight: '800' }}>LIVE</span>
              </span>
            </button>

            <button
              className={`farmer-nav-item ${activeNav === 'ask_agrilink_ai' ? 'active' : ''}`}
              onClick={() => setActiveNav('ask_agrilink_ai')}
              style={{
                background: activeNav === 'ask_agrilink_ai' ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.35), rgba(5, 150, 105, 0.45))' : undefined,
                borderColor: activeNav === 'ask_agrilink_ai' ? '#10b981' : undefined
              }}
            >
              <Bot size={18} color="#34d399" />
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>🌱 Ask AgriLink AI</span>
                <span style={{ fontSize: '9px', background: 'rgba(52, 211, 153, 0.25)', color: '#34d399', padding: '1px 5px', borderRadius: '6px', fontWeight: '800' }}>VOICE</span>
              </span>
            </button>

            <button
              className={`farmer-nav-item ${activeNav === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveNav('profile')}
            >
              <User size={18} />
              <span>{t('Profile')}</span>
            </button>

            <button
              className={`farmer-nav-item ${activeNav === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveNav('settings')}
            >
              <Settings size={18} />
              <span>{t('Settings')}</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="farmer-sidebar-footer">
          <div style={{ fontSize: '11px', color: '#6ee7b7', marginBottom: '14px', lineHeight: '1.4' }}>
            <div style={{ fontWeight: '700', color: '#a7f3d0' }}>Healthy Farms</div>
            <div>Happy Families</div>
            <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '2px' }}>— AgriSmart</div>
          </div>

          <button
            onClick={() => {
              alert("📱 To install AgriLink Mobile App on your phone:\n\n• Android: Tap Chrome menu (⋮) -> 'Install App' or 'Add to Home screen'\n• iPhone (iOS): Tap Safari Share (⎋) -> 'Add to Home Screen'");
            }}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px',
              borderRadius: '8px',
              background: 'rgba(55, 189, 120, 0.12)',
              border: '1px solid rgba(55, 189, 120, 0.35)',
              color: '#34d399',
              fontSize: '12.5px',
              fontWeight: '700',
              cursor: 'pointer',
              marginBottom: '10px',
              transition: 'background 0.2s'
            }}
          >
            <Smartphone size={15} />
            <span>{t('Install Mobile App')}</span>
          </button>

          <button
            onClick={handleLogoutFarmer}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '11px',
              borderRadius: '8px',
              background: '#180d0e',
              border: '1.5px solid #dc2626',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: '800',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#dc2626';
              e.currentTarget.style.color = '#ffffff';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = '#180d0e';
              e.currentTarget.style.color = '#ffffff';
            }}
          >
            <LogOut size={16} color="#ef4444" />
            <span>{t('Logout')}</span>
          </button>
        </div>
      </aside>

      {/* =========================================================================
          MAIN APPLICATION AREA
          ========================================================================= */}
      <main className="farmer-main">
        
        {/* Top Header */}
        <header className="farmer-topbar">
          <div className="farmer-search-box">
            <Search size={16} color="#34d399" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('search_placeholder') || "Search crops, products, or insights..."}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer' }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Top Language Selector */}
            <LanguageSelector compact={true} variant="pill" />

            {/* Quick Refresh Data Button */}
            <button
              onClick={handleRefreshAll}
              disabled={refreshing}
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(55, 189, 120, 0.25)',
                color: '#e2f1ea',
                borderRadius: '50%',
                width: '38px',
                height: '38px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              title="Sync Data"
            >
              <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} color="#10b981" />
            </button>

            {/* Notification Bell */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#fbbf24',
                  borderRadius: '50%',
                  width: '38px',
                  height: '38px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <Bell size={18} />
                {pendingOrdersCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '2px',
                    right: '2px',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#ef4444'
                  }} />
                )}
              </button>

              {showNotifications && (
                <div style={{
                  position: 'absolute',
                  top: '46px',
                  right: 0,
                  width: '320px',
                  maxHeight: '400px',
                  overflowY: 'auto',
                  background: '#0d2823',
                  border: '1px solid rgba(55, 189, 120, 0.4)',
                  borderRadius: '16px',
                  padding: '16px',
                  boxShadow: '0 16px 36px rgba(0,0,0,0.6)',
                  zIndex: 60
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '800', color: '#10b981' }}>
                      🌾 FARMER ALERTS & UPDATES
                    </span>
                    <span style={{ fontSize: '11px', color: '#9ca3af' }}>
                      {notificationsList.length} total
                    </span>
                  </div>

                  {notificationsList.length === 0 ? (
                    <div style={{ padding: '16px 0', textAlign: 'center', color: '#9ca3af', fontSize: '12px' }}>
                      No new farmer notifications.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {notificationsList.slice(0, 8).map((notif, idx) => (
                        <div
                          key={notif._id || notif.id || idx}
                          style={{
                            background: notif.isRead ? 'rgba(255,255,255,0.03)' : 'rgba(52, 211, 153, 0.12)',
                            border: `1px solid ${notif.isRead ? 'rgba(255,255,255,0.06)' : 'rgba(52, 211, 153, 0.3)'}`,
                            borderRadius: '10px',
                            padding: '10px 12px'
                          }}
                        >
                          <div style={{ fontSize: '12.5px', fontWeight: '700', color: '#effbe7', marginBottom: '2px' }}>
                            {notif.title}
                          </div>
                          <div style={{ fontSize: '11.5px', color: '#c2dcd0', lineHeight: '1.4' }}>
                            {notif.message}
                          </div>
                          <div style={{ fontSize: '10px', color: '#7e9e8f', marginTop: '4px' }}>
                            {notif.createdAt ? new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: '11px', color: '#9ca3af', display: 'flex', justifyContent: 'space-between' }}>
                    <span>🌤️ Weather: {weatherData.advisory?.slice(0, 35)}...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Farmer Profile Chip */}
            <div
              className="farmer-user-chip"
              onClick={() => setShowMobileProfileSheet(true)}
              style={{ cursor: 'pointer' }}
              title="Open Profile & Account Settings"
            >
              <div className="farmer-avatar-circle">
                {farmerDisplayName[0] || 'A'}
              </div>
              <div style={{ lineHeight: '1.2' }}>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#f3f4f6' }}>
                  {farmerDisplayName}
                </div>
                <div style={{ fontSize: '11px', color: '#34d399', display: 'flex', alignItems: 'center', gap: '2px' }}>
                  <MapPin size={10} /> {farmerCityName}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* =========================================================================
            VIEW 1: HOME (Matches Reference Screenshot 1 & 2)
            ========================================================================= */}
        {activeNav === 'home' && (
          <div style={{ padding: '24px 28px', maxWidth: '1400px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
            
            {/* Hero Welcome Banner */}
            <div className="farmer-hero-banner">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                <div style={{ maxWidth: '650px' }}>
                  <div className="farmer-hero-badge">
                    <Sprout size={13} color="#4ade80" /> SMART FARMING PLATFORM
                  </div>
                  <h1 style={{ fontSize: '30px', fontWeight: '900', margin: '0 0 6px 0', color: '#effbe7', textShadow: '0 2px 14px rgba(0,0,0,0.5)' }}>
                    Welcome, {farmerDisplayName} 👋
                  </h1>
                  <h2 style={{ fontSize: '21px', fontWeight: '800', color: '#4ade80', margin: '0 0 12px 0', textShadow: '0 0 18px rgba(74, 222, 128, 0.35)' }}>
                    Smart Agriculture.
                  </h2>
                  <p style={{ fontSize: '14px', color: '#c0d9cb', lineHeight: '1.6', margin: '0 0 18px 0', textShadow: '0 1px 6px rgba(0,0,0,0.4)' }}>
                    Plan your cultivation, monitor your crops, manage harvested products and connect with buyers.
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                    <span style={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      backdropFilter: 'blur(12px)',
                      WebkitBackdropFilter: 'blur(12px)',
                      border: '1px solid rgba(255, 255, 255, 0.18)',
                      borderTop: '1px solid rgba(255, 255, 255, 0.35)',
                      color: '#a7f3d0',
                      padding: '5px 14px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '700',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                    }}>
                      <MapPin size={12} color="#34d399" /> {farmerCityName}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => {
                        setActiveNav('before_cultivation');
                        setCultivationStage('before');
                      }}
                      style={{
                        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.9) 0%, rgba(5, 150, 105, 0.95) 100%)',
                        backdropFilter: 'blur(16px)',
                        WebkitBackdropFilter: 'blur(16px)',
                        color: '#ffffff',
                        border: '1px solid rgba(255, 255, 255, 0.35)',
                        borderTop: '1.5px solid rgba(255, 255, 255, 0.65)',
                        borderRadius: '12px',
                        padding: '11px 22px',
                        fontSize: '13.5px',
                        fontWeight: '800',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: '0 8px 24px rgba(16, 185, 129, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.4)',
                        transition: 'all 0.25s ease'
                      }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)'; e.currentTarget.style.boxShadow = '0 12px 28px rgba(16, 185, 129, 0.45)'; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(16, 185, 129, 0.35)'; }}
                    >
                      <span>Explore Farming Tools</span>
                      <ChevronRight size={16} />
                    </button>

                    <button
                      onClick={() => setActiveNav('products')}
                      style={{
                        background: 'rgba(255, 255, 255, 0.08)',
                        backdropFilter: 'blur(16px)',
                        WebkitBackdropFilter: 'blur(16px)',
                        color: '#effbe7',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderTop: '1px solid rgba(255, 255, 255, 0.38)',
                        borderRadius: '12px',
                        padding: '11px 22px',
                        fontSize: '13.5px',
                        fontWeight: '800',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.25), inset 0 1px 1px rgba(255, 255, 255, 0.25)',
                        transition: 'all 0.25s ease'
                      }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.background = 'rgba(255, 255, 255, 0.14)'; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'; }}
                    >
                      <span>View My Products</span>
                      <ChevronRight size={16} />
                    </button>

                    <button
                      onClick={() => setActiveNav('three_d_farm_port')}
                      style={{
                        background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.2) 0%, rgba(3, 105, 161, 0.4) 100%)',
                        backdropFilter: 'blur(16px)',
                        WebkitBackdropFilter: 'blur(16px)',
                        color: '#38bdf8',
                        border: '1px solid rgba(56, 189, 248, 0.45)',
                        borderTop: '1.5px solid rgba(56, 189, 248, 0.75)',
                        borderRadius: '12px',
                        padding: '11px 20px',
                        fontSize: '13.5px',
                        fontWeight: '800',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: '0 8px 20px rgba(56, 189, 248, 0.25)',
                        transition: 'all 0.25s ease'
                      }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)'; e.currentTarget.style.boxShadow = '0 12px 28px rgba(56, 189, 248, 0.4)'; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(56, 189, 248, 0.25)'; }}
                    >
                      <Box size={16} color="#38bdf8" />
                      <span>3D Digital Twin</span>
                    </button>
                  </div>
                </div>

                {/* Illustrated Farm Elements (Right side) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div className="animate-sun-pulse" style={{ fontSize: '48px', marginBottom: '8px' }}>
                      ☀️
                    </div>
                    <div style={{ fontSize: '32px' }}>🌱 🌾 🌽</div>
                  </div>
                  <div style={{
                    width: '108px',
                    height: '108px',
                    borderRadius: '26px',
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0.05) 100%)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    border: '1.5px solid rgba(255, 255, 255, 0.25)',
                    borderTop: '1.5px solid rgba(255, 255, 255, 0.55)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '44px',
                    boxShadow: '0 12px 30px rgba(0, 0, 0, 0.25), inset 0 1px 1px rgba(255, 255, 255, 0.4)'
                  }}>
                    👨‍🌾
                    <span style={{ fontSize: '18px', marginTop: '-4px' }}>🚜</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3 Metric Cards with Glassmorphism (Real Database Data) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px', marginBottom: '28px' }}>
              <div
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(16, 185, 129, 0.04) 50%, rgba(5, 30, 20, 0.3) 100%)',
                  backdropFilter: 'blur(24px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderTop: '1.5px solid rgba(255, 255, 255, 0.4)',
                  borderLeft: '1.2px solid rgba(255, 255, 255, 0.25)',
                  borderRadius: '18px',
                  padding: '20px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: '0 16px 36px -10px rgba(0, 0, 0, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.25)',
                  transition: 'all 0.25s ease'
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 20px 42px -10px rgba(0,0,0,0.6), 0 0 25px rgba(16, 185, 129, 0.25)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 16px 36px -10px rgba(0, 0, 0, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.25)'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(5, 150, 105, 0.1) 100%)', border: '1px solid rgba(52, 211, 153, 0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399', boxShadow: '0 0 18px rgba(16, 185, 129, 0.25)' }}>
                    <Package size={24} />
                  </div>
                  <div>
                    <div style={{ fontSize: '22px', fontWeight: '900', color: '#effbe7' }}>
                      {farmerProducts.length} Items
                    </div>
                    <div style={{ fontSize: '12.5px', color: '#9db5aa', fontWeight: '600' }}>
                      {totalStockUnits.toLocaleString()} Units in Stock
                    </div>
                  </div>
                </div>
                <span style={{ fontSize: '11.5px', color: '#4ade80', fontWeight: '800', background: 'rgba(74, 222, 128, 0.12)', border: '1px solid rgba(74, 222, 128, 0.25)', padding: '3px 8px', borderRadius: '12px' }}>
                  {outOfStockProducts.length > 0 ? `${outOfStockProducts.length} Out` : 'Active'}
                </span>
              </div>

              <div
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(245, 158, 11, 0.04) 50%, rgba(35, 20, 5, 0.3) 100%)',
                  backdropFilter: 'blur(24px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderTop: '1.5px solid rgba(255, 255, 255, 0.4)',
                  borderLeft: '1.2px solid rgba(255, 255, 255, 0.25)',
                  borderRadius: '18px',
                  padding: '20px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: '0 16px 36px -10px rgba(0, 0, 0, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.25)',
                  transition: 'all 0.25s ease'
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 20px 42px -10px rgba(0,0,0,0.6), 0 0 25px rgba(245, 158, 11, 0.25)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 16px 36px -10px rgba(0, 0, 0, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.25)'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.25) 0%, rgba(180, 83, 9, 0.1) 100%)', border: '1px solid rgba(251, 191, 36, 0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fbbf24', boxShadow: '0 0 18px rgba(245, 158, 11, 0.25)' }}>
                    <Truck size={24} />
                  </div>
                  <div>
                    <div style={{ fontSize: '22px', fontWeight: '900', color: '#effbe7' }}>
                      {pendingOrdersCount + confirmedOrdersCount} Orders
                    </div>
                    <div style={{ fontSize: '12.5px', color: '#9db5aa', fontWeight: '600' }}>
                      {pendingOrdersCount} Pending • {confirmedOrdersCount} Confirmed
                    </div>
                  </div>
                </div>
                <span style={{ fontSize: '11.5px', color: '#fbbf24', fontWeight: '800', background: 'rgba(251, 191, 36, 0.12)', border: '1px solid rgba(251, 191, 36, 0.25)', padding: '3px 8px', borderRadius: '12px' }}>
                  {packedOrdersCount} Packed
                </span>
              </div>

              <div
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(14, 165, 233, 0.04) 50%, rgba(5, 25, 35, 0.3) 100%)',
                  backdropFilter: 'blur(24px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderTop: '1.5px solid rgba(255, 255, 255, 0.4)',
                  borderLeft: '1.2px solid rgba(255, 255, 255, 0.25)',
                  borderRadius: '18px',
                  padding: '20px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: '0 16px 36px -10px rgba(0, 0, 0, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.25)',
                  transition: 'all 0.25s ease'
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 20px 42px -10px rgba(0,0,0,0.6), 0 0 25px rgba(14, 165, 233, 0.25)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 16px 36px -10px rgba(0, 0, 0, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.25)'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.25) 0%, rgba(3, 105, 161, 0.1) 100%)', border: '1px solid rgba(56, 189, 248, 0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8', boxShadow: '0 0 18px rgba(14, 165, 233, 0.25)' }}>
                    <IndianRupee size={24} />
                  </div>
                  <div>
                    <div style={{ fontSize: '22px', fontWeight: '900', color: '#effbe7' }}>
                      ₹{realDeliveredEarnings.toLocaleString('en-IN')}
                    </div>
                    <div style={{ fontSize: '12.5px', color: '#9db5aa', fontWeight: '600' }}>
                      {completedOrdersCount} Delivered • ₹{realPendingRevenue.toLocaleString('en-IN')} In Pipeline
                    </div>
                  </div>
                </div>
                <span style={{ fontSize: '11.5px', color: '#38bdf8', fontWeight: '800', background: 'rgba(56, 189, 248, 0.12)', border: '1px solid rgba(56, 189, 248, 0.25)', padding: '3px 8px', borderRadius: '12px' }}>
                  Real Sales
                </span>
              </div>
            </div>

            {/* Farmer Tools: Stage Selector Buttons (Screenshot 1 & 2) */}
            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#effbe7', margin: '0 0 2px 0' }}>
                  Farmer Tools
                </h3>
                <p style={{ fontSize: '12.5px', color: '#9db5aa', margin: 0 }}>
                  Choose the stage of your farming journey
                </p>
              </div>

              <div className="farmer-stage-toggle-bar">
                <button
                  className={`farmer-stage-btn ${cultivationStage === 'before' ? 'active' : ''}`}
                  onClick={() => setCultivationStage('before')}
                >
                  <Sprout size={16} />
                  <span>Before Cultivation</span>
                </button>
                <button
                  className={`farmer-stage-btn ${cultivationStage === 'after' ? 'active' : ''}`}
                  onClick={() => setCultivationStage('after')}
                >
                  <Package size={16} />
                  <span>After Cultivation</span>
                </button>
              </div>
            </div>

            {/* Cultivation Stage Preview Content */}
            {cultivationStage === 'before' ? (
              <div>
                {/* 3 Main Before-Cultivation Cards (Screenshot 2) */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '18px', marginBottom: '28px' }}>
                  
                  {/* Card 1: Weather Analysis */}
                  <div
                    onClick={() => {
                      setActiveNav('before_cultivation');
                    }}
                    style={{
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(14, 165, 233, 0.04) 50%, rgba(5, 25, 35, 0.3) 100%)',
                      backdropFilter: 'blur(24px) saturate(180%)',
                      WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                      border: '1px solid rgba(255, 255, 255, 0.14)',
                      borderTop: '1.5px solid rgba(255, 255, 255, 0.35)',
                      borderLeft: '1.2px solid rgba(255, 255, 255, 0.22)',
                      borderRadius: '18px',
                      padding: '22px 24px',
                      cursor: 'pointer',
                      transition: 'all 0.25s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '14px',
                      boxShadow: '0 14px 34px -10px rgba(0, 0, 0, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.22)'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translateY(-3px)';
                      e.currentTarget.style.borderColor = '#38bdf8';
                      e.currentTarget.style.boxShadow = '0 20px 42px -10px rgba(0,0,0,0.6), 0 0 25px rgba(56, 189, 248, 0.25)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.14)';
                      e.currentTarget.style.boxShadow = '0 14px 34px -10px rgba(0, 0, 0, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.22)';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.25) 0%, rgba(3, 105, 161, 0.1) 100%)', border: '1px solid rgba(56, 189, 248, 0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', boxShadow: '0 0 18px rgba(14, 165, 233, 0.25)' }}>
                        {weatherCondition === 'rainy' ? '🌧️' : weatherCondition === 'sunny' ? '☀️' : weatherCondition === 'stormy' ? '⛈️' : '⛅'}
                      </div>
                      <div>
                        <h4 style={{ fontSize: '15.5px', fontWeight: '800', color: '#effbe7', margin: '0 0 4px 0' }}>
                          Weather Analysis
                        </h4>
                        <p style={{ fontSize: '12.5px', color: '#9db5aa', margin: 0 }}>
                          Check weather conditions and farming forecasts.
                        </p>
                      </div>
                    </div>
                    <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #059669)', border: '1px solid rgba(255, 255, 255, 0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)' }}>
                      <ChevronRight size={18} />
                    </div>
                  </div>

                  {/* Card 2: Crop Recommendation */}
                  <div
                    onClick={() => {
                      setActiveNav('before_cultivation');
                    }}
                    style={{
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(16, 185, 129, 0.04) 50%, rgba(5, 30, 20, 0.3) 100%)',
                      backdropFilter: 'blur(24px) saturate(180%)',
                      WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                      border: '1px solid rgba(255, 255, 255, 0.14)',
                      borderTop: '1.5px solid rgba(255, 255, 255, 0.35)',
                      borderLeft: '1.2px solid rgba(255, 255, 255, 0.22)',
                      borderRadius: '18px',
                      padding: '22px 24px',
                      cursor: 'pointer',
                      transition: 'all 0.25s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '14px',
                      boxShadow: '0 14px 34px -10px rgba(0, 0, 0, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.22)'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translateY(-3px)';
                      e.currentTarget.style.borderColor = '#10b981';
                      e.currentTarget.style.boxShadow = '0 20px 42px -10px rgba(0,0,0,0.6), 0 0 25px rgba(16, 185, 129, 0.25)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.14)';
                      e.currentTarget.style.boxShadow = '0 14px 34px -10px rgba(0, 0, 0, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.22)';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(5, 150, 105, 0.1) 100%)', border: '1px solid rgba(52, 211, 153, 0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', boxShadow: '0 0 18px rgba(16, 185, 129, 0.25)' }}>
                        🌱
                      </div>
                      <div>
                        <h4 style={{ fontSize: '15.5px', fontWeight: '800', color: '#effbe7', margin: '0 0 4px 0' }}>
                          Crop Recommendation
                        </h4>
                        <p style={{ fontSize: '12.5px', color: '#9db5aa', margin: 0 }}>
                          Get suitable crop suggestions for your soil & water.
                        </p>
                      </div>
                    </div>
                    <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #059669)', border: '1px solid rgba(255, 255, 255, 0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)' }}>
                      <ChevronRight size={18} />
                    </div>
                  </div>

                  {/* Card 3: Disease Detection */}
                  <div
                    onClick={() => {
                      setActiveNav('disease_detection');
                    }}
                    style={{
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(239, 68, 68, 0.04) 50%, rgba(35, 10, 10, 0.3) 100%)',
                      backdropFilter: 'blur(24px) saturate(180%)',
                      WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                      border: '1px solid rgba(255, 255, 255, 0.14)',
                      borderTop: '1.5px solid rgba(255, 255, 255, 0.35)',
                      borderLeft: '1.2px solid rgba(255, 255, 255, 0.22)',
                      borderRadius: '18px',
                      padding: '22px 24px',
                      cursor: 'pointer',
                      transition: 'all 0.25s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '14px',
                      boxShadow: '0 14px 34px -10px rgba(0, 0, 0, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.22)'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translateY(-3px)';
                      e.currentTarget.style.borderColor = '#f87171';
                      e.currentTarget.style.boxShadow = '0 20px 42px -10px rgba(0,0,0,0.6), 0 0 25px rgba(239, 68, 68, 0.25)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.14)';
                      e.currentTarget.style.boxShadow = '0 14px 34px -10px rgba(0, 0, 0, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.22)';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.25) 0%, rgba(185, 28, 28, 0.1) 100%)', border: '1px solid rgba(248, 113, 113, 0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', boxShadow: '0 0 18px rgba(239, 68, 68, 0.25)' }}>
                        🍃
                      </div>
                      <div>
                        <h4 style={{ fontSize: '15.5px', fontWeight: '800', color: '#effbe7', margin: '0 0 4px 0' }}>
                          Plant Disease Reference Clinic (Simulation Mode)
                        </h4>
                        <p style={{ fontSize: '12.5px', color: '#9db5aa', margin: 0 }}>
                          Reference leaf pathology in 2D & 3D, hear audio diagnosis & instant remedies.
                        </p>
                      </div>
                    </div>
                    <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #059669)', border: '1px solid rgba(255, 255, 255, 0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)' }}>
                      <ChevronRight size={18} />
                    </div>
                  </div>

                  {/* Card 4: Medicines & Fertilizers Center */}
                  <div
                    onClick={() => {
                      setActiveNav('medicines_fertilizers');
                    }}
                    style={{
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(16, 185, 129, 0.05) 50%, rgba(6, 40, 30, 0.35) 100%)',
                      backdropFilter: 'blur(24px) saturate(180%)',
                      WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                      border: '1px solid rgba(52, 211, 153, 0.35)',
                      borderTop: '1.5px solid rgba(255, 255, 255, 0.45)',
                      borderLeft: '1.2px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '18px',
                      padding: '22px 24px',
                      cursor: 'pointer',
                      transition: 'all 0.25s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '14px',
                      boxShadow: '0 14px 34px -10px rgba(0, 0, 0, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.25)'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translateY(-3px)';
                      e.currentTarget.style.borderColor = '#34d399';
                      e.currentTarget.style.boxShadow = '0 20px 42px -10px rgba(0,0,0,0.6), 0 0 25px rgba(52, 211, 153, 0.35)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.borderColor = 'rgba(52, 211, 153, 0.35)';
                      e.currentTarget.style.boxShadow = '0 14px 34px -10px rgba(0, 0, 0, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.25)';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: 'linear-gradient(135deg, rgba(52, 211, 153, 0.25) 0%, rgba(5, 150, 105, 0.1) 100%)', border: '1px solid rgba(52, 211, 153, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', boxShadow: '0 0 18px rgba(52, 211, 153, 0.25)' }}>
                        🧪
                      </div>
                      <div>
                        <h4 style={{ fontSize: '15.5px', fontWeight: '800', color: '#effbe7', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>Medicines & Fertilizers (இயற்கை & ரசாயனம்)</span>
                          <span style={{ fontSize: '10.5px', fontWeight: '800', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#ffffff', padding: '2px 8px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.35)', boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }}>OTP Safe</span>
                        </h4>
                        <p style={{ fontSize: '12.5px', color: '#9db5aa', margin: 0 }}>
                          Bio-organics, synthetic agro-medicines, and acreage dosage calculator.
                        </p>
                      </div>
                    </div>
                    <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #059669)', border: '1px solid rgba(255, 255, 255, 0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)' }}>
                      <ChevronRight size={18} />
                    </div>
                  </div>

                  {/* Card 5: 3D Smart Farm & Crop Simulation Port */}
                  <div
                    onClick={() => {
                      setActiveNav('three_d_farm_port');
                    }}
                    style={{
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(56, 189, 248, 0.05) 50%, rgba(3, 30, 45, 0.35) 100%)',
                      backdropFilter: 'blur(24px) saturate(180%)',
                      WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                      border: '1px solid rgba(56, 189, 248, 0.35)',
                      borderTop: '1.5px solid rgba(255, 255, 255, 0.45)',
                      borderLeft: '1.2px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '18px',
                      padding: '22px 24px',
                      cursor: 'pointer',
                      transition: 'all 0.25s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '14px',
                      boxShadow: '0 14px 34px -10px rgba(0, 0, 0, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.25)'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translateY(-3px)';
                      e.currentTarget.style.borderColor = '#38bdf8';
                      e.currentTarget.style.boxShadow = '0 20px 42px -10px rgba(0,0,0,0.6), 0 0 25px rgba(56, 189, 248, 0.35)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.35)';
                      e.currentTarget.style.boxShadow = '0 14px 34px -10px rgba(0, 0, 0, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.25)';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.25) 0%, rgba(3, 105, 161, 0.1) 100%)', border: '1px solid rgba(56, 189, 248, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', boxShadow: '0 0 18px rgba(56, 189, 248, 0.25)' }}>
                        🌐
                      </div>
                      <div>
                        <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#ffffff', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>3D Interactive Farm Simulation Port</span>
                          <span style={{ fontSize: '10px', background: '#0284c7', color: '#ffffff', padding: '1px 6px', borderRadius: '6px' }}>360° Real-Time</span>
                        </h4>
                        <p style={{ fontSize: '12px', color: '#cbd5e1', margin: 0 }}>
                          Interactive 3D elevation terrain, soil moisture radar & plant inspector.
                        </p>
                      </div>
                    </div>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                      <ChevronRight size={18} />
                    </div>
                  </div>

                </div>
              </div>
            ) : (
              /* After Cultivation Quick Preview */
              <div style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(16, 185, 129, 0.04) 50%, rgba(5, 30, 20, 0.3) 100%)',
                backdropFilter: 'blur(24px) saturate(180%)',
                WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                border: '1px solid rgba(255, 255, 255, 0.14)',
                borderTop: '1.5px solid rgba(255, 255, 255, 0.35)',
                borderLeft: '1.2px solid rgba(255, 255, 255, 0.22)',
                borderRadius: '20px',
                padding: '26px 28px',
                marginBottom: '28px',
                boxShadow: '0 16px 36px -10px rgba(0, 0, 0, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.22)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '20px' }}>
                  <div>
                    <h4 style={{ fontSize: '17px', fontWeight: '800', color: '#4ade80', margin: 0, textShadow: '0 0 12px rgba(74, 222, 128, 0.3)' }}>
                      📦 After Cultivation: Harvested Stock & Dispatches
                    </h4>
                    <p style={{ fontSize: '12.5px', color: '#9db5aa', margin: '4px 0 0 0' }}>
                      Manage packaged produce ready for buyer purchase and assign delivery drivers.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveNav('products')}
                    style={{
                      background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.9) 0%, rgba(5, 150, 105, 0.95) 100%)',
                      backdropFilter: 'blur(12px)',
                      color: '#ffffff',
                      border: '1px solid rgba(255, 255, 255, 0.35)',
                      borderTop: '1.5px solid rgba(255, 255, 255, 0.6)',
                      padding: '9px 18px',
                      borderRadius: '12px',
                      fontSize: '13px',
                      fontWeight: '800',
                      cursor: 'pointer',
                      boxShadow: '0 6px 18px rgba(16, 185, 129, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.4)'
                    }}
                  >
                    + Manage Active Listings
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                  <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '16px', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.09)', backdropFilter: 'blur(10px)' }}>
                    <span style={{ fontSize: '11.5px', color: '#9db5aa', fontWeight: '600' }}>Active Produce Items</span>
                    <div style={{ fontSize: '22px', fontWeight: '900', color: '#effbe7' }}>{farmerProducts.length} Items</div>
                  </div>
                  <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '16px', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.09)', backdropFilter: 'blur(10px)' }}>
                    <span style={{ fontSize: '11.5px', color: '#9db5aa', fontWeight: '600' }}>Inventory Valuation</span>
                    <div style={{ fontSize: '22px', fontWeight: '900', color: '#4ade80' }}>₹{totalInventoryValuation.toFixed(2)}</div>
                  </div>
                  <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '16px', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.09)', backdropFilter: 'blur(10px)' }}>
                    <span style={{ fontSize: '11.5px', color: '#9db5aa', fontWeight: '600' }}>Buyer Orders</span>
                    <div style={{ fontSize: '22px', fontWeight: '900', color: '#38bdf8' }}>{incomingOrders.length} Orders</div>
                  </div>
                </div>
              </div>
            )}

            {/* Middle Section: 1. My Farm & 2. Available Products */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '22px', marginBottom: '28px' }}>
              
              {/* 1. My Farm */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(16, 185, 129, 0.03) 50%, rgba(5, 30, 20, 0.3) 100%)',
                backdropFilter: 'blur(24px) saturate(180%)',
                WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                border: '1px solid rgba(255, 255, 255, 0.14)',
                borderTop: '1.5px solid rgba(255, 255, 255, 0.35)',
                borderLeft: '1.2px solid rgba(255, 255, 255, 0.22)',
                borderRadius: '20px',
                padding: '24px',
                boxShadow: '0 16px 36px -10px rgba(0, 0, 0, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.22)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                  <div>
                    <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#effbe7', margin: 0 }}>
                      1. My Farm
                    </h4>
                    <span style={{ fontSize: '11.5px', color: '#9db5aa' }}>Your farm. Your crops. Your progress.</span>
                  </div>
                  <button
                    onClick={() => setActiveNav('profile')}
                    style={{ background: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(52, 211, 153, 0.3)', padding: '5px 12px', borderRadius: '12px', color: '#34d399', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                  >
                    View Details →
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '18px' }}>
                  <div style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '14px', borderRadius: '14px', textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', marginBottom: '4px' }}>🌽</div>
                    <div style={{ fontSize: '18px', fontWeight: '900', color: '#effbe7' }}>4</div>
                    <div style={{ fontSize: '11px', color: '#9db5aa' }}>Active Crops</div>
                  </div>
                  <div style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '14px', borderRadius: '14px', textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', marginBottom: '4px' }}>📍</div>
                    <div style={{ fontSize: '18px', fontWeight: '900', color: '#effbe7' }}>3</div>
                    <div style={{ fontSize: '11px', color: '#9db5aa' }}>Farm Fields</div>
                  </div>
                  <div style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '14px', borderRadius: '14px', textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', marginBottom: '4px' }}>📅</div>
                    <div style={{ fontSize: '18px', fontWeight: '900', color: '#4ade80' }}>82%</div>
                    <div style={{ fontSize: '11px', color: '#9db5aa' }}>Crop Progress</div>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px', color: '#9db5aa' }}>
                    <span>Current Crop Growth Progress</span>
                    <span style={{ color: '#4ade80', fontWeight: '800' }}>82%</span>
                  </div>
                  <div className="farmer-progress-bar">
                    <div className="farmer-progress-fill" style={{ width: '82%' }} />
                  </div>
                </div>
              </div>

              {/* 2. Available Products (Real Database Data) */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(16, 185, 129, 0.03) 50%, rgba(5, 30, 20, 0.3) 100%)',
                backdropFilter: 'blur(24px) saturate(180%)',
                WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                border: '1px solid rgba(255, 255, 255, 0.14)',
                borderTop: '1.5px solid rgba(255, 255, 255, 0.35)',
                borderLeft: '1.2px solid rgba(255, 255, 255, 0.22)',
                borderRadius: '20px',
                padding: '24px',
                boxShadow: '0 16px 36px -10px rgba(0, 0, 0, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.22)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                  <div>
                    <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#effbe7', margin: 0 }}>
                      2. Available Products
                    </h4>
                    <span style={{ fontSize: '11.5px', color: '#9db5aa' }}>Currently listed produce from your farm inventory.</span>
                  </div>
                  <button
                    onClick={() => setActiveNav('products')}
                    style={{ background: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(52, 211, 153, 0.3)', padding: '5px 12px', borderRadius: '12px', color: '#34d399', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                  >
                    View All ({farmerProducts.length}) →
                  </button>
                </div>

                {farmerProducts.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px 10px', color: '#9db5aa' }}>
                    <div style={{ fontSize: '28px', marginBottom: '6px' }}>🧺</div>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#effbe7' }}>No produce listed yet</div>
                    <p style={{ fontSize: '11.5px', margin: '4px 0 12px 0' }}>Add fresh harvests to connect with buyers.</p>
                    <button
                      onClick={() => { setActiveNav('products'); setShowAddForm(true); }}
                      style={{ background: '#10b981', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                    >
                      + Add First Produce
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '10px' }}>
                    {farmerProducts.slice(0, 6).map((prod) => (
                      <div key={prod._id || prod.id} style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '12px 8px', textAlign: 'center' }}>
                        {prod.image ? (
                          <img src={prod.image} alt={prod.title} style={{ width: '38px', height: '38px', borderRadius: '8px', objectFit: 'cover', margin: '0 auto 6px auto', display: 'block' }} />
                        ) : (
                          <div style={{ fontSize: '24px', marginBottom: '4px' }}>🌾</div>
                        )}
                        <div style={{ fontSize: '12px', fontWeight: '800', color: '#effbe7', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{prod.title}</div>
                        <div style={{ fontSize: '10.5px', color: Number(prod.stock) <= 0 ? '#ef4444' : Number(prod.stock) <= 10 ? '#f59e0b' : '#9db5aa' }}>
                          {Number(prod.stock) <= 0 ? 'Out of Stock' : `${prod.stock} ${prod.unit || 'kg'}`}
                        </div>
                        <div style={{ fontSize: '11.5px', color: '#4ade80', fontWeight: '800' }}>₹{prod.price}/{prod.unit || 'kg'}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Quick KPI Strip (Real Database Data) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '28px' }}>
              <div style={{ background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.07) 0%, rgba(255, 255, 255, 0.02) 100%)', backdropFilter: 'blur(16px)', padding: '16px 18px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.12)', borderTop: '1px solid rgba(255, 255, 255, 0.25)', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: '0 8px 20px rgba(0,0,0,0.2)' }}>
                <span style={{ fontSize: '24px' }}>📦</span>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: '900', color: '#effbe7' }}>{farmerProducts.length}</div>
                  <div style={{ fontSize: '11.5px', color: '#9db5aa', fontWeight: '600' }}>Active Listings</div>
                </div>
              </div>

              <div style={{ background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.07) 0%, rgba(255, 255, 255, 0.02) 100%)', backdropFilter: 'blur(16px)', padding: '16px 18px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.12)', borderTop: '1px solid rgba(255, 255, 255, 0.25)', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: '0 8px 20px rgba(0,0,0,0.2)' }}>
                <span style={{ fontSize: '24px' }}>💰</span>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: '900', color: '#4ade80' }}>₹{realDeliveredEarnings.toLocaleString('en-IN')}</div>
                  <div style={{ fontSize: '11.5px', color: '#9db5aa', fontWeight: '600' }}>Completed Earnings</div>
                </div>
              </div>

              <div style={{ background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.07) 0%, rgba(255, 255, 255, 0.02) 100%)', backdropFilter: 'blur(16px)', padding: '16px 18px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.12)', borderTop: '1px solid rgba(255, 255, 255, 0.25)', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: '0 8px 20px rgba(0,0,0,0.2)' }}>
                <span style={{ fontSize: '24px' }}>📑</span>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: '900', color: '#fbbf24' }}>{pendingOrdersCount}</div>
                  <div style={{ fontSize: '11.5px', color: '#9db5aa', fontWeight: '600' }}>Pending Orders</div>
                </div>
              </div>

              <div style={{ background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.07) 0%, rgba(255, 255, 255, 0.02) 100%)', backdropFilter: 'blur(16px)', padding: '16px 18px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.12)', borderTop: '1px solid rgba(255, 255, 255, 0.25)', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: '0 8px 20px rgba(0,0,0,0.2)' }}>
                <span style={{ fontSize: '24px' }}>🚚</span>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: '900', color: '#38bdf8' }}>{completedOrdersCount}</div>
                  <div style={{ fontSize: '11.5px', color: '#9db5aa', fontWeight: '600' }}>Delivered Orders</div>
                </div>
              </div>
            </div>

            {/* Recent Orders Activity Feed (Real Orders from Database) */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(55, 189, 120, 0.15)', borderRadius: '14px', padding: '22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#f3f4f6', margin: 0 }}>
                  Recent Orders & Activity
                </h4>
                <button
                  onClick={() => setActiveNav('orders')}
                  style={{ background: 'transparent', border: 'none', color: '#34d399', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                >
                  View All Orders →
                </button>
              </div>

              {recentOrdersList.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: '#9ca3af', fontSize: '12.5px' }}>
                  No recent customer order activity recorded yet. Buyer orders will appear here automatically.
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                  {recentOrdersList.map((ord) => (
                    <div key={ord._id || ord.id} style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontSize: '12.5px', fontWeight: '800', color: '#f3f4f6' }}>Order #{ord.orderId || String(ord._id || ord.id).slice(-6)}</span>
                        <span style={{ fontSize: '10.5px', fontWeight: '800', color: ord.status === 'delivered' ? '#34d399' : ord.status === 'cancelled' ? '#f87171' : '#fbbf24' }}>
                          {(ord.status || 'pending').toUpperCase()}
                        </span>
                      </div>
                      <div style={{ fontSize: '11px', color: '#34d399' }}>
                        ₹{Number(ord.totalAmount || 0).toFixed(2)} • {ord.customerName || 'Customer'}
                      </div>
                      <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '4px' }}>
                        {new Date(ord.createdAt || Date.now()).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* =========================================================================
            VIEW 2: BEFORE CULTIVATION SUITE (Interactive Tools 1, 2, 3)
            ========================================================================= */}
        {activeNav === 'before_cultivation' && (
          <div style={{ padding: '24px 28px', maxWidth: '1400px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
            
            {/* View Header */}
            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '20px' }}>🌱</span>
                  <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#f3f4f6', margin: 0 }}>
                    Before Cultivation Advisory & AI Suite
                  </h2>
                </div>
                <p style={{ fontSize: '13px', color: '#9ca3af', margin: '4px 0 0 0' }}>
                  Make scientific, weather-backed decisions before sowing: Weather analysis, intelligent seed recommendation, and plant health checks.
                </p>
              </div>

              {/* City / Farmer Location Selector with GPS & Search */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', position: 'relative' }}>
                <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: '600' }}>Farmer Location:</span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}>
                  <select
                    className="farmer-location-select"
                    value={selectedCity}
                    onChange={(e) => {
                      if (e.target.value === '__search__') {
                        setIsSearchingCity(true);
                      } else if (e.target.value === '__gps__') {
                        detectCurrentGpsLocation();
                      } else {
                        handleCityChange(e.target.value);
                      }
                    }}
                    style={{
                      background: '#092119',
                      border: '1.5px solid rgba(55, 189, 120, 0.45)',
                      color: '#ffffff',
                      colorScheme: 'dark',
                      padding: '8px 14px',
                      borderRadius: '10px',
                      fontSize: '13px',
                      fontWeight: '800',
                      cursor: 'pointer',
                      outline: 'none',
                      maxWidth: '280px',
                      boxShadow: '0 4px 14px rgba(0,0,0,0.35)'
                    }}
                  >
                    <option value="My Farm Location (GPS)" style={{ background: '#08241b', color: '#86efac', fontWeight: '800' }}>
                      📍 My Farm Location (GPS Default)
                    </option>
                    <optgroup label="── Tamil Nadu Agri Belts ──" style={{ background: '#041610', color: '#34d399', fontWeight: '800' }}>
                      <option value="Namakkal" style={{ background: '#08241b', color: '#f8fafc' }}>📍 Namakkal (Agro Gateway)</option>
                      <option value="Chidambaram" style={{ background: '#08241b', color: '#f8fafc' }}>📍 Chidambaram (Delta Basin)</option>
                      <option value="Thanjavur" style={{ background: '#08241b', color: '#f8fafc' }}>📍 Thanjavur (Paddy Granary)</option>
                      <option value="Coimbatore" style={{ background: '#08241b', color: '#f8fafc' }}>📍 Coimbatore (Kongu Agro)</option>
                      <option value="Madurai" style={{ background: '#08241b', color: '#f8fafc' }}>📍 Madurai (Vaigai Basin)</option>
                      <option value="Tiruchirappalli" style={{ background: '#08241b', color: '#f8fafc' }}>📍 Trichy (Delta Junction)</option>
                      <option value="Salem" style={{ background: '#08241b', color: '#f8fafc' }}>📍 Salem (Mango & Tapioca)</option>
                      <option value="Tirunelveli" style={{ background: '#08241b', color: '#f8fafc' }}>📍 Tirunelveli (Thamirabarani)</option>
                      <option value="Erode" style={{ background: '#08241b', color: '#f8fafc' }}>📍 Erode (Turmeric & Spices)</option>
                    </optgroup>
                    <optgroup label="── Major National Agricultural Zones ──" style={{ background: '#041610', color: '#38bdf8', fontWeight: '800' }}>
                      <option value="Mandya" style={{ background: '#08241b', color: '#f8fafc' }}>📍 Mandya (Sugarcane Basin, KA)</option>
                      <option value="Guntur" style={{ background: '#08241b', color: '#f8fafc' }}>📍 Guntur (Chilli & Cotton, AP)</option>
                      <option value="Nashik" style={{ background: '#08241b', color: '#f8fafc' }}>📍 Nashik (Grape & Onion Hub, MH)</option>
                      <option value="Punjab" style={{ background: '#08241b', color: '#f8fafc' }}>📍 Punjab (Ludhiana - Wheat Bowl)</option>
                      <option value="Haryana" style={{ background: '#08241b', color: '#f8fafc' }}>📍 Haryana (Karnal - Basmati Granary)</option>
                    </optgroup>
                    {customLocations.length > 0 && (
                      <optgroup label="── Custom & Searched Locations ──" style={{ background: '#041610', color: '#fde047', fontWeight: '800' }}>
                        {customLocations.map(loc => (
                          <option key={loc.name} value={loc.name} style={{ background: '#08241b', color: '#f8fafc' }}>
                            {loc.label.startsWith('📍') ? loc.label : `📍 ${loc.label}`}
                          </option>
                        ))}
                      </optgroup>
                    )}
                    <option value="__gps__" style={{ background: '#08241b', color: '#34d399', fontWeight: '800' }}>
                      🎯 Detect My Current Live GPS
                    </option>
                    <option value="__search__" style={{ background: '#08241b', color: '#38bdf8', fontWeight: '800' }}>
                      🔍 Search any village or city...
                    </option>
                  </select>

                  {/* Quick GPS detect button */}
                  <button
                    onClick={() => detectCurrentGpsLocation()}
                    title="Get my live GPS farm location"
                    style={{
                      background: 'rgba(16, 185, 129, 0.18)',
                      border: '1px solid rgba(16, 185, 129, 0.45)',
                      color: '#86efac',
                      padding: '8px 12px',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '800',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <MapPin size={14} color="#34d399" />
                    <span>GPS</span>
                  </button>

                  {/* Search modal / popup button */}
                  <button
                    onClick={() => setIsSearchingCity(!isSearchingCity)}
                    title="Search any location across India or globally"
                    style={{
                      background: isSearchingCity ? 'rgba(56, 189, 248, 0.3)' : 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(56, 189, 248, 0.4)',
                      color: '#7dd3fc',
                      padding: '8px 12px',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '800',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Search size={14} color="#38bdf8" />
                    <span>Search</span>
                  </button>

                  {/* Interactive Autocomplete Search Dropdown */}
                  {isSearchingCity && (
                    <div style={{
                      position: 'absolute',
                      top: '110%',
                      right: 0,
                      width: '320px',
                      background: 'rgba(5, 22, 17, 0.97)',
                      backdropFilter: 'blur(24px)',
                      border: '1px solid rgba(56, 189, 248, 0.45)',
                      borderRadius: '14px',
                      padding: '12px',
                      zIndex: 100,
                      boxShadow: '0 20px 45px rgba(0,0,0,0.8), 0 0 25px rgba(56, 189, 248, 0.2)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                        <Search size={15} color="#38bdf8" />
                        <input
                          type="text"
                          placeholder="Type village, taluk, district, or city..."
                          value={citySearchQuery}
                          onChange={(e) => handleSearchCityInput(e.target.value)}
                          autoFocus
                          style={{
                            width: '100%',
                            background: 'rgba(255,255,255,0.08)',
                            border: '1px solid rgba(255,255,255,0.18)',
                            borderRadius: '8px',
                            padding: '7px 10px',
                            color: '#ffffff',
                            fontSize: '12.5px',
                            outline: 'none'
                          }}
                        />
                        <button
                          onClick={() => {
                            setIsSearchingCity(false);
                            setCitySearchResults([]);
                          }}
                          style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '2px' }}
                        >
                          <X size={16} />
                        </button>
                      </div>

                      {searchingLoading && (
                        <div style={{ fontSize: '11.5px', color: '#93c5fd', textAlign: 'center', padding: '10px 0' }}>
                          🔍 Searching satellite registry...
                        </div>
                      )}

                      {!searchingLoading && citySearchResults.length > 0 && (
                        <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {citySearchResults.map((loc, idx) => (
                            <div
                              key={idx}
                              onClick={() => handleSelectSearchResult(loc)}
                              style={{
                                padding: '8px 10px',
                                borderRadius: '8px',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                cursor: 'pointer',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                transition: 'all 0.15s ease'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(56, 189, 248, 0.2)';
                                e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.5)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                              }}
                            >
                              <div>
                                <div style={{ fontSize: '12.5px', fontWeight: '700', color: '#ffffff' }}>
                                  📍 {loc.cityName}
                                </div>
                                <div style={{ fontSize: '10.5px', color: '#94a3b8' }}>
                                  {loc.admin1 ? `${loc.admin1}, ` : ''}{loc.country}
                                </div>
                              </div>
                              <span style={{ fontSize: '11px', color: '#38bdf8', fontWeight: '700' }}>Select →</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {!searchingLoading && citySearchQuery.length >= 2 && citySearchResults.length === 0 && (
                        <div style={{ fontSize: '11.5px', color: '#9ca3af', textAlign: 'center', padding: '8px 0' }}>
                          No locations found for "{citySearchQuery}". Try another spelling.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* -------------------------------------------------------------
                TOOL 1: WEATHER ANALYSIS (With Dynamic Cloud Imagery & Advisory)
                ------------------------------------------------------------- */}
            <div style={{ marginBottom: '20px', width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                  <Cloud size={18} /> 1. Weather Analysis & Dynamic Cloud Atmosphere
                </h3>

                {/* Live Weather Simulator Buttons & Live Satellite Toggle */}
                <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <button
                    onClick={() => {
                      fetchRealForecast(selectedCity);
                      showToast(`Satellite telemetry active for ${selectedCity}`, 'success');
                    }}
                    style={{
                      padding: '3px 10px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: '800',
                      cursor: 'pointer',
                      border: weatherMode === 'live' ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.15)',
                      background: weatherMode === 'live' ? 'rgba(16, 185, 129, 0.28)' : 'rgba(255,255,255,0.06)',
                      color: weatherMode === 'live' ? '#6ee7b7' : '#d1d5db',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      boxShadow: weatherMode === 'live' ? '0 0 10px rgba(16, 185, 129, 0.35)' : 'none'
                    }}
                  >
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: weatherMode === 'live' ? '#10b981' : '#9ca3af', display: 'inline-block', boxShadow: weatherMode === 'live' ? '0 0 5px #10b981' : 'none' }} />
                    🛰️ Live Radar
                  </button>

                  <span style={{ fontSize: '10.5px', color: '#9ca3af', marginLeft: '3px' }}>Simulate:</span>
                  <button
                    onClick={() => handleManualWeatherToggle('sunny')}
                    style={{
                      padding: '3px 8px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      border: '1px solid rgba(255,255,255,0.1)',
                      background: (weatherMode === 'simulated' && weatherCondition === 'sunny') ? '#f59e0b' : 'rgba(255,255,255,0.06)',
                      color: (weatherMode === 'simulated' && weatherCondition === 'sunny') ? '#000' : '#d1d5db'
                    }}
                  >
                    ☀️ Sunny
                  </button>
                  <button
                    onClick={() => handleManualWeatherToggle('cloudy')}
                    style={{
                      padding: '3px 8px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      border: '1px solid rgba(255,255,255,0.1)',
                      background: (weatherMode === 'simulated' && weatherCondition === 'cloudy') ? '#10b981' : 'rgba(255,255,255,0.06)',
                      color: '#ffffff'
                    }}
                  >
                    ⛅ Cloudy
                  </button>
                  <button
                    onClick={() => handleManualWeatherToggle('rainy')}
                    style={{
                      padding: '3px 8px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      border: '1px solid rgba(255,255,255,0.1)',
                      background: (weatherMode === 'simulated' && weatherCondition === 'rainy') ? '#3b82f6' : 'rgba(255,255,255,0.06)',
                      color: '#ffffff'
                    }}
                  >
                    🌧️ Rainy
                  </button>
                  <button
                    onClick={() => handleManualWeatherToggle('stormy')}
                    style={{
                      padding: '3px 8px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      border: '1px solid rgba(255,255,255,0.1)',
                      background: (weatherMode === 'simulated' && weatherCondition === 'stormy') ? '#8b5cf6' : 'rgba(255,255,255,0.06)',
                      color: '#ffffff'
                    }}
                  >
                    ⛈️ Storm
                  </button>
                  <button
                    onClick={() => handleManualWeatherToggle('mist')}
                    style={{
                      padding: '3px 8px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      border: '1px solid rgba(255,255,255,0.1)',
                      background: (weatherMode === 'simulated' && weatherCondition === 'mist') ? '#64748b' : 'rgba(255,255,255,0.06)',
                      color: '#ffffff'
                    }}
                  >
                    🌫️ Mist
                  </button>
                </div>
              </div>

              {/* Dynamic Weather & Cloud Display Box with Reduced Dimensions */}
              <div className={`dynamic-cloud-box weather-${weatherCondition}`} style={{ padding: '14px 18px', borderRadius: '16px' }}>
                {/* Live Radar Header & Sync Bar */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '6px', position: 'relative', zIndex: 2 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{
                      fontSize: '10.5px',
                      background: 'rgba(0,0,0,0.75)',
                      color: (weatherMode === 'simulated' || weatherData.dataSource === 'simulated')
                        ? '#fbbf24'
                        : weatherData.isCached
                        ? '#67e8f9'
                        : weatherData.isLive
                        ? '#34d399'
                        : '#f87171',
                      padding: '3px 10px',
                      borderRadius: '10px',
                      fontWeight: '800',
                      letterSpacing: '0.5px',
                      border: `1px solid ${(weatherMode === 'simulated' || weatherData.dataSource === 'simulated') ? 'rgba(251, 191, 36, 0.4)' : weatherData.isCached ? 'rgba(103, 232, 249, 0.4)' : weatherData.isLive ? 'rgba(52, 211, 153, 0.4)' : 'rgba(248, 113, 113, 0.4)'}`,
                      textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}>
                      <span style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: (weatherMode === 'simulated' || weatherData.dataSource === 'simulated')
                          ? '#fbbf24'
                          : weatherData.isCached
                          ? '#38bdf8'
                          : weatherData.isLive
                          ? '#10b981'
                          : '#ef4444',
                        boxShadow: `0 0 6px ${(weatherMode === 'simulated' || weatherData.dataSource === 'simulated') ? '#fbbf24' : weatherData.isCached ? '#38bdf8' : weatherData.isLive ? '#10b981' : '#ef4444'}`
                      }} />
                      {(weatherMode === 'simulated' || weatherData.dataSource === 'simulated')
                        ? 'SIMULATED WEATHER • SCENARIO PREVIEW'
                        : weatherData.isCached
                        ? 'CACHED WEATHER DATA • RECENT TELEMETRY'
                        : weatherData.isLive
                        ? 'LIVE SATELLITE AGRI-RADAR • VERIFIED TELEMETRY'
                        : 'TELEMETRY OFFLINE • SATELLITE FEED PENDING'}
                    </span>
                    <span style={{ fontSize: '12px', color: '#fde047', fontWeight: '700', textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}>
                      • {selectedCity} Field Sensor
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '10.5px', color: '#cbd5e1', textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
                      Telemetry: <strong style={{ color: weatherData.isLive ? '#86efac' : weatherData.isCached ? '#67e8f9' : '#fca5a5' }}>{weatherData.lastUpdated || 'Live Sync'}</strong>
                    </span>
                    <button
                      onClick={() => fetchRealForecast(selectedCity)}
                      disabled={weatherLoading}
                      title="Sync latest live weather satellite feed"
                      style={{
                        background: 'rgba(0,0,0,0.6)',
                        border: '1px solid rgba(255,255,255,0.25)',
                        color: '#ffffff',
                        padding: '3px 8px',
                        borderRadius: '7px',
                        cursor: 'pointer',
                        fontSize: '10.5px',
                        fontWeight: '700',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <RotateCw size={11} style={{ animation: weatherLoading ? 'spin 1s linear infinite' : 'none' }} />
                      {weatherLoading ? 'Pinging...' : 'Sync'}
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', position: 'relative', zIndex: 2 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                      <span style={{ fontSize: '38px', fontWeight: '900', letterSpacing: '-1px', color: '#ffffff', textShadow: '0 2px 8px rgba(0,0,0,0.8)', lineHeight: '1' }}>
                        {weatherData.temp !== null ? `${weatherData.temp}°C` : '--°C'}
                      </span>
                      <div>
                        <div style={{ fontSize: '17px', fontWeight: '800', textTransform: 'capitalize', color: '#ffffff', textShadow: '0 2px 6px rgba(0,0,0,0.85)' }}>
                          {weatherData.temp !== null
                            ? (weatherData.conditionLabel || (weatherCondition === 'rainy' ? 'Heavy Rain Showers' : weatherCondition === 'sunny' ? 'Clear & Sunny Sky' : weatherCondition === 'stormy' ? 'Thunderstorm Warning' : weatherCondition === 'mist' ? 'Morning Dew & Mist' : 'Overcast Cumulus Clouds'))
                            : 'Live weather data unavailable'}
                        </div>
                        <div style={{ fontSize: '11.5px', color: '#ffffff', fontWeight: '600', textShadow: '0 1px 4px rgba(0,0,0,0.9)', marginTop: '2px' }}>
                          {weatherData.temp !== null
                            ? `Feels like ${weatherData.feelsLike}°C • Barometer ${weatherData.pressure || 1009} hPa • Dew Point ${weatherData.dewPoint || 22}°C • Soil moisture receptive`
                            : 'Real meteorological satellite telemetry is currently offline • Default telemetry paused'}
                        </div>
                      </div>
                    </div>

                    {/* Meteorological metrics */}
                    <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0,0,0,0.65)', border: '1px solid rgba(255,255,255,0.2)', padding: '5px 10px', borderRadius: '8px', color: '#ffffff', textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
                        <Droplets size={14} color="#67e8f9" />
                        <span style={{ fontSize: '11.5px', fontWeight: '600' }}>Humidity: <strong style={{ color: '#67e8f9', fontWeight: '800' }}>{weatherData.humidity !== null ? `${weatherData.humidity}%` : '--%'}</strong></span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0,0,0,0.65)', border: '1px solid rgba(255,255,255,0.2)', padding: '5px 10px', borderRadius: '8px', color: '#ffffff', textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
                        <CloudRain size={14} color="#93c5fd" />
                        <span style={{ fontSize: '11.5px', fontWeight: '600' }}>Rain (Now): <strong style={{ color: '#93c5fd', fontWeight: '800' }}>{weatherData.rainChance !== null ? `${weatherData.rainChance}%` : '--%'}</strong></span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0,0,0,0.65)', border: '1px solid rgba(255,255,255,0.2)', padding: '5px 10px', borderRadius: '8px', color: '#ffffff', textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
                        <CloudRain size={14} color="#60a5fa" />
                        <span style={{ fontSize: '11.5px', fontWeight: '600' }}>Peak Today: <strong style={{ color: '#60a5fa', fontWeight: '800' }}>{weatherData.peakRainChance !== null ? `${weatherData.peakRainChance}% (${weatherData.todayRainMm ?? '0.0'} mm)` : '--%'}</strong></span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0,0,0,0.65)', border: '1px solid rgba(255,255,255,0.2)', padding: '5px 10px', borderRadius: '8px', color: '#ffffff', textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
                        <Wind size={14} color="#a7f3d0" />
                        <span style={{ fontSize: '11.5px', fontWeight: '600' }}>Wind: <strong style={{ color: '#a7f3d0', fontWeight: '800' }}>{weatherData.temp !== null ? weatherData.wind : '--'}</strong></span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0,0,0,0.65)', border: '1px solid rgba(255,255,255,0.2)', padding: '5px 10px', borderRadius: '8px', color: '#ffffff', textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
                        <Sun size={14} color="#fbbf24" />
                        <span style={{ fontSize: '11.5px', fontWeight: '600' }}>UV Index: <strong style={{ color: '#fde047', fontWeight: '800' }}>{weatherData.uvIndex !== null ? `${weatherData.uvIndex} ${weatherData.uvIndex > 5 ? '(High)' : '(Optimal)'}` : '--'}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Cloud / Sky Graphic & Animation (Scaled down) */}
                  <div style={{ position: 'relative', width: '130px', height: '75px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {weatherCondition === 'sunny' && (
                      <div style={{ textAlign: 'center' }}>
                        <div className="animate-sun-pulse" style={{ fontSize: '44px' }}>☀️</div>
                        <div className="animate-cloud-drift" style={{ fontSize: '20px', marginTop: '-18px', opacity: 0.8 }}>☁️</div>
                      </div>
                    )}

                    {weatherCondition === 'cloudy' && (
                      <div className="animate-cloud-drift" style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '42px' }}>☁️</div>
                        <div style={{ fontSize: '26px', marginTop: '-20px', marginLeft: '16px', opacity: 0.9 }}>⛅</div>
                      </div>
                    )}

                    {weatherCondition === 'rainy' && (
                      <div style={{ textAlign: 'center' }}>
                        <div className="animate-cloud-drift" style={{ fontSize: '40px' }}>🌧️</div>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '4px' }}>
                          <span className="raindrop-item" style={{ animationDelay: '0s' }} />
                          <span className="raindrop-item" style={{ animationDelay: '0.2s' }} />
                          <span className="raindrop-item" style={{ animationDelay: '0.4s' }} />
                        </div>
                      </div>
                    )}

                    {weatherCondition === 'stormy' && (
                      <div style={{ textAlign: 'center' }}>
                        <div className="animate-lightning" style={{ fontSize: '42px' }}>⛈️</div>
                        <div style={{ fontSize: '13px', color: '#fde047', fontWeight: '800' }}>⚡ LIGHTNING</div>
                      </div>
                    )}

                    {weatherCondition === 'mist' && (
                      <div className="animate-cloud-drift" style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '40px', opacity: 0.85 }}>🌫️</div>
                        <div style={{ fontSize: '20px', marginTop: '-14px', opacity: 0.6 }}>☁️</div>
                      </div>
                    )}
                  </div>
                </div>

                {weatherData.error && (
                  <div style={{
                    marginTop: '10px',
                    background: 'rgba(239, 68, 68, 0.2)',
                    border: '1px solid #ef4444',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    color: '#fca5a5',
                    fontSize: '12px',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    position: 'relative',
                    zIndex: 2
                  }}>
                    <span>⚠️ {weatherData.error}</span>
                    <button
                      onClick={() => fetchRealForecast()}
                      style={{
                        background: 'rgba(239, 68, 68, 0.4)',
                        border: '1px solid #f87171',
                        color: '#fff',
                        borderRadius: '6px',
                        padding: '4px 10px',
                        cursor: 'pointer',
                        fontSize: '11px',
                        fontWeight: '800'
                      }}
                    >
                      Retry Sync
                    </button>
                  </div>
                )}

                {/* 12-Hour Predictive Hourly Timeline (Compact height) */}
                {weatherData.hourly && weatherData.hourly.length > 0 && (
                  <div style={{
                    marginTop: '10px',
                    background: 'rgba(0, 0, 0, 0.42)',
                    border: '1px solid rgba(255, 255, 255, 0.16)',
                    borderRadius: '10px',
                    padding: '8px 12px',
                    position: 'relative',
                    zIndex: 2
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <div style={{ fontSize: '11px', fontWeight: '800', color: '#93c5fd', display: 'flex', alignItems: 'center', gap: '5px', letterSpacing: '0.4px', textTransform: 'uppercase' }}>
                        <Clock size={12} color="#93c5fd" /> True Predictive Hourly Timeline (Next 12 Hours)
                      </div>
                      <span style={{ fontSize: '10px', color: '#94a3b8' }}>Real Open-Meteo atmospheric forecast</span>
                    </div>
                    <div style={{
                      display: 'flex',
                      gap: '8px',
                      overflowX: 'auto',
                      paddingBottom: '3px',
                      scrollbarWidth: 'thin'
                    }}>
                      {weatherData.hourly.map((h, idx) => (
                        <div
                          key={idx}
                          style={{
                            flex: '0 0 auto',
                            minWidth: '64px',
                            background: idx === 0 ? 'rgba(56, 189, 248, 0.18)' : 'rgba(255, 255, 255, 0.06)',
                            border: idx === 0 ? '1px solid rgba(56, 189, 248, 0.5)' : '1px solid rgba(255, 255, 255, 0.12)',
                            borderRadius: '8px',
                            padding: '5px 7px',
                            textAlign: 'center',
                            backdropFilter: 'blur(8px)'
                          }}
                        >
                          <div style={{ fontSize: '10px', color: idx === 0 ? '#38bdf8' : '#cbd5e1', fontWeight: '700', marginBottom: '2px' }}>
                            {h.time}
                          </div>
                          <div style={{ fontSize: '16px', margin: '1px 0' }}>{h.icon || '⛅'}</div>
                          <div style={{ fontSize: '12.5px', fontWeight: '800', color: '#ffffff' }}>{h.temp}°</div>
                          <div style={{
                            fontSize: '9.5px',
                            marginTop: '2px',
                            padding: '1px 5px',
                            borderRadius: '5px',
                            background: h.rainProb > 40 ? 'rgba(59, 130, 246, 0.35)' : 'rgba(255, 255, 255, 0.08)',
                            color: h.rainProb > 40 ? '#93c5fd' : '#94a3b8',
                            fontWeight: '700'
                          }}>
                            💧 {h.rainProb}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5-Day Agriculture Sowing Outlook (Compact height) */}
                {weatherData.daily && weatherData.daily.length > 0 && (
                  <div style={{
                    marginTop: '8px',
                    background: 'rgba(0, 0, 0, 0.42)',
                    border: '1px solid rgba(255, 255, 255, 0.16)',
                    borderRadius: '10px',
                    padding: '8px 12px',
                    position: 'relative',
                    zIndex: 2
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <div style={{ fontSize: '11px', fontWeight: '800', color: '#86efac', display: 'flex', alignItems: 'center', gap: '5px', letterSpacing: '0.4px', textTransform: 'uppercase' }}>
                        <Sparkles size={12} color="#86efac" /> 5-Day Agricultural Sowing Outlook
                      </div>
                      <span style={{ fontSize: '10px', color: '#94a3b8' }}>High-resolution regional model</span>
                    </div>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(115px, 1fr))',
                      gap: '8px'
                    }}>
                      {weatherData.daily.map((d, idx) => (
                        <div
                          key={idx}
                          style={{
                            background: idx === 0 ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                            border: idx === 0 ? '1px solid rgba(34, 197, 94, 0.4)' : '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '8px',
                            padding: '6px 8px',
                            textAlign: 'center'
                          }}
                        >
                          <div style={{ fontSize: '11px', fontWeight: '800', color: idx === 0 ? '#4ade80' : '#f1f5f9' }}>
                            {d.day}
                          </div>
                          <div style={{ fontSize: '9.5px', color: '#94a3b8', marginBottom: '2px' }}>{d.date}</div>
                          <div style={{ fontSize: '18px', margin: '2px 0' }}>{d.icon || '⛅'}</div>
                          <div style={{ fontSize: '12px', fontWeight: '800', color: '#ffffff' }}>
                            {d.maxTemp}° <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '500' }}>/ {d.minTemp}°</span>
                          </div>
                          <div style={{
                            fontSize: '9.5px',
                            marginTop: '3px',
                            padding: '2px 5px',
                            borderRadius: '5px',
                            background: d.rainProb > 40 ? 'rgba(59, 130, 246, 0.35)' : 'rgba(255, 255, 255, 0.08)',
                            color: d.rainProb > 40 ? '#93c5fd' : '#cbd5e1',
                            fontWeight: '700'
                          }}>
                            💧 Peak {d.rainProb}% ({d.rainAmount || '0.0'} mm)
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Farmer Agricultural Weather Advisory (Compact) */}
                <div style={{
                  marginTop: '8px',
                  background: 'rgba(0, 0, 0, 0.45)',
                  border: '1px solid rgba(251, 191, 36, 0.3)',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  fontSize: '12px',
                  lineHeight: '1.4',
                  position: 'relative',
                  zIndex: 2
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '14px' }}>🌾</span>
                    <strong style={{ color: '#fde047', fontSize: '12.5px', fontWeight: '800' }}>
                      Farmer Field Guidance & Operations Window:
                    </strong>
                  </div>
                  <div style={{ color: '#e2f1ea', fontSize: '11.5px' }}>
                    {weatherData.advisory}
                  </div>
                </div>
              </div>
            </div>

            {/* -------------------------------------------------------------
                TOOL 2: CROP RECOMMENDATION (Soil + Water Capacity + Season)
                ------------------------------------------------------------- */}
            <div style={{ marginBottom: '36px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(55, 189, 120, 0.2)', borderRadius: '16px', padding: '24px' }}>
              <div style={{ marginBottom: '18px' }}>
                <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#10b981', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 4px 0' }}>
                  <Sprout size={20} /> 2. Crop & Seed Recommendation Engine
                </h3>
                <p style={{ fontSize: '12.5px', color: '#9ca3af', margin: 0 }}>
                  We combine the analyzed weather with your soil type and water availability to recommend high-yield seeds and expected harvest returns.
                </p>
              </div>

              {/* Input Selectors */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '22px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#34d399', display: 'block', marginBottom: '6px' }}>
                    1. Soil Type
                  </label>
                  <select
                    value={soilType}
                    onChange={(e) => setSoilType(e.target.value)}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(55, 189, 120, 0.3)', color: '#e2f1ea', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', cursor: 'pointer' }}
                  >
                    <option value="Alluvial Soil">Alluvial Soil (வண்டல் மண் - High Potash)</option>
                    <option value="Black Soil">Black Cotton Soil (கரிசல் மண் - High Moisture)</option>
                    <option value="Red Soil">Red Loam Soil (செம்மண் - High Drainage)</option>
                    <option value="Clayey Loam">Clayey Loam (களிமண் - Nutrient Rich)</option>
                    <option value="Sandy Loam">Sandy Loam (மணல் கலந்த மண் - Fast Warmth)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#34d399', display: 'block', marginBottom: '6px' }}>
                    2. Water Capacity / Availability
                  </label>
                  <select
                    value={waterCapacity}
                    onChange={(e) => setWaterCapacity(e.target.value)}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(55, 189, 120, 0.3)', color: '#e2f1ea', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', cursor: 'pointer' }}
                  >
                    <option value="High">High Water (River canal / Abundant well)</option>
                    <option value="Medium">Medium Water (Borewell / Seasonal)</option>
                    <option value="Low">Low Water (Rainfed / Drip-only)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#34d399', display: 'block', marginBottom: '6px' }}>
                    3. Monsoon / Season
                  </label>
                  <select
                    value={season}
                    onChange={(e) => setSeason(e.target.value)}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(55, 189, 120, 0.3)', color: '#e2f1ea', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', cursor: 'pointer' }}
                  >
                    <option value="Monsoon (Kharif)">Monsoon / Kharif (June – Oct)</option>
                    <option value="Winter (Rabi)">Winter / Rabi (Oct – March)</option>
                    <option value="Summer (Zaid)">Summer / Zaid (March – June)</option>
                  </select>
                </div>
              </div>

              {/* Recommendation Cards */}
              <div>
                <div style={{ fontSize: '13px', fontWeight: '800', color: '#ffffff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={16} color="#fbbf24" /> Top Recommended Seeds for Current Monsoon:
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                  {recommendedCrops.map((crop, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: 'rgba(255,255,255,0.025)',
                        border: '1px solid rgba(55, 189, 120, 0.25)',
                        borderRadius: '12px',
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '28px' }}>{crop.icon}</span>
                            <div>
                              <div style={{ fontSize: '15px', fontWeight: '800', color: '#f3f4f6' }}>{crop.name}</div>
                              <div style={{ fontSize: '11px', color: '#34d399', fontWeight: '700' }}>Suitability: {crop.match}% Match</div>
                            </div>
                          </div>
                          <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '700' }}>
                            {crop.duration}
                          </span>
                        </div>

                        <p style={{ fontSize: '12px', color: '#9ca3af', lineHeight: '1.4', margin: '0 0 12px 0' }}>
                          {crop.notes}
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '8px', fontSize: '11.5px', marginBottom: '12px' }}>
                          <div>
                            <span style={{ color: '#9ca3af', display: 'block' }}>Expected Yield:</span>
                            <strong style={{ color: '#f3f4f6' }}>{crop.yield}</strong>
                          </div>
                          <div>
                            <span style={{ color: '#9ca3af', display: 'block' }}>Estimated Profit:</span>
                            <strong style={{ color: '#10b981' }}>{crop.profit}</strong>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          showToast(`Added ${crop.name} cultivation schedule to farm planner!`, 'success');
                        }}
                        style={{
                          width: '100%',
                          background: 'rgba(55, 189, 120, 0.15)',
                          border: '1px solid rgba(55, 189, 120, 0.4)',
                          color: '#34d399',
                          padding: '8px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: '700',
                          cursor: 'pointer'
                        }}
                      >
                        ✓ Select Seed & View Sowing Tips
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Phase 6: Multi-Variable Scientific AI Advisory */}
              <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: '800', color: '#86efac', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Bot size={18} color="#34d399" />
                      <span>Scientific Agricultural AI Advisory (Multi-Variable Analysis)</span>
                    </div>
                    <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#9db5aa' }}>
                      Evaluates soil, water regime, ambient temperatures, seasonal photoperiod, and rotation history without data fabrication.
                    </p>
                  </div>

                  <button
                    onClick={handleGetCropAdvisory}
                    disabled={cropAdvisoryLoading}
                    style={{
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      border: 'none',
                      color: '#ffffff',
                      padding: '10px 20px',
                      borderRadius: '12px',
                      fontSize: '13px',
                      fontWeight: '800',
                      cursor: cropAdvisoryLoading ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 16px rgba(16, 185, 129, 0.4)'
                    }}
                  >
                    {cropAdvisoryLoading ? (
                      <>
                        <RefreshCw size={15} className="animate-spin" />
                        <span>Computing Agronomy Model...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={15} />
                        <span>🌱 Get AI Crop Recommendation</span>
                      </>
                    )}
                  </button>
                </div>

                {cropAdvisoryResult && (
                  <div style={{
                    background: 'linear-gradient(145deg, rgba(8, 30, 23, 0.95), rgba(4, 18, 14, 0.98))',
                    border: '1.5px solid rgba(74, 222, 128, 0.4)',
                    borderRadius: '18px',
                    padding: '20px',
                    color: '#effbe7',
                    boxShadow: '0 12px 30px rgba(0,0,0,0.5)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
                      <div>
                        <span style={{ fontSize: '11px', color: '#86efac', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '0.6px' }}>
                          🌱 Recommended Crop
                        </span>
                        <h3 style={{ margin: '4px 0 0 0', fontSize: '22px', fontWeight: '900', color: '#effbe7' }}>
                          {cropAdvisoryResult.recommendedCrop}
                        </h3>
                      </div>

                      <span style={{
                        background: 'rgba(52, 211, 153, 0.15)',
                        border: '1px solid rgba(52, 211, 153, 0.35)',
                        color: '#34d399',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '11.5px',
                        fontWeight: '800'
                      }}>
                        Confidence: {cropAdvisoryResult.confidence}
                      </span>
                    </div>

                    {/* Why this may suit your conditions */}
                    <div style={{ marginBottom: '16px' }}>
                      <span style={{ fontSize: '12.5px', fontWeight: '800', color: '#86efac', display: 'block', marginBottom: '6px' }}>
                        Why this may suit your conditions
                      </span>
                      <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', lineHeight: '1.6', color: '#d1fae5' }}>
                        {(cropAdvisoryResult.whySuited || []).map((reason, rIdx) => (
                          <li key={rIdx}>{reason}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Attributes Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                      <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.07)' }}>
                        <span style={{ fontSize: '11px', color: '#9db5aa', display: 'block', fontWeight: '700' }}>🌧 Water Requirement</span>
                        <span style={{ fontSize: '13.5px', fontWeight: '800', color: '#67e8f9', marginTop: '2px', display: 'block' }}>
                          {cropAdvisoryResult.waterRequirement}
                        </span>
                      </div>

                      <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.07)' }}>
                        <span style={{ fontSize: '11px', color: '#9db5aa', display: 'block', fontWeight: '700' }}>⏱ Approximate Duration</span>
                        <span style={{ fontSize: '13.5px', fontWeight: '800', color: '#fbbf24', marginTop: '2px', display: 'block' }}>
                          {cropAdvisoryResult.duration}
                        </span>
                      </div>

                      <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.07)' }}>
                        <span style={{ fontSize: '11px', color: '#9db5aa', display: 'block', fontWeight: '700' }}>🌱 Suitable Soil</span>
                        <span style={{ fontSize: '12.5px', fontWeight: '600', color: '#effbe7', marginTop: '2px', display: 'block' }}>
                          {cropAdvisoryResult.suitableSoil}
                        </span>
                      </div>
                    </div>

                    {/* Risks */}
                    {cropAdvisoryResult.risks && cropAdvisoryResult.risks.length > 0 && (
                      <div style={{ marginBottom: '14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', padding: '12px 14px', borderRadius: '12px' }}>
                        <span style={{ fontSize: '12px', fontWeight: '800', color: '#f87171', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                          ⚠️ Risks & Vulnerabilities
                        </span>
                        <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: '#fecaca', lineHeight: '1.5' }}>
                          {cropAdvisoryResult.risks.map((risk, kIdx) => (
                            <li key={kIdx}>{risk}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Suggested Next Steps */}
                    {cropAdvisoryResult.suggestedNextSteps && cropAdvisoryResult.suggestedNextSteps.length > 0 && (
                      <div style={{ marginBottom: '14px' }}>
                        <span style={{ fontSize: '12.5px', fontWeight: '800', color: '#a7f3d0', display: 'block', marginBottom: '6px' }}>
                          📋 Suggested Next Steps
                        </span>
                        <ol style={{ margin: 0, paddingLeft: '18px', fontSize: '12.5px', color: '#d1fae5', lineHeight: '1.6' }}>
                          {cropAdvisoryResult.suggestedNextSteps.map((step, sIdx) => (
                            <li key={sIdx}>{step}</li>
                          ))}
                        </ol>
                      </div>
                    )}

                    {/* Transparent Missing Information Notice */}
                    {cropAdvisoryResult.missingInformationNotice && (
                      <div style={{
                        background: 'rgba(251, 191, 36, 0.1)',
                        border: '1px solid rgba(251, 191, 36, 0.25)',
                        borderRadius: '10px',
                        padding: '10px 14px',
                        fontSize: '11.5px',
                        color: '#fde68a',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <AlertCircle size={15} color="#fbbf24" style={{ flexShrink: 0 }} />
                        <span>
                          <strong>Note:</strong> {cropAdvisoryResult.missingInformationNotice}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* -------------------------------------------------------------
                TOOL 3: PLANT DISEASE DETECTION (Image Upload + Simple Remedies)
                ------------------------------------------------------------- */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '16px', padding: '24px' }}>
              <div style={{ marginBottom: '18px' }}>
                <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#f87171', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 4px 0' }}>
                  <ShieldCheck size={20} /> 3. Plant Disease Reference Clinic (Simulation / Reference Mode)
                </h3>
                <p style={{ fontSize: '12.5px', color: '#9ca3af', margin: 0 }}>
                  Upload a photo or choose a sample diseased leaf. The system references an agricultural pathology knowledge base to explain <strong>simple, easy-to-understand solutions</strong> for farmers. (Note: Reference simulation mode; external vision AI API key not configured).
                </p>
              </div>

              {/* Sample Presets to test immediately */}
              <div style={{ marginBottom: '18px', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '10px' }}>
                <span style={{ fontSize: '12px', color: '#d1d5db', fontWeight: '700', display: 'block', marginBottom: '8px' }}>
                  🧪 Quick Test with Sample Diseased Leaves:
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {DISEASE_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => handleSelectDiseasePreset(preset)}
                      style={{
                        background: selectedDisease.id === preset.id ? '#059669' : 'rgba(255,255,255,0.06)',
                        color: selectedDisease.id === preset.id ? '#ffffff' : '#d1d5db',
                        border: '1px solid rgba(255,255,255,0.12)',
                        padding: '6px 12px',
                        borderRadius: '16px',
                        fontSize: '11.5px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      {preset.crop}: {preset.name.split('(')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scanner Grid: Upload Area + Diagnosis Result */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                
                {/* Image Upload Box with Laser Scanner */}
                <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', border: '2px dashed rgba(55, 189, 120, 0.3)', minHeight: '260px', background: '#0a1715', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
                  
                  {analyzingImage && (
                    <div className="scanner-laser-line" />
                  )}

                  {uploadedImagePreview || selectedDisease.image ? (
                    <div style={{ width: '100%', height: '220px', borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
                      <img
                        src={uploadedImagePreview || selectedDisease.image}
                        alt="Disease" className="uploaded-img"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <span style={{
                        position: 'absolute',
                        bottom: '8px',
                        left: '8px',
                        background: 'rgba(0,0,0,0.7)',
                        color: '#fff',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: '700'
                      }}>
                        {analyzingImage ? 'Matching symptoms...' : 'Reference Scan Ready'}
                      </span>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                      <UploadCloud size={42} color="#10b981" style={{ margin: '0 auto 12px auto' }} />
                      <div style={{ fontSize: '13px', fontWeight: '700', color: '#f3f4f6' }}>Upload Leaf or Crop Photo</div>
                      <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>PNG, JPG or JPEG from mobile camera</div>
                    </div>
                  )}

                  <label style={{
                    marginTop: '12px',
                    background: '#10b981',
                    color: '#ffffff',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <UploadCloud size={15} />
                    <span>{uploadedImagePreview ? 'Leaf Sample Analyzed • Tap to Retake' : 'Upload Leaf Photo'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleDiseaseImageUpload}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>

                {/* Farmer-Friendly Diagnosis Card */}
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '10px' }}>
                      <div>
                        <span style={{ fontSize: '11px', color: '#f87171', fontWeight: '800', letterSpacing: '0.5px' }}>
                          DIAGNOSIS REPORT
                        </span>
                        <h4 style={{ fontSize: '17px', fontWeight: '800', color: '#ffffff', margin: '2px 0 0 0' }}>
                          {selectedDisease.name}
                        </h4>
                      </div>
                      <span style={{
                        background: selectedDisease.severity.includes('High') ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                        color: selectedDisease.severity.includes('High') ? '#f87171' : '#34d399',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: '800'
                      }}>
                        {selectedDisease.severity}
                      </span>
                    </div>

                    <p style={{ fontSize: '12px', color: '#d1d5db', lineHeight: '1.4', marginBottom: '14px' }}>
                      {selectedDisease.summary}
                    </p>

                    {/* How to Solve It: Organic Remedy */}
                    <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '8px', padding: '10px 12px', marginBottom: '10px' }}>
                      <div style={{ fontSize: '12px', fontWeight: '800', color: '#34d399', marginBottom: '4px' }}>
                        🌿 Simple Organic / Home Remedy:
                      </div>
                      <div style={{ fontSize: '12px', color: '#e2f1ea', lineHeight: '1.4' }}>
                        {selectedDisease.organicRemedy}
                      </div>
                    </div>

                    {/* How to Solve It: Medicine / Spray Dosage */}
                    <div style={{ background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.25)', borderRadius: '8px', padding: '10px 12px', marginBottom: '14px' }}>
                      <div style={{ fontSize: '12px', fontWeight: '800', color: '#38bdf8', marginBottom: '4px' }}>
                        💊 Recommended Medicine & Spray Dosage:
                      </div>
                      <div style={{ fontSize: '12px', color: '#e2f1ea', lineHeight: '1.4' }}>
                        {selectedDisease.chemicalMedicine}
                      </div>
                    </div>

                    {/* Easy Golden Rules / Tips */}
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: '800', color: '#fbbf24', marginBottom: '6px' }}>
                        💡 3 Simple Golden Tips for Farmer:
                      </div>
                      <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '11.5px', color: '#9ca3af', lineHeight: '1.5' }}>
                        {selectedDisease.farmerTips.map((tip, i) => (
                          <li key={i} style={{ marginBottom: '2px' }}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* =========================================================================
            VIEW 3: AFTER CULTIVATION & MY PRODUCTS (Catalog & Add Produce)
            ========================================================================= */}
        {(activeNav === 'after_cultivation' || activeNav === 'products') && (
          <div style={{ padding: '24px 28px', maxWidth: '1400px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
            
            {/* Header with Quick Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
              <div>
                <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#f3f4f6', margin: 0 }}>
                  {activeNav === 'after_cultivation' ? 'After Cultivation: Harvest Management' : 'My Active Produce Catalog'}
                </h2>
                <p style={{ fontSize: '13px', color: '#9ca3af', margin: '4px 0 0 0' }}>
                  List fresh harvest, adjust prices, monitor stock, and pin your farm pickup location for delivery drivers.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  style={{
                    background: '#10b981',
                    color: '#ffffff',
                    border: 'none',
                    padding: '10px 18px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)'
                  }}
                >
                  {showAddForm ? <X size={16} /> : <Plus size={16} />}
                  <span>{showAddForm ? 'Close Form' : 'Add New Produce / Seeds'}</span>
                </button>
              </div>
            </div>

            {/* Add Product Form Modal / Collapsible */}
            {showAddForm && isFarmer && (
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1.5px solid rgba(16, 185, 129, 0.45)', borderRadius: '16px', padding: '24px', marginBottom: '28px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px' }}>
                  <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#10b981', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sparkles size={18} /> Publish New Produce or Certified Seeds
                  </h3>
                  <button onClick={() => setShowAddForm(false)} style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer' }}>
                    <X size={18} />
                  </button>
                </div>

                {/* 1-Click Templates */}
                <div style={{ marginBottom: '18px', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '10px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                    <Zap size={14} /> 1-Click Quick Produce Templates:
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {QUICK_TEMPLATES.map((tpl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => applyQuickTemplate(tpl)}
                        style={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          color: '#f3f4f6',
                          padding: '5px 12px',
                          borderRadius: '16px',
                          fontSize: '12px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <span>{tpl.icon}</span>
                        <span>{tpl.title}</span>
                        <span style={{ color: '#10b981' }}>₹{tpl.price}/{tpl.unit}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <form onSubmit={handleAddProduct}>
                  {/* ─────────────────────────────────────────────────────────────
                      SECTION 1: BASIC PRODUCE INFORMATION (Always Visible)
                      ───────────────────────────────────────────────────────────── */}
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ fontSize: '13px', fontWeight: '800', color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>1. Basic Produce Information</span>
                      <span style={{ fontSize: '10px', background: 'rgba(16, 185, 129, 0.2)', border: '1px solid #10b981', color: '#6ee7b7', padding: '1px 6px', borderRadius: '4px' }}>Required</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: '700', color: '#e5e7eb', display: 'block', marginBottom: '6px' }}>
                          Produce Name *
                        </label>
                        <input
                          type="text"
                          value={title}
                          onChange={e => setTitle(e.target.value)}
                          placeholder="e.g. Country Tomato, Fresh Spinach, Sona Masoori"
                          className="input-field"
                          style={{ minHeight: '48px', fontSize: '14px', boxSizing: 'border-box' }}
                          required
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '12px', fontWeight: '700', color: '#e5e7eb', display: 'block', marginBottom: '6px' }}>
                          Category *
                        </label>
                        <select
                          value={category}
                          onChange={e => handleCategoryChange(e.target.value)}
                          className="input-field"
                          style={{ minHeight: '48px', fontSize: '14px', cursor: 'pointer', boxSizing: 'border-box' }}
                        >
                          <option value="vegetable">🥬 Farm-Fresh Vegetables</option>
                          <option value="fruit">🍎 Fresh Organic Fruits</option>
                          <option value="grain">🌾 Grains, Pulses & Cereals</option>
                          <option value="seed">🌱 Agriculture Seeds</option>
                          <option value="dairy">🥛 Dairy & Farm Fresh</option>
                          <option value="spices">🌶️ Spices & Condiments</option>
                          <option value="other">📦 Other Produce</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ fontSize: '12px', fontWeight: '700', color: '#e5e7eb', display: 'block', marginBottom: '6px' }}>
                          Farmer Direct Price (₹) *
                        </label>
                        <div style={{ position: 'relative' }}>
                          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#10b981', fontWeight: '800', fontSize: '15px' }}>₹</span>
                          <input
                            type="number"
                            inputMode="decimal"
                            step="0.01"
                            min="0.01"
                            value={price}
                            onChange={e => setPrice(e.target.value)}
                            placeholder="e.g. 45"
                            className="input-field"
                            style={{ minHeight: '48px', fontSize: '14px', paddingLeft: '30px', boxSizing: 'border-box' }}
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label style={{ fontSize: '12px', fontWeight: '700', color: '#e5e7eb', display: 'block', marginBottom: '6px' }}>
                          Pricing Unit *
                        </label>
                        <select
                          value={unit}
                          onChange={e => setUnit(e.target.value)}
                          className="input-field"
                          style={{ minHeight: '48px', fontSize: '14px', cursor: 'pointer', boxSizing: 'border-box' }}
                        >
                          <option value="kg">Per Kilogram (kg)</option>
                          <option value="quintal">Per Quintal (100 kg)</option>
                          <option value="bunch">Per Bunch (கட்டு)</option>
                          <option value="dozen">Per Dozen (12 pcs)</option>
                          <option value="box">Per Box / Crate</option>
                          <option value="g">Per Gram (g)</option>
                          <option value="litre">Per Litre (L)</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ fontSize: '12px', fontWeight: '700', color: '#e5e7eb', display: 'block', marginBottom: '4px' }}>
                          Available Quantity *
                        </label>
                        <span style={{ fontSize: '11px', color: '#9ca3af', display: 'block', marginBottom: '6px' }}>
                          Total stock ready for sale right now
                        </span>
                        <input
                          type="number"
                          inputMode="numeric"
                          min="1"
                          value={stock}
                          onChange={e => setStock(e.target.value)}
                          placeholder="e.g. 100"
                          className="input-field"
                          style={{ minHeight: '48px', fontSize: '14px', boxSizing: 'border-box' }}
                          required
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '12px', fontWeight: '700', color: '#e5e7eb', display: 'block', marginBottom: '4px' }}>
                          Minimum Order Quantity *
                        </label>
                        <span style={{ fontSize: '11px', color: '#9ca3af', display: 'block', marginBottom: '6px' }}>
                          Smallest quantity a customer can order
                        </span>
                        <input
                          type="number"
                          inputMode="numeric"
                          min="1"
                          value={minOrderQty}
                          onChange={e => setMinOrderQty(e.target.value)}
                          placeholder="1"
                          className="input-field"
                          style={{ minHeight: '48px', fontSize: '14px', boxSizing: 'border-box' }}
                          required
                        />
                      </div>
                    </div>

                    {/* Bargain Availability Checkbox */}
                    <div style={{
                      marginTop: '14px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '10px',
                      padding: '12px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      cursor: 'pointer'
                    }} onClick={() => setAllowBargain(!allowBargain)}>
                      <input
                        type="checkbox"
                        checked={allowBargain}
                        onChange={e => setAllowBargain(e.target.checked)}
                        style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#10b981' }}
                        onClick={e => e.stopPropagation()}
                      />
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: '700', color: '#effbe7' }}>
                          Allow customers to negotiate price (Bulk Bargaining)
                        </div>
                        <div style={{ fontSize: '11.5px', color: '#9ca3af' }}>
                          Customers can submit bulk price offers; you retain complete power to accept, decline, or counter.
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ─────────────────────────────────────────────────────────────
                      SECTION 2: HARVEST & QUALITY DETAILS (Optional Accordion)
                      ───────────────────────────────────────────────────────────── */}
                  <div style={{
                    marginBottom: '16px',
                    border: '1px solid rgba(251, 191, 36, 0.3)',
                    borderRadius: '12px',
                    background: 'rgba(251, 191, 36, 0.03)',
                    overflow: 'hidden'
                  }}>
                    <button
                      type="button"
                      onClick={() => setShowHarvestSection(!showHarvestSection)}
                      style={{
                        width: '100%',
                        padding: '14px 16px',
                        background: 'transparent',
                        border: 'none',
                        color: '#fbbf24',
                        fontSize: '13.5px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        textAlign: 'left'
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        🌾 {showHarvestSection ? 'Hide Harvest & Quality Details' : '+ Add Harvest & Quality Details (Optional)'}
                      </span>
                      <span style={{ fontSize: '11px', color: '#d97706', background: 'rgba(251, 191, 36, 0.15)', padding: '2px 8px', borderRadius: '10px' }}>
                        {showHarvestSection ? 'Collapse ▲' : 'Expand ▼'}
                      </span>
                    </button>

                    {showHarvestSection && (
                      <div style={{ padding: '0 16px 16px 16px', borderTop: '1px solid rgba(251, 191, 36, 0.15)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginTop: '12px' }}>
                        <div>
                          <label style={{ fontSize: '12px', fontWeight: '700', color: '#e5e7eb', display: 'block', marginBottom: '4px' }}>
                            Crop Variety
                          </label>
                          <span style={{ fontSize: '11px', color: '#9ca3af', display: 'block', marginBottom: '6px' }}>
                            Specific cultivar name
                          </span>
                          <input
                            type="text"
                            value={variety}
                            onChange={e => setVariety(e.target.value)}
                            placeholder="e.g. Sona Masoori, Alphonso, PKM-1, G4 Chilli"
                            className="input-field"
                            style={{ minHeight: '46px', fontSize: '13.5px', boxSizing: 'border-box' }}
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: '12px', fontWeight: '700', color: '#e5e7eb', display: 'block', marginBottom: '4px' }}>
                            Harvest Date
                          </label>
                          <span style={{ fontSize: '11px', color: '#9ca3af', display: 'block', marginBottom: '6px' }}>
                            Date harvested from the field
                          </span>
                          <input
                            type="date"
                            value={harvestDate}
                            onChange={e => setHarvestDate(e.target.value)}
                            className="input-field"
                            style={{ minHeight: '46px', fontSize: '13.5px', boxSizing: 'border-box' }}
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: '12px', fontWeight: '700', color: '#e5e7eb', display: 'block', marginBottom: '4px' }}>
                            Quality Grade
                          </label>
                          <span style={{ fontSize: '11px', color: '#9ca3af', display: 'block', marginBottom: '6px' }}>
                            Size & appearance sorting
                          </span>
                          <select
                            value={qualityGrade}
                            onChange={e => setQualityGrade(e.target.value)}
                            className="input-field"
                            style={{ minHeight: '46px', fontSize: '13.5px', cursor: 'pointer', boxSizing: 'border-box' }}
                          >
                            <option value="">Not Specified (Leave blank)</option>
                            <option value="Premium">🌟 Premium Export Quality</option>
                            <option value="Grade A">⭐ Grade A Standard Quality</option>
                            <option value="Standard">🌾 Standard Market Grade</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ─────────────────────────────────────────────────────────────
                      SECTION 3: CULTIVATION DETAILS (Optional Accordion)
                      ───────────────────────────────────────────────────────────── */}
                  <div style={{
                    marginBottom: '18px',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    borderRadius: '12px',
                    background: 'rgba(56, 189, 248, 0.03)',
                    overflow: 'hidden'
                  }}>
                    <button
                      type="button"
                      onClick={() => setShowCultivationSection(!showCultivationSection)}
                      style={{
                        width: '100%',
                        padding: '14px 16px',
                        background: 'transparent',
                        border: 'none',
                        color: '#38bdf8',
                        fontSize: '13.5px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        textAlign: 'left'
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        🌱 {showCultivationSection ? 'Hide Cultivation Details' : '+ Add Cultivation Details (Optional)'}
                      </span>
                      <span style={{ fontSize: '11px', color: '#0284c7', background: 'rgba(56, 189, 248, 0.15)', padding: '2px 8px', borderRadius: '10px' }}>
                        {showCultivationSection ? 'Collapse ▲' : 'Expand ▼'}
                      </span>
                    </button>

                    {showCultivationSection && (
                      <div style={{ padding: '0 16px 16px 16px', borderTop: '1px solid rgba(56, 189, 248, 0.15)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginTop: '12px' }}>
                        <div>
                          <label style={{ fontSize: '12px', fontWeight: '700', color: '#e5e7eb', display: 'block', marginBottom: '4px' }}>
                            Cultivation Type
                          </label>
                          <span style={{ fontSize: '11px', color: '#9ca3af', display: 'block', marginBottom: '6px' }}>
                            Farming practice applied
                          </span>
                          <select
                            value={cultivationType}
                            onChange={e => setCultivationType(e.target.value)}
                            className="input-field"
                            style={{ minHeight: '46px', fontSize: '13.5px', cursor: 'pointer', boxSizing: 'border-box' }}
                          >
                            <option value="">Not Specified (Leave blank)</option>
                            <option value="Natural">🌱 Natural / Zero-Budget Farming</option>
                            <option value="Organic">🌿 Organic (Farmer-Reported)</option>
                            <option value="Conventional">🚜 Conventional Farming</option>
                            <option value="Hydroponic">💧 Hydroponic / Polyhouse</option>
                          </select>
                          {cultivationType === 'Organic' && (
                            <span style={{ fontSize: '10.5px', color: '#fbbf24', marginTop: '4px', display: 'block' }}>
                              ⚠️ Displayed to buyers as farmer-reported cultivation type
                            </span>
                          )}
                        </div>

                        <div>
                          <label style={{ fontSize: '12px', fontWeight: '700', color: '#e5e7eb', display: 'block', marginBottom: '4px' }}>
                            Irrigation Method
                          </label>
                          <span style={{ fontSize: '11px', color: '#9ca3af', display: 'block', marginBottom: '6px' }}>
                            Water supply method
                          </span>
                          <select
                            value={irrigationMethod}
                            onChange={e => setIrrigationMethod(e.target.value)}
                            className="input-field"
                            style={{ minHeight: '46px', fontSize: '13.5px', cursor: 'pointer', boxSizing: 'border-box' }}
                          >
                            <option value="">Not Specified (Leave blank)</option>
                            <option value="Drip">💧 Drip Irrigation</option>
                            <option value="Rain-fed">🌧️ Rain-fed (Dryland)</option>
                            <option value="Borewell">⚡ Borewell / Deep Well</option>
                            <option value="Canal/River">🌊 Canal / River Basin</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Produce Description */}
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#e5e7eb', display: 'block', marginBottom: '6px' }}>
                      Produce Description (Optional)
                    </label>
                    <textarea
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      placeholder="e.g. Hand-picked at dawn, tree-ripened, graded for freshness."
                      className="input-field"
                      rows="2"
                      style={{ fontSize: '13px', boxSizing: 'border-box' }}
                    />
                  </div>

                  {/* Farm Pickup Location Pin */}
                  <div style={{ marginBottom: '18px', background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                      <div>
                        <span style={{ fontSize: '12px', fontWeight: '700', color: '#d1d5db', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <MapPin size={15} color="#10b981" /> Farm Gate Pickup / Dispatch Point:
                        </span>
                        <span style={{ fontSize: '12px', color: '#10b981', fontWeight: '600' }}>
                          {farmLocation.address || 'Selected farm coordinates'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowMapPicker(!showMapPicker)}
                        style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#e5e7eb', padding: '8px 14px', borderRadius: '8px', fontSize: '11.5px', cursor: 'pointer', minHeight: '36px' }}
                      >
                        {showMapPicker ? 'Hide Map' : '📍 Adjust GPS Pin'}
                      </button>
                    </div>

                    {showMapPicker && (
                      <div style={{ marginTop: '10px', borderRadius: '8px', overflow: 'hidden' }}>
                        <MapPicker
                          location={farmLocation}
                          onSelectLocation={(loc) => {
                            setFarmLocation(loc);
                            showToast(`Farm pickup location updated`, 'info');
                          }}
                          height="180px"
                        />
                      </div>
                    )}
                  </div>

                  {/* ─────────────────────────────────────────────────────────────
                      PREVIEW BEFORE PUBLISH (Accordion / Toggle)
                      ───────────────────────────────────────────────────────────── */}
                  <div style={{ marginBottom: '18px' }}>
                    <button
                      type="button"
                      onClick={() => setShowPreview(!showPreview)}
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        color: '#d1d5db',
                        padding: '8px 14px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        marginBottom: '8px'
                      }}
                    >
                      <Eye size={14} color="#34d399" />
                      <span>{showPreview ? 'Hide Produce Preview' : '👁️ Preview Listing Before Publishing'}</span>
                    </button>

                    {showPreview && (
                      <div style={{
                        background: 'linear-gradient(135deg, rgba(8, 28, 22, 0.95), rgba(4, 16, 13, 0.98))',
                        border: '1px solid rgba(52, 211, 153, 0.35)',
                        borderRadius: '12px',
                        padding: '16px',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '10px',
                        fontSize: '12.5px',
                        color: '#e5e7eb'
                      }}>
                        <div>
                          <strong style={{ color: '#9ca3af', display: 'block', fontSize: '11px' }}>PRODUCE NAME</strong>
                          <span style={{ fontSize: '15px', fontWeight: '800', color: '#6ee7b7' }}>{title || '(Enter name above)'}</span>
                        </div>
                        <div>
                          <strong style={{ color: '#9ca3af', display: 'block', fontSize: '11px' }}>PRICE</strong>
                          <span style={{ fontSize: '15px', fontWeight: '800', color: '#10b981' }}>₹{price || 0} / {unit || 'kg'}</span>
                        </div>
                        <div>
                          <strong style={{ color: '#9ca3af', display: 'block', fontSize: '11px' }}>AVAILABLE STOCK</strong>
                          <span>{stock || 0} {unit || 'kg'}</span>
                        </div>
                        <div>
                          <strong style={{ color: '#9ca3af', display: 'block', fontSize: '11px' }}>MIN ORDER QUANTITY</strong>
                          <span>{minOrderQty || 1} {unit || 'kg'}</span>
                        </div>
                        <div>
                          <strong style={{ color: '#9ca3af', display: 'block', fontSize: '11px' }}>VARIETY</strong>
                          <span>{variety || 'Not provided'}</span>
                        </div>
                        <div>
                          <strong style={{ color: '#9ca3af', display: 'block', fontSize: '11px' }}>HARVEST DATE</strong>
                          <span>{harvestDate || 'Not provided'}</span>
                        </div>
                        <div>
                          <strong style={{ color: '#9ca3af', display: 'block', fontSize: '11px' }}>QUALITY GRADE</strong>
                          <span>{qualityGrade || 'Not provided'}</span>
                        </div>
                        <div>
                          <strong style={{ color: '#9ca3af', display: 'block', fontSize: '11px' }}>CULTIVATION TYPE</strong>
                          <span>{cultivationType || 'Not provided'}</span>
                        </div>
                        <div>
                          <strong style={{ color: '#9ca3af', display: 'block', fontSize: '11px' }}>IRRIGATION METHOD</strong>
                          <span>{irrigationMethod || 'Not provided'}</span>
                        </div>
                        <div>
                          <strong style={{ color: '#9ca3af', display: 'block', fontSize: '11px' }}>BARGAINING</strong>
                          <span style={{ color: allowBargain ? '#34d399' : '#9ca3af' }}>
                            {allowBargain ? '✓ Available (Bulk offers accepted)' : 'Fixed Price Only'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Form Action Buttons (Mobile-first >= 48px touch targets) */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      style={{
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        color: '#d1d5db',
                        padding: '12px 22px',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontSize: '13.5px',
                        fontWeight: '600',
                        minHeight: '48px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      style={{
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        color: '#ffffff',
                        border: 'none',
                        padding: '12px 28px',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '800',
                        minHeight: '48px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)'
                      }}
                    >
                      {loading ? 'Publishing Produce...' : '🌱 Publish to Live Marketplace'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Produce Grid */}
            {displayedProducts.length === 0 ? (
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '14px', padding: '48px', textAlign: 'center', color: '#9ca3af' }}>
                <Sprout size={44} style={{ margin: '0 auto 14px auto', color: '#10b981', opacity: 0.6 }} />
                <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#f3f4f6', margin: '0 0 6px 0' }}>
                  No produce listings found
                </h3>
                <p style={{ fontSize: '12px', margin: '0 0 16px 0' }}>
                  Click "Add New Produce / Seeds" above to list your fresh farm harvest!
                </p>
                <button
                  onClick={() => setShowAddForm(true)}
                  style={{ background: '#10b981', color: '#ffffff', border: 'none', padding: '8px 18px', borderRadius: '8px', fontSize: '12.5px', fontWeight: '700', cursor: 'pointer' }}
                >
                  + Add Your First Product
                </button>
              </div>
            ) : (
              <div className="farmer-catalog-grid">
                {displayedProducts.map((p) => {
                  const prodId = p._id || p.id;
                  const isOutOfStock = Number(p.stock) <= 0;
                  const isLowStock = Number(p.stock) < 20 && Number(p.stock) > 0;

                  return (
                    <div
                      key={prodId}
                      className="farmer-compact-card"
                      onClick={() => setSelectedProductForDetails(p)}
                      title="Tap to manage produce details"
                    >
                      <div>
                        {/* Image banner with Category badge and Freshness indicator */}
                        <div className="farmer-compact-thumb-wrap">
                          <img
                            src={p.image || 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b'}
                            alt={p.title}
                            className="farmer-compact-thumb-img"
                          />
                          <span style={{
                            position: 'absolute',
                            top: '6px',
                            left: '6px',
                            background: 'rgba(0,0,0,0.8)',
                            backdropFilter: 'blur(4px)',
                            color: p.category === 'seed' ? '#34d399' : p.category === 'fruit' ? '#fbbf24' : '#38bdf8',
                            padding: '2px 7px',
                            borderRadius: '8px',
                            fontSize: '10px',
                            fontWeight: '800'
                          }}>
                            {p.category === 'seed' ? '🌾 SEED' : p.category === 'fruit' ? '🥭 FRUIT' : '🥬 VEG'}
                          </span>

                          <span style={{
                            position: 'absolute',
                            bottom: '6px',
                            left: '6px',
                            background: 'rgba(0,0,0,0.75)',
                            backdropFilter: 'blur(4px)',
                            color: '#a7f3d0',
                            padding: '2px 6px',
                            borderRadius: '6px',
                            fontSize: '9.5px',
                            fontWeight: '700'
                          }}>
                            {p.harvestDate ? `🗓️ ${new Date(p.harvestDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}` : '🌱 Fresh'}
                          </span>

                          {isOutOfStock ? (
                            <span style={{
                              position: 'absolute',
                              top: '6px',
                              right: '6px',
                              background: '#ef4444',
                              color: '#fff',
                              padding: '2px 6px',
                              borderRadius: '6px',
                              fontSize: '9px',
                              fontWeight: '900'
                            }}>
                              OUT
                            </span>
                          ) : isLowStock ? (
                            <span style={{
                              position: 'absolute',
                              top: '6px',
                              right: '6px',
                              background: '#f59e0b',
                              color: '#fff',
                              padding: '2px 6px',
                              borderRadius: '6px',
                              fontSize: '9px',
                              fontWeight: '900'
                            }}>
                              LOW
                            </span>
                          ) : null}
                        </div>

                        {/* Card Info (Compact) */}
                        <div style={{ padding: '10px 10px 4px 10px' }}>
                          <h4 style={{
                            fontSize: '13px',
                            fontWeight: '800',
                            color: '#f3f4f6',
                            margin: '0 0 4px 0',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>
                            {p.title}
                          </h4>

                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '4px' }}>
                            <span style={{ fontSize: '15px', fontWeight: '900', color: '#10b981' }}>
                              ₹{Number(p.price).toFixed(2)}
                            </span>
                            <span style={{ fontSize: '10.5px', color: '#9ca3af' }}>
                              /{p.unit || 'kg'}
                            </span>
                          </div>

                          <div style={{ fontSize: '11px', color: '#d1d5db', display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                            <span>{p.stock} {p.unit || 'kg'} stock</span>
                            <span style={{ color: '#9ca3af' }}>Min: {p.minOrderQty || 1}</span>
                          </div>

                          <div style={{ marginTop: '4px' }}>
                            <span style={{
                              fontSize: '10px',
                              fontWeight: '700',
                              color: p.allowBargain !== false ? '#34d399' : '#9ca3af',
                              background: p.allowBargain !== false ? 'rgba(52, 211, 153, 0.12)' : 'rgba(255,255,255,0.05)',
                              padding: '2px 6px',
                              borderRadius: '5px',
                              display: 'inline-block'
                            }}>
                              {p.allowBargain !== false ? '🤝 Bargain' : '🔒 Fixed'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Compact Actions (Touch targets >= 44px) */}
                      <div
                        style={{ padding: '8px 10px', display: 'flex', gap: '6px', borderTop: '1px solid rgba(255,255,255,0.06)' }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => openEditModal(p)}
                          style={{
                            flex: 1,
                            minHeight: '44px',
                            background: 'rgba(255,255,255,0.08)',
                            border: 'none',
                            color: '#e5e7eb',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px'
                          }}
                        >
                          <Edit2 size={13} />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => handleDeleteProduct(prodId, p.title)}
                          style={{
                            minHeight: '44px',
                            minWidth: '44px',
                            background: 'rgba(239, 68, 68, 0.12)',
                            border: '1px solid rgba(239, 68, 68, 0.25)',
                            color: '#f87171',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          title="Delete produce"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

        {/* =========================================================================
            VIEW 4: ORDERS (Buyer Orders & Dispatches)
            ========================================================================= */}
        {activeNav === 'orders' && (
          <div style={{ padding: '24px 28px', maxWidth: '1400px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
            <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
              <div>
                <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#f3f4f6', margin: 0 }}>
                  Buyer Orders Management
                </h2>
                <p style={{ fontSize: '13px', color: '#9ca3af', margin: '4px 0 0 0' }}>
                  Orders placed by buyers for your produce. Accept and pack items to prepare for driver pickup and live tracking.
                </p>
              </div>

              <button
                onClick={() => setShowDeliverySummon(true)}
                style={{
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  border: '1px solid rgba(52, 211, 153, 0.4)',
                  color: '#ffffff',
                  padding: '10px 18px',
                  borderRadius: '12px',
                  fontWeight: '800',
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 6px 18px rgba(16, 185, 129, 0.35)'
                }}
              >
                <Truck size={17} />
                <span>🛰️ Summon Delivery Partner</span>
              </button>
            </div>

            {incomingOrders.length === 0 ? (
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '14px', padding: '48px', textAlign: 'center', color: '#9ca3af' }}>
                <Package size={44} style={{ margin: '0 auto 14px auto', color: '#38bdf8', opacity: 0.6 }} />
                <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#f3f4f6', margin: '0 0 6px 0' }}>
                  No customer orders received yet
                </h3>
                <p style={{ fontSize: '12px' }}>
                  When buyers order your vegetables, fruits, or seeds, their delivery orders appear here in real-time.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {incomingOrders.map((o) => {
                  const orderId = o._id || o.id;
                  const isPending = o.status === 'pending';
                  const isConfirmed = o.status === 'confirmed' || o.status === 'accepted';
                  const isPacked = o.status === 'packed';
                  const isInTransit = ['assigned', 'driver_assigned', 'picked_up', 'in_transit', 'arrived'].includes(o.status);
                  const isDelivered = o.status === 'delivered';

                  return (
                    <div
                      key={orderId}
                      style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(55, 189, 120, 0.15)',
                        borderLeft: isPending ? '4px solid #f59e0b' : isConfirmed ? '4px solid #38bdf8' : isPacked ? '4px solid #0284c7' : isInTransit ? '4px solid #a855f7' : '4px solid #10b981',
                        borderRadius: '12px',
                        padding: '18px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '16px', fontWeight: '800', color: '#38bdf8' }}>
                              Order #{o.orderId || String(orderId).slice(-6)}
                            </span>
                            <span style={{
                              fontSize: '11px',
                              fontWeight: '700',
                              padding: '2px 8px',
                              borderRadius: '10px',
                              background: isPending ? 'rgba(245, 158, 11, 0.2)' : isConfirmed ? 'rgba(56, 189, 248, 0.2)' : isPacked ? 'rgba(2, 132, 199, 0.2)' : isInTransit ? 'rgba(168, 85, 247, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                              color: isPending ? '#f59e0b' : isConfirmed ? '#38bdf8' : isPacked ? '#38bdf8' : isInTransit ? '#c084fc' : '#34d399'
                            }}>
                              {(o.status || 'pending').toUpperCase()}
                            </span>
                          </div>
                          <span style={{ fontSize: '11px', color: '#9ca3af' }}>
                            Placed on {new Date(o.createdAt || Date.now()).toLocaleString()}
                          </span>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '20px', fontWeight: '900', color: '#10b981' }}>
                            ₹{Number(o.totalAmount || 0).toFixed(2)}
                          </span>
                          <div style={{ fontSize: '11px', color: '#9ca3af' }}>Total Amount</div>
                        </div>
                      </div>

                      {/* Buyer Details */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', marginBottom: '14px' }}>
                        <div>
                          <span style={{ fontSize: '10.5px', color: '#38bdf8', fontWeight: '800', textTransform: 'uppercase' }}>
                            👤 Buyer Contact
                          </span>
                          <div style={{ fontSize: '13px', fontWeight: '700', color: '#f3f4f6' }}>{o.customerName}</div>
                          <div style={{ fontSize: '12px', color: '#9ca3af' }}>📞 {o.customerPhone}</div>
                          <div style={{ fontSize: '11px', color: '#9ca3af' }}>📍 {o.customerLocation?.address || 'Customer Delivery Address'}</div>
                        </div>

                        <div>
                          <span style={{ fontSize: '10.5px', color: '#fbbf24', fontWeight: '800', textTransform: 'uppercase' }}>
                            🚚 Delivery Logistics
                          </span>
                          {o.deliveryName && o.deliveryName !== 'Unassigned' ? (
                            <div>
                              <div style={{ fontSize: '13px', fontWeight: '700', color: '#f3f4f6' }}>{o.deliveryName}</div>
                              <div style={{ fontSize: '12px', color: '#9ca3af' }}>📞 {o.deliveryPhone || 'N/A'}</div>
                            </div>
                          ) : (
                            <div style={{ fontSize: '12px', color: '#9ca3af', fontStyle: 'italic', marginTop: '4px' }}>
                              {isPacked ? 'Packed and awaiting driver pickup' : 'Awaiting packaging confirmation before driver pickup'}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Items */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
                        {(o.items || []).map((item, idx) => (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.04)', padding: '4px 10px', borderRadius: '6px' }}>
                            {item.image && <img src={item.image} alt={item.title} style={{ width: '24px', height: '24px', borderRadius: '4px', objectFit: 'cover' }} />}
                            <span style={{ fontSize: '12px', color: '#f3f4f6' }}>{item.title}</span>
                            <span style={{ fontSize: '11px', color: '#34d399' }}>x{item.quantity}</span>
                          </div>
                        ))}
                      </div>

                      {/* Actions */}
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', flexWrap: 'wrap' }}>
                        {isPending && isFarmer && (
                          <>
                            <button
                              onClick={() => handleUpdateOrderStatus(orderId, 'confirmed')}
                              style={{ background: '#10b981', color: '#ffffff', border: 'none', padding: '8px 18px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                            >
                              <CheckCircle size={15} /> 1. Confirm Order
                            </button>
                            <button
                              onClick={() => handleCancelOrder(orderId)}
                              style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                            >
                              <X size={15} /> Reject Order
                            </button>
                          </>
                        )}
                        {isConfirmed && !isPacked && isFarmer && (
                          <>
                            <button
                              onClick={() => handleUpdateOrderStatus(orderId, 'packed')}
                              style={{ background: '#0284c7', color: '#ffffff', border: 'none', padding: '8px 18px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                            >
                              <Package size={15} /> 2. Mark Packed & Ready for Driver
                            </button>
                            <button
                              onClick={() => handleCancelOrder(orderId)}
                              style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                            >
                              <X size={15} /> Cancel Order
                            </button>
                          </>
                        )}
                        {isPacked && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '12px', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}>
                              <Clock size={14} /> Packed & Ready
                            </span>
                            <button
                              onClick={() => {
                                setSelectedDispatchOrderId(orderId);
                                setShowDeliverySummon(true);
                              }}
                              style={{
                                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                                border: '1px solid rgba(245, 158, 11, 0.4)',
                                color: '#ffffff',
                                padding: '7px 14px',
                                borderRadius: '8px',
                                fontSize: '12px',
                                fontWeight: '800',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}
                            >
                              <Truck size={14} /> Summon Delivery Driver
                            </button>
                          </div>
                        )}
                        {isInTransit && (
                          <span style={{ fontSize: '12px', color: '#c084fc', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}>
                            <Truck size={14} /> Driver In-Transit to Customer
                          </span>
                        )}
                        {isDelivered && (
                          <span style={{ fontSize: '12px', color: '#34d399', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}>
                            <CheckCircle size={14} /> Delivered Successfully
                          </span>
                        )}
                        {o.status === 'cancelled' && (
                          <span style={{ fontSize: '12px', color: '#f87171', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}>
                            <X size={14} /> Order Cancelled (Inventory Replenished)
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            VIEW: BUYER BULK BARGAINS & NEGOTIATIONS
            ========================================================================= */}
        {activeNav === 'bargains' && (
          <div style={{ padding: '24px 28px', maxWidth: '1400px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
            <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
              <div>
                <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#f3f4f6', margin: 0 }}>
                  Buyer Bulk Bargains & Direct Price Offers
                </h2>
                <p style={{ fontSize: '13px', color: '#9ca3af', margin: '4px 0 0 0' }}>
                  Review real bulk purchase price proposals from customers. Submissions are marked PENDING until you choose to Accept, Reject, or propose a Counter Offer.
                </p>
              </div>

              <button
                onClick={fetchFarmerBargains}
                disabled={loadingBargains}
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: '#effbe7',
                  padding: '9px 16px',
                  borderRadius: '10px',
                  fontWeight: '700',
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <RotateCw size={14} style={{ animation: loadingBargains ? 'spin 1s linear infinite' : 'none' }} />
                <span>Refresh Bargains</span>
              </button>
            </div>

            {loadingBargains && farmerBargains.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af' }}>
                <RotateCw size={24} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 12px auto' }} />
                <p>Loading bulk buyer offers...</p>
              </div>
            ) : farmerBargains.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <IndianRupee size={36} color="#fbbf24" style={{ margin: '0 auto 12px auto', opacity: 0.6 }} />
                <h3 style={{ color: '#f3f4f6', fontSize: '17px', margin: '0 0 6px 0' }}>No Bulk Price Offers Yet</h3>
                <p style={{ color: '#9ca3af', fontSize: '13px', margin: 0 }}>
                  When buyers offer wholesale prices on your fresh produce, their pending offers will appear here for your review and negotiation.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {farmerBargains.map((b) => {
                  const bId = String(b._id || b.id);
                  const isPending = b.status === 'PENDING';
                  const isAccepted = b.status === 'ACCEPTED';
                  const isRejected = b.status === 'REJECTED';
                  const isCountered = b.status === 'COUNTERED';

                  const discountPct = b.originalPrice && b.proposedPrice
                    ? Math.round(((b.originalPrice - b.proposedPrice) / b.originalPrice) * 100)
                    : 0;

                  return (
                    <div
                      key={bId}
                      style={{
                        background: 'linear-gradient(145deg, rgba(14, 38, 30, 0.7), rgba(8, 24, 19, 0.8))',
                        border: isPending ? '1.5px solid rgba(245, 158, 11, 0.5)' : '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '16px',
                        padding: '20px',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.3)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <span style={{ fontSize: '16px', fontWeight: '800', color: '#effbe7' }}>
                              {b.productTitle || 'Farm Produce'}
                            </span>
                            <span style={{
                              padding: '2px 8px',
                              borderRadius: '8px',
                              fontSize: '11px',
                              fontWeight: '800',
                              background: isPending ? 'rgba(245, 158, 11, 0.2)' : isAccepted ? 'rgba(16, 185, 129, 0.2)' : isCountered ? 'rgba(56, 189, 248, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                              color: isPending ? '#fbbf24' : isAccepted ? '#34d399' : isCountered ? '#38bdf8' : '#f87171',
                              border: `1px solid ${isPending ? '#fbbf24' : isAccepted ? '#34d399' : isCountered ? '#38bdf8' : '#f87171'}`
                            }}>
                              {b.status}
                            </span>
                          </div>
                          <div style={{ fontSize: '12px', color: '#a3c2b0' }}>
                            Buyer: <strong style={{ color: '#effbe7' }}>{b.customerName || 'AgriLink Shopper'}</strong> • {new Date(b.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '11px', color: '#9ca3af' }}>Requested Quantity</div>
                          <span style={{ fontSize: '18px', fontWeight: '800', color: '#effbe7' }}>
                            {b.quantity} {b.unit || b.productUnit || 'kg'}
                          </span>
                        </div>
                      </div>

                      {/* Pricing Comparison */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px', background: 'rgba(0,0,0,0.25)', padding: '12px', borderRadius: '12px', marginBottom: '14px' }}>
                        <div>
                          <span style={{ fontSize: '11px', color: '#9ca3af', display: 'block' }}>Catalog Price:</span>
                          <strong style={{ color: '#effbe7', fontSize: '14px' }}>₹{b.originalPrice} / {b.unit || b.productUnit || 'kg'}</strong>
                        </div>
                        <div>
                          <span style={{ fontSize: '11px', color: '#fbbf24', display: 'block' }}>Buyer Proposed Offer:</span>
                          <strong style={{ color: '#fbbf24', fontSize: '16px' }}>₹{b.proposedPrice} / {b.unit || b.productUnit || 'kg'}</strong>
                          {discountPct > 0 && (
                            <span style={{ fontSize: '11px', color: '#f87171', marginLeft: '6px' }}>(-{discountPct}%)</span>
                          )}
                        </div>
                        <div>
                          <span style={{ fontSize: '11px', color: '#a3c2b0', display: 'block' }}>Total Proposed Value:</span>
                          <strong style={{ color: '#34d399', fontSize: '16px' }}>₹{(b.proposedPrice * b.quantity).toFixed(2)}</strong>
                        </div>
                        {b.counterPrice && (
                          <div>
                            <span style={{ fontSize: '11px', color: '#38bdf8', display: 'block' }}>Your Counter Price:</span>
                            <strong style={{ color: '#38bdf8', fontSize: '15px' }}>₹{b.counterPrice} / {b.unit || b.productUnit || 'kg'}</strong>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      {isPending && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', flexWrap: 'wrap', gap: '10px' }}>
                          <button
                            onClick={() => handleUpdateBargain(bId, 'accept')}
                            style={{
                              background: '#10b981',
                              color: '#fff',
                              border: 'none',
                              padding: '8px 18px',
                              borderRadius: '8px',
                              fontSize: '12.5px',
                              fontWeight: '700',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            <CheckCircle size={15} /> Accept Offer
                          </button>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <input
                              type="number"
                              min="1"
                              placeholder="Counter ₹"
                              value={counterInputs[bId] || ''}
                              onChange={e => setCounterInputs({ ...counterInputs, [bId]: e.target.value })}
                              style={{
                                width: '90px',
                                padding: '8px 10px',
                                borderRadius: '8px',
                                background: 'rgba(0,0,0,0.5)',
                                border: '1px solid rgba(56, 189, 248, 0.4)',
                                color: '#effbe7',
                                fontSize: '12px',
                                fontWeight: '700'
                              }}
                            />
                            <button
                              onClick={() => handleUpdateBargain(bId, 'counter', counterInputs[bId])}
                              style={{
                                background: '#0284c7',
                                color: '#fff',
                                border: 'none',
                                padding: '8px 14px',
                                borderRadius: '8px',
                                fontSize: '12px',
                                fontWeight: '700',
                                cursor: 'pointer'
                              }}
                            >
                              Counter Offer
                            </button>
                          </div>

                          <button
                            onClick={() => handleUpdateBargain(bId, 'reject')}
                            style={{
                              background: 'rgba(239, 68, 68, 0.15)',
                              color: '#f87171',
                              border: '1px solid rgba(239, 68, 68, 0.3)',
                              padding: '8px 14px',
                              borderRadius: '8px',
                              fontSize: '12px',
                              fontWeight: '700',
                              cursor: 'pointer'
                            }}
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            VIEW 5: MARKET PRICES (Mandi Benchmarks)
            ========================================================================= */}
        {activeNav === 'market_prices' && (
          <div style={{ padding: '24px 28px', maxWidth: '1400px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.35)', color: '#7dd3fc', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '8px' }}>
                <Info size={12} /> Regional Mandi Reference Benchmarks (Sample Data)
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#f3f4f6', margin: 0 }}>
                Regional Mandi Wholesale Price Benchmarks
              </h2>
              <p style={{ fontSize: '13px', color: '#9ca3af', margin: '4px 0 0 0' }}>
                Curated wholesale benchmark rates to guide produce pricing. Live automated APMC telemetry feeds require authorized government gateway integration.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
              {[
                { crop: 'Basmati Paddy (Rice)', mandi: 'Thanjavur APMC', price: '₹2,350 / Qtl', change: '+3.4%', up: true, icon: '🌾' },
                { crop: 'Vine Tomatoes', mandi: 'Coimbatore Market', price: '₹1,850 / Qtl', change: '+5.1%', up: true, icon: '🍅' },
                { crop: 'Bt Cotton', mandi: 'Guntur Yard', price: '₹7,100 / Qtl', change: '-1.2%', up: false, icon: '🌿' },
                { crop: 'Nashik Red Onions', mandi: 'Bangalore APMC', price: '₹1,600 / Qtl', change: '+2.8%', up: true, icon: '🧅' },
                { crop: 'Kharif Maize (Corn)', mandi: 'Mandya Basin', price: '₹2,100 / Qtl', change: '+0.8%', up: true, icon: '🌽' },
                { crop: 'Golden Wheat', mandi: 'Khanna Punjab', price: '₹2,275 / Qtl', change: '+1.5%', up: true, icon: '🌾' }
              ].map((item, idx) => (
                <div key={idx} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(55, 189, 120, 0.2)', borderRadius: '12px', padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '24px' }}>{item.icon}</span>
                    <span style={{ fontSize: '11px', fontWeight: '800', color: item.up ? '#34d399' : '#f87171', background: item.up ? 'rgba(52, 211, 153, 0.12)' : 'rgba(248, 113, 113, 0.12)', padding: '2px 8px', borderRadius: '10px' }}>
                      {item.change}
                    </span>
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: '800', color: '#f3f4f6' }}>{item.crop}</div>
                  <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '8px' }}>Mandi: {item.mandi}</div>
                  <div style={{ fontSize: '18px', fontWeight: '900', color: '#10b981' }}>{item.price}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================================
            VIEW 5.5: DEDICATED DISEASE DETECTION & AI PLANT DOCTOR
            ========================================================================= */}
        {activeNav === 'disease_detection' && (
          <div style={{ padding: '24px 28px', maxWidth: '1400px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
            
            {/* Header Title Banner */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(9, 43, 39, 0.6) 100%)',
              border: '1.5px solid rgba(239, 68, 68, 0.35)',
              borderRadius: '20px',
              padding: '24px 28px',
              marginBottom: '24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '20px'
            }}>
              <div>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(239, 68, 68, 0.2)',
                  color: '#fca5a5',
                  padding: '4px 12px',
                  borderRadius: '16px',
                  fontSize: '11px',
                  fontWeight: '800',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                  marginBottom: '10px'
                }}>
                  <ShieldCheck size={14} color="#f87171" />
                  <span>SIMULATION / DEMO MODE (Visual Symptom Presets)</span>
                </div>
                <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#ffffff', margin: '0 0 6px 0' }}>
                  Plant Disease Detection & Remedy Center
                </h1>
                <p style={{ fontSize: '13.5px', color: '#cbd5e1', maxWidth: '750px', margin: 0, lineHeight: '1.5' }}>
                  Simulated reference diagnostics matching uploaded leaf photos and symptoms against calibrated regional pathogen presets. (Production Vision AI provider can be connected cleanly without UI rewrites).
                </p>
              </div>

              {/* Clinic Stats Pill */}
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '10px 16px', textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: '800', color: '#f59e0b' }}>Simulated</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>Diagnostic Mode</div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '10px 16px', textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: '800', color: '#34d399' }}>Instant</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>Remedy Speed</div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '10px 16px', textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: '800', color: '#38bdf8' }}>Tamil Nadu</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>Regional Database</div>
                </div>
              </div>
            </div>

            {/* Quick Sample Selector Bar */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(55, 189, 120, 0.2)',
              borderRadius: '16px',
              padding: '16px 20px',
              marginBottom: '24px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#f3f4f6', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>🧪 Test With Verified Leaf Samples:</span>
                  <span style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 'normal' }}>Click any sample to run diagnostic scan</span>
                </span>
                <span style={{ fontSize: '11px', color: '#34d399', fontWeight: '700' }}>
                  Current Selection: {selectedDisease.name.split('(')[0]}
                </span>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {DISEASE_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectDiseasePreset(preset)}
                    style={{
                      background: selectedDisease.id === preset.id ? '#10b981' : 'rgba(255,255,255,0.06)',
                      color: selectedDisease.id === preset.id ? '#ffffff' : '#d1d5db',
                      border: selectedDisease.id === preset.id ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.15)',
                      padding: '8px 16px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: selectedDisease.id === preset.id ? '800' : '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.2s ease',
                      boxShadow: selectedDisease.id === preset.id ? '0 4px 12px rgba(16, 185, 129, 0.35)' : 'none'
                    }}
                  >
                    <span>{preset.id === 'healthy_leaf' ? '🌿' : '🍃'}</span>
                    <span>{preset.crop}: {preset.name.split('(')[0]}</span>
                    <span style={{
                      fontSize: '10px',
                      padding: '1px 6px',
                      borderRadius: '8px',
                      background: preset.id === 'healthy_leaf' ? 'rgba(52, 211, 153, 0.25)' : 'rgba(248, 113, 113, 0.25)',
                      color: preset.id === 'healthy_leaf' ? '#34d399' : '#fca5a5'
                    }}>
                      {preset.severity}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2D / 3D Diagnostic Mode & Audio Controls Bar */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
              marginBottom: '20px',
              background: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '14px',
              padding: '12px 18px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12.5px', fontWeight: '700', color: '#f3f4f6' }}>View Mode:</span>
                <button
                  type="button"
                  onClick={() => setDiseaseView3D(false)}
                  style={{
                    background: !diseaseView3D ? '#10b981' : 'rgba(255, 255, 255, 0.08)',
                    color: '#ffffff',
                    border: 'none',
                    padding: '6px 14px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '800',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <ImageIcon size={14} /> 2D Optical Scanner
                </button>
                <button
                  type="button"
                  onClick={() => setDiseaseView3D(true)}
                  style={{
                    background: diseaseView3D ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' : 'rgba(255, 255, 255, 0.08)',
                    color: '#ffffff',
                    border: 'none',
                    padding: '6px 14px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '800',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Box size={14} /> ✨ 3D Leaf Tissue Inspector
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={handleSpeakDiseaseRemedy}
                  style={{
                    background: isTtsPlaying ? '#ef4444' : 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#ffffff',
                    padding: '6px 14px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Volume2 size={14} className={isTtsPlaying ? 'animate-bounce' : ''} />
                  <span>{isTtsPlaying ? 'Stop Audio' : '🔊 Listen Remedy (Voice Reader)'}</span>
                </button>
              </div>
            </div>

            {/* Diagnostic Scanner Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px', marginBottom: '32px' }}>
              
              {/* Left Column: Image Upload & Laser Scanner / 3D Inspector */}
              <div style={{
                background: '#0a1715',
                border: '1.5px solid rgba(55, 189, 120, 0.25)',
                borderRadius: '16px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                minHeight: '440px'
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <div style={{ fontSize: '13px', fontWeight: '800', color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {diseaseView3D ? <Box size={16} /> : <ImageIcon size={16} />}
                      {diseaseView3D ? '3D Orbital Leaf Inspection Port' : 'AI Leaf Visual Scanner'}
                    </div>
                    <span style={{ fontSize: '11px', color: '#34d399', fontWeight: '700' }}>
                      Confidence: {aiScanConfidence}
                    </span>
                  </div>

                  {/* 3D vs 2D Display Frame */}
                  {diseaseView3D ? (
                    <div style={{ height: '310px', borderRadius: '12px', overflow: 'hidden' }}>
                      <ThreeDPortViewer
                        mode="leaf_inspector"
                        diseaseName={selectedDisease.name}
                        severity={selectedDisease.severity}
                      />
                    </div>
                  ) : (
                    <div style={{
                      position: 'relative',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      border: '2px dashed rgba(55, 189, 120, 0.4)',
                      height: '310px',
                      background: '#061311',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {analyzingImage && (
                        <div className="scanner-laser-line" />
                      )}

                      <img
                        src={uploadedImagePreview || selectedDisease.image}
                        alt={selectedDisease.name}
                        className="uploaded-img"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />

                      {/* Scan Status Badge Overlay */}
                      <div style={{
                        position: 'absolute',
                        bottom: '12px',
                        left: '12px',
                        right: '12px',
                        background: 'rgba(0, 0, 0, 0.82)',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '8px',
                        padding: '8px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: analyzingImage ? '#f59e0b' : '#10b981',
                            display: 'inline-block',
                            boxShadow: analyzingImage ? '0 0 8px #f59e0b' : '0 0 8px #10b981'
                          }} />
                          <span style={{ fontSize: '12px', fontWeight: '700', color: '#ffffff' }}>
                            {analyzingImage ? 'Scanning Leaf Tissue with AI...' : `Scan Verified (${aiScanConfidence})`}
                          </span>
                        </div>
                        <span style={{ fontSize: '11px', color: '#34d399', fontWeight: '700' }}>
                          {selectedDisease.crop}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Upload & Retake Action Button */}
                <div style={{ marginTop: '20px' }}>
                  <label style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: '#ffffff',
                    padding: '12px 20px',
                    borderRadius: '10px',
                    fontSize: '13px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
                    boxSizing: 'border-box'
                  }}>
                    <UploadCloud size={17} />
                    <span>{uploadedImagePreview ? 'Leaf Analyzed • Tap to Upload Another' : 'Capture / Upload Leaf Photo'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleDiseaseImageUpload}
                      style={{ display: 'none' }}
                    />
                  </label>
                  <p style={{ fontSize: '11px', color: '#9ca3af', textAlign: 'center', margin: '8px 0 0 0' }}>
                    Supports JPG, PNG from phone camera or field album
                  </p>
                </div>
              </div>

              {/* Right Column: Farmer-Friendly Diagnosis & Prescriptions */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1.5px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div>
                  {/* Diagnosis Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '14px' }}>
                    <div>
                      <span style={{ fontSize: '11px', color: '#f87171', fontWeight: '800', letterSpacing: '0.6px', textTransform: 'uppercase' }}>
                        AI DIAGNOSTIC RESULT
                      </span>
                      <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#ffffff', margin: '2px 0 0 0' }}>
                        {selectedDisease.name}
                      </h3>
                      <div style={{ fontSize: '12.5px', color: '#94a3b8', marginTop: '2px' }}>
                        Affects: <strong style={{ color: '#e2e8f0' }}>{selectedDisease.crop}</strong> {selectedDisease.tamilName && `• ${selectedDisease.tamilName}`}
                      </div>
                    </div>

                    <span style={{
                      background: selectedDisease.severity.includes('0%') ? 'rgba(52, 211, 153, 0.2)' : selectedDisease.severity.includes('High') || selectedDisease.severity.includes('Critical') ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                      color: selectedDisease.severity.includes('0%') ? '#34d399' : selectedDisease.severity.includes('High') || selectedDisease.severity.includes('Critical') ? '#f87171' : '#f59e0b',
                      border: `1px solid ${selectedDisease.severity.includes('0%') ? '#34d399' : selectedDisease.severity.includes('High') || selectedDisease.severity.includes('Critical') ? '#f87171' : '#f59e0b'}`,
                      padding: '4px 12px',
                      borderRadius: '16px',
                      fontSize: '11.5px',
                      fontWeight: '800',
                      whiteSpace: 'nowrap'
                    }}>
                      Severity: {selectedDisease.severity}
                    </span>
                  </div>

                  {/* Summary / Symptoms */}
                  <div style={{ background: 'rgba(0,0,0,0.3)', borderLeft: '3px solid #10b981', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', color: '#e2e8f0', lineHeight: '1.5', marginBottom: '18px' }}>
                    {selectedDisease.summary}
                  </div>

                  {/* Treatment Cards Grid */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                    {/* Organic Remedy */}
                    <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '12px', padding: '14px' }}>
                      <div style={{ fontSize: '12px', fontWeight: '800', color: '#34d399', textTransform: 'uppercase', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        🌿 Organic & Natural Remedy (இயற்கை மருத்துவம்)
                      </div>
                      <div style={{ fontSize: '12.5px', color: '#f3f4f6', lineHeight: '1.5' }}>
                        {selectedDisease.organicRemedy}
                      </div>
                    </div>

                    {/* Chemical Medicine with Exact Dosage */}
                    <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', padding: '14px' }}>
                      <div style={{ fontSize: '12px', fontWeight: '800', color: '#f87171', textTransform: 'uppercase', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        💊 Chemical Spray & Exact Dosage (மருந்து தெளிப்பு)
                      </div>
                      <div style={{ fontSize: '12.5px', color: '#f3f4f6', lineHeight: '1.5' }}>
                        {selectedDisease.chemicalMedicine}
                      </div>
                    </div>

                    {/* Farmer Field Tips */}
                    <div style={{ background: 'rgba(244, 201, 93, 0.08)', border: '1px solid rgba(244, 201, 93, 0.3)', borderRadius: '12px', padding: '14px' }}>
                      <div style={{ fontSize: '12px', fontWeight: '800', color: '#fbbf24', textTransform: 'uppercase', marginBottom: '6px' }}>
                        👨‍🌾 Farmer Field Practice Tips
                      </div>
                      <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: '#e2e8f0', lineHeight: '1.6' }}>
                        {selectedDisease.farmerTips.map((tip, idx) => (
                          <li key={idx} style={{ marginBottom: '4px' }}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* 1-Click Send to Medicine & Fertilizer Hub + Action Buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                  <button
                    onClick={handleSendToMedicineHub}
                    style={{
                      width: '100%',
                      background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                      border: 'none',
                      color: '#ffffff',
                      padding: '12px 16px',
                      borderRadius: '10px',
                      fontSize: '13px',
                      fontWeight: '800',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 14px rgba(2, 132, 199, 0.35)'
                    }}
                  >
                    <FlaskConical size={16} />
                    <span>Apply to Medicines & Fertilizers Center (Calculate Exact Dosage) ➔</span>
                  </button>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => showToast(`Saved treatment plan for ${selectedDisease.name.split('(')[0]} to field notebook`, 'success')}
                      style={{
                        flex: 1,
                        background: 'rgba(55, 189, 120, 0.15)',
                        border: '1px solid rgba(55, 189, 120, 0.35)',
                        color: '#34d399',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      ✓ Save to Field Notebook
                    </button>
                    <button
                      onClick={() => showToast('Opening Krishi Vigyan Kendra (KVK) helpline: 1800-180-1551', 'info')}
                      style={{
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        color: '#ffffff',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      📞 Call Agronomist
                    </button>
                  </div>
                </div>
              </div>

            </div>

            {/* Educational Knowledge Hub: Top Crop Threats */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(55, 189, 120, 0.15)',
              borderRadius: '16px',
              padding: '24px'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#ffffff', margin: '0 0 6px 0' }}>
                Verified Crop Disease & Pathology Library ({DISEASE_PRESETS.length} Verified Diseases)
              </h3>
              <p style={{ fontSize: '12.5px', color: '#9ca3af', margin: '0 0 20px 0' }}>
                Fungal, bacterial, and viral infections across paddy, tomato, cotton, sugarcane, chilli, banana, citrus, and vegetable crops.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                {DISEASE_PRESETS.map((dp) => (
                  <div
                    key={dp.id}
                    style={{
                      background: 'rgba(0,0,0,0.3)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '12px',
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ height: '130px', borderRadius: '8px', overflow: 'hidden', marginBottom: '12px' }}>
                        <img src={dp.image} alt={dp.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div style={{ fontSize: '11px', color: '#10b981', fontWeight: '700', textTransform: 'uppercase' }}>
                        {dp.crop}
                      </div>
                      <h4 style={{ fontSize: '14.5px', fontWeight: '800', color: '#ffffff', margin: '2px 0 6px 0' }}>
                        {dp.name}
                      </h4>
                      <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: '1.4', margin: '0 0 12px 0' }}>
                        {dp.summary}
                      </p>
                    </div>

                    <button
                      onClick={() => handleSelectDiseasePreset(dp)}
                      style={{
                        width: '100%',
                        background: 'rgba(55, 189, 120, 0.15)',
                        border: '1px solid rgba(55, 189, 120, 0.35)',
                        color: '#34d399',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      Inspect Disease & Remedy ➔
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* =========================================================================
            VIEW 5.6: FARMER MEDICINES & FERTILIZERS CENTER
            ========================================================================= */}
        {activeNav === 'medicines_fertilizers' && (
          <div style={{ padding: '24px 28px', maxWidth: '1400px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
            <MedicineFertilizerHub
              onSelectMedicineForOrder={handleOrderMedicineWithOtp}
              showToast={showToast}
              initialCrop={selectedDisease.crop}
            />
          </div>
        )}

        {/* =========================================================================
            VIEW 5.7: 3D INTERACTIVE FARM SIMULATION PORT
            ========================================================================= */}
        {activeNav === 'three_d_farm_port' && (
          <div style={{ padding: '24px 28px', maxWidth: '1400px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
            <div style={{
              background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.15) 0%, rgba(3, 105, 161, 0.4) 100%)',
              border: '1.5px solid rgba(56, 189, 248, 0.35)',
              borderRadius: '20px',
              padding: '24px 28px',
              marginBottom: '24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '20px'
            }}>
              <div>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(56, 189, 248, 0.2)',
                  color: '#7dd3fc',
                  padding: '4px 14px',
                  borderRadius: '16px',
                  fontSize: '11px',
                  fontWeight: '800',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                  marginBottom: '10px'
                }}>
                  <Box size={14} color="#38bdf8" />
                  <span>Interactive 3D Visualizer Studio</span>
                </div>
                <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#ffffff', margin: '0 0 6px 0' }}>
                  Smart Farm 3D Elevation & Crop Health Port
                </h1>
                <p style={{ fontSize: '13.5px', color: '#cbd5e1', maxWidth: '750px', margin: 0, lineHeight: '1.5' }}>
                  Interactive 3D orbital space visualizing farm terrain elevations, IoT soil moisture channels, plant tissue disease hotspots, and agrochemical mist dispensers.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(56,189,248,0.3)', borderRadius: '12px', padding: '10px 16px', textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: '800', color: '#38bdf8' }}>360° Orbit</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>Drag Controls</div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(52,211,153,0.3)', borderRadius: '12px', padding: '10px 16px', textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: '800', color: '#34d399' }}>WebGL Fast</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>Hardware Accel</div>
                </div>
              </div>
            </div>

            {/* 3D Grid Showcase */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
              <div style={{ height: '420px' }}>
                <ThreeDPortViewer mode="farm_terrain" />
              </div>
              <div style={{ height: '420px' }}>
                <ThreeDPortViewer mode="leaf_inspector" diseaseName={selectedDisease.name} severity={selectedDisease.severity} />
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            VIEW: 3D SOIL DIGITAL TWIN
            ========================================================================= */}
        {activeNav === 'soil_digital_twin' && (
          <div style={{ padding: '24px 28px', maxWidth: '1400px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
            <div style={{
              background: 'linear-gradient(135deg, rgba(74, 222, 128, 0.15) 0%, rgba(5, 150, 105, 0.3) 100%)',
              border: '1.5px solid rgba(74, 222, 128, 0.4)',
              borderRadius: '20px',
              padding: '24px 28px',
              marginBottom: '24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '20px'
            }}>
              <div>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(74, 222, 128, 0.2)',
                  color: '#86efac',
                  padding: '4px 14px',
                  borderRadius: '16px',
                  fontSize: '11px',
                  fontWeight: '800',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                  marginBottom: '10px'
                }}>
                  <Sprout size={14} color="#4ade80" />
                  <span>Subterranean Digital Twin & Telemetry</span>
                </div>
                <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#ffffff', margin: '0 0 6px 0' }}>
                  Real-Time 3D Soil Strata & Bio-Irrigation Twin
                </h1>
                <p style={{ fontSize: '13.5px', color: '#cbd5e1', maxWidth: '750px', margin: 0, lineHeight: '1.5' }}>
                  Live underground root respiration, volumetric water moisture percolation, and autonomous microbial balance sensors.
                </p>
              </div>

              <button
                onClick={() => setShowDeliverySummon(true)}
                style={{
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  border: 'none',
                  color: '#ffffff',
                  padding: '12px 22px',
                  borderRadius: '14px',
                  fontWeight: '800',
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 8px 24px rgba(245, 158, 11, 0.4)'
                }}
              >
                <Truck size={18} />
                <span>🛰️ Summon Cold-Chain Delivery</span>
              </button>
            </div>

            <SoilDigitalTwin3D onTriggerDrip={() => showToast('💧 Subsurface micro-drip valve opened (0.4 Bar)', 'info')} />
          </div>
        )}

        {/* =========================================================================
            VIEW 7: SETTINGS
            ========================================================================= */}
        {activeNav === 'settings' && (
          <div style={{ padding: '24px 28px', maxWidth: '1000px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(55, 189, 120, 0.2)', borderRadius: '16px', padding: '28px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#ffffff', margin: '0 0 16px 0' }}>
                System & Regional Preferences
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '10px' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#f3f4f6' }}>SMS Order Notifications</div>
                    <div style={{ fontSize: '11px', color: '#9ca3af' }}>Receive instantaneous SMS when a buyer orders your produce</div>
                  </div>
                  <input type="checkbox" defaultChecked style={{ width: '18px', height: '18px', accentColor: '#10b981', cursor: 'pointer' }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '10px' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#f3f4f6' }}>Severe Weather & Rain SMS Alerts</div>
                    <div style={{ fontSize: '11px', color: '#9ca3af' }}>Get storm and squall warnings 12 hours before onset</div>
                  </div>
                  <input type="checkbox" defaultChecked style={{ width: '18px', height: '18px', accentColor: '#10b981', cursor: 'pointer' }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '10px' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#f3f4f6' }}>Currency Format</div>
                    <div style={{ fontSize: '11px', color: '#9ca3af' }}>Display prices in Indian Rupees (₹)</div>
                  </div>
                  <span style={{ fontSize: '12px', color: '#34d399', fontWeight: '700' }}>₹ INR Standard</span>
                </div>
              </div>

              <button
                onClick={() => showToast('Preferences updated', 'success')}
                style={{ background: '#10b981', color: '#ffffff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}
              >
                Save Preferences
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            VIEW: FARM & TOOLS HUB (Mobile Friendly)
            ========================================================================= */}
        {activeNav === 'farm' && (
          <div style={{ padding: 'clamp(14px, 3vw, 28px)', maxWidth: '1400px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(74, 222, 128, 0.15)', border: '1px solid rgba(74, 222, 128, 0.35)', color: '#86efac', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '8px' }}>
                <Sprout size={12} /> Agricultural Command Hub
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#effbe7', margin: '0 0 6px 0' }}>
                Farming Tools & Advisory
              </h2>
              <p style={{ fontSize: '13px', color: '#9db5aa', margin: 0 }}>
                Smart agronomy decision tools, live weather radar, crop disease diagnostics, and mandi wholesale rates.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: '16px' }}>
              {/* 1. Before Cultivation */}
              <div
                onClick={() => { setActiveNav('before_cultivation'); setCultivationStage('before'); }}
                style={{ background: 'rgba(9, 38, 28, 0.75)', border: '1.5px solid rgba(74, 222, 128, 0.3)', borderRadius: '18px', padding: '20px', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', gap: '10px' }}
              >
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(74, 222, 128, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Sprout size={24} color="#4ade80" />
                </div>
                <div>
                  <h3 style={{ color: '#effbe7', fontSize: '16px', fontWeight: '800', margin: '0 0 4px 0' }}>Before Cultivation</h3>
                  <p style={{ color: '#a3c2b0', fontSize: '12.5px', margin: 0, lineHeight: '1.5' }}>
                    Soil texture analysis, water capacity scoring, and optimal crop profit recommendations.
                  </p>
                </div>
              </div>

              {/* 2. After Cultivation */}
              <div
                onClick={() => { setActiveNav('after_cultivation'); setCultivationStage('after'); }}
                style={{ background: 'rgba(9, 38, 28, 0.75)', border: '1.5px solid rgba(244, 201, 93, 0.3)', borderRadius: '18px', padding: '20px', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', gap: '10px' }}
              >
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(244, 201, 93, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Layers size={24} color="#f4c95d" />
                </div>
                <div>
                  <h3 style={{ color: '#effbe7', fontSize: '16px', fontWeight: '800', margin: '0 0 4px 0' }}>After Cultivation</h3>
                  <p style={{ color: '#a3c2b0', fontSize: '12.5px', margin: 0, lineHeight: '1.5' }}>
                    Manage harvested stock lots, pricing, packaging, and farm gate GPS pickup points.
                  </p>
                </div>
              </div>

              {/* 3. AI Disease Detection */}
              <div
                onClick={() => setActiveNav('disease_detection')}
                style={{ background: 'rgba(9, 38, 28, 0.75)', border: '1.5px solid rgba(239, 68, 68, 0.3)', borderRadius: '18px', padding: '20px', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', gap: '10px' }}
              >
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldCheck size={24} color="#f87171" />
                </div>
                <div>
                  <h3 style={{ color: '#effbe7', fontSize: '16px', fontWeight: '800', margin: '0 0 4px 0' }}>Crop Disease Detection</h3>
                  <p style={{ color: '#a3c2b0', fontSize: '12.5px', margin: 0, lineHeight: '1.5' }}>
                    Optical leaf photograph scan, pathogen diagnosis, and biological treatment remedies.
                  </p>
                </div>
              </div>

              {/* 4. Medicines & Fertilizers */}
              <div
                onClick={() => setActiveNav('medicines_fertilizers')}
                style={{ background: 'rgba(9, 38, 28, 0.75)', border: '1.5px solid rgba(52, 211, 153, 0.3)', borderRadius: '18px', padding: '20px', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', gap: '10px' }}
              >
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(52, 211, 153, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FlaskConical size={24} color="#34d399" />
                </div>
                <div>
                  <h3 style={{ color: '#effbe7', fontSize: '16px', fontWeight: '800', margin: '0 0 4px 0' }}>Medicines & Fertilizers</h3>
                  <p style={{ color: '#a3c2b0', fontSize: '12.5px', margin: 0, lineHeight: '1.5' }}>
                    Organic fertilizer catalog, application dosage calculator, and pest control guidelines.
                  </p>
                </div>
              </div>

              {/* 5. APMC Mandi Market Rates */}
              <div
                onClick={() => setActiveNav('market_prices')}
                style={{ background: 'rgba(9, 38, 28, 0.75)', border: '1.5px solid rgba(56, 189, 248, 0.3)', borderRadius: '18px', padding: '20px', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', gap: '10px' }}
              >
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(56, 189, 248, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BarChart2 size={24} color="#38bdf8" />
                </div>
                <div>
                  <h3 style={{ color: '#effbe7', fontSize: '16px', fontWeight: '800', margin: '0 0 4px 0' }}>Mandi Wholesale Prices</h3>
                  <p style={{ color: '#a3c2b0', fontSize: '12.5px', margin: 0, lineHeight: '1.5' }}>
                    Live wholesale mandi prices across Mandya, Bangalore, and regional agricultural yards.
                  </p>
                </div>
              </div>

              {/* 6. 3D Farm Port */}
              <div
                onClick={() => setActiveNav('three_d_farm_port')}
                style={{ background: 'rgba(9, 38, 28, 0.75)', border: '1.5px solid rgba(168, 85, 247, 0.3)', borderRadius: '18px', padding: '20px', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', gap: '10px' }}
              >
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(168, 85, 247, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Smartphone size={24} color="#c084fc" />
                </div>
                <div>
                  <h3 style={{ color: '#effbe7', fontSize: '16px', fontWeight: '800', margin: '0 0 4px 0' }}>3D Farm Port</h3>
                  <p style={{ color: '#a3c2b0', fontSize: '12.5px', margin: 0, lineHeight: '1.5' }}>
                    Interactive 3D digital-twin farm layout and autonomous field sensor visualization.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            VIEW: FARMER PROFILE & GPS (Mobile Friendly)
            ========================================================================= */}
        {/* =========================================================================
            VIEW: FARMER PROFILE & GPS (Fully Interactive & Safe)
            ========================================================================= */}
        {/* =========================================================================
            VIEW: ASK AGRILINK AI (Voice + Text Agricultural Assistant)
            ========================================================================= */}
        {activeNav === 'ask_agrilink_ai' && (
          <div style={{ padding: '24px 28px', maxWidth: '1000px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
            <div style={{ marginBottom: '18px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(52, 211, 153, 0.15)', border: '1px solid rgba(52, 211, 153, 0.35)', color: '#34d399', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '8px' }}>
                <Bot size={12} /> Agricultural AI Assistant
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#effbe7', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                🌱 Ask AgriLink AI
              </h2>
              <p style={{ fontSize: '13px', color: '#9db5aa', margin: 0 }}>
                Discuss crop choices, soil health, irrigation schedules, weather advisories, diseases, and cultivation practices.
              </p>
            </div>

            <AskAgriLinkAi
              farmerLocation={farmerCityName}
              showToast={showToast}
            />
          </div>
        )}

        {/* =========================================================================
            VIEW: FARMER PROFILE & GPS (Phase 6 Enhanced Security & 7-Day Lock)
            ========================================================================= */}
        {activeNav === 'profile' && (
          <div style={{ padding: 'clamp(14px, 3vw, 28px)', maxWidth: '1000px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(74, 222, 128, 0.15)', border: '1px solid rgba(74, 222, 128, 0.35)', color: '#86efac', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '8px' }}>
                <User size={12} /> Producer Identity & Security
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#effbe7', margin: '0 0 6px 0' }}>
                Farmer Profile & Security Center
              </h2>
              <p style={{ fontSize: '13px', color: '#9db5aa', margin: 0 }}>
                Manage verified producer credentials, farm name, email verification, and pickup coordinates.
              </p>
            </div>

            <div style={{ background: 'rgba(9, 38, 28, 0.85)', border: '1.5px solid rgba(74, 222, 128, 0.3)', borderRadius: '20px', padding: '24px', marginBottom: '24px' }}>
              {/* Profile Card Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '18px', flexWrap: 'wrap' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: 'linear-gradient(135deg, #10b981, #047857)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '28px', fontWeight: '900', boxShadow: '0 4px 16px rgba(16, 185, 129, 0.4)' }}>
                  {profileFirstName?.[0]?.toUpperCase() || user?.firstName?.[0]?.toUpperCase() || 'F'}
                </div>
                <div>
                  <div style={{ color: '#effbe7', fontSize: '20px', fontWeight: '800' }}>
                    {profileFirstName || user?.firstName} {profileLastName || user?.lastName}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
                    <span style={{
                      background: user?.isVerified ? 'rgba(52, 211, 153, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                      color: user?.isVerified ? '#34d399' : '#fbbf24',
                      border: `1px solid ${user?.isVerified ? '#34d399' : '#fbbf24'}`,
                      padding: '2px 10px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: '800'
                    }}>
                      {user?.isVerified ? '✓ Verified Producer' : '⏳ Verification Pending'}
                    </span>
                    <span style={{ fontSize: '11.5px', color: '#9db5aa' }}>
                      Account Role: <strong style={{ color: '#effbe7' }}>Farmer</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Status and Modification Timestamps */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '22px' }}>
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '12px 14px' }}>
                  <span style={{ fontSize: '11px', color: '#9db5aa', textTransform: 'uppercase', fontWeight: '700' }}>Last Profile Update</span>
                  <div style={{ fontSize: '13px', fontWeight: '800', color: '#effbe7', marginTop: '3px' }}>
                    {user?.lastProfileModifiedAt ? new Date(user.lastProfileModifiedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Initial Registration'}
                  </div>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '12px 14px' }}>
                  <span style={{ fontSize: '11px', color: '#9db5aa', textTransform: 'uppercase', fontWeight: '700' }}>Next Modification Date</span>
                  <div style={{ fontSize: '13px', fontWeight: '800', color: '#34d399', marginTop: '3px' }}>
                    Available Now
                  </div>
                </div>
              </div>

              {/* Editable Profile Form */}
              <form onSubmit={handleSaveProfile}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ fontSize: '12px', color: '#9db5aa', display: 'block', marginBottom: '6px', fontWeight: '700' }}>First Name</label>
                    <input
                      type="text"
                      value={profileFirstName}
                      onChange={e => setProfileFirstName(e.target.value)}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', color: '#9db5aa', display: 'block', marginBottom: '6px', fontWeight: '700' }}>Last Name</label>
                    <input
                      type="text"
                      value={profileLastName}
                      onChange={e => setProfileLastName(e.target.value)}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', color: '#9db5aa', display: 'block', marginBottom: '6px', fontWeight: '700' }}>Farm Name / Estate</label>
                    <input
                      type="text"
                      value={profileFarmName}
                      onChange={e => setProfileFarmName(e.target.value)}
                      placeholder="e.g. Kaveri Organic Greens Estate"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', color: '#9db5aa', display: 'block', marginBottom: '6px', fontWeight: '700' }}>Phone (Login Phone)</label>
                    <input
                      type="text"
                      value={user?.phone || profilePhone}
                      disabled
                      style={{ opacity: 0.7, cursor: 'not-allowed' }}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', color: '#9db5aa', display: 'block', marginBottom: '6px', fontWeight: '700' }}>Native Place / District</label>
                    <input
                      type="text"
                      value={profileNativePlace}
                      onChange={e => setProfileNativePlace(e.target.value)}
                      placeholder="e.g. Namakkal / Salem"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <label style={{ fontSize: '12px', color: '#9db5aa', fontWeight: '700' }}>Email Address</label>
                      <button
                        type="button"
                        onClick={() => setShowEmailOtpModal(true)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#34d399',
                          fontSize: '11px',
                          fontWeight: '800',
                          cursor: 'pointer',
                          textDecoration: 'underline'
                        }}
                      >
                        Change Email (OTP)
                      </button>
                    </div>
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      style={{ opacity: 0.7, cursor: 'not-allowed' }}
                      className="input-field"
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ fontSize: '12px', color: '#9db5aa', display: 'block', marginBottom: '6px', fontWeight: '700' }}>Farm Description & Cultivation Methods</label>
                  <textarea
                    value={profileDescription}
                    onChange={e => setProfileDescription(e.target.value)}
                    rows="3"
                    placeholder="Describe your soil, crops, organic certifications, and pesticide-free methods..."
                    className="input-field"
                  />
                </div>

                {/* Farm GPS & Gate Pickup Coordinates */}
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(74, 222, 128, 0.25)', borderRadius: '16px', padding: '16px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MapPin size={18} color="#34d399" />
                      <span style={{ fontSize: '13px', fontWeight: '800', color: '#effbe7' }}>
                        Farm Gate GPS Location
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowProfileMapPicker(true)}
                      style={{
                        background: 'rgba(52, 211, 153, 0.2)',
                        border: '1px solid #34d399',
                        color: '#34d399',
                        padding: '6px 14px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      🗺️ Update Farm GPS on Map
                    </button>
                  </div>
                  <div style={{ fontSize: '13px', color: '#c0d9cb', marginBottom: '4px' }}>
                    {farmLocation?.address || farmLocation?.placeName || 'Mandya Organic Farm Gate, Karnataka'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#86efac' }}>
                    Coordinates: {farmLocation?.lat ? Number(farmLocation.lat).toFixed(4) : '11.3992'}° N, {farmLocation?.lng ? Number(farmLocation.lng).toFixed(4) : '79.6936'}° E
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                  <button
                    type="button"
                    onClick={handleLogoutFarmer}
                    style={{
                      background: 'rgba(220, 38, 38, 0.15)',
                      border: '1.5px solid #dc2626',
                      color: '#ef4444',
                      padding: '11px 22px',
                      borderRadius: '12px',
                      fontSize: '13px',
                      fontWeight: '800',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>

                  <button
                    type="submit"
                    disabled={savingProfile}
                    style={{
                      background: '#10b981',
                      color: '#ffffff',
                      border: 'none',
                      padding: '11px 24px',
                      borderRadius: '12px',
                      fontSize: '13.5px',
                      fontWeight: '800',
                      cursor: savingProfile ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <span>{savingProfile ? 'Saving Profile...' : 'Save Profile Changes'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Farm GPS MapPicker Modal */}
        {showProfileMapPicker && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            padding: '16px'
          }}>
            <div style={{
              background: '#0b2320',
              border: '1.5px solid rgba(74, 222, 128, 0.4)',
              borderRadius: '20px',
              padding: '24px',
              maxWidth: '650px',
              width: '100%',
              boxShadow: '0 20px 50px rgba(0,0,0,0.7)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MapPin size={20} color="#34d399" />
                  <h3 style={{ margin: 0, color: '#effbe7', fontSize: '17px', fontWeight: '800' }}>
                    Select Farm Gate Pickup Coordinates
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowProfileMapPicker(false)}
                  style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>
              <p style={{ color: '#a3c2b0', fontSize: '12.5px', margin: '0 0 16px 0' }}>
                Click anywhere on the map or drag the green marker to pinpoint your farm dispatch gate. Delivery couriers navigate to this location.
              </p>
              <div style={{ height: '320px', borderRadius: '14px', overflow: 'hidden', marginBottom: '16px' }}>
                <MapPicker
                  location={farmLocation}
                  onSelectLocation={handleUpdateFarmGps}
                  height="320px"
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowProfileMapPicker(false)}
                  style={{ background: 'rgba(255,255,255,0.08)', color: '#effbe7', border: 'none', padding: '8px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* =========================================================================
          EDIT PRODUCT MODAL
          ========================================================================= */}
      {editingProduct && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '16px'
        }}>
          <div
            className="responsive-modal-card"
            style={{
              background: '#0b2320',
              border: '1px solid rgba(55, 189, 120, 0.4)',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '540px',
              maxHeight: '92vh',
              overflowY: 'auto',
              padding: 'clamp(16px, 4vw, 24px)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#10b981', margin: 0 }}>
                Edit Produce Listing
              </h3>
              <button onClick={() => setEditingProduct(null)} style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
                {/* SECTION 1: BASIC PRODUCE INFORMATION */}
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(74, 222, 128, 0.2)', borderRadius: '12px', padding: '14px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '800', color: '#4ade80', marginBottom: '10px' }}>
                    1. Basic Information <span style={{ fontSize: '11px', color: '#f87171' }}>*Required</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '12px', color: '#effbe7', display: 'block', marginBottom: '4px', fontWeight: '600' }}>
                        Produce Name *
                      </label>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={e => setEditTitle(e.target.value)}
                        className="input-field"
                        placeholder="e.g. Country Tomato"
                        required
                        style={{ minHeight: '44px' }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
                      <div>
                        <label style={{ fontSize: '12px', color: '#effbe7', display: 'block', marginBottom: '4px', fontWeight: '600' }}>
                          Category *
                        </label>
                        <select
                          value={editCategory}
                          onChange={e => setEditCategory(e.target.value)}
                          className="input-field"
                          style={{ minHeight: '44px' }}
                        >
                          <option value="vegetable">Vegetables</option>
                          <option value="fruit">Fruits</option>
                          <option value="grain">Grains & Pulses</option>
                          <option value="spice">Spices & Herbs</option>
                          <option value="organic">Organic Special</option>
                          <option value="seed">Seeds</option>
                          <option value="dairy">Dairy & Farm Fresh</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ fontSize: '12px', color: '#effbe7', display: 'block', marginBottom: '4px', fontWeight: '600' }}>
                          Unit *
                        </label>
                        <select
                          value={editUnit}
                          onChange={e => setEditUnit(e.target.value)}
                          className="input-field"
                          style={{ minHeight: '44px' }}
                        >
                          <option value="kg">kg (Kilogram)</option>
                          <option value="quintal">quintal (100 kg)</option>
                          <option value="ton">ton (1,000 kg)</option>
                          <option value="bunch">bunch / kattu</option>
                          <option value="crate">crate / box</option>
                          <option value="bag">bag / sack</option>
                          <option value="piece">piece / count</option>
                          <option value="litre">litre</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div>
                        <label style={{ fontSize: '12px', color: '#effbe7', display: 'block', marginBottom: '4px', fontWeight: '600' }}>
                          Price (₹ / {editUnit || 'unit'}) *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          value={editPrice}
                          onChange={e => setEditPrice(e.target.value)}
                          className="input-field"
                          required
                          style={{ minHeight: '44px' }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '12px', color: '#effbe7', display: 'block', marginBottom: '4px', fontWeight: '600' }}>
                          Available Stock ({editUnit || 'unit'}) *
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={editStock}
                          onChange={e => setEditStock(e.target.value)}
                          className="input-field"
                          required
                          style={{ minHeight: '44px' }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', alignItems: 'center' }}>
                      <div>
                        <label style={{ fontSize: '12px', color: '#effbe7', display: 'block', marginBottom: '2px', fontWeight: '600' }}>
                          Min Order ({editUnit || 'unit'})
                        </label>
                        <span style={{ fontSize: '10.5px', color: '#9db5aa', display: 'block', marginBottom: '4px' }}>
                          Smallest quantity a customer can order
                        </span>
                        <input
                          type="number"
                          min="1"
                          value={editMinOrderQty}
                          onChange={e => setEditMinOrderQty(e.target.value)}
                          className="input-field"
                          style={{ minHeight: '44px' }}
                        />
                      </div>

                      <div style={{ paddingTop: '14px' }}>
                        <label style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          cursor: 'pointer',
                          padding: '10px 12px',
                          background: editAllowBargain ? 'rgba(74, 222, 128, 0.12)' : 'rgba(255,255,255,0.04)',
                          border: `1px solid ${editAllowBargain ? 'rgba(74, 222, 128, 0.4)' : 'rgba(255,255,255,0.1)'}`,
                          borderRadius: '10px',
                          minHeight: '44px',
                          boxSizing: 'border-box'
                        }}>
                          <input
                            type="checkbox"
                            checked={editAllowBargain}
                            onChange={e => setEditAllowBargain(e.target.checked)}
                            style={{ width: '18px', height: '18px', accentColor: '#10b981', cursor: 'pointer' }}
                          />
                          <div>
                            <div style={{ fontSize: '12px', fontWeight: '700', color: '#effbe7' }}>
                              Allow Bargaining
                            </div>
                            <div style={{ fontSize: '10px', color: '#9db5aa' }}>
                              Bulk price negotiation
                            </div>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SECTION 2: HARVEST & QUALITY (OPTIONAL ACCORDION) */}
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(244, 201, 93, 0.25)', borderRadius: '12px', padding: '14px' }}>
                  <button
                    type="button"
                    onClick={() => setEditShowHarvestSection(!editShowHarvestSection)}
                    style={{
                      width: '100%',
                      background: 'transparent',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      color: '#f4c95d',
                      fontSize: '13px',
                      fontWeight: '800',
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    <span>{editShowHarvestSection ? '▾ 2. Harvest & Quality Details' : '+ Add Harvest & Quality Details (Optional)'}</span>
                    <span style={{ fontSize: '11px', color: '#9db5aa', fontWeight: '500' }}>
                      {editShowHarvestSection ? 'Tap to collapse' : 'Variety, Grade, Date'}
                    </span>
                  </button>

                  {editShowHarvestSection && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
                      <div>
                        <label style={{ fontSize: '12px', color: '#effbe7', display: 'block', marginBottom: '4px' }}>
                          Produce Variety
                        </label>
                        <input
                          type="text"
                          value={editVariety}
                          onChange={e => setEditVariety(e.target.value)}
                          className="input-field"
                          placeholder="e.g. Sona Masoori, Alphonso, PKM-1"
                          style={{ minHeight: '44px' }}
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <div>
                          <label style={{ fontSize: '12px', color: '#effbe7', display: 'block', marginBottom: '4px' }}>
                            Harvest Date
                          </label>
                          <input
                            type="date"
                            value={editHarvestDate}
                            onChange={e => setEditHarvestDate(e.target.value)}
                            className="input-field"
                            style={{ minHeight: '44px' }}
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: '12px', color: '#effbe7', display: 'block', marginBottom: '4px' }}>
                            Quality Grade
                          </label>
                          <select
                            value={editQualityGrade}
                            onChange={e => setEditQualityGrade(e.target.value)}
                            className="input-field"
                            style={{ minHeight: '44px' }}
                          >
                            <option value="">Leave empty (Unspecified)</option>
                            <option value="Premium">Premium</option>
                            <option value="Grade A">Grade A</option>
                            <option value="Standard">Standard</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* SECTION 3: CULTIVATION DETAILS (OPTIONAL ACCORDION) */}
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(52, 211, 153, 0.25)', borderRadius: '12px', padding: '14px' }}>
                  <button
                    type="button"
                    onClick={() => setEditShowCultivationSection(!editShowCultivationSection)}
                    style={{
                      width: '100%',
                      background: 'transparent',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      color: '#34d399',
                      fontSize: '13px',
                      fontWeight: '800',
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    <span>{editShowCultivationSection ? '▾ 3. Cultivation & Irrigation' : '+ Add Cultivation Details (Optional)'}</span>
                    <span style={{ fontSize: '11px', color: '#9db5aa', fontWeight: '500' }}>
                      {editShowCultivationSection ? 'Tap to collapse' : 'Type & Water Source'}
                    </span>
                  </button>

                  {editShowCultivationSection && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <div>
                          <label style={{ fontSize: '12px', color: '#effbe7', display: 'block', marginBottom: '4px' }}>
                            Cultivation Type
                          </label>
                          <select
                            value={editCultivationType}
                            onChange={e => setEditCultivationType(e.target.value)}
                            className="input-field"
                            style={{ minHeight: '44px' }}
                          >
                            <option value="">Not Specified</option>
                            <option value="Natural">Natural</option>
                            <option value="Organic">Organic</option>
                            <option value="Conventional">Conventional</option>
                            <option value="Hydroponic">Hydroponic</option>
                          </select>
                          {editCultivationType === 'Organic' && (
                            <div style={{ fontSize: '10px', color: '#facc15', marginTop: '4px' }}>
                              ℹ️ Note: Farmer-reported cultivation type
                            </div>
                          )}
                        </div>

                        <div>
                          <label style={{ fontSize: '12px', color: '#effbe7', display: 'block', marginBottom: '4px' }}>
                            Irrigation Method
                          </label>
                          <select
                            value={editIrrigationMethod}
                            onChange={e => setEditIrrigationMethod(e.target.value)}
                            className="input-field"
                            style={{ minHeight: '44px' }}
                          >
                            <option value="">Not Specified</option>
                            <option value="Drip">Drip</option>
                            <option value="Rain-fed">Rain-fed</option>
                            <option value="Borewell">Borewell</option>
                            <option value="Canal/River">Canal/River</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* IMAGE & DESCRIPTION */}
                <div>
                  <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>Produce Image URL</label>
                  <input
                    type="url"
                    value={editImage}
                    onChange={e => setEditImage(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="input-field"
                    style={{ minHeight: '44px' }}
                  />
                  {/* Preset quick buttons */}
                  <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                    {(PRESET_IMAGES[editCategory] || PRESET_IMAGES.vegetable).slice(0, 3).map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setEditImage(item.url)}
                        style={{
                          background: editImage === item.url ? 'rgba(52,211,153,0.3)' : 'rgba(255,255,255,0.06)',
                          border: `1px solid ${editImage === item.url ? '#34d399' : 'rgba(255,255,255,0.1)'}`,
                          color: '#effbe7',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          cursor: 'pointer'
                        }}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>Description</label>
                  <textarea
                    value={editDescription}
                    onChange={e => setEditDescription(e.target.value)}
                    className="input-field"
                    rows="3"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  style={{ background: 'rgba(255,255,255,0.06)', border: 'none', color: '#d1d5db', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  style={{ background: '#10b981', color: '#ffffff', border: 'none', padding: '8px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' }}
                >
                  {savingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Global OTP Notification Modal for High-Priority Alerts & Orders */}
      <OtpNotificationModal
        isOpen={isOtpModalOpen}
        onClose={() => setIsOtpModalOpen(false)}
        notification={currentOtpNotif}
        onVerified={(notifId) => {
          showToast('✓ Agricultural Protocol & Order Authorized via OTP!', 'success');
          setIsOtpModalOpen(false);
        }}
        showToast={showToast}
      />

      {/* Real-time Delivery Summon Beacon Modal */}
      <DeliverySummonModal
        isOpen={showDeliverySummon}
        orderId={selectedDispatchOrderId}
        onClose={() => {
          setShowDeliverySummon(false);
          setSelectedDispatchOrderId(null);
        }}
        onDriverConfirmed={(driver) => {
          showToast(`⚡ Driver ${driver.name} accepted summon! ETA: ${driver.eta}`, 'success');
          fetchIncomingOrders();
          setShowDeliverySummon(false);
          setSelectedDispatchOrderId(null);
        }}
      />

      {/* Product Details Modal (Phase 6 Compact Browsing Modal) */}
      <ProductDetailsModal
        isOpen={!!selectedProductForDetails}
        product={selectedProductForDetails}
        onClose={() => setSelectedProductForDetails(null)}
        onEdit={(prod) => {
          setSelectedProductForDetails(null);
          openEditModal(prod);
        }}
        onDelete={(prodId) => {
          setSelectedProductForDetails(null);
          handleDeleteProduct(prodId, selectedProductForDetails?.title);
        }}
      />

      {/* Farmer Mobile Profile Drawer / Bottom Sheet */}
      <FarmerMobileProfileSheet
        isOpen={showMobileProfileSheet}
        onClose={() => setShowMobileProfileSheet(false)}
        farmer={{ ...user, firstName: profileFirstName || user?.firstName, lastName: profileLastName || user?.lastName, farmName: profileFarmName || user?.farmName, location: farmLocation?.address || profileNativePlace }}
        onNavigate={(tab) => {
          setShowMobileProfileSheet(false);
          setActiveNav(tab);
        }}
        onLogout={handleLogoutFarmer}
      />

      {/* Email OTP Verification Modal for Profile Modification */}
      <ProfileEmailOtpModal
        isOpen={showEmailOtpModal}
        onClose={() => setShowEmailOtpModal(false)}
        currentEmail={user?.email}
        onSuccess={(updatedUser) => {
          if (updateUserProfile) {
            updateUserProfile(updatedUser);
          }
          showToast('✓ Email updated successfully! 7-day modification lock activated.', 'success');
        }}
        showToast={showToast}
      />

      {/* Mobile Bottom Navigation Bar (Home | Farm | Products | Orders | Profile) */}
      <nav className="mobile-bottom-nav">
        <button
          className={`mobile-nav-btn ${activeNav === 'home' ? 'active' : ''}`}
          onClick={() => {
            setActiveNav('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          <Home size={20} />
          <span>Home</span>
        </button>

        <button
          className={`mobile-nav-btn ${['farm', 'before_cultivation', 'after_cultivation', 'disease_detection', 'medicines_fertilizers', 'market_prices'].includes(activeNav) ? 'active' : ''}`}
          onClick={() => setActiveNav('farm')}
        >
          <Sprout size={20} />
          <span>Farm</span>
        </button>

        <button
          className={`mobile-nav-btn ${activeNav === 'three_d_farm_port' ? 'active' : ''}`}
          onClick={() => {
            setActiveNav('three_d_farm_port');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          style={{ position: 'relative' }}
        >
          <Box size={20} color={activeNav === 'three_d_farm_port' ? '#38bdf8' : undefined} />
          <span style={{ color: activeNav === 'three_d_farm_port' ? '#38bdf8' : undefined }}>3D Port</span>
          <span style={{ position: 'absolute', top: '2px', right: '10px', fontSize: '8px', background: '#0284c7', color: '#fff', padding: '1px 4px', borderRadius: '6px', fontWeight: '900' }}>3D</span>
        </button>

        <button
          className={`mobile-nav-btn ${activeNav === 'products' ? 'active' : ''}`}
          onClick={() => setActiveNav('products')}
        >
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <Package size={20} />
            {farmerProducts.length > 0 && <span className="mobile-nav-badge">{farmerProducts.length}</span>}
          </div>
          <span>Products</span>
        </button>

        <button
          className={`mobile-nav-btn ${activeNav === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveNav('orders')}
        >
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <Truck size={20} />
            {pendingOrdersCount > 0 && (
              <span className="mobile-nav-badge" style={{ background: '#ef4444' }}>
                {pendingOrdersCount}
              </span>
            )}
          </div>
          <span>Orders</span>
        </button>

        <button
          className={`mobile-nav-btn ${activeNav === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveNav('profile')}
        >
          <User size={20} />
          <span>Profile</span>
        </button>
      </nav>

    </div>
  );
}
