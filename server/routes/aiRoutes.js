const express = require('express');
const router = express.Router();
const { diagnoseCrop, recipeAssistant } = require('../controllers/aiController');

// Crop disease analysis
router.post('/diagnose-crop', diagnoseCrop);

// Interactive Recipe Studio AI Assistant
router.post('/recipe-assistant', recipeAssistant);

module.exports = router;
