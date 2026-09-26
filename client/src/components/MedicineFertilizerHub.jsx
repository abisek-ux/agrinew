import React, { useState } from 'react';
import {
  Sparkles,
  FlaskConical,
  Leaf,
  ShieldCheck,
  Calculator,
  ShoppingCart,
  CheckCircle,
  HelpCircle,
  Droplets,
  AlertTriangle,
  Info,
  Layers,
  ArrowRight,
  Eye,
  Sliders,
  Box,
  Truck,
  RotateCw,
  Search,
  Filter
} from 'lucide-react';
import ThreeDPortViewer from './ThreeDPortViewer';

export const MEDICINE_CATALOG = [
  // ==================== NATURAL & ORGANIC MEDICINES / FERTILIZERS ====================
  {
    id: 'med_neem_oil',
    name: 'Pure Cold-Pressed Neem Oil (10,000 PPM)',
    tamilName: 'வேப்பெண்ணெய் கரைசல்',
    type: 'organic',
    category: 'Bio-Insecticide & Fungicide',
    badge: '100% Certified Organic',
    cropSuitability: ['Tomato', 'Paddy / Rice', 'Chilli', 'Cotton', 'Brinjal', 'Vegetables'],
    price: 420,
    unit: '1 Liter Bottle',
    rating: 4.9,
    reviews: 312,
    activeIngredient: 'Azadirachtin 10,000 PPM',
    description: 'Natural broad-spectrum bio-pesticide that blocks insect feeding and repels sucking pests, whiteflies, aphids, and powdery mildew.',
    standardDosage: '5 ml per 1 Liter of water (75 ml per 15L spray tank)',
    perAcreDosageKgOrL: 1.0, // 1 Litre per acre
    waterPerAcreLiters: 150,
    sprayInterval: 'Every 7-10 Days',
    safetyPeriod: '0 Days (Harvest safe anytime)',
    organicScore: 100,
    soilBenefit: 'Enriches beneficial predatory insects and leaves zero toxic residues in soil microbes.',
    image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 'med_panchagavya',
    name: 'Traditional Organic Panchagavya Bio-Stimulant',
    tamilName: 'பஞ்சகாவ்யா இயற்கை டானிக்',
    type: 'organic',
    category: 'Growth Booster & Immunity',
    badge: 'Desi Cow Formulation',
    cropSuitability: ['Paddy / Rice', 'Banana', 'Sugarcane', 'Coconut', 'Vegetables', 'All Crops'],
    price: 350,
    unit: '5 Liter Can',
    rating: 4.8,
    reviews: 428,
    activeIngredient: 'Fermented Cow Milk, Ghee, Curd, Dung & Urine + Jaggery + Banana',
    description: 'Probiotic plant growth promoter loaded with beneficial microorganisms, auxins, and gibberellins that promote heavy root branching and lush green leaves.',
    standardDosage: '30 ml per 1 Liter of water (3% foliar spray solution)',
    perAcreDosageKgOrL: 3.0, // 3 Litres per acre
    waterPerAcreLiters: 150,
    sprayInterval: 'Once every 15 days at vegetative and flowering stages',
    safetyPeriod: '0 Days (Pure natural nourishment)',
    organicScore: 100,
    soilBenefit: 'Dramatically improves soil humus, earthworm population, and moisture retention.',
    image: 'https://images.unsplash.com/photo-1592417817098-8f3d6ef23512?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 'med_jeevamrutham',
    name: 'Concentrated Liquid Jeevamrutham Probiotic',
    tamilName: 'ஜீவாமிர்தம் நுண்ணுயிர் உரம்',
    type: 'organic',
    category: 'Soil Microbial Fertilizer',
    badge: 'Zero Budget Natural Farming',
    cropSuitability: ['Cotton', 'Groundnut', 'Maize', 'Paddy / Rice', 'Millets', 'Fruit Trees'],
    price: 280,
    unit: '10 Liter Canister',
    rating: 4.9,
    reviews: 195,
    activeIngredient: 'Indigenous Microorganisms (IMO), Desi Cow Flora, Gram Flour & Jaggery',
    description: 'Billion-count beneficial microbial culture that converts locked soil nutrients into plant-absorbable forms and prevents soil hardening.',
    standardDosage: '200 Liters fermented Jeevamrutham per Acre via Drip or Flood Irrigation',
    perAcreDosageKgOrL: 5.0, // 5L concentrate to make 200L
    waterPerAcreLiters: 200,
    sprayInterval: 'Apply once a month with irrigation water',
    safetyPeriod: '0 Days',
    organicScore: 100,
    soilBenefit: 'Reactivates biological soil life and restores natural earthworm channels.',
    image: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 'med_vermicompost',
    name: 'Premium Bio-Enriched Vermicompost (Organic Gold)',
    tamilName: 'மண்புழு உரம்',
    type: 'organic',
    category: 'Organic Soil Nutrition',
    badge: '100% Pure Earthworm Castings',
    cropSuitability: ['Vegetables', 'Paddy / Rice', 'Chilli', 'Tomato', 'Horticulture'],
    price: 520,
    unit: '50 Kg Bag',
    rating: 4.9,
    reviews: 580,
    activeIngredient: 'Organic Carbon 18-20%, Total NPK 3.5%, Micronutrients + Humic Acid',
    description: 'Odorless organic matter enriched with earthworm castings and mycorrhiza to restore soil fertility, porosity, and drought resilience.',
    standardDosage: '500 kg to 1 Ton per Acre mixed during final land preparation',
    perAcreDosageKgOrL: 200.0,
    waterPerAcreLiters: 0,
    sprayInterval: 'Basal application at planting or side-dressing every 45 days',
    safetyPeriod: '0 Days',
    organicScore: 100,
    soilBenefit: 'Boosts soil organic carbon (SOC) and balances soil pH for long term yield stability.',
    image: 'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 'med_trichoderma',
    name: 'Trichoderma Viride 1.5% WP (Bio-Fungicide)',
    tamilName: 'டிரைக்கோடெர்மா விரிடி உயிர் பூஞ்சாணம்',
    type: 'organic',
    category: 'Bio-Fungicide',
    badge: 'Antagonistic Fungal Shield',
    cropSuitability: ['Tomato', 'Chilli', 'Groundnut', 'Cotton', 'Paddy', 'Pulses'],
    price: 240,
    unit: '1 Kg Pack',
    rating: 4.7,
    reviews: 164,
    activeIngredient: 'Trichoderma viride 2x10^6 cfu/gm min',
    description: 'Biological control agent that feeds on harmful soil fungi causing root rot, collar rot, damping off, and Fusarium wilt.',
    standardDosage: 'Seed treatment: 10g/kg seed. Soil application: 2.5 kg/acre with vermicompost.',
    perAcreDosageKgOrL: 2.5,
    waterPerAcreLiters: 150,
    sprayInterval: 'Once during sowing, foliar spray if fungal wilt appears',
    safetyPeriod: '0 Days (Eco-safe)',
    organicScore: 98,
    soilBenefit: 'Colonies root rhizosphere and protects future crops from persistent soil-borne pathogens.',
    image: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 'med_bio_npk',
    name: 'Bio-NPK Consortium Granules (Microbial Trio)',
    tamilName: 'உயிர் என்பிகே உரம்',
    type: 'organic',
    category: 'Microbial Bio-Fertilizer',
    badge: 'N-Fixing + P-Solubilizing + K-Mobilizing',
    cropSuitability: ['Paddy / Rice', 'Sugarcane', 'Cotton', 'Maize', 'Groundnut'],
    price: 490,
    unit: '4 Kg Granular Pack',
    rating: 4.8,
    reviews: 210,
    activeIngredient: 'Azotobacter chroococcum + Bacillus megaterium + Frateuria aurantia',
    description: 'Tri-action microbial formulation that fixes atmospheric nitrogen, unlocks insoluble phosphates, and mobilizes potash from soil minerals.',
    standardDosage: '4 Kg per Acre broadcast with sand or farmyard manure',
    perAcreDosageKgOrL: 4.0,
    waterPerAcreLiters: 0,
    sprayInterval: 'At sowing or early tillering stage',
    safetyPeriod: '0 Days',
    organicScore: 100,
    soilBenefit: 'Reduces chemical fertilizer dependency by 25-30% without dropping harvest yields.',
    image: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=500&q=80'
  },

  // ==================== ARTIFICIAL / CHEMICAL SYNTHESIZED FORMULATIONS ====================
  {
    id: 'med_urea_neem',
    name: 'Neem-Coated Urea (46% Nitrogen Fast-Acting)',
    tamilName: 'வேம்பு பூசிய யூரியா',
    type: 'chemical',
    category: 'Nitrogen Fertilizer',
    badge: 'High-Concentration Macro Nutrient',
    cropSuitability: ['Paddy / Rice', 'Sugarcane', 'Maize', 'Cotton', 'Wheat', 'Vegetables'],
    price: 266, // Govt subsidized standard MRP
    unit: '45 Kg Bag',
    rating: 4.7,
    reviews: 940,
    activeIngredient: 'Nitrogen 46.0% (Amide form) + Neem Oil Coat 0.035%',
    description: 'Slow-release nitrogen booster that powers rapid green leaf vegetative growth and vigorous tillering.',
    standardDosage: '30-45 kg per Acre split in 2 to 3 doses according to crop growth cycle',
    perAcreDosageKgOrL: 45.0,
    waterPerAcreLiters: 0,
    sprayInterval: 'Basal dose + Top dressing at 30 and 50 days after transplanting',
    safetyPeriod: '7 Days before harvest',
    organicScore: 15,
    soilBenefit: 'Provide immediate nitrogen burst; must be balanced with organic matter to prevent soil acidity.',
    image: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 'med_dap_fertilizer',
    name: 'Di-Ammonium Phosphate (DAP 18:46:0)',
    tamilName: 'டிஏபி உரம் (DAP)',
    type: 'chemical',
    category: 'Phosphatic Fertilizer',
    badge: 'Root Developer & Seedling Booster',
    cropSuitability: ['Paddy / Rice', 'Cotton', 'Groundnut', 'Chilli', 'Sugarcane', 'Tomato'],
    price: 1350,
    unit: '50 Kg Bag',
    rating: 4.8,
    reviews: 650,
    activeIngredient: 'Nitrogen 18% + Phosphorus (P2O5) 46%',
    description: 'High-analysis phosphorus fertilizer that accelerates root establishment, strong stem development, and early flowering.',
    standardDosage: '50 Kg per Acre as basal application before sowing/transplanting',
    perAcreDosageKgOrL: 50.0,
    waterPerAcreLiters: 0,
    sprayInterval: 'Single basal dose placed 5cm below seed depth',
    safetyPeriod: '10 Days before harvest',
    organicScore: 20,
    soilBenefit: 'Crucial for initial seedling vigor in phosphate-deficient soils.',
    image: 'https://images.unsplash.com/photo-1628352081506-83c43123ed6d?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 'med_npk_19',
    name: 'Water Soluble NPK 19-19-19 (100% Soluble Polyfeed)',
    tamilName: 'நீரில் கரையும் 19-19-19 உரம்',
    type: 'chemical',
    category: 'Foliar & Drip Nutrition',
    badge: '100% Water Soluble Grade',
    cropSuitability: ['Tomato', 'Chilli', 'Banana', 'Cotton', 'Vegetables', 'All Crops'],
    price: 185,
    unit: '1 Kg Pack',
    rating: 4.9,
    reviews: 410,
    activeIngredient: 'N 19% + P2O5 19% + K2O 19% with Trace Elements',
    description: 'Balanced nutrient spray directly absorbed through leaf stomata within 3 hours. Rapidly corrects multi-nutrient deficiencies.',
    standardDosage: '5-7 grams per 1 Liter of water (approx 75-100g per 15L backpack spray tank)',
    perAcreDosageKgOrL: 1.5,
    waterPerAcreLiters: 150,
    sprayInterval: 'Spray at 30, 45, and 60 days after sowing',
    safetyPeriod: '3 Days before harvest',
    organicScore: 25,
    soilBenefit: 'Leaves zero chloride salts and ensures 95%+ nutrient absorption rate.',
    image: 'https://images.unsplash.com/photo-1585314062600-1dec5b9b1e96?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 'med_mancozeb_75',
    name: 'Mancozeb 75% WP (Dithane M-45 Grade Fungicide)',
    tamilName: 'மேன்கோசெப் 75% பூஞ்சாணக்கொல்லி',
    type: 'chemical',
    category: 'Broad-Spectrum Fungicide',
    badge: 'Protective Contact Action',
    cropSuitability: ['Tomato', 'Paddy / Rice', 'Potato', 'Chilli', 'Groundnut', 'Grapes'],
    price: 320,
    unit: '500g Pack',
    rating: 4.8,
    reviews: 388,
    activeIngredient: 'Mancozeb 75% WP (Manganese + Zinc dithiocarbamate)',
    description: 'Gold-standard protective contact fungicide that halts Early Blight, Late Blight, Leaf Spot, Anthracnose, and Blast.',
    standardDosage: '2.0 - 2.5 grams per 1 Liter of water (35g per 15L tank). Spray on both leaf surfaces.',
    perAcreDosageKgOrL: 0.6,
    waterPerAcreLiters: 150,
    sprayInterval: 'Spray at first symptom sign; repeat after 10 days if humid',
    safetyPeriod: '14 Days Pre-Harvest Interval (PHI)',
    organicScore: 10,
    soilBenefit: 'Strong fungal kill action; use protective face mask and gloves during spraying.',
    image: 'https://images.unsplash.com/photo-1628352081506-83c43123ed6d?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 'med_imidacloprid',
    name: 'Imidacloprid 17.8% SL (Confidor Systemic Shield)',
    tamilName: 'இமிடாக்ளோபிரிட் 17.8% உறிஞ்சும் பூச்சிக்கொல்லி',
    type: 'chemical',
    category: 'Systemic Insecticide',
    badge: 'Anti-Sucking Pest Specialist',
    cropSuitability: ['Cotton', 'Chilli', 'Paddy / Rice', 'Sugarcane', 'Tomato'],
    price: 460,
    unit: '250 ml Bottle',
    rating: 4.9,
    reviews: 520,
    activeIngredient: 'Imidacloprid 17.8% Soluble Liquid (SL)',
    description: 'Potent systemic neonicotinoid that protects crops from Aphids, Whiteflies, Jassids, Brown Plant Hopper (BPH), and Thrips for up to 21 days.',
    standardDosage: '0.5 ml per 1 Liter of water (7.5 ml per 15L spray tank)',
    perAcreDosageKgOrL: 0.1,
    waterPerAcreLiters: 150,
    sprayInterval: 'Spray once when sucking pests exceed economic threshold level (ETL)',
    safetyPeriod: '21 Days Pre-Harvest Interval (PHI)',
    organicScore: 10,
    soilBenefit: 'Systemic uptake via foliage and xylem roots.',
    image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 'med_tricyclazole',
    name: 'Tricyclazole 75% WP (Paddy Blast Eradicator)',
    tamilName: 'டிரைசைக்ளசோல் 75% நெல் குலைநோய் மருந்து',
    type: 'chemical',
    category: 'Paddy Blast Fungicide',
    badge: 'Systemic Melanin Biosynthesis Inhibitor',
    cropSuitability: ['Paddy / Rice'],
    price: 580,
    unit: '250g Pack',
    rating: 4.9,
    reviews: 290,
    activeIngredient: 'Tricyclazole 75% WP',
    description: 'Specifically engineered to cure and protect rice crops against Leaf Blast, Node Blast, and Neck Blast (குலை நோய்).',
    standardDosage: '0.6 - 1.0 gram per 1 Liter of water (12g per 15L spray tank)',
    perAcreDosageKgOrL: 0.15,
    waterPerAcreLiters: 150,
    sprayInterval: 'Spray at tillering and panicle emergence stages',
    safetyPeriod: '30 Days before paddy harvest',
    organicScore: 10,
    soilBenefit: 'Targeted action inside rice leaf cuticle.',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 'med_chelated_micronutrient',
    name: 'Chelated Micronutrient Cocktail (EDTA Zn, Fe, B, Mn)',
    tamilName: 'செலேட்டட் நுண்சத்து உரம்',
    type: 'chemical',
    category: 'Micronutrient Corrector',
    badge: '100% EDTA Chelation',
    cropSuitability: ['Paddy / Rice', 'Cotton', 'Citrus', 'Banana', 'Tomato', 'All Crops'],
    price: 380,
    unit: '500g Pack',
    rating: 4.8,
    reviews: 175,
    activeIngredient: 'Zn 6%, Fe 4%, Mn 3%, Cu 1%, Boron 1.5%, Mo 0.05%',
    description: 'Cures interveinal chlorosis, leaf yellowing, fruit cracking, and flower drop within 5 days of foliar spraying.',
    standardDosage: '1.5 grams per 1 Liter of water (25g per 15L tank)',
    perAcreDosageKgOrL: 0.4,
    waterPerAcreLiters: 150,
    sprayInterval: 'Foliar spray twice during rapid vegetative and flowering phases',
    safetyPeriod: '3 Days',
    organicScore: 30,
    soilBenefit: 'High bioavailability in alkaline and calcareous soils.',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=500&q=80'
  }
];

export default function MedicineFertilizerHub({
  onSelectMedicineForOrder = null,
  showToast = () => {},
  initialCrop = 'Tomato',
  initialSelectedMedicine = null
}) {
  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog' | 'calculator' | 'comparison' | '3d_port'
  const [filterType, setFilterType] = useState('all'); // 'all' | 'organic' | 'chemical' | 'fungicide' | 'insecticide' | 'fertilizer'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMedicine, setSelectedMedicine] = useState(initialSelectedMedicine || MEDICINE_CATALOG[0]);
  const [quickViewMed, setQuickViewMed] = useState(null);

  // Dosage Calculator State
  const [calcCrop, setCalcCrop] = useState(initialCrop || 'Tomato');
  const [calcAcreage, setCalcAcreage] = useState(2.0); // Acres
  const [calcSelectedMedId, setCalcSelectedMedId] = useState(MEDICINE_CATALOG[0].id);
  const [calcUnitType, setCalcUnitType] = useState('acres'); // 'acres' | 'cents'

  // Filter Catalog
  const filteredCatalog = MEDICINE_CATALOG.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tamilName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.activeIngredient.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.cropSuitability.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (filterType === 'all') return true;
    if (filterType === 'organic') return item.type === 'organic';
    if (filterType === 'chemical') return item.type === 'chemical';
    if (filterType === 'fungicide') return item.category.toLowerCase().includes('fungicide');
    if (filterType === 'insecticide') return item.category.toLowerCase().includes('insecticide');
    if (filterType === 'fertilizer') return item.category.toLowerCase().includes('fertilizer') || item.category.toLowerCase().includes('nutrition');
    return true;
  });

  // Calculate Dosage
  const currentCalcMed = MEDICINE_CATALOG.find((m) => m.id === calcSelectedMedId) || MEDICINE_CATALOG[0];
  const effectiveAcres = calcUnitType === 'cents' ? calcAcreage / 100 : calcAcreage;
  const totalMedQuantity = (currentCalcMed.perAcreDosageKgOrL * effectiveAcres).toFixed(2);
  const totalWaterLiters = Math.round(currentCalcMed.waterPerAcreLiters * effectiveAcres);
  const totalBackpackTanks = totalWaterLiters > 0 ? Math.ceil(totalWaterLiters / 15) : 0;
  const estimatedCost = Math.round((currentCalcMed.price * (currentCalcMed.perAcreDosageKgOrL * effectiveAcres)).toFixed(0));

  const handleOrderInitiation = (med) => {
    if (onSelectMedicineForOrder) {
      onSelectMedicineForOrder(med);
    } else {
      showToast(`Initiating OTP-verified order dispatch for ${med.name}`, 'info');
    }
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      
      {/* Top Banner Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(6, 78, 59, 0.6) 100%)',
        border: '1.5px solid rgba(55, 189, 120, 0.35)',
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
            background: 'rgba(52, 211, 153, 0.2)',
            color: '#34d399',
            padding: '4px 14px',
            borderRadius: '16px',
            fontSize: '11px',
            fontWeight: '800',
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
            marginBottom: '10px'
          }}>
            <FlaskConical size={14} color="#34d399" />
            <span>Kisan Agro-Pharmacy & Precision Nutrients</span>
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#ffffff', margin: '0 0 6px 0' }}>
            Farmer Medicines & Fertilizers Center (இயற்கை & ரசாயன மருந்துகள்)
          </h1>
          <p style={{ fontSize: '13.5px', color: '#cbd5e1', maxWidth: '780px', margin: 0, lineHeight: '1.5' }}>
            Explore verified <strong>Natural Bio-Formulations</strong> (Neem, Panchagavya, Jeevamrutham) and certified <strong>Synthetic Agrochemicals</strong> (Urea, DAP, Mancozeb, Confidor) with automated acre dosage calculations & OTP-secured ordering.
          </p>
        </div>

        {/* Feature Highlights Pills */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(52,211,153,0.3)', borderRadius: '12px', padding: '10px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: '18px', fontWeight: '800', color: '#34d399' }}>100% Verified</div>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>Govt TNAU Approved</div>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(56,189,248,0.3)', borderRadius: '12px', padding: '10px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: '18px', fontWeight: '800', color: '#38bdf8' }}>3D Ports</div>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>Real-time 360° View</div>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '12px', padding: '10px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: '18px', fontWeight: '800', color: '#f59e0b' }}>OTP Protected</div>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>Safe Chemical Release</div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '24px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        paddingBottom: '12px',
        flexWrap: 'wrap'
      }}>
        {[
          { id: 'catalog', label: '🌿 All Medicines & Fertilizers Catalog', icon: <FlaskConical size={16} /> },
          { id: 'calculator', label: '🧮 Smart Dosage & Acreage Calculator', icon: <Calculator size={16} /> },
          { id: 'comparison', label: '⚖️ Natural vs Artificial Guide', icon: <Leaf size={16} /> },
          { id: '3d_port', label: '✨ 3D Interactive Formulation Port', icon: <Box size={16} /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: activeTab === tab.id ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'rgba(255, 255, 255, 0.05)',
              color: activeTab === tab.id ? '#ffffff' : '#94a3b8',
              border: activeTab === tab.id ? '1px solid #10b981' : '1px solid rgba(255, 255, 255, 0.1)',
              padding: '10px 20px',
              borderRadius: '12px',
              fontSize: '13px',
              fontWeight: activeTab === tab.id ? '800' : '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
              boxShadow: activeTab === tab.id ? '0 4px 14px rgba(16, 185, 129, 0.35)' : 'none'
            }}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* =========================================================================
          VIEW TAB 1: CATALOG OF NATURAL & ARTIFICIAL MEDICINES
          ========================================================================= */}
      {activeTab === 'catalog' && (
        <div>
          {/* Search & Filter Bar */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '16px 20px',
            marginBottom: '24px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '16px',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            {/* Search Input */}
            <div style={{ position: 'relative', minWidth: '280px', flex: 1 }}>
              <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search by medicine name, crop, Tamil name, or chemical ingredient..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(0, 0, 0, 0.5)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '10px',
                  padding: '10px 14px 10px 38px',
                  color: '#ffffff',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Filter Category Chips */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[
                { id: 'all', label: 'All Formulations' },
                { id: 'organic', label: '🌿 Natural / Organic' },
                { id: 'chemical', label: '🧪 Synthetic / Chemical' },
                { id: 'fungicide', label: '🛡️ Fungicides' },
                { id: 'insecticide', label: '🐛 Insecticides' },
                { id: 'fertilizer', label: '🌾 Soil & NPK Nutrition' }
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilterType(f.id)}
                  style={{
                    background: filterType === f.id ? '#10b981' : 'rgba(255, 255, 255, 0.06)',
                    color: filterType === f.id ? '#ffffff' : '#cbd5e1',
                    border: filterType === f.id ? '1px solid #10b981' : '1px solid rgba(255, 255, 255, 0.12)',
                    padding: '6px 14px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: filterType === f.id ? '800' : '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
            gap: '24px'
          }}>
            {filteredCatalog.map((med) => {
              const isOrganic = med.type === 'organic';
              return (
                <div
                  key={med.id}
                  style={{
                    background: isOrganic ? 'linear-gradient(145deg, #092019 0%, #04120e 100%)' : 'linear-gradient(145deg, #0f1f2e 0%, #07101a 100%)',
                    border: isOrganic ? '1.5px solid rgba(52, 211, 153, 0.3)' : '1.5px solid rgba(56, 189, 248, 0.3)',
                    borderRadius: '18px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                  }}
                >
                  {/* Top Image & Badge Header */}
                  <div style={{ position: 'relative', height: '170px', overflow: 'hidden' }}>
                    <img
                      src={med.image}
                      alt={med.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      background: isOrganic ? 'rgba(16, 185, 129, 0.9)' : 'rgba(14, 165, 233, 0.9)',
                      color: '#ffffff',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontWeight: '800',
                      letterSpacing: '0.4px',
                      textTransform: 'uppercase',
                      backdropFilter: 'blur(6px)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      {isOrganic ? <Leaf size={12} /> : <FlaskConical size={12} />}
                      {med.badge}
                    </div>

                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      background: 'rgba(0, 0, 0, 0.75)',
                      color: '#fbbf24',
                      padding: '4px 8px',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontWeight: '800',
                      backdropFilter: 'blur(6px)'
                    }}>
                      ★ {med.rating} ({med.reviews})
                    </div>

                    <div style={{
                      position: 'absolute',
                      bottom: '8px',
                      left: '12px',
                      right: '12px',
                      background: 'rgba(0, 0, 0, 0.8)',
                      backdropFilter: 'blur(8px)',
                      padding: '6px 10px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      color: '#cbd5e1'
                    }}>
                      🏷️ {med.category}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div style={{ padding: '18px 20px', flex: 1 }}>
                    <h3 style={{ fontSize: '16.5px', fontWeight: '800', color: '#ffffff', margin: '0 0 4px 0' }}>
                      {med.name}
                    </h3>
                    <div style={{ fontSize: '13px', color: isOrganic ? '#34d399' : '#38bdf8', fontWeight: '700', marginBottom: '10px' }}>
                      {med.tamilName}
                    </div>

                    <p style={{ fontSize: '12.5px', color: '#94a3b8', lineHeight: '1.45', margin: '0 0 14px 0' }}>
                      {med.description}
                    </p>

                    {/* Quick Specs Pill Box */}
                    <div style={{
                      background: 'rgba(0, 0, 0, 0.35)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '10px',
                      padding: '10px 12px',
                      marginBottom: '14px',
                      fontSize: '11.5px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px'
                    }}>
                      <div>
                        <strong style={{ color: '#e2e8f0' }}>🧪 Formulation:</strong>{' '}
                        <span style={{ color: '#cbd5e1' }}>{med.activeIngredient}</span>
                      </div>
                      <div>
                        <strong style={{ color: '#e2e8f0' }}>💧 Standard Dose:</strong>{' '}
                        <span style={{ color: '#34d399' }}>{med.standardDosage}</span>
                      </div>
                      <div>
                        <strong style={{ color: '#e2e8f0' }}>🌾 Crop Suitability:</strong>{' '}
                        <span style={{ color: '#fef08a' }}>{med.cropSuitability.slice(0, 4).join(', ')}...</span>
                      </div>
                    </div>

                    {/* Price & Unit */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <div>
                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>Farmer Fair Price</span>
                        <div style={{ fontSize: '20px', fontWeight: '800', color: '#ffffff' }}>
                          ₹{med.price}{' '}
                          <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 'normal' }}>/ {med.unit}</span>
                        </div>
                      </div>

                      <span style={{
                        fontSize: '11px',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        background: isOrganic ? 'rgba(52, 211, 153, 0.15)' : 'rgba(248, 113, 113, 0.15)',
                        color: isOrganic ? '#34d399' : '#fca5a5',
                        fontWeight: '700'
                      }}>
                        {med.safetyPeriod}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => {
                          setCalcSelectedMedId(med.id);
                          setActiveTab('calculator');
                        }}
                        style={{
                          flex: 1,
                          background: 'rgba(255, 255, 255, 0.08)',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          color: '#cbd5e1',
                          padding: '9px 12px',
                          borderRadius: '10px',
                          fontSize: '12px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        <Calculator size={14} /> Calculate Dose
                      </button>

                      <button
                        onClick={() => handleOrderInitiation(med)}
                        style={{
                          flex: 1.2,
                          background: isOrganic ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                          border: 'none',
                          color: '#ffffff',
                          padding: '9px 14px',
                          borderRadius: '10px',
                          fontSize: '12px',
                          fontWeight: '800',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                        }}
                      >
                        <Truck size={14} /> Order with OTP
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW TAB 2: PRECISION DOSAGE & ACREAGE CALCULATOR
          ========================================================================= */}
      {activeTab === 'calculator' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '28px'
        }}>
          {/* Left Calculator Inputs */}
          <div style={{
            background: '#0a1a16',
            border: '1.5px solid rgba(55, 189, 120, 0.3)',
            borderRadius: '18px',
            padding: '24px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#ffffff', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calculator size={20} color="#34d399" /> Agricultural Acreage & Spray Calculator
            </h3>
            <p style={{ fontSize: '12.5px', color: '#94a3b8', margin: '0 0 20px 0' }}>
              Select your medicine or fertilizer and enter your land acreage to calculate exact dilution, tank loads, and spray schedule.
            </p>

            {/* Select Medicine */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#cbd5e1', marginBottom: '6px' }}>
                1. Select Medicine or Fertilizer:
              </label>
              <select
                value={calcSelectedMedId}
                onChange={(e) => setCalcSelectedMedId(e.target.value)}
                style={{
                  width: '100%',
                  background: '#04120e',
                  border: '1px solid rgba(55, 189, 120, 0.4)',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: '600',
                  outline: 'none'
                }}
              >
                {MEDICINE_CATALOG.map((m) => (
                  <option key={m.id} value={m.id} style={{ background: '#04120e', color: '#ffffff' }}>
                    {m.type === 'organic' ? '🌿 [Natural]' : '🧪 [Chemical]'} {m.name} - ₹{m.price}/{m.unit}
                  </option>
                ))}
              </select>
            </div>

            {/* Select Crop */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#cbd5e1', marginBottom: '6px' }}>
                2. Target Crop:
              </label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {['Tomato', 'Paddy / Rice', 'Chilli', 'Cotton', 'Sugarcane', 'Banana', 'Groundnut', 'Vegetables'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCalcCrop(c)}
                    style={{
                      background: calcCrop === c ? '#10b981' : 'rgba(255, 255, 255, 0.06)',
                      color: calcCrop === c ? '#ffffff' : '#cbd5e1',
                      border: calcCrop === c ? '1px solid #10b981' : '1px solid rgba(255, 255, 255, 0.12)',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: calcCrop === c ? '800' : '600',
                      cursor: 'pointer'
                    }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Land Area Input */}
            <div style={{ marginBottom: '22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '12.5px', fontWeight: '700', color: '#cbd5e1' }}>
                  3. Farm Land Size:
                </label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setCalcUnitType('acres')}
                    style={{
                      background: calcUnitType === 'acres' ? '#059669' : 'rgba(255, 255, 255, 0.08)',
                      color: '#ffffff',
                      border: 'none',
                      padding: '3px 10px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    Acres
                  </button>
                  <button
                    type="button"
                    onClick={() => setCalcUnitType('cents')}
                    style={{
                      background: calcUnitType === 'cents' ? '#059669' : 'rgba(255, 255, 255, 0.08)',
                      color: '#ffffff',
                      border: 'none',
                      padding: '3px 10px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    Cents (குழி/சென்ட்)
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input
                  type="number"
                  min="0.1"
                  step="0.5"
                  value={calcAcreage}
                  onChange={(e) => setCalcAcreage(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
                  style={{
                    width: '120px',
                    background: '#04120e',
                    border: '1.5px solid #10b981',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    color: '#ffffff',
                    fontSize: '16px',
                    fontWeight: '800',
                    outline: 'none'
                  }}
                />
                <span style={{ fontSize: '13px', color: '#94a3b8' }}>
                  {calcUnitType === 'acres' ? 'Acres (ஏக்கர்)' : 'Cents (100 Cents = 1 Acre)'}
                </span>
              </div>
            </div>

            {/* Safety & Timing Card */}
            <div style={{
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: '12px',
              padding: '14px',
              fontSize: '12px',
              color: '#fef08a'
            }}>
              <div style={{ fontWeight: '800', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertTriangle size={15} color="#f59e0b" /> Application & Spray Best Practices:
              </div>
              <div>• Best Spray Timing: <strong>Early morning (6:30 AM - 8:30 AM)</strong> or <strong>Late afternoon (4:30 PM - 6:00 PM)</strong>.</div>
              <div>• Never spray under direct hot midday sun (prevents leaf scorching).</div>
              <div>• {currentCalcMed.type === 'organic' ? 'Eco-Safe: Harmless to bees and livestock.' : 'Chemical Alert: Wear safety mask and rubber gloves.'}</div>
            </div>
          </div>

          {/* Right Calculated Dosage Results Card */}
          <div style={{
            background: 'linear-gradient(145deg, #09241e 0%, #031410 100%)',
            border: '1.5px solid rgba(55, 189, 120, 0.4)',
            borderRadius: '18px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <span style={{ fontSize: '11px', color: '#34d399', fontWeight: '800', textTransform: 'uppercase' }}>
                    PRECISION PRESCRIPTION
                  </span>
                  <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#ffffff', margin: '2px 0 0 0' }}>
                    {currentCalcMed.name}
                  </h3>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                    For {calcAcreage} {calcUnitType} of <strong>{calcCrop}</strong>
                  </div>
                </div>

                <span style={{
                  background: currentCalcMed.type === 'organic' ? 'rgba(52, 211, 153, 0.2)' : 'rgba(56, 189, 248, 0.2)',
                  color: currentCalcMed.type === 'organic' ? '#34d399' : '#38bdf8',
                  padding: '4px 10px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: '800'
                }}>
                  {currentCalcMed.type === 'organic' ? '🌿 Bio Formulation' : '🧪 Synthetic Agrochemical'}
                </span>
              </div>

              {/* KPI Results Metrics Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '14px',
                marginBottom: '20px'
              }}>
                <div style={{ background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '14px' }}>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>Total Quantity Needed</div>
                  <div style={{ fontSize: '22px', fontWeight: '800', color: '#34d399' }}>
                    {totalMedQuantity} <span style={{ fontSize: '13px', color: '#cbd5e1' }}>{currentCalcMed.unit.includes('Liter') ? 'Liters' : currentCalcMed.unit.includes('Kg') ? 'Kg' : 'Packs'}</span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#6ee7b7' }}>Standard: {currentCalcMed.standardDosage}</div>
                </div>

                <div style={{ background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '14px' }}>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>Clean Water Required</div>
                  <div style={{ fontSize: '22px', fontWeight: '800', color: '#38bdf8' }}>
                    {totalWaterLiters} <span style={{ fontSize: '13px', color: '#cbd5e1' }}>Liters</span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#7dd3fc' }}>
                    {totalBackpackTanks > 0 ? `≈ ${totalBackpackTanks} Backpack Tanks (15L)` : 'Basal Soil Placement'}
                  </div>
                </div>

                <div style={{ background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '14px' }}>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>Estimated Cost</div>
                  <div style={{ fontSize: '22px', fontWeight: '800', color: '#fbbf24' }}>
                    ₹{estimatedCost}
                  </div>
                  <div style={{ fontSize: '11px', color: '#fef08a' }}>At direct farmer price</div>
                </div>

                <div style={{ background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '14px' }}>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>Pre-Harvest Interval</div>
                  <div style={{ fontSize: '16px', fontWeight: '800', color: '#ffffff' }}>
                    {currentCalcMed.safetyPeriod}
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>Spray: {currentCalcMed.sprayInterval}</div>
                </div>
              </div>

              {/* Soil Benefit Highlight */}
              <div style={{
                background: 'rgba(16, 185, 129, 0.08)',
                borderLeft: '3px solid #10b981',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '12.5px',
                color: '#e2e8f0',
                marginBottom: '20px'
              }}>
                🌱 <strong>Soil & Microbial Impact:</strong> {currentCalcMed.soilBenefit}
              </div>
            </div>

            {/* Order Action Button */}
            <button
              onClick={() => handleOrderInitiation(currentCalcMed)}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                border: 'none',
                color: '#ffffff',
                padding: '14px 20px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '800',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 16px rgba(16, 185, 129, 0.4)'
              }}
            >
              <Truck size={18} />
              <span>Order {totalMedQuantity} {currentCalcMed.unit.includes('Liter') ? 'Liters' : 'Kg'} with OTP Security Dispatch</span>
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW TAB 3: COMPARISON MATRIX: NATURAL (ORGANIC) VS SYNTHETIC (CHEMICAL)
          ========================================================================= */}
      {activeTab === 'comparison' && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1.5px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '18px',
          padding: '24px'
        }}>
          <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#ffffff', margin: '0 0 8px 0' }}>
            🌿 Natural Organic Remedies vs 🧪 Synthetic Agrochemicals Comparison Matrix
          </h3>
          <p style={{ fontSize: '13px', color: '#94a3b8', margin: '0 0 24px 0' }}>
            Understanding when to use biological vs chemical remedies for maximum yield, sustainable soil organic carbon, and farmer health safety.
          </p>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', color: '#cbd5e1' }}>
              <thead>
                <tr style={{ background: 'rgba(0, 0, 0, 0.5)', borderBottom: '2px solid rgba(55, 189, 120, 0.4)' }}>
                  <th style={{ padding: '14px 16px', textAlign: 'left', color: '#ffffff' }}>Comparison Parameter</th>
                  <th style={{ padding: '14px 16px', textAlign: 'left', color: '#34d399' }}>🌿 Natural / Bio Remedies (வேப்பெண்ணெய், பஞ்சகாவ்யா)</th>
                  <th style={{ padding: '14px 16px', textAlign: 'left', color: '#38bdf8' }}>🧪 Synthetic Agrochemicals (மேன்கோசெப், யூரியா)</th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    param: 'Action Speed',
                    natural: 'Gradual systemic strengthening (3-5 days)',
                    chemical: 'Immediate knockdown & curative kill (6-24 hours)'
                  },
                  {
                    param: 'Soil Health & Microbes',
                    natural: 'Enriches earthworms, humic content & microbial flora',
                    chemical: 'May acidify soil or suppress beneficial microbes if overused'
                  },
                  {
                    param: 'Pre-Harvest Waiting Period',
                    natural: '0 Days (Harvest safe immediately)',
                    chemical: '7 to 21 Days safety waiting window'
                  },
                  {
                    param: 'Pest Resistance Development',
                    natural: 'Very low (multi-compound mode of action)',
                    chemical: 'Moderate to high if sprayed repeatedly without rotation'
                  },
                  {
                    param: 'Farmer & Livestock Safety',
                    natural: 'Completely safe, non-toxic, eco-friendly',
                    chemical: 'Requires safety PPE mask, gloves & eye protection'
                  },
                  {
                    param: 'Best Use Scenario',
                    natural: 'Preventive defense, nursery stage, flowering & organic crops',
                    chemical: 'Severe outbreak emergency, high pest pressure & blast epidemics'
                  }
                ].map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', background: idx % 2 === 0 ? 'rgba(255, 255, 255, 0.02)' : 'transparent' }}>
                    <td style={{ padding: '14px 16px', fontWeight: '700', color: '#f3f4f6' }}>{row.param}</td>
                    <td style={{ padding: '14px 16px', color: '#a7f3d0' }}>{row.natural}</td>
                    <td style={{ padding: '14px 16px', color: '#bae6fd' }}>{row.chemical}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW TAB 4: INTERACTIVE 3D FORMULATION & DISPENSER PORT
          ========================================================================= */}
      {activeTab === '3d_port' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
          <div style={{ height: '420px' }}>
            <ThreeDPortViewer
              mode="medicine_dispenser"
              medicineData={selectedMedicine}
            />
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1.5px solid rgba(55, 189, 120, 0.3)',
            borderRadius: '18px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontSize: '11px', color: '#34d399', fontWeight: '800', textTransform: 'uppercase', marginBottom: '4px' }}>
                3D INTERACTIVE FORMULATION DISPENSER
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#ffffff', margin: '0 0 8px 0' }}>
                {selectedMedicine.name}
              </h3>
              <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.5', margin: '0 0 16px 0' }}>
                Rotate 360° to inspect formulation packaging, sealed tamper-proof safety seals, and active particle spray atomization.
              </p>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '18px' }}>
                {MEDICINE_CATALOG.slice(0, 6).map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMedicine(m)}
                    style={{
                      background: selectedMedicine.id === m.id ? '#10b981' : 'rgba(255, 255, 255, 0.06)',
                      color: selectedMedicine.id === m.id ? '#ffffff' : '#cbd5e1',
                      border: selectedMedicine.id === m.id ? '1px solid #10b981' : '1px solid rgba(255, 255, 255, 0.1)',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '11.5px',
                      fontWeight: selectedMedicine.id === m.id ? '800' : '600',
                      cursor: 'pointer'
                    }}
                  >
                    {m.type === 'organic' ? '🌿' : '🧪'} {m.name.split('(')[0]}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => handleOrderInitiation(selectedMedicine)}
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                border: 'none',
                color: '#ffffff',
                padding: '12px 20px',
                borderRadius: '10px',
                fontSize: '13.5px',
                fontWeight: '800',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <Truck size={16} /> Request Doorstep Delivery with OTP
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
