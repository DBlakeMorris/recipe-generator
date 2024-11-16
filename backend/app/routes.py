from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from .models import RecipeGenerator, PantryManager

router = APIRouter()

# Initialize recipe generator and pantry manager
recipe_generator = RecipeGenerator()
pantry_manager = PantryManager()

@router.post("/api/generate-titles")
async def generate_titles(request: Request):
    data = await request.json()
    titles = recipe_generator.generate_titles(data['ingredients'], data.get('preferences'))
    return JSONResponse({"titles": titles})

@router.post("/api/generate-recipe")
async def generate_recipe(request: Request):
    data = await request.json()
    recipe = recipe_generator.generate_full_recipe(
        data['title'], 
        data['ingredients'], 
        data.get('preferences')
    )
    return JSONResponse(recipe)

@router.post("/api/save-recipe")
async def save_recipe(request: Request):
    data = await request.json()
    updated_list = pantry_manager.add_recipe(data)
    return JSONResponse({"recipes": updated_list})

@router.post("/api/remove-recipe")
async def remove_recipe(request: Request):
    data = await request.json()
    updated_list = pantry_manager.remove_recipe(data['title'])
    return JSONResponse({"recipes": updated_list})

@router.get("/api/recipes")
async def get_recipes():
    recipes = pantry_manager.get_recipe_list()
    return JSONResponse({"recipes": recipes})