const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const axios = require("axios");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.post("/grade", async (req, res) => {
    const { essayText, rubric } = req.body;

    if (!essayText || !rubric) {
        return res.status(400).json({ 
            error: "Missing required fields",
            details: !essayText ? "essayText is required" : "rubric is required"
        });
    }

    try {
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro-001:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
                contents: [{
                    parts: [{
                        text: `Grade this essay (grades only A-F):
1. Writing (grammar, style)
2. Content (argument, evidence)
3. Structure (organization)
4. Overall grade

Format: Just number, grade, and 1-2 key points per section.
Essay: ${essayText}`
                    }]
                }],
                generationConfig: {
                    temperature: 0.3,
                    maxOutputTokens: 500,
                    topP: 0.5,
                    topK: 20
                }
            }
        );

        if (!response.data.candidates || !response.data.candidates[0]?.content?.parts[0]?.text) {
            throw new Error("Invalid response format from Gemini API");
        }

        const feedback = response.data.candidates[0].content.parts[0].text;
        res.json({ feedback });

    } catch (error) {
        console.error("Error details:", {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });

        if (error.response?.status === 401) {
            return res.status(401).json({ 
                error: "Invalid API key",
                details: "Please check your Gemini API key configuration"
            });
        }

        if (error.response?.status === 429) {
            return res.status(429).json({ 
                error: "Rate limit exceeded",
                details: "Please try again later"
            });
        }

        res.status(500).json({ 
            error: "Failed to get feedback from AI",
            details: error.message
        });
    }
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
