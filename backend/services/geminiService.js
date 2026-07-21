// backend/services/geminiService.js

const { GoogleGenAI } = require('@google/genai');

// Initialize the Google Gen AI SDK using the API key from environment variables
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// 1. Service function for AI Gift Recommendations
const generateGiftRecommendation = async (userPreferences) => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Suggest handmade gift ideas based on these preferences: ${userPreferences}. Keep it concise and warm.`,
        });
        return response.text;
    } catch (error) {
        console.error('Gemini API Error (Gift Recommendation):', error);
        throw new Error('Failed to generate gift recommendations');
    }
};

// 2. Service function for AI Product Descriptions
const generateProductDescription = async (productTitle, keyFeatures) => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Write an engaging, premium e-commerce product description for a handmade item titled "${productTitle}" with these features: ${keyFeatures}. Use a warm, artisan tone.`,
        });
        return response.text;
    } catch (error) {
        console.error('Gemini API Error (Product Description):', error);
        throw new Error('Failed to generate product description');
    }
};

// 3. Service function for AI Instagram Captions
const generateInstagramCaption = async (productName, details) => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Write a catchy Instagram caption with emojis and relevant hashtags for a handmade product named "${productName}". Details: ${details}`,
        });
        return response.text;
    } catch (error) {
        console.error('Gemini API Error (Instagram Caption):', error);
        throw new Error('Failed to generate Instagram caption');
    }
};

module.exports = {
    generateGiftRecommendation,
    generateProductDescription,
    generateInstagramCaption
};