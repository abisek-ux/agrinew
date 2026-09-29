const Product = require('../models/Product');
const { isConnected } = require('../config/db');
const { getMemoryProducts } = require('./productController');

/**
 * Helper to fetch all active marketplace products
 */
const getAllProducts = async () => {
  if (isConnected()) {
    return await Product.find({});
  }
  return typeof getMemoryProducts === 'function' ? getMemoryProducts() : [];
};

/**
 * POST /api/ai/diagnose-crop
 * Validates plant image and sends to Vision AI provider if configured.
 * If no real vision AI key is configured, explicitly returns mode: 'demo_reference_required'
 */
const diagnoseCrop = async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', fileName } = req.body;

    if (!imageBase64) {
      return res.status(400).json({
        success: false,
        message: 'No image data provided. Please upload a clear photo of the infected crop leaf or stem.'
      });
    }

    // 1. Validate file type
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    const detectedMime = mimeType.toLowerCase();
    if (!allowedMimeTypes.includes(detectedMime)) {
      return res.status(400).json({
        success: false,
        message: `Unsupported file format (${detectedMime}). Only JPG, PNG, and WebP images are supported.`
      });
    }

    // 2. Validate file size (max 5MB)
    const base64Data = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const sizeInMb = buffer.length / (1024 * 1024);

    if (sizeInMb > 5) {
      return res.status(400).json({
        success: false,
        message: `Image size (${sizeInMb.toFixed(1)}MB) exceeds maximum limit of 5MB. Please choose a smaller image.`
      });
    }

    // 3. Check for Real Vision AI API Key
    const apiKey = process.env.GEMINI_API_KEY || process.env.VISION_AI_API_KEY;

    if (!apiKey) {
      return res.json({
        success: false,
        mode: 'demo_reference_required',
        message: 'Real Vision AI API key (GEMINI_API_KEY) is not configured in backend environment.',
        notice: 'Reference / Demo Mode is active. For live AI visual inference on field photographs, please add GEMINI_API_KEY to server/.env.',
        disclaimer: 'Warning: AI output is not guaranteed. Please confirm all crop symptoms with a certified agricultural expert before chemical application.'
      });
    }

    // 4. Call Real Vision AI API (Google Gemini 1.5 Flash Vision)
    try {
      const prompt = `You are a certified agricultural plant pathologist assisting smallholder farmers. 
Analyze this plant leaf/crop photograph and return a JSON object with this EXACT structure (no markdown fences, pure JSON):
{
  "detectedCrop": "Identified crop name (e.g. Tomato, Rice, Banana)",
  "possibleDisease": "Precise pathology / disease name (e.g. Early Blight, Bacterial Leaf Streak)",
  "confidence": "Estimated confidence percentage string (e.g. 84%)",
  "severity": "Severity classification (e.g. Mild, Moderate, Severe)",
  "visibleSymptoms": "Concise bullet-points of visible symptoms on leaf/tissue",
  "explanation": "Clear explanation of how the pathogen spreads and affects yield",
  "recommendedNextStep": "Immediate action the farmer must take today",
  "organicTreatment": "Safe bio-organic spray remedy (e.g. Neem oil, Trichoderma, Panchagavya)",
  "chemicalTreatment": "Approved agricultural fungicide/bactericide with precise dosage if severe",
  "preventionGuidance": "Cultural practices for crop rotation, soil drainage, and spacing",
  "warning": "Warning: AI output is an advisory estimation and not guaranteed. Please confirm with an agricultural expert if symptoms are severe."
}`;

      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      const payload = {
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: detectedMime,
                  data: base64Data
                }
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: 'application/json'
        }
      };

      const aiResponse = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!aiResponse.ok) {
        throw new Error(`Vision AI service returned status: ${aiResponse.status}`);
      }

      const aiData = await aiResponse.json();
      const rawText = aiData?.candidates?.[0]?.content?.parts?.[0]?.text;
      const parsedDiagnosis = JSON.parse(rawText);

      return res.json({
        success: true,
        mode: 'live_vision_ai',
        provider: 'Google Gemini Vision AI',
        diagnosis: parsedDiagnosis
      });
    } catch (aiErr) {
      console.warn('Real AI Vision diagnosis failed:', aiErr.message);
      return res.json({
        success: false,
        mode: 'demo_reference_required',
        message: `Vision AI service unavailable: ${aiErr.message}. Falling back to reference agronomy mode.`,
        disclaimer: 'Warning: AI output is not guaranteed. Please confirm with an agricultural expert if symptoms are severe.'
      });
    }
  } catch (error) {
    console.error('diagnoseCrop controller error:', error);
    return res.status(500).json({ success: false, message: 'Crop diagnosis service error' });
  }
};

/**
 * POST /api/ai/recipe-assistant
 * Interactive AI cooking assistant connected to real AgriLink marketplace inventory
 */
const recipeAssistant = async (req, res) => {
  try {
    const { query, message, prompt, cartItems = [], preferences = {}, conversationHistory = [] } = req.body;
    const cleanQuery = String(query || message || prompt || '').trim();

    if (!cleanQuery) {
      return res.status(400).json({ success: false, message: 'Please ask a cooking or recipe question' });
    }
    const allMarketProducts = await getAllProducts();

    // Map cart and query ingredients
    const cartProductTitles = cartItems.map(i => (i.title || i.name || '').trim()).filter(Boolean);

    // Common culinary database
    const culinaryKnowledge = [
      {
        id: 'tomato_cucumber_salad',
        title: 'Farm-Fresh Heritage Salad with Herb Dressing',
        category: 'Salad / Raw Fresh',
        baseIngredients: ['Tomato', 'Cucumber', 'Coriander', 'Lemon', 'Green Chilli'],
        prepTime: '10 mins',
        cookTime: '0 mins',
        difficulty: 'Easy',
        calories: '140 kcal',
        protein: '4g',
        steps: [
          'Wash fresh heirloom tomatoes and farm cucumbers under cold water.',
          'Dice tomatoes into 1-inch wedges and slice cucumbers thinly into rounds.',
          'Toss together in a ceramic bowl with finely chopped fresh coriander leaves.',
          'Drizzle 1 tbsp cold-pressed olive or sesame oil, squeeze fresh lemon juice, and season with pink rock salt and crushed black pepper.',
          'Let sit for 5 minutes for juices to mingle before serving crisp.'
        ],
        substitutions: {
          no_onion: 'Naturally onion-free. Enhanced with fragrant coriander and mint.',
          high_protein: 'Add 100g of roasted country peanuts, sprouted mung beans, or crumbled fresh paneer (+14g protein).'
        },
        storage: 'Best consumed fresh. Refrigerate in airtight glass container for up to 24 hours.'
      },
      {
        id: 'spinach_dal_curry',
        title: 'Country Farm Spinach Dal (Keerai Paruppu)',
        category: 'Main Course / Stew',
        baseIngredients: ['Spinach', 'Toor Dal', 'Tomato', 'Garlic', 'Cumin', 'Turmeric'],
        prepTime: '15 mins',
        cookTime: '20 mins',
        difficulty: 'Medium',
        calories: '280 kcal',
        protein: '18g',
        steps: [
          'Rinse fresh farm spinach thoroughly 3 times to remove garden silt, then chop finely.',
          'Pressure cook 1 cup washed toor dal or moong dal with turmeric, chopped tomatoes, and 2 cups water for 3 whistles.',
          'In a kadai, heat 1 tsp cold-pressed oil or ghee. Add mustard seeds, cumin, crushed garlic, and dry red chillies.',
          'Add chopped spinach and sauté for 3-4 minutes until wilted.',
          'Pour in the cooked dal, season with salt, and simmer on low flame for 6 minutes.',
          'Finish with a squeeze of fresh lemon and serve steaming with brown rice or rotis.'
        ],
        substitutions: {
          no_onion: 'Prepared completely onion-free with cumin, asafoetida (hing), and crushed ginger-garlic.',
          high_protein: 'Double the dal ratio or fold in roasted country chickpeas (chana) (+24g protein).'
        },
        storage: 'Keeps refrigerated for 3 days. Reheat with a splash of hot water.'
      },
      {
        id: 'carrot_beetroot_stirfry',
        title: 'Crisp Carrot & Green Bean Poriyal',
        category: 'Side Dish / Sauté',
        baseIngredients: ['Carrot', 'Beans', 'Grated Coconut', 'Mustard Seeds', 'Curry Leaves'],
        prepTime: '10 mins',
        cookTime: '12 mins',
        difficulty: 'Easy',
        calories: '160 kcal',
        protein: '5g',
        steps: [
          'Finely cube organic farm carrots and snap beans into uniform bite-sized pieces.',
          'Heat 1 tbsp cold-pressed coconut or groundnut oil in a heavy-bottom skillet.',
          'Splutter mustard seeds, urad dal, split green chillies, and fresh curry leaves.',
          'Add vegetables with a pinch of turmeric and 3 tbsp water. Cover and steam for 7 minutes until tender-crisp.',
          'Remove lid, evaporate remaining moisture, and toss with 2 tbsp fresh grated coconut and sea salt.'
        ],
        substitutions: {
          no_onion: 'Authentic South Indian sattvic poriyal without onion.',
          high_protein: 'Add soaked boiled white soya beans or crushed roasted peanuts (+12g protein).'
        },
        storage: 'Refrigerate for up to 48 hours. Delicious served cold in wraps.'
      },
      {
        id: 'vegetable_biryani_pulao',
        title: 'Clay Pot Heritage Farm Vegetable Pulao',
        category: 'Rice & Grains',
        baseIngredients: ['Basmati Rice', 'Carrot', 'Beans', 'Potato', 'Onion', 'Ginger', 'Mint'],
        prepTime: '20 mins',
        cookTime: '25 mins',
        difficulty: 'Medium',
        calories: '340 kcal',
        protein: '8g',
        steps: [
          'Soak aged long-grain basmati rice for 20 minutes and drain.',
          'In a clay pot or thick vessel, warm ghee or cold-pressed oil with whole spices (cloves, cardamom, cinnamon, bay leaf).',
          'Sauté ginger paste, sliced onions (or hing if no onion), and green chillies until fragrant.',
          'Add diced carrots, beans, potatoes, and chopped mint leaves. Sauté on medium flame for 3 minutes.',
          'Add soaked rice, 1.75 cups boiling water per cup of rice, and sea salt. Cover tightly and cook on low flame for 12 minutes.',
          'Rest for 10 minutes, fluff gently with a wooden spatula, and garnish with fresh coriander.'
        ],
        substitutions: {
          no_onion: 'Substitute onion with sliced fresh ginger, fennel seeds, and a pinch of asafoetida.',
          high_protein: 'Add 150g firm country tofu or fresh dairy paneer and green peas (+16g protein).'
        },
        storage: 'Refrigerate for up to 2 days.'
      }
    ];

    // Check if query is asking for step-by-step preparation
    const isPrepStepQuery = /how (do I|to) (prepare|cook|make)|step by step|directions|procedure/i.test(cleanQuery);
    // Check if query is asking for ingredients
    const isIngredientsQuery = /what ingredients|what do I need|grocery list|ingredients required/i.test(cleanQuery);
    // Check if query is asking for cooking time
    const isTimeQuery = /how long|cooking time|prep time|how much time|minutes/i.test(cleanQuery);
    // Check if query is asking for onion-free
    const isNoOnionQuery = /without onion|no onion|jain|sattvic/i.test(cleanQuery);
    // Check if query is asking for high-protein
    const isHighProteinQuery = /high protein|protein|fitness|gym|bodybuilding|muscle/i.test(cleanQuery);

    // Score recipes based on query mentions, cart items, and title matching
    const qLower = cleanQuery.toLowerCase();
    const scoredRecipes = culinaryKnowledge.map(recipe => {
      let score = 0;
      recipe.baseIngredients.forEach(ing => {
        if (qLower.includes(ing.toLowerCase())) score += 3;
        if (cartProductTitles.some(cp => cp.toLowerCase().includes(ing.toLowerCase()))) score += 2;
      });
      if (qLower.includes(recipe.title.toLowerCase()) || qLower.includes(recipe.category.toLowerCase())) score += 5;
      return { recipe, score };
    }).sort((a, b) => b.score - a.score);

    const selectedRecipe = scoredRecipes[0]?.recipe || culinaryKnowledge[0];

    // Find missing ingredients and cross-reference with real AgriLink products
    const availableInCart = [];
    const missingIngredients = [];

    selectedRecipe.baseIngredients.forEach(ing => {
      const foundInCart = cartProductTitles.find(cp => cp.toLowerCase().includes(ing.toLowerCase()));
      if (foundInCart) {
        availableInCart.push(ing);
      } else {
        // Check if available in marketplace
        const marketMatch = allMarketProducts.find(p =>
          (p.title || '').toLowerCase().includes(ing.toLowerCase()) ||
          (p.category || '').toLowerCase().includes(ing.toLowerCase())
        );

        missingIngredients.push({
          name: ing,
          isAvailableInAgriLink: Boolean(marketMatch),
          agriLinkProduct: marketMatch
            ? {
                id: String(marketMatch._id || marketMatch.id),
                title: marketMatch.title,
                price: marketMatch.price,
                unit: marketMatch.unit || 'kg',
                farmerName: marketMatch.farmerName || 'Verified Local Farmer',
                stock: marketMatch.stock,
                image: marketMatch.image
              }
            : null
        });
      }
    });

    // Formulate intelligent AI conversational response
    let answerText = '';

    if (isPrepStepQuery) {
      answerText = `Here is how to prepare **${selectedRecipe.title}** step-by-step:\n\n` +
        selectedRecipe.steps.map((s, idx) => `**Step ${idx + 1}:** ${s}`).join('\n\n') +
        `\n\n⏱️ Total Time: ${selectedRecipe.prepTime} prep + ${selectedRecipe.cookTime} cook. Enjoy fresh!`;
    } else if (isIngredientsQuery) {
      answerText = `For **${selectedRecipe.title}**, you will need:\n\n` +
        selectedRecipe.baseIngredients.map(i => `• ${i}`).join('\n') +
        `\n\n${availableInCart.length > 0 ? `✅ Already in your cart: ${availableInCart.join(', ')}` : ''}` +
        `\n🛒 Missing items: ${missingIngredients.map(m => m.name).join(', ')}`;
    } else if (isNoOnionQuery) {
      answerText = `Yes! You can easily prepare **${selectedRecipe.title}** without onion.\n\n` +
        `💡 **Adaptation Guidance:** ${selectedRecipe.substitutions.no_onion}\n\n` +
        `The recipe retains rich umami using cold-pressed oils, cumin, fresh herbs, and heirloom produce.`;
    } else if (isHighProteinQuery) {
      answerText = `Here is your high-protein adaptation of **${selectedRecipe.title}**:\n\n` +
        `💪 **High-Protein Boost:** ${selectedRecipe.substitutions.high_protein}\n` +
        `Standard Protein: ${selectedRecipe.protein} | Boosted Version: 22g - 28g per serving.\n\n` +
        `Nutritional Profile: ${selectedRecipe.calories} per serving. Ideal for post-workout or wholesome farm-to-table lunch.`;
    } else if (isTimeQuery) {
      answerText = `**${selectedRecipe.title}** takes:\n\n` +
        `• Preparation Time: ${selectedRecipe.prepTime}\n` +
        `• Active Cooking Time: ${selectedRecipe.cookTime}\n` +
        `• Total Window: ~${parseInt(selectedRecipe.prepTime) + parseInt(selectedRecipe.cookTime)} minutes.`;
    } else {
      answerText = `Based on your request, I recommend **${selectedRecipe.title}**!\n\n` +
        `It is a wholesome ${selectedRecipe.category} (${selectedRecipe.calories}, ${selectedRecipe.protein} protein) with a total time of only ${selectedRecipe.prepTime} prep and ${selectedRecipe.cookTime} cook.\n\n` +
        (availableInCart.length > 0
          ? `🌾 Great news: You already have **${availableInCart.join(', ')}** in your cart!\n\n`
          : '') +
        (missingIngredients.filter(m => m.isAvailableInAgriLink).length > 0
          ? `🛒 Missing ingredients available directly from local farmers on AgriLink:\n` +
            missingIngredients.filter(m => m.isAvailableInAgriLink).map(m => `• **${m.name}** — ${m.agriLinkProduct.title} (₹${m.agriLinkProduct.price}/${m.agriLinkProduct.unit} from ${m.agriLinkProduct.farmerName})`).join('\n')
          : '');
    }

    return res.json({
      success: true,
      answer: answerText,
      reply: answerText,
      recipe: {
        ...selectedRecipe,
        availableInCart,
        missingIngredients
      }
    });
  } catch (error) {
    console.error('recipeAssistant controller error:', error);
    return res.status(500).json({ success: false, message: 'Recipe assistant service error' });
  }
};

module.exports = {
  diagnoseCrop,
  recipeAssistant
};
