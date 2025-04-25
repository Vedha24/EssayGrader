require('dotenv').config();

module.exports = {
    port: process.env.PORT || 3000,
    geminiApiKey: process.env.GEMINI_API_KEY,
    geminiApiUrl: 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro-001:generateContent'
}; 