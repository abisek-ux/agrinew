import React, { createContext, useContext, useState, useEffect } from 'react';

export const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧', region: 'Global' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳', region: 'Tamil Nadu' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', flag: '🇮🇳', region: 'India' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳', region: 'Karnataka' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳', region: 'Andhra / Telangana' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳', region: 'Kerala' }
];

export const TRANSLATIONS = {
  en: {
    'hero_badge': "✨ 100% Direct Farm-to-Table Ecosystem • 0% Broker Fee",
    'hero_title': "🌱 Farm Fresh Produce & Smart Agriculture Hub",
    'hero_subtitle': "Direct farm-to-table platform with 3D crop inspection, autonomous GPS delivery dispatch, and pure organic marketplace trading.",
    'quick_shop_now': "🛒 Shop Fresh Produce Instantly",
    'farmer_hub_title': "🌾 Farmer Hub & Studio",
    'delivery_fleet_title': "🚚 Express Delivery Fleet",
    'mobile_app_title': "📱 3D Mobile Experience",
    'mandi_rates_title': "LIVE APMC MANDI BENCHMARK",
    'daily_reels_title': "🌾 Live Daily Harvest Reels & Stories",
    'daily_reels_sub': "Updated 30 mins ago",
    'tag_zero_broker': "Zero Middleman Broker Guarantee",
    'tag_organic': "100% Direct Certified Farm Produce",
    'tag_gps': "3D Interactive Sowing Physics Active",
    'launch_experience': "Launch Now ➔",
    'farmer_tagline': "Autonomous Sowing & Direct Harvest",
    'farmer_desc': "Manage harvest inventory, set your own fair prices without middleman cuts, inspect crop health with 3D scans, and receive direct customer orders.",
    'customer_tagline': "Organic Produce & 3D AR Inspection",
    'customer_desc': "Browse fresh organic produce with 3D quality inspection holograms, negotiate bulk prices directly with farmers, and track doorstep deliveries live.",
    'delivery_tagline': "Cold-Chain Logistics & Live Radar",
    'delivery_desc': "Accept delivery assignments, monitor 3D fleet HUD telemetry, simulate live turn-by-turn GPS, and claim instant shift payouts.",

    // Top Bar & Navigation
    'app_name': 'AgriLink',
    'select_language': 'Select Language',
    'portal_farmer': '🌾 Farmer Hub & Studio',
    'portal_delivery': '🚚 Express Logistics Fleet',
    'portal_customer': '🛒 Direct Farm Marketplace',
    'portal_ecosystem': 'AgriLink Ecosystem',
    'switch_role': 'Switch Role',
    'install_app': 'Install App',
    'logout': 'Logout',
    'login': 'Login / Sign In',
    'deliver_to': 'Deliver to:',
    'express_delivery': '⚡ Express 2-Hr Harvest',
    'agricoins': '🪙 AgriCoins',
    'zero_broker_fee': '0% Broker Fee • 100% to Farmers',
    'search_placeholder': 'Search fresh produce, mangoes, seeds, vegetables...',
    'voice_search': 'Voice Search',
    'clear': 'Clear',

    // Categories
    'cat_all': 'All Farm',
    'cat_fruits': 'Fruits',
    'cat_veggies': 'Veggies',
    'cat_seeds': 'Seeds',
    'cat_dairy': 'Dairy & Ghee',
    'cat_bio': 'Bio Hub',
    'cat_deals': 'Flash Deals',

    // Marketplace & Products
    'direct_farm_produce': 'Direct Farm Produce',
    'in_stock': 'In Stock',
    'out_of_stock': 'Out of Stock',
    'add_to_cart': 'Add to Cart',
    'added': '✓ Added',
    'buy_now': 'Buy Now',
    'bargain_now': 'Bargain Price',
    'harvested_on': 'Harvested',
    'reviews': 'Reviews',
    'verified_organic': '100% Certified Organic',
    'farmer_label': 'Farmer',
    'price_per_unit': 'Price per unit',

    // Cart & Checkout
    'your_cart': 'Your Farm Cart',
    'cart_empty': 'Your cart is empty',
    'subtotal': 'Subtotal',
    'delivery_fee': 'Delivery Fee',
    'free_delivery': 'FREE',
    'total_amount': 'Total Amount',
    'checkout': 'Proceed to Checkout',
    'pay_online': 'Pay Online (UPI / Card)',
    'cash_on_delivery': 'Cash on Delivery',

    // UPI & Payment Portal
    'payment_portal_title': 'AgriLink Secure Payment Portal',
    'scan_upi_qr': 'Scan Real UPI QR Code',
    'in_app_upi_transfer': 'In-App Direct UPI Transfer',
    'card_netbanking': 'Debit / Credit Card & NetBanking',
    'scan_with_app': 'Scan with Any UPI App',
    'open_scanner_hint': 'Open Google Pay, PhonePe, Paytm, or BHIM to pay directly',
    'select_bank': 'Select Verified Bank Account',
    'enter_mpin': 'Enter 4-Digit UPI MPIN',
    'verifying_payment': 'Verifying Secure NPCI Payment...',
    'payment_success': 'Payment Successful & Verified!',
    'download_receipt': 'Download Receipt (PDF)',

    // Orders & Tracking
    'orders_tab': 'My Orders',
    'active_orders': 'Active Orders',
    'past_orders': 'Order History',
    'order_id': 'Order ID',
    'order_details': 'Order Details & Milestones',
    'live_radar_map': 'Live Radar Map',
    'producer_farm': 'Producer Farm',
    'delivery_partner': 'Delivery Partner',
    'customer_destination': 'Customer Destination',
    'order_status': 'Status',
    'status_pending': 'Pending Confirmation',
    'status_confirmed': 'Confirmed by Farmer',
    'status_packed': 'Packed at Farm',
    'status_assigned': 'Courier Assigned',
    'status_picked_up': 'Picked Up from Farm',
    'status_in_transit': 'Out for Delivery',
    'status_arrived': 'Courier Arrived at Doorstep',
    'status_delivered': 'Delivered & Authenticated',
    'status_cancelled': 'Cancelled',
    'cancel_order': 'Cancel Order',

    // GPS & Live Tracker
    'gps_farmer_link': '🌾 Farmer Farm GPS',
    'gps_route_link': '🗺️ Turn-by-Turn Navigation',
    'gps_courier_link': '🚚 Live Courier GPS',
    'open_in_google_maps': '📍 Open in Google Maps GPS ↗',
    'handover_code_title': 'Doorstep Handover PIN Authentication',
    'handover_code_hint': 'Share this secure code with your delivery driver upon produce inspection.',

    // Hubs
    'namakkal_hub': 'Namakkal Agro Harvest Depot',
    'salem_hub': 'Salem Organic Orchard Depot',
    'coimbatore_hub': 'Coimbatore Regional Farm Hub',
    'tamil_nadu': 'Tamil Nadu, India',

    // Farmer Portal specific
    'farmer_dashboard': 'Farmer Control Center',
    'my_produce_listings': 'My Produce Listings',
    'add_new_product': 'List New Harvest',
    'active_crop_orders': 'Active Farm Orders',
    'signal_dispatch': 'Signal Courier Fleet',
    'ai_crop_doctor': 'AI Plant Doctor',
    'ai_crop_advisory': 'AI Crop Advisory'
  },

  ta: {
    'hero_badge': "✨ 100% நேரடி பண்ணை-வீட்டு தளம் • 0% தரகர் கட்டணம்",
    'hero_title': "🌱 பண்ணை நேரடி விளைபொருட்கள் & விவசாய மையம்",
    'hero_subtitle': "நேரடி பண்ணை-வீட்டு விநியோகம்: 3D பயிர் பரிசோதனை, நேரடி GPS டெலிவரி மற்றும் 0% தரகர் கட்டணத்துடன் தூய இயற்கை விளைபொருட்கள் வர்த்தகம்.",
    'quick_shop_now': "🛒 உடனடியாக காய்கறி & பழங்கள் வாங்க",
    'farmer_hub_title': "🌾 விவசாயி நேரடி விற்பனை தளம்",
    'delivery_fleet_title': "🚚 விரைவு விநியோக தளவாட சேவை",
    'mobile_app_title': "📱 3D மொபைல் செயலி அனுபவம்",
    'mandi_rates_title': "நேரடி மண்டி சந்தை விலைகள்",
    'daily_reels_title': "🌾 நேரடி பண்ணை அறுவடை நிகழ்வுகள்",
    'daily_reels_sub': "30 நிமிடங்களுக்கு முன் புதுப்பிக்கப்பட்டது",
    'tag_zero_broker': "0% இடைத்தரகர் கட்டண உத்தரவாதம்",
    'tag_organic': "100% தூய இயற்கை விளைபொருட்கள்",
    'tag_gps': "3D ஊடாடும் விதைப்பு இயற்பியல் இயங்குகிறது",
    'launch_experience': "உடனே தொடங்குக ➔",
    'farmer_tagline': "சுயாதீன விதைப்பு மற்றும் நேரடி அறுவடை",
    'farmer_desc': "விளைபொருள் சரக்குகளை நிர்வகிக்கவும், தரகர் இன்றி நியாயமான விலையை நீங்களே நிர்ணயிக்கவும், 3D ஸ்கேன் மூலம் பயிர் ஆரோக்கியத்தை சரிபார்க்கவும்.",
    'customer_tagline': "இயற்கை உணவு மற்றும் 3D ஆய்வு",
    'customer_desc': "3D தர பரிசோதனையுடன் புதிய இயற்கை விளைபொருட்களை உலாவவும், விவசாயிகளுடன் நேரடியாக பேரம் பேசவும், நேரடி டெலிவரியை கண்காணிக்கவும்.",
    'delivery_tagline': "குளிர்சங்கிலி தளவாடங்கள் மற்றும் நேரடி ரேடார்",
    'delivery_desc': "டெலிவரி பணிகளை ஏற்கவும், 3D ஜிபிஎஸ் வரைபட வழிசெலுத்தலை இயக்கவும், உடனடி கட்டண தீர்வை பெறவும்.",

    // Top Bar & Navigation
    'app_name': 'அக்ரிலின்க்',
    'select_language': 'மொழியைத் தேர்ந்தெடுக்கவும்',
    'portal_farmer': '🌾 விவசாயி நேரடி தளம்',
    'portal_delivery': '🚚 விநியோக தளவாட மையம்',
    'portal_customer': '🛒 நுகர்வோர் சந்தை',
    'portal_ecosystem': 'அக்ரிலின்க் பண்ணை சூழல்',
    'switch_role': 'பங்கை மாற்றவும்',
    'install_app': 'செயலியை நிறுவு',
    'logout': 'வெளியேறு',
    'login': 'உள்நுழைக / பதிவு செய்க',
    'deliver_to': 'டெலிவரி செய்யும் இடம்:',
    'express_delivery': '⚡ 2-மணிநேர விரைவு அறுவடை',
    'agricoins': '🪙 அக்ரிகாயின்ஸ்',
    'zero_broker_fee': '0% தரகர் கட்டணம் • 100% விவசாயிகளுக்கு',
    'search_placeholder': 'மாம்பழங்கள், காய்கறிகள், விதைகள், இயற்கை உணவுகளை தேடுங்கள்...',
    'voice_search': 'குரல் தேடல்',
    'clear': 'அழி',

    // Categories
    'cat_all': 'அனைத்து பண்ணை',
    'cat_fruits': 'பழங்கள்',
    'cat_veggies': 'காய்கறிகள்',
    'cat_seeds': 'விதைகள்',
    'cat_dairy': 'பால் & நெய்',
    'cat_bio': 'இயற்கை உரம்',
    'cat_deals': 'சிறப்பு தள்ளுபடி',

    // Marketplace & Products
    'direct_farm_produce': 'நேரடி பண்ணை விளைபொருட்கள்',
    'in_stock': 'இருப்பில் உள்ளது',
    'out_of_stock': 'இருப்பு இல்லை',
    'add_to_cart': 'கூடையில் சேர்',
    'added': '✓ சேர்க்கப்பட்டது',
    'buy_now': 'உடனே வாங்கு',
    'bargain_now': 'விலை பேரம் பேசு',
    'harvested_on': 'அறுவடை நாள்',
    'reviews': 'மதிப்புரைகள்',
    'verified_organic': '100% சான்றளிக்கப்பட்ட இயற்கை',
    'farmer_label': 'விவசாயி',
    'price_per_unit': 'விலை / அளவு',

    // Cart & Checkout
    'your_cart': 'உங்கள் பண்ணை கூடை',
    'cart_empty': 'உங்கள் கூடை காலியாக உள்ளது',
    'subtotal': 'கூடுதல் தொகை',
    'delivery_fee': 'டெலிவரி கட்டணம்',
    'free_delivery': 'இலவசம்',
    'total_amount': 'மொத்த தொகை',
    'checkout': 'செக்அவுட் தொடரவும்',
    'pay_online': 'ஆன்லைனில் செலுத்துக (UPI / Card)',
    'cash_on_delivery': 'டெலிவரியின் போது பணம்',

    // UPI & Payment Portal
    'payment_portal_title': 'அக்ரிலின்க் பாதுகாப்பான கட்டண தளம்',
    'scan_upi_qr': 'நேரடி UPI QR குறியீட்டை ஸ்கேன் செய்க',
    'in_app_upi_transfer': 'செயலியில் நேரடி வங்கி UPI பரிமாற்றம்',
    'card_netbanking': 'டெபிட் / கிரெடிட் கார்டு & நெட்பேங்கிங்',
    'scan_with_app': 'எந்தவொரு UPI ஆப் மூலமும் ஸ்கேன் செய்யுங்கள்',
    'open_scanner_hint': 'Google Pay, PhonePe, Paytm அல்லது BHIM மூலம் நேரடியாக செலுத்தலாம்',
    'select_bank': 'வங்கி கணக்கை தேர்வு செய்க',
    'enter_mpin': '4-இலக்க UPI MPIN-ஐ உள்ளிடவும்',
    'verifying_payment': 'NPCI பாதுகாப்பான கட்டணம் சரிபார்க்கப்படுகிறது...',
    'payment_success': 'கட்டணம் வெற்றிகரமாக செலுத்தப்பட்டு சரிபார்க்கப்பட்டது!',
    'download_receipt': 'ரசீதை பதிவிறக்குக (PDF)',

    // Orders & Tracking
    'orders_tab': 'என் ஆர்டர்கள்',
    'active_orders': 'செயலில் உள்ள ஆர்டர்கள்',
    'past_orders': 'ஆர்டர் வரலாறு',
    'order_id': 'ஆர்டர் எண்',
    'order_details': 'ஆர்டர் விவரங்கள் & நிலைகள்',
    'live_radar_map': 'நேரடி ரேடார் வரைபடம்',
    'producer_farm': 'விளைவித்த பண்ணை',
    'delivery_partner': 'டெலிவரி கூட்டாளர்',
    'customer_destination': 'டெலிவரி முகவரி',
    'order_status': 'நிலை',
    'status_pending': 'விவசாயி உறுதிப்படுத்தலுக்காக காத்திருக்கிறது',
    'status_confirmed': 'விவசாயி உறுதிப்படுத்தினார்',
    'status_packed': 'பண்ணையில் பேக் செய்யப்பட்டது',
    'status_assigned': 'டெலிவரி டிரைவர் நியமிக்கப்பட்டார்',
    'status_picked_up': 'பண்ணையிலிருந்து எடுக்கப்பட்டது',
    'status_in_transit': 'டெலிவரிக்கு வழியில் உள்ளது',
    'status_arrived': 'உங்கள் வாசலுக்கு டிரைவர் வந்துவிட்டார்',
    'status_delivered': 'வெற்றிகரமாக டெலிவரி செய்யப்பட்டது',
    'status_cancelled': 'ரத்து செய்யப்பட்டது',
    'cancel_order': 'ஆர்டரை ரத்து செய்',

    // GPS & Live Tracker
    'gps_farmer_link': '🌾 விவசாயி பண்ணை GPS',
    'gps_route_link': '🗺️ வரைபட வழிசெலுத்தல்',
    'gps_courier_link': '🚚 நேரடி டிரைவர் GPS',
    'open_in_google_maps': '📍 கூகிள் வரைபடத்தில் திற ↗',
    'handover_code_title': 'வாசற்படி சரிபார்ப்பு OTP குறியீடு',
    'handover_code_hint': 'பொருட்களை சரிபார்த்த பிறகு இந்த குறியீட்டை டெலிவரி நபரிடம் பகிரவும்.',

    // Hubs
    'namakkal_hub': 'நாமக்கல் வேளாண் அறுவடை மையம்',
    'salem_hub': 'சேலம் இயற்கை பழத்தோட்ட மையம்',
    'coimbatore_hub': 'கோவை மண்டல பண்ணை மையம்',
    'tamil_nadu': 'தமிழ்நாடு, இந்தியா',

    // Farmer Portal specific
    'farmer_dashboard': 'விவசாயி கட்டுப்பாட்டு அறை',
    'my_produce_listings': 'என் விளைபொருள் பட்டியல்',
    'add_new_product': 'புதிய அறுவடையை சேர்க்கவும்',
    'active_crop_orders': 'செயலில் உள்ள பண்ணை ஆர்டர்கள்',
    'signal_dispatch': 'வாகனத்தை வரவழைக்கவும்',
    'ai_crop_doctor': 'AI பயிர் மருத்துவர்',
    'ai_crop_advisory': 'AI பயிர் ஆலோசனை'
  },

  hi: {
    'hero_badge': "✨ 100% सीधे खेत से घर तक • 0% दलाली शुल्क",
    'hero_title': "🌱 खेत से ताज़ा उत्पाद और स्मार्ट कृषि केंद्र",
    'hero_subtitle': "3D फसल परीक्षण, स्वचालित जीपीएस डिलीवरी और 0% दलाली के साथ सीधे किसानों से शुद्ध जैविक उत्पाद बाज़ार।",
    'quick_shop_now': "🛒 तुरंत ताज़ा उत्पाद खरीदें",
    'farmer_hub_title': "🌾 किसान स्टूडियो और बिक्री केंद्र",
    'delivery_fleet_title': "🚚 एक्सप्रेस डिलीवरी फ्लीट",
    'mobile_app_title': "📱 3D मोबाइल ऐप अनुभव",
    'mandi_rates_title': "लाइव एपीएमसी मंडी दरें",
    'daily_reels_title': "🌾 खेत से दैनिक ताज़ा कटाई वीडियो",
    'daily_reels_sub': "30 मिनट पहले अपडेट किया गया",
    'tag_zero_broker': "शून्य बिचौलिया दलाल गारंटी",
    'tag_organic': "100% प्रमाणित जैविक उत्पाद",
    'tag_gps': "3D संवादात्मक फसल भौतिकी सक्रिय",
    'launch_experience': "अभी शुरू करें ➔",
    'farmer_tagline': "स्वायत्त बुवाई और सीधी फसल बिक्री",
    'farmer_desc': "अपनी उपज का प्रबंधन करें, बिना बिचौलियों के अपनी कीमतें खुद तय करें, 3D स्कैन से फसल रोग जांचें और सीधे आर्डर पाएं।",
    'customer_tagline': "जैविक उत्पाद और 3D निरीक्षण",
    'customer_desc': "3D गुणवत्ता परीक्षण के साथ ताज़े जैविक उत्पाद देखें, किसानों से सीधे थोक मोलभाव करें और लाइव डिलीवरी ट्रैक करें।",
    'delivery_tagline': "कोल्ड-चेन लॉजिस्टिक्स और लाइव रडार",
    'delivery_desc': "डिलीवरी असाइनमेंट स्वीकार करें, लाइव जीपीएस नेविगेशन देखें और अपनी कमाई तुरंत पाएं।",

    // Top Bar & Navigation
    'app_name': 'एग्रीलिंक',
    'select_language': 'भाषा चुनें',
    'portal_farmer': '🌾 किसान समर्पित पोर्टल',
    'portal_delivery': '🚚 डिलीवरी लॉजिस्टिक्स हब',
    'portal_customer': '🛒 ग्राहक बाज़ार',
    'portal_ecosystem': 'एग्रीलिंक कृषि इकोसिस्टम',
    'switch_role': 'भूमिका बदलें',
    'install_app': 'ऐप इंस्टॉल करें',
    'logout': 'लॉग आउट',
    'login': 'लॉग इन / साइन अप',
    'deliver_to': 'डिलीवरी स्थान:',
    'express_delivery': '⚡ 2 घंटे में ताज़ा डिलीवरी',
    'agricoins': '🪙 एग्रीकॉइन्स',
    'zero_broker_fee': '0% दलाल शुल्क • 100% किसानों को',
    'search_placeholder': 'ताज़े फल, सब्ज़ियां, बीज और जैविक उत्पाद खोजें...',
    'voice_search': 'आवाज़ से खोजें',
    'clear': 'साफ़ करें',

    // Categories
    'cat_all': 'सभी उत्पाद',
    'cat_fruits': 'फल',
    'cat_veggies': 'सब्जियां',
    'cat_seeds': 'बीज',
    'cat_dairy': 'दूध और घी',
    'cat_bio': 'जैविक खाद',
    'cat_deals': 'खास छूट',

    // Marketplace & Products
    'direct_farm_produce': 'सीधे खेत से उत्पाद',
    'in_stock': 'स्टॉक में उपलब्ध',
    'out_of_stock': 'स्टॉक समाप्त',
    'add_to_cart': 'कार्ट में जोड़ें',
    'added': '✓ जोड़ा गया',
    'buy_now': 'अभी खरीदें',
    'bargain_now': 'मोलभाव करें',
    'harvested_on': 'कटाई तिथि',
    'reviews': 'समीक्षाएं',
    'verified_organic': '100% प्रमाणित जैविक',
    'farmer_label': 'किसान',
    'price_per_unit': 'मूल्य प्रति इकाई',

    // Cart & Checkout
    'your_cart': 'आपकी टोकरी',
    'cart_empty': 'आपकी टोकरी खाली है',
    'subtotal': 'उप-योग',
    'delivery_fee': 'डिलीवरी शुल्क',
    'free_delivery': 'निःशुल्क',
    'total_amount': 'कुल राशि',
    'checkout': 'ऑर्डर पूरा करें',
    'pay_online': 'ऑनलाइन भुगतान (UPI / कार्ड)',
    'cash_on_delivery': 'डिलीवरी पर नकद',

    // UPI & Payment Portal
    'payment_portal_title': 'एग्रीलिंक सुरक्षित भुगतान पोर्टल',
    'scan_upi_qr': 'असली UPI QR कोड स्कैन करें',
    'in_app_upi_transfer': 'ऐप में सीधा UPI बैंक ट्रांसफर',
    'card_netbanking': 'डेबिट / क्रेडिट कार्ड एवं नेटबैंकिंग',
    'scan_with_app': 'किसी भी UPI ऐप से स्कैन करें',
    'open_scanner_hint': 'Google Pay, PhonePe, Paytm या BHIM से सीधे भुगतान करें',
    'select_bank': 'सत्यापित बैंक खाता चुनें',
    'enter_mpin': '4-अंकों का UPI MPIN दर्ज करें',
    'verifying_payment': 'NPCI द्वारा भुगतान सत्यापित किया जा रहा है...',
    'payment_success': 'भुगतान सफलतापूर्वक सत्यापित हुआ!',
    'download_receipt': 'रसीद डाउनलोड करें (PDF)',

    // Orders & Tracking
    'orders_tab': 'मेरे ऑर्डर',
    'active_orders': 'सक्रिय ऑर्डर',
    'past_orders': 'ऑर्डर इतिहास',
    'order_id': 'ऑर्डर संख्या',
    'order_details': 'ऑर्डर विवरण एवं चरण',
    'live_radar_map': 'लाइव रडार मैप',
    'producer_farm': 'उत्पादक खेत',
    'delivery_partner': 'डिलीवरी पार्टनर',
    'customer_destination': 'डिलीवरी पता',
    'order_status': 'स्थिति',
    'status_pending': 'पुष्टि प्रतीक्षित',
    'status_confirmed': 'किसान द्वारा स्वीकृत',
    'status_packed': 'खेत में पैक किया गया',
    'status_assigned': 'डिलीवरी एजेंट नियुक्त',
    'status_picked_up': 'खेत से उठाया गया',
    'status_in_transit': 'डिलीवरी मार्ग पर',
    'status_arrived': 'दरवाजे पर पहुँच चुका है',
    'status_delivered': 'सफलतापूर्वक डिलीवर',
    'status_cancelled': 'रद्द किया गया',
    'cancel_order': 'ऑर्डर रद्द करें',

    // GPS & Live Tracker
    'gps_farmer_link': '🌾 किसान खेत GPS',
    'gps_route_link': '🗺️ नेविगेशन मार्ग',
    'gps_courier_link': '🚚 लाइव कूरियर GPS',
    'open_in_google_maps': '📍 गूगल मैप्स पर खोलें ↗',
    'handover_code_title': 'डिलीवरी हैंडओवर पिन',
    'handover_code_hint': 'उत्पाद जांचने के बाद यह कोड डिलीवरी पार्टनर को बताएं।',

    // Hubs
    'namakkal_hub': 'नमक्कल कृषि उपज डिपो',
    'salem_hub': 'सेलम जैविक फल डिपो',
    'coimbatore_hub': 'कोयम्बटूर क्षेत्रीय कृषि केंद्र',
    'tamil_nadu': 'तमिलनाडु, भारत',

    // Farmer Portal specific
    'farmer_dashboard': 'किसान नियंत्रण केंद्र',
    'my_produce_listings': 'मेरी फसल सूची',
    'add_new_product': 'नई फसल जोड़ें',
    'active_crop_orders': 'सक्रिय फसल ऑर्डर',
    'signal_dispatch': 'लॉजिस्टिक्स को बुलाएं',
    'ai_crop_doctor': 'AI फसल डॉक्टर',
    'ai_crop_advisory': 'AI फसल सलाह'
  },

  kn: {
    'hero_badge': "✨ 100% ನೇರ ಹೊಲದಿಂದ ಮನೆಗೆ • 0% ದಲ್ಲಾಳಿ ಶುಲ್ಕ",
    'hero_title': "🌱 ಹೊಲದಿಂದ ನೇರ ತಾಜಾ ಉತ್ಪನ್ನ ಮತ್ತು ಕೃಷಿ ಕೇಂದ್ರ",
    'hero_subtitle': "3D ಬೆಳೆ ತಪಾಸಣೆ, ಸ್ವಯಂಚಾಲಿತ ಜಿಪಿಎಸ್ ವಿತರಣೆ ಮತ್ತು 0% ದಲ್ಲಾಳಿ ಶುಲ್ಕದೊಂದಿಗೆ ನೇರ ಸಾವಯವ ಉತ್ಪನ್ನ ಮಾರುಕಟ್ಟೆ.",
    'quick_shop_now': "🛒 ತಕ್ಷಣ ತಾಜಾ ಉತ್ಪನ್ನ ಖರೀದಿಸಿ",
    'farmer_hub_title': "🌾 ರೈತರ ಸ್ಟುಡಿಯೋ ಮತ್ತು ಮಾರಾಟ",
    'delivery_fleet_title': "🚚 ಎಕ್ಸ್‌ಪ್ರೆಸ್ ವಿತರಣಾ ಫ್ಲೀಟ್",
    'mobile_app_title': "📱 3D ಮೊಬೈಲ್ ಅನುಭವ",
    'mandi_rates_title': "ಲೈವ್ ಎಪಿಎಂಸಿ ಮಂಡಿ ದರಗಳು",
    'daily_reels_title': "🌾 ದೈನಂದಿನ ಕೃಷಿ ಕೊಯ್ಲು ವೀಡಿಯೊಗಳು",
    'daily_reels_sub': "30 ನಿಮಿಷಗಳ ಹಿಂದೆ ನವೀಕರಿಸಲಾಗಿದೆ",
    'tag_zero_broker': "ಶೂನ್ಯ ಮಧ್ಯವರ್ತಿ ದಲ್ಲಾಳಿ ಗ್ಯಾರಂಟಿ",
    'tag_organic': "100% ಪ್ರಮಾಣೀಕೃತ ಸಾವಯವ ಕೃಷಿ ಉತ್ಪನ್ನ",
    'tag_gps': "3D ಸಂವಾದಾತ್ಮಕ ಬಿತ್ತನೆ ತಂತ್ರಜ್ಞಾನ ಸಕ್ರಿಯ",
    'launch_experience': "ಈಗಲೇ ಪ್ರಾರಂಭಿಸಿ ➔",
    'farmer_tagline': "ಸ್ವಾಯತ್ತ ಬಿತ್ತನೆ ಮತ್ತು ನೇರ ಕೊಯ್ಲು",
    'farmer_desc': "ಬೆಳೆ ದಾಸ್ತಾನು ನಿರ್ವಹಿಸಿ, ದಲ್ಲಾಳಿಗಳಿಲ್ಲದೆ ನಿಮ್ಮದೇ ಬೆಲೆ ನಿಗದಿಪಡಿಸಿ ಮತ್ತು ನೇರ ಗ್ರಾಹಕ ಆದೇಶಗಳನ್ನು ಸ್ವೀಕರಿಸಿ.",
    'customer_tagline': "ಸಾವಯವ ಉತ್ಪನ್ನ ಮತ್ತು 3D ತಪಾಸಣೆ",
    'customer_desc': "3D ತಪಾಸಣೆಯೊಂದಿಗೆ ತಾಜಾ ಸಾವಯವ ಉತ್ಪನ್ನಗಳನ್ನು ಖರೀದಿಸಿ, ರೈತರೊಂದಿಗೆ ನೇರವಾಗಿ ಚೌಕಾಸಿ ಮಾಡಿ ಮತ್ತು ಲೈವ್ ಟ್ರ್ಯಾಕ್ ಮಾಡಿ.",
    'delivery_tagline': "ಕೋಲ್ಡ್-ಚೈನ್ ಲಾಜಿಸ್ಟಿಕ್ಸ್ ಮತ್ತು ಲೈವ್ ರಾಡಾರ್",
    'delivery_desc': "ವಿತರಣಾ ಕೆಲಸಗಳನ್ನು ಸ್ವೀಕರಿಸಿ, ಲೈವ್ ಜಿಪಿಎಸ್ ಮಾರ್ಗವನ್ನು ವೀಕ್ಷಿಸಿ ಮತ್ತು ತ್ವರಿತ ಗಳಿಕೆ ಪಡೆಯಿರಿ.",

    // Top Bar & Navigation
    'app_name': 'ಅಗ್ರಿಲಿಂಕ್',
    'select_language': 'ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    'portal_farmer': '🌾 ರೈತರ ನೇರ ಪೋರ್ಟಲ್',
    'portal_delivery': '🚚 ವಿತರಣಾ ಲಾಜಿಸ್ಟಿಕ್ಸ್ ಹಬ್',
    'portal_customer': '🛒 ಗ್ರಾಹಕ ಮಾರುಕಟ್ಟೆ',
    'portal_ecosystem': 'ಅಗ್ರಿಲಿಂಕ್ ಪರಿಸರ ವ್ಯವಸ್ಥೆ',
    'switch_role': 'ಪಾತ್ರ ಬದಲಾಯಿಸಿ',
    'install_app': 'ಆ್ಯಪ್ ಇನ್‌ಸ್ಟಾಲ್ ಮಾಡಿ',
    'logout': 'ಲಾಗ್ ಔಟ್',
    'login': 'ಲಾಗ್ ಇನ್ / ಸೈನ್ ಅಪ್',
    'deliver_to': 'ತಲುಪಿಸುವ ಸ್ಥಳ:',
    'express_delivery': '⚡ 2 ಗಂಟೆಗಳ ತಾಜಾ ವಿತರಣೆ',
    'agricoins': '🪙 ಅಗ್ರಿಕಾಯಿನ್ಸ್',
    'zero_broker_fee': '0% ದಲ್ಲಾಳಿ ಶುಲ್ಕ • 100% ರೈತರಿಗೆ',
    'search_placeholder': 'ತಾಜಾ ಹಣ್ಣುಗಳು, ತರಕಾರಿಗಳು, ಬೀಜಗಳನ್ನು ಹುಡುಕಿ...',
    'voice_search': 'ಧ್ವನಿ ಹುಡುಕಾಟ',
    'clear': 'ತೆರವುಗೊಳಿಸಿ',

    // Categories
    'cat_all': 'ಎಲ್ಲಾ ಉತ್ಪನ್ನಗಳು',
    'cat_fruits': 'ಹಣ್ಣುಗಳು',
    'cat_veggies': 'ತರಕಾರಿಗಳು',
    'cat_seeds': 'ಬೀಜಗಳು',
    'cat_dairy': 'ಹಾಲು ಮತ್ತು ತುಪ್ಪ',
    'cat_bio': 'ಸಾವಯವ ಗೊಬ್ಬರ',
    'cat_deals': 'ವಿಶೇಷ ರಿಯಾಯಿತಿ',

    // Marketplace & Products
    'direct_farm_produce': 'ನೇರ ಕೃಷಿ ಉತ್ಪನ್ನಗಳು',
    'in_stock': 'ಲಭ್ಯವಿದೆ',
    'out_of_stock': 'ಲಭ್ಯವಿಲ್ಲ',
    'add_to_cart': 'ಕಾರ್ಟ್‌ಗೆ ಸೇರಿಸಿ',
    'added': '✓ ಸೇರಿಸಲಾಗಿದೆ',
    'buy_now': 'ಈಗಲೇ ಖರೀದಿಸಿ',
    'bargain_now': 'ಬೆಲೆ ಚೌಕಾಸಿ',
    'harvested_on': 'ಕೊಯ್ಲು ದಿನಾಂಕ',
    'reviews': 'ವಿಮರ್ಶೆಗಳು',
    'verified_organic': '100% ಪ್ರಮಾಣೀಕೃತ ಸಾವಯವ',
    'farmer_label': 'ರೈತ',
    'price_per_unit': 'ಪ್ರತಿ ಯೂನಿಟ್ ಬೆಲೆ',

    // Cart & Checkout
    'your_cart': 'ನಿಮ್ಮ ಬುಟ್ಟಿ',
    'cart_empty': 'ಬುಟ್ಟಿ ಖಾಲಿಯಾಗಿದೆ',
    'subtotal': 'ಒಟ್ಟು ಮೊತ್ತ',
    'delivery_fee': 'ವಿತರಣಾ ಶುಲ್ಕ',
    'free_delivery': 'ಉಚಿತ',
    'total_amount': 'ಅಂತಿಮ ಮೊತ್ತ',
    'checkout': 'ಮುಂದೆ ಸಾಗಿ',
    'pay_online': 'ಆನ್‌ಲೈನ್ ಪಾವತಿ (UPI / ಕಾರ್ಡ್)',
    'cash_on_delivery': 'ವಿತರಣೆಯ ಸಮಯದಲ್ಲಿ ನಗದು',

    // UPI & Payment Portal
    'payment_portal_title': 'ಅಗ್ರಿಲಿಂಕ್ ಸುರಕ್ಷಿತ ಪಾವತಿ',
    'scan_upi_qr': 'UPI QR ಕೋಡ್ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ',
    'in_app_upi_transfer': 'ನೇರ UPI ಬ್ಯಾಂಕ್ ವರ್ಗಾವಣೆ',
    'card_netbanking': 'ಡೆಬಿಟ್ / ಕ್ರೆಡಿಟ್ ಕಾರ್ಡ್ & ನೆಟ್‌ಬ್ಯಾಂಕಿಂಗ್',
    'scan_with_app': 'ಯಾವುದೇ UPI ಆ್ಯಪ್‌ನೊಂದಿಗೆ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ',
    'open_scanner_hint': 'Google Pay, PhonePe, Paytm ಅಥವಾ BHIM ಮೂಲಕ ಪಾವತಿಸಿ',
    'select_bank': 'ಬ್ಯಾಂಕ್ ಖಾತೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    'enter_mpin': '4-ಅಂಕಿಯ UPI MPIN ನಮೂದಿಸಿ',
    'verifying_payment': 'NPCI ಪಾವತಿ ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...',
    'payment_success': 'ಪಾವತಿ ಯಶಸ್ವಿಯಾಗಿದೆ!',
    'download_receipt': 'ರಶೀದಿ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ (PDF)',

    // Orders & Tracking
    'orders_tab': 'ನನ್ನ ಆರ್ಡರ್‌ಗಳು',
    'active_orders': 'ಸಕ್ರಿಯ ಆರ್ಡರ್‌ಗಳು',
    'past_orders': 'ಆರ್ಡರ್ ಇತಿಹಾಸ',
    'order_id': 'ಆರ್ಡರ್ ಐಡಿ',
    'order_details': 'ಆರ್ಡರ್ ವಿವರಗಳು',
    'live_radar_map': 'ಲೈವ್ ರಾಡಾರ್ ನಕ್ಷೆ',
    'producer_farm': 'ಉತ್ಪಾದಿಸಿದ ತೋಟ',
    'delivery_partner': 'ವಿತರಣಾ ಸಹಾಯಕ',
    'customer_destination': 'ತಲುಪಿಸುವ ವಿಳಾಸ',
    'order_status': 'ಸ್ಥಿತಿ',
    'status_pending': 'ಖಚಿತಪಡಿಸುವಿಕೆ ಬಾಕಿ',
    'status_confirmed': 'ರೈತರಿಂದ ಖಚಿತಗೊಂಡಿದೆ',
    'status_packed': 'ಪ್ಯಾಕ್ ಮಾಡಲಾಗಿದೆ',
    'status_assigned': 'ಡ್ರೈವರ್ ನಿಯೋಜಿಸಲಾಗಿದೆ',
    'status_picked_up': 'ತೋಟದಿಂದ ಪಡೆಯಲಾಗಿದೆ',
    'status_in_transit': 'ದಾರಿಯಲ್ಲಿದೆ',
    'status_arrived': 'ಮನೆಬಾಗಿಲಿಗೆ ತಲುಪಿದೆ',
    'status_delivered': 'ಯಶಸ್ವಿಯಾಗಿ ತಲುಪಿಸಲಾಗಿದೆ',
    'status_cancelled': 'ರದ್ದುಗೊಳಿಸಲಾಗಿದೆ',
    'cancel_order': 'ಆರ್ಡರ್ ರದ್ದುಮಾಡಿ',

    // GPS & Live Tracker
    'gps_farmer_link': '🌾 ರೈತರ ತೋಟ GPS',
    'gps_route_link': '🗺️ ಮಾರ್ಗ ನಕ್ಷೆ',
    'gps_courier_link': '🚚 ಲೈವ್ ಕೊರಿಯರ್ GPS',
    'open_in_google_maps': '📍 ಗೂಗಲ್ ನಕ್ಷೆಯಲ್ಲಿ ತೆರೆಯಿರಿ ↗',
    'handover_code_title': 'ವಿತರಣೆ OTP ಕೋಡ್',
    'handover_code_hint': 'ವಸ್ತುಗಳನ್ನು ಪರಿಶೀಲಿಸಿದ ನಂತರ ಈ ಕೋಡ್ ಅನ್ನು ಡ್ರೈವರ್‌ಗೆ ನೀಡಿ.',

    // Hubs
    'namakkal_hub': 'ನಾಮಕ್ಕಲ್ ಕೃಷಿ ಡಿಪೋ',
    'salem_hub': 'ಸೇಲಂ ಸಾವಯವ ಹಣ್ಣಿನ ಡಿಪೋ',
    'coimbatore_hub': 'ಕೊಯಮತ್ತೂರು ಪ್ರಾದೇಶಿಕ ಕೇಂದ್ರ',
    'tamil_nadu': 'ತಮಿಳುನಾಡು, ಭಾರತ',

    // Farmer Portal specific
    'farmer_dashboard': 'ರೈತರ ಕಂಟ್ರೋಲ್ ಸೆಂಟರ್',
    'my_produce_listings': 'ನನ್ನ ಬೆಳೆಗಳ ಪಟ್ಟಿ',
    'add_new_product': 'ಹೊಸ ಬೆಳೆ ಸೇರಿಸಿ',
    'active_crop_orders': 'ಸಕ್ರಿಯ ಆರ್ಡರ್‌ಗಳು',
    'signal_dispatch': 'ವಾಹನವನ್ನು ಕರೆಯಿರಿ',
    'ai_crop_doctor': 'AI ಬೆಳೆ ವೈದ್ಯ',
    'ai_crop_advisory': 'AI ಬೆಳೆ ಸಲಹೆ'
  },

  te: {
    'hero_badge': "✨ 100% నేరుగా పొలం నుండి ఇంటికి • 0% దళారీ రుసుము",
    'hero_title': "🌱 పొలం నుండి తాజా ఉత్పత్తులు & స్మార్ట్ వ్యవసాయ కేంద్రం",
    'hero_subtitle': "3D పంట తనిఖీ, ఆటోమేటిక్ జీపీఎస్ డెలివరీ మరియు 0% దళారీ రుసుముతో నేరుగా స్వచ్ఛమైన ఆర్గానిక్ ఉత్పత్తుల మార్కెట్.",
    'quick_shop_now': "🛒 వెంటనే తాజా ఉత్పత్తులు కొనండి",
    'farmer_hub_title': "🌾 రైతు స్టూడియో & అమ్మకాలు",
    'delivery_fleet_title': "🚚 ఎక్స్‌ప్రెస్ డెలివరీ సర్వీస్",
    'mobile_app_title': "📱 3D మొబైల్ అనుభవం",
    'mandi_rates_title': "లైవ్ ఏపీఎంసీ మార్కెట్ ధరలు",
    'daily_reels_title': "🌾 లైవ్ వ్యవసాయ పంట కథనాలు",
    'daily_reels_sub': "30 నిమిషాల క్రితం అప్‌డేట్ చేయబడింది",
    'tag_zero_broker': "జీరో బ్రోకర్ ఫీజు గ్యారెంటీ",
    'tag_organic': "100% సర్టిఫైడ్ ఆర్గానిక్ ఉత్పత్తులు",
    'tag_gps': "3D ఇంటరాక్టివ్ విత్తన భౌతిక శాస్త్రం క్రియాశీలం",
    'launch_experience': "ఇప్పుడే ప్రారంభించండి ➔",
    'farmer_tagline': "స్వయంప్రతిపత్తి విత్తనం & ప్రత్యక్ష పంట",
    'farmer_desc': "పంట ఇన్వెంటరీని నిర్వహించండి, దళారీలు లేకుండా మీ స్వంత ధరలను మీరే నిర్ణయించండి మరియు నేరుగా ఆర్డర్‌లను పొందండి.",
    'customer_tagline': "ఆర్గానిక్ ఉత్పత్తులు & 3D తనిఖీ",
    'customer_desc': "3D తనిఖీతో తాజా ఆర్గానిక్ ఉత్పత్తులను కొనుగోలు చేయండి, రైతులతో నేరుగా బేరసారాలు చేయండి మరియు లైవ్ ట్రాకింగ్ చేయండి.",
    'delivery_tagline': "కోల్డ్-చైన్ లాజిస్టిక్స్ & లైవ్ రాడార్",
    'delivery_desc': "డెలివరీ పనులను స్వీకరించండి, లైవ్ జీపీఎస్ నావిగేషన్ ఉపయోగించండి మరియు తక్షణ ఆదాయాన్ని పొందండి.",

    // Top Bar & Navigation
    'app_name': 'అగ్రిలింక్',
    'select_language': 'భాషను ఎంచుకోండి',
    'portal_farmer': '🌾 రైతు ప్రత్యక్ష పోర్టల్',
    'portal_delivery': '🚚 డెలివరీ లాజిస్టిక్స్ హబ్',
    'portal_customer': '🛒 కస్టమర్ మార్కెట్',
    'portal_ecosystem': 'అగ్రిలింక్ పర్యావరణం',
    'switch_role': 'పాత్ర మార్చు',
    'install_app': 'యాప్ ఇన్‌స్టాల్ చేయండి',
    'logout': 'లాగ్ అవుట్',
    'login': 'లాగిన్ / సైన్ అప్',
    'deliver_to': 'డెలివరీ స్థలం:',
    'express_delivery': '⚡ 2 గంటల తాజా డెలివరీ',
    'agricoins': '🪙 అగ్రికాయిన్స్',
    'zero_broker_fee': '0% దళారీ రుసుము • 100% రైతులకు',
    'search_placeholder': 'తాజా కూరగాయలు, పండ్లు, విత్తనాలు వెతకండి...',
    'voice_search': 'వాయిస్ సెర్చ్',
    'clear': 'క్లియర్',

    // Categories
    'cat_all': 'అన్ని ఉత్పత్తులు',
    'cat_fruits': 'పండ్లు',
    'cat_veggies': 'కూరగాయలు',
    'cat_seeds': 'విత్తనాలు',
    'cat_dairy': 'పాలు & నెయ్యి',
    'cat_bio': 'సేంద్రీయ ఎరువులు',
    'cat_deals': 'ప్రత్యేక ఆఫర్లు',

    // Marketplace & Products
    'direct_farm_produce': 'రైతుల నుండి నేరుగా ఉత్పత్తులు',
    'in_stock': 'అందుబాటులో ఉంది',
    'out_of_stock': 'అందుబాటులో లేదు',
    'add_to_cart': 'కార్ట్‌కు జోడించు',
    'added': '✓ జోడించబడింది',
    'buy_now': 'ఇప్పుడే కొనండి',
    'bargain_now': 'ధర బేరం చేయండి',
    'harvested_on': 'కోత తేదీ',
    'reviews': 'సమీక్షలు',
    'verified_organic': '100% సేంద్రీయ ధృవీకరణ',
    'farmer_label': 'రైతు',
    'price_per_unit': 'ధర / కొలత',

    // Cart & Checkout
    'your_cart': 'మీ కార్ట్',
    'cart_empty': 'మీ కార్ట్ ఖాళీగా ఉంది',
    'subtotal': 'ఉపమొత్తం',
    'delivery_fee': 'డెలివరీ ఛార్జీ',
    'free_delivery': 'ఉచితం',
    'total_amount': 'మొత్తం చెల్లింపు',
    'checkout': 'ఆర్డర్ పూర్తి చేయండి',
    'pay_online': 'ఆన్‌లైన్ చెల్లింపు (UPI / కార్డ్)',
    'cash_on_delivery': 'డెలివరీ సమయంలో నగదు',

    // UPI & Payment Portal
    'payment_portal_title': 'అగ్రిలింక్ సురక్షిత చెల్లింపు పోర్టల్',
    'scan_upi_qr': 'UPI QR కోడ్‌ను స్కాన్ చేయండి',
    'in_app_upi_transfer': 'నేరుగా UPI బ్యాంక్ బదిలీ',
    'card_netbanking': 'డెబిట్ / క్రెడిట్ కార్డ్ & నెట్‌బ్యాంకింగ్',
    'scan_with_app': 'ఏదైనా UPI యాప్‌తో స్కాన్ చేయండి',
    'open_scanner_hint': 'Google Pay, PhonePe, Paytm లేదా BHIM ద్వారా చెల్లించండి',
    'select_bank': 'బ్యాంక్ ఖాతాను ఎంచుకోండి',
    'enter_mpin': '4-అంకెల UPI MPIN నమోదు చేయండి',
    'verifying_payment': 'చెల్లింపు ధృవీకరించబడుతోంది...',
    'payment_success': 'చెల్లింపు విజయవంతమైంది!',
    'download_receipt': 'రసీదు డౌన్‌లోడ్ (PDF)',

    // Orders & Tracking
    'orders_tab': 'నా ఆర్డర్లు',
    'active_orders': 'యాక్టివ్ ఆర్డర్లు',
    'past_orders': 'ఆర్డర్ హిస్టరీ',
    'order_id': 'ఆర్డర్ ఐడి',
    'order_details': 'ఆర్డర్ వివరాలు & దశలు',
    'live_radar_map': 'లైవ్ రాడార్ మ్యాప్',
    'producer_farm': 'ఉత్పత్తి చేసిన పొలం',
    'delivery_partner': 'డెలివరీ భాగస్వామి',
    'customer_destination': 'చేరుకోవాల్సిన చిరునామా',
    'order_status': 'స్థితి',
    'status_pending': 'రైతు ఆమోదం కోసం వేచి ఉంది',
    'status_confirmed': 'రైతు ధృవీకరించారు',
    'status_packed': 'ప్యాక్ చేయబడింది',
    'status_assigned': 'డ్రైవర్ కేటాయించబడ్డారు',
    'status_picked_up': 'పొలం నుండి తీసుకున్నారు',
    'status_in_transit': 'డెలివరీ దారిలో ఉంది',
    'status_arrived': 'ఇంటి వద్దకు చేరుకుంది',
    'status_delivered': 'విజయవంతంగా డెలివరీ చేయబడింది',
    'status_cancelled': 'రద్దు చేయబడింది',
    'cancel_order': 'ఆర్డర్ రద్దు చేయండి',

    // GPS & Live Tracker
    'gps_farmer_link': '🌾 రైతు పొలం GPS',
    'gps_route_link': '🗺️ మార్గం మ్యాప్',
    'gps_courier_link': '🚚 లైవ్ కొరియర్ GPS',
    'open_in_google_maps': '📍 గూగుల్ మ్యాప్స్‌లో తెరవండి ↗',
    'handover_code_title': 'డోర్‌స్టెప్ హ్యాండోవర్ OTP',
    'handover_code_hint': 'వస్తువులను పరిశీలించిన తర్వాత ఈ కోడ్‌ను డెలివరీ వ్యక్తికి చెప్పండి.',

    // Hubs
    'namakkal_hub': 'నమక్కల్ వ్యవసాయ డిపో',
    'salem_hub': 'సేలం సేంద్రీయ పండ్ల డిపో',
    'coimbatore_hub': 'కోయంబత్తూరు ప్రాంతీయ కేంద్రం',
    'tamil_nadu': 'తమిళనాడు, భారతదేశం',

    // Farmer Portal specific
    'farmer_dashboard': 'రైతు కంట్రోల్ సెంటర్',
    'my_produce_listings': 'నా పంటల జాబితా',
    'add_new_product': 'కొత్త పంటను జోడించు',
    'active_crop_orders': 'యాక్టివ్ ఆర్డర్లు',
    'signal_dispatch': 'వాహనాన్ని పిలవండి',
    'ai_crop_doctor': 'AI పంట డాక్టర్',
    'ai_crop_advisory': 'AI పంట సలహా'
  },

  ml: {
    'hero_badge': "✨ 100% തോട്ടത്തിൽ നിന്ന് നേരിട്ട് വീട്ടിലേക്ക് • 0% കമ്മീഷൻ",
    'hero_title': "🌱 തോട്ടത്തിൽ നിന്ന് നേരിട്ടുള്ള ഉൽപ്പന്നങ്ങളും കാർഷിക കേന്ദ്രവും",
    'hero_subtitle': "3D വിള പരിശോധന, ലൈവ് ജിപിഎസ് ഡെലിവറി, 0% ഇടനിലക്കാരില്ലാത്ത നേരിട്ടുള്ള ജൈവ ഉൽപ്പന്ന വിപണി.",
    'quick_shop_now': "🛒 ഉടനടി പുതിയ വിളകൾ വാങ്ങുക",
    'farmer_hub_title': "🌾 കർഷക സ്റ്റുడియో & വിപണനം",
    'delivery_fleet_title': "🚚 എക്സ്പ്രസ് വിതരണ ശൃംഖല",
    'mobile_app_title': "📱 3D മൊബൈൽ അനുഭവം",
    'mandi_rates_title': "തത്സമയ വിപണി നിരക്കുകൾ",
    'daily_reels_title': "🌾 ലൈവ് കാർഷിക കൊയ്ത്ത് വീഡിയോകൾ",
    'daily_reels_sub': "30 മിനിറ്റ് മുമ്പ് അപ്ഡേറ്റ് ചെയ്തത്",
    'tag_zero_broker': "ഇടനിലക്കാരില്ലാത്ത 100% വരുമാനം",
    'tag_organic': "100% സർട്ടിഫൈഡ് ജൈവ ഉൽപ്പന്നങ്ങൾ",
    'tag_gps': "3D ഇന്ററാക്ടീവ് വിതയ്ക്കൽ ഫിസിക്സ് സജീവം",
    'launch_experience': "ഇപ്പോൾ ആരംഭിക്കുക ➔",
    'farmer_tagline': "സ്വയംപര്യാപ്ത കൃഷിയും നേരിട്ടുള്ള വിപണനവും",
    'farmer_desc': "വിളവെടുപ്പ് നിയന്ത്രിക്കുക, ഇടനിലക്കാരില്ലാതെ സ്വന്തം വില നിശ്ചയിക്കുക, ഉപഭോക്താക്കളിൽ നിന്ന് നേരിട്ട് ഓർഡറുകൾ സ്വീകരിക്കുക.",
    'customer_tagline': "ജൈവ ഉൽപ്പന്നങ്ങളും 3D പരിശോധനയും",
    'customer_desc': "3D ഗുണനിലവാര പരിശോധനയോടെ പുതിയ ജൈവ ഉൽപ്പന്നങ്ങൾ തിരഞ്ഞെടുക്കുക, വില പേശി വാങ്ങുക, തത്സമയം ട്രാക്ക് ചെയ്യുക.",
    'delivery_tagline': "കോൾഡ് ചെയിൻ ലോജിസ്റ്റിക്സും ലൈവ് റഡാറും",
    'delivery_desc': "ഡെലിവറി ഓർഡറുകൾ സ്വീകരിക്കുക, തത്സമയ ജിപിഎസ് നാവിഗേഷൻ വഴി കൃത്യസമയത്ത് എത്തിക്കുക.",

    // Top Bar & Navigation
    'app_name': 'അഗ്രിലിങ്ക്',
    'select_language': 'ഭാഷ തിരഞ്ഞെടുക്കുക',
    'portal_farmer': '🌾 കർഷക പോർട്ടൽ',
    'portal_delivery': '🚚 ഡെലിവറി ലോജിസ്റ്റിക്സ് ഹബ്',
    'portal_customer': '🛒 ഉപഭോക്തൃ വിപണി',
    'portal_ecosystem': 'അഗ്രിലിങ്ക് പരിസ്ഥിതി',
    'switch_role': 'റോൾ മാറ്റുക',
    'install_app': 'ആപ്പ് ഇൻസ്റ്റാൾ ചെയ്യുക',
    'logout': 'ലോഗ് ഔട്ട്',
    'login': 'ലോഗിൻ / സൈൻ അപ്പ്',
    'deliver_to': 'ഡെലിവറി സ്ഥലം:',
    'express_delivery': '⚡ 2 മണിക്കൂർ അതിവേഗ വിളവെടുപ്പ്',
    'agricoins': '🪙 അഗ്രികോയിൻസ്',
    'zero_broker_fee': '0% ഇടനിലക്കാരില്ല • 100% കർഷകർക്ക്',
    'search_placeholder': 'പഴങ്ങൾ, പച്ചക്കറികൾ, വിത്തുകൾ തിരയുക...',
    'voice_search': 'ശബ്ദ തിരയൽ',
    'clear': 'മായ്ക്കുക',

    // Categories
    'cat_all': 'എല്ലാ വിളകളും',
    'cat_fruits': 'പഴങ്ങൾ',
    'cat_veggies': 'പച്ചക്കറികൾ',
    'cat_seeds': 'വിത്തുകൾ',
    'cat_dairy': 'പാൽ & നെയ്യ്',
    'cat_bio': 'ജൈവ വളങ്ങൾ',
    'cat_deals': 'പ്രത്യേക ഓഫറുകൾ',

    // Marketplace & Products
    'direct_farm_produce': 'നേരിട്ടുള്ള ഫാം ഉൽപ്പന്നങ്ങൾ',
    'in_stock': 'സ്റ്റോക്കുണ്ട്',
    'out_of_stock': 'സ്റ്റോക്കില്ല',
    'add_to_cart': 'കാർട്ടിൽ ചേർക്കുക',
    'added': '✓ ചേർത്തു',
    'buy_now': 'ഇപ്പോൾ വാങ്ങുക',
    'bargain_now': 'വില പേശുക',
    'harvested_on': 'വിളവെടുത്ത തീയതി',
    'reviews': 'അവലോകനങ്ങൾ',
    'verified_organic': '100% സാക്ഷ്യപ്പെടുത്തിയ ജൈവ ഉൽപ്പന്നം',
    'farmer_label': 'കർഷകൻ',
    'price_per_unit': 'വില / യൂണിറ്റ്',

    // Cart & Checkout
    'your_cart': 'നിങ്ങളുടെ കാർട്ട്',
    'cart_empty': 'നിങ്ങളുടെ കാർട്ട് ശൂന്യമാണ്',
    'subtotal': 'ആകെ തുക',
    'delivery_fee': 'ഡെലിവറി നിരക്ക്',
    'free_delivery': 'സൗജന്യം',
    'total_amount': 'ആകെ അടയ്ക്കേണ്ട തുക',
    'checkout': 'ഓർഡർ പൂർത്തിയാക്കുക',
    'pay_online': 'ഓൺലൈൻ പേയ്മെന്റ് (UPI / കാർഡ്)',
    'cash_on_delivery': 'ഡെലിവറി സമയത്ത് പണം നൽകുക',

    // UPI & Payment Portal
    'payment_portal_title': 'അഗ്രിലിങ്ക് സുരക്ഷിത പേയ്മെന്റ് പോർട്ടൽ',
    'scan_upi_qr': 'യഥാർത്ഥ UPI QR കോഡ് സ്കാൻ ചെയ്യുക',
    'in_app_upi_transfer': 'ഡയറക്റ്റ് UPI ബാങ്ക് ട്രാൻസ്ഫർ',
    'card_netbanking': 'ഡെബിറ്റ് / ക്രെഡിറ്റ് കാർഡ് & നെറ്റ്ബാങ്കിംഗ്',
    'scan_with_app': 'ഏതെങ്കിലും UPI ആപ്പ് ഉപയോഗിച്ച് സ്കാൻ ചെയ്യുക',
    'open_scanner_hint': 'Google Pay, PhonePe, Paytm അല്ലെങ്കിൽ BHIM വഴി പണമടയ്ക്കുക',
    'select_bank': 'ബാങ്ക് അക്കൗണ്ട് തിരഞ്ഞെടുക്കുക',
    'enter_mpin': '4-അക്ക UPI MPIN നൽകുക',
    'verifying_payment': 'NPCI സുരക്ഷിത പേയ്മെന്റ് പരിശോധിക്കുന്നു...',
    'payment_success': 'പേയ്മെന്റ് വിജയകരമായി പൂർത്തിയായി!',
    'download_receipt': 'രസീത് ഡൗൺലോഡ് ചെയ്യുക (PDF)',

    // Orders & Tracking
    'orders_tab': 'എന്റെ ഓർഡറുകൾ',
    'active_orders': 'സജീവ ഓർഡറുകൾ',
    'past_orders': 'ഓർഡർ ചരിത്രം',
    'order_id': 'ഓർഡർ നമ്പർ',
    'order_details': 'ഓർഡർ വിശദാംശങ്ങൾ',
    'live_radar_map': 'തത്സമയ റഡാർ മാപ്പ്',
    'producer_farm': 'ഉത്പാദിപ്പിച്ച തോട്ടം',
    'delivery_partner': 'ഡെലിവറി പങ്കാളി',
    'customer_destination': 'എത്തിക്കേണ്ട വിലാസം',
    'order_status': 'അവസ്ഥ',
    'status_pending': 'കർഷകന്റെ സ്ഥിരീകരണത്തിനായി കാത്തിരിക്കുന്നു',
    'status_confirmed': 'കർഷകൻ സ്ഥിരീകരിച്ചു',
    'status_packed': 'പാക്ക് ചെയ്തു',
    'status_assigned': 'ഡ്രൈവറെ നിയോഗിച്ചു',
    'status_picked_up': 'തോട്ടത്തിൽ നിന്ന് എടുത്തു',
    'status_in_transit': 'വഴിയിലാണ്',
    'status_arrived': 'വീട്ടുപടിക്കൽ എത്തി',
    'status_delivered': 'വിജയകരമായി കൈമാറി',
    'status_cancelled': 'റദ്ദാക്കി',
    'cancel_order': 'ഓർഡർ റദ്ദാക്കുക',

    // GPS & Live Tracker
    'gps_farmer_link': '🌾 കർഷക ഫാം GPS',
    'gps_route_link': '🗺️ റൂട്ട് മാപ്പ്',
    'gps_courier_link': '🚚 ലൈവ് കൊറിയർ GPS',
    'open_in_google_maps': '📍 ഗൂഗിൾ മാപ്പിൽ തുറക്കുക ↗',
    'handover_code_title': 'ഹാൻഡ്ഓവർ സുരക്ഷാ OTP',
    'handover_code_hint': 'സാധനങ്ങൾ പരിശോധിച്ച ശേഷം ഈ കോഡ് ഡ്രൈവർക്ക് നൽകുക.',

    // Hubs
    'namakkal_hub': 'നാമക്കൽ കാർഷിക ഡിപ്പോ',
    'salem_hub': 'സേലം ജൈവ തോട്ടം ഡിപ്പോ',
    'coimbatore_hub': 'കോയമ്പത്തൂർ പ്രാദേശിക കേന്ദ്രം',
    'tamil_nadu': 'തമിഴ്നാട്, ഇന്ത്യ',

    // Farmer Portal specific
    'farmer_dashboard': 'കർഷക നിയന്ത്രണ കേന്ദ്രം',
    'my_produce_listings': 'എന്റെ വിളകൾ',
    'add_new_product': 'പുതിയ വിള ചേർക്കുക',
    'active_crop_orders': 'സജീവ ഓർഡറുകൾ',
    'signal_dispatch': 'വാഹനം വിളിക്കുക',
    'ai_crop_doctor': 'AI വിള ഡോക്ടർ',
    'ai_crop_advisory': 'AI വിള ഉപദേശം'
  }
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    try {
      const saved = localStorage.getItem('agrilink_language');
      if (saved && TRANSLATIONS[saved]) return saved;
      // Default to Tamil (or English)
      return 'en';
    } catch {
      return 'en';
    }
  });

  const setLanguage = (langCode) => {
    if (TRANSLATIONS[langCode]) {
      setLanguageState(langCode);
      try {
        localStorage.setItem('agrilink_language', langCode);
        document.documentElement.lang = langCode;
        window.dispatchEvent(new CustomEvent('agrilink-language-change', { detail: { language: langCode } }));
      } catch (err) {
        console.warn('Could not persist language to localStorage:', err);
      }
    }
  };

  /**
   * Translate function
   * @param {string} key - The dictionary key or fallback text
   * @param {string} fallbackText - Optional default text if key not found
   */
  const t = (key, fallbackText) => {
    if (!key) return '';
    const currentDict = TRANSLATIONS[language] || TRANSLATIONS.en;
    if (currentDict[key]) return currentDict[key];

    // Try finding by exact text in English dictionary
    const enDict = TRANSLATIONS.en;
    const foundKey = Object.keys(enDict).find(k => enDict[k] === key || enDict[k] === fallbackText);
    if (foundKey && currentDict[foundKey]) {
      return currentDict[foundKey];
    }

    return fallbackText || key;
  };

  const currentLangMeta = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, languages: LANGUAGES, currentLangMeta }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    // Fallback safe dummy context if used outside provider
    return {
      language: 'en',
      setLanguage: () => {},
      t: (k, fb) => fb || k,
      languages: LANGUAGES,
      currentLangMeta: LANGUAGES[0]
    };
  }
  return ctx;
}
