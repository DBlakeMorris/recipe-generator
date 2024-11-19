from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genai
import json
from datetime import datetime
import os

# Initialize FastAPI
app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Recipe Generator API is running"}

# Configure the API
genai.configure(api_key='AIzaSyCfM0vm3xCDM2U-UOL9X-eD_cIbqQ7peXk')

class RecipeGenerator:
    def __init__(self):
        """Initialize the recipe generator with Gemini"""
        try:
            print("Initializing Gemini model...")
            self.model = genai.GenerativeModel('gemini-pro')
            print("Model initialized successfully!")
        except Exception as e:
            print(f"Error in initialization: {str(e)}")
            self.model = None

    def generate_titles(self, ingredients, preferences=None):
        """Generate 5 possible recipe titles using Gemini"""
        try:
            prompt = f"""
            Create 5 COMPLETELY DIFFERENT and unique recipe titles using these ingredients: {ingredients}
            {f'Considering these preferences: {preferences}' if preferences else ''}
            Rules for titles:
            - Each must be VERY different from the others
            - Each must use different cooking methods
            - Each should have a different cuisine influence
            - Make them creative and appetizing
            - Number them 1-5
            - Each title should be 3-7 words long
            """

            response = self.model.generate_content(prompt)
            titles = response.text.strip().split('\n')
            titles = [t.strip().split('.', 1)[-1].strip() for t in titles if t.strip() and any(c.isdigit() for c in t)]
            titles = [t.strip('.- 1234567890') for t in titles]
            titles = list(dict.fromkeys(titles))

            while len(titles) < 5:
                style = ['Grilled', 'Baked', 'Sautéed', 'Roasted', 'Stir-Fried'][len(titles)]
                main_ingredient = ingredients.split(',')[0].strip().capitalize()
                titles.append(f"{style} {main_ingredient} Special")

            return titles[:5]

        except Exception as e:
            print(f"Error generating titles: {e}")
            return [f"Quick {ingredients.split(',')[0].capitalize()} Dish"] * 5

    def generate_full_recipe(self, title, ingredients, preferences=None):
        """Generate full recipe for selected title"""
        try:
            prompt = f"""
            Create a detailed recipe for: {title}
            Using these ingredients: {ingredients}
            {f'Preferences: {preferences}' if preferences else ''}
            Follow this EXACT format:
            [TITLE]
            {title}
            DESCRIPTION:
            [Write a brief 2-3 sentence description of the dish]
            PREPARATION TIME: [X] minutes
            COOKING TIME: [X] minutes
            SERVINGS: [X]
            INGREDIENTS:
            - [List each ingredient with exact measurements]
            INSTRUCTIONS:
            1. [First step]
            2. [Second step]
            [Continue with all steps]
            TIPS:
            - [Add 2-3 cooking tips specific to this recipe]
            """

            response = self.model.generate_content(prompt)
            return {"title": title, "content": response.text}

        except Exception as e:
            return {"title": "Error", "content": str(e)}

# Initialize recipe generator
recipe_generator = RecipeGenerator()

# For Vercel, we'll keep recipes in memory (this will reset on deploy)
saved_recipes = []

# API Routes
@app.post("/api/generate-titles")
async def generate_titles(request: Request):
    data = await request.json()
    titles = recipe_generator.generate_titles(data['ingredients'], data.get('preferences'))
    return JSONResponse({"titles": titles})

@app.post("/api/generate-recipe")
async def generate_recipe(request: Request):
    data = await request.json()
    recipe = recipe_generator.generate_full_recipe(
        data['title'], 
        data['ingredients'], 
        data.get('preferences')
    )
    return JSONResponse(recipe)

@app.post("/api/save-recipe")
async def save_recipe(request: Request):
    data = await request.json()
    data['saved_date'] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    saved_recipes.append(data)
    return JSONResponse({"recipes": [recipe['title'] for recipe in saved_recipes]})

@app.post("/api/remove-recipe")
async def remove_recipe(request: Request):
    try:
        data = await request.json()
        print("Received data:", data)
        recipe_title = data.get('title')
        if not recipe_title:
            return JSONResponse({"error": "Title is required"}, status_code=400)
        
        global saved_recipes
        saved_recipes = [r for r in saved_recipes if r['title'] != recipe_title]
        return JSONResponse({"recipes": [recipe['title'] for recipe in saved_recipes]})
    except Exception as e:
        print("Error removing recipe:", e)
        return JSONResponse({"error": str(e)}, status_code=500)

@app.get("/api/recipes")
async def get_recipes():
    return JSONResponse({"recipes": [recipe['title'] for recipe in saved_recipes]})

if __name__ == "__main__":
    import uvicorn
    print("Starting Recipe Generator...")
    uvicorn.run(app, host="0.0.0.0", port=8000)