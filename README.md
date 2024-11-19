# Grandma's AI Recipe Generator

An AI-powered recipe generator that creates delicious recipes using a Gemini API - it was crafted for my Grandma as a quirky Xmas gift! 

## Features
- Generate recipe ideas from ingredients
- Get detailed cooking instructions
- Save favorite recipes
- Intuitive UI

## How to Use
- Simply list the food ingredients of your choosing in the first box - ideally seperated with a comma (e.g., salmon, potatoes, peas)
- In the second box, i.e., 'any special requests' feel free to state your preferences such as "not spicy", "French style", "Marco Pierre-White inspired" or "serving only 3 people" - be as imaginitive and 'picky' as you'd like

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
