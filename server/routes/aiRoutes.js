const express = require('express');
const router = express.Router();
const {
  cropAdvisory,
  askAgriLinkAi,
  diagnoseCrop,
  recipeAssistant
} = require('../controllers/aiController');

// Multi-variable Crop Recommendation Advisory
router.post('/crop-advisory', cropAdvisory);

// Dedicated Agricultural Assistant (Voice + Text)
router.post('/ask-agrilink', askAgriLinkAi);

// Crop disease analysis with blurry image protection
router.post('/diagnose-crop', diagnoseCrop);

// Interactive Recipe Studio AI Assistant with strict context handling
router.post('/recipe-assistant', recipeAssistant);

module.exports = router;
