# Grandma's AI Recipe Generator

An AI-powered recipe generator that creates delicious recipes using a Gemini API - it was crafted for my Grandma as a quirky Xmas gift! 🎅

## Features
- Generate recipe ideas from ingredients
- Get detailed cooking instructions
- Save favorite recipes
- Intuitive UI

## How to Use
- Simply list the food ingredients of your choosing in the first box - ideally seperated with a comma (e.g., salmon, potatoes, peas).
- In the second box, i.e., 'any special requests' feel free to state your preferences such as "not spicy", "French style", "Marco Pierre-White inspired" or "serving only 3 people" - be as imaginitive and 'picky' as you wish.
- Select from a list of 5 recipes, should none be to your liking, tune the output by adding further information to the two boxes as appropriate. However any majoy changes (like how many people are to be served), simply reset and try again.
- At the bottom of each generated recipe, there is a button "Save to Grandma's Pantry" click this for each of your favorte recipes for later use - held in the "Grandma's Pantry" tab!

## Technical Implementation
This seemingly simple recipe generator incorporates several complex technical components:

### LLM Integration
- Optimized prompt engineering for consistent recipe formatting and content quality
- Multi-stage response validation to ensure food safety and recipe completeness
- Context-aware response generation handling multiple user constraints simultaneously
- Rate limiting and error handling for API stability

### Response Processing
- Natural language processing for ingredient parsing and validation
- Dynamic response formatting to maintain consistent recipe structure
- Real-time response optimization for performance

### System Architecture
- Serverless backend deployment optimized for scalability
- Stateless API design with robust error handling
- Secure API key management and request validation
- Frontend state management for recipe storage and retrieval

### User Experience
- Intelligent response caching for frequently requested combinations
- Real-time input validation and suggestion system
- Persistent storage for saved recipes with efficient retrieval
- Responsive design adapting to various device sizes and orientations

## Live Demo
https://dblakemorris.github.io/recipe-generator

## Local Development

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
python main.py
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
