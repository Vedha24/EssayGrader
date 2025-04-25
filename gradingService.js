const axios = require('axios');
const config = require('../config/config');
const crypto = require('crypto');

class GradingService {
    constructor() {
        // Initialize cache with a maximum of 100 entries
        this.cache = new Map();
        this.maxCacheSize = 100;
    }

    // Generate a cache key based on essay and rubric
    generateCacheKey(essayText, rubric) {
        const hash = crypto.createHash('md5');
        hash.update(essayText + rubric);
        return hash.digest('hex');
    }

    // Manage cache size
    manageCache() {
        if (this.cache.size > this.maxCacheSize) {
            // Remove the oldest entries
            const entriesToDelete = this.cache.size - this.maxCacheSize;
            const keys = Array.from(this.cache.keys()).slice(0, entriesToDelete);
            keys.forEach(key => this.cache.delete(key));
        }
    }

    async gradeEssay(essayText, rubric) {
        try {
            // Optimize the prompt to be more concise
            const prompt = `Grade this essay (grades only A-F):
1. Writing (grammar, style)
2. Content (argument, evidence)
3. Structure (organization)
4. Overall grade

Format: Just number, grade, and 1-2 key points per section.
Essay: ${essayText}`;

            const response = await axios.post(
                `${config.geminiApiUrl}?key=${config.geminiApiKey}`,
                {
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }],
                    // Optimize generation parameters for speed
                    temperature: 0.3, // Lower temperature for more focused output
                    maxOutputTokens: 500, // Limit response length
                    topP: 0.5, // More focused sampling
                    topK: 20, // More focused token selection
                    candidateCount: 1 // Only generate one response
                }
            );

            if (!response.data.candidates || !response.data.candidates[0]?.content?.parts[0]?.text) {
                throw new Error("Invalid response format from Gemini API");
            }

            const feedback = response.data.candidates[0].content.parts[0].text;
            
            // Cache the result
            const cacheKey = this.generateCacheKey(essayText, rubric);
            this.cache.set(cacheKey, feedback);
            this.manageCache();

            return feedback;
        } catch (error) {
            console.error("Grading service error:", {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });

            if (error.response?.status === 401) {
                throw new Error("Invalid API key configuration");
            }

            if (error.response?.status === 429) {
                throw new Error("Rate limit exceeded. Please try again later");
            }

            throw new Error(error.message || "Failed to grade essay");
        }
    }
}

module.exports = new GradingService(); 