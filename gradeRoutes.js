const express = require('express');
const router = express.Router();
const gradingService = require('../services/gradingService');

// Middleware to validate request body
const validateGradeRequest = (req, res, next) => {
    let { essayText, rubric } = req.body;
    // Trim input fields
    essayText = typeof essayText === 'string' ? essayText.trim() : '';
    rubric = typeof rubric === 'string' ? rubric.trim() : '';
    req.body.essayText = essayText;
    req.body.rubric = rubric;

    if (!essayText) {
        return res.status(400).json({ 
            error: "Missing required fields",
            details: "essayText is required and cannot be empty or whitespace"
        });
    }
    if (!rubric) {
        return res.status(400).json({ 
            error: "Missing required fields",
            details: "rubric is required and cannot be empty or whitespace"
        });
    }
    next();
};

// Grade essay endpoint
router.post('/grade', validateGradeRequest, async (req, res) => {
    const { essayText, rubric } = req.body;

    try {
        const feedback = await gradingService.gradeEssay(essayText, rubric);
        res.json({ feedback });
    } catch (error) {
        console.error("Route handler error:", error.message);
        res.status(500).json({ 
            error: "Failed to grade essay",
            details: error.message
        });
    }
});

module.exports = router; 