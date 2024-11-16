import google.generativeai as genai
import json
from datetime import datetime

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

class PantryManager:
    def __init__(self, pantry_file="grandmas_pantry.json"):
        self.pantry_file = pantry_file
        self.load_pantry()

    def load_pantry(self):
        """Load saved recipes from file"""
        try:
            with open(self.pantry_file, 'r') as f:
                self.pantry = json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            self.pantry = []

    def save_pantry(self):
        """Save recipes to file"""
        with open(self.pantry_file, 'w') as f:
            json.dump(self.pantry, f, indent=4)

    def add_recipe(self, recipe_data):
        """Add a recipe to the pantry"""
        recipe_data['saved_date'] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        self.pantry.append(recipe_data)
        self.save_pantry()
        return self.get_recipe_list()

    def remove_recipe(self, recipe_title):
        """Remove a recipe from the pantry"""
        self.pantry = [r for r in self.pantry if r['title'] != recipe_title]
        self.save_pantry()
        return self.get_recipe_list()

    def get_recipe_list(self):
        """Get list of saved recipe titles"""
        return [recipe['title'] for recipe in self.pantry]

    def get_recipe(self, title):
        """Get a specific recipe by title"""
        for recipe in self.pantry:
            if recipe['title'] == title:
                return recipe
        return None