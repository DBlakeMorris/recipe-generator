"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RefreshCw } from "lucide-react"

const API_URL = 'https://recipe-generator-zeta.vercel.app'

interface Recipe {
  title: string
  content: string
}

type APIError = {
  message: string
}

const formatRecipeContent = (content: string) => {
  if (!content) return '';

  let cleanContent = content
    .replace(/^.*?\n.*?(?=Description|DESCRIPTION)/s, '')
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    
    .replace(/(Description|DESCRIPTION)(\s*:?\s*)/g, '<div class="font-bold text-pink-600 mt-4">Description</div><div class="text-gray-700 mb-4">')
    .replace(/(Preparation Time|PREPARATION TIME)(\s*:?\s*)/g, '<div class="font-bold text-pink-600 mt-4">Preparation Time</div><div class="text-gray-700">')
    .replace(/(Cooking Time|COOKING TIME)(\s*:?\s*)/g, '<div class="font-bold text-pink-600 mt-4">Cooking Time</div><div class="text-gray-700">')
    .replace(/(Servings|SERVINGS)(\s*:?\s*)/g, '<div class="font-bold text-pink-600 mt-4">Servings</div><div class="text-gray-700">')
    
    .replace(/(INGREDIENTS:|Ingredients:)/g, '<div class="font-bold text-pink-600 mt-6 mb-2">Ingredients</div><ul class="list-disc pl-6 space-y-2">')
    .replace(/For the ([^:]+):/g, '<div class="font-semibold text-pink-500 mt-3">For the $1:</div>')
    
    .replace(/(INSTRUCTIONS:|Instructions:)/g, '</ul><div class="font-bold text-pink-600 mt-6 mb-2">Instructions</div><ol class="list-decimal pl-6 space-y-2">')
    
    .replace(/(TIPS:|Tips:)/g, '</ol><div class="font-bold text-pink-600 mt-6 mb-2">Tips</div><ul class="list-disc pl-6 space-y-2">')
    
    .replace(/^- /gm, '<li class="text-gray-700">')
    .replace(/^\d+\.\s+/gm, '<li class="text-gray-700">')
    
    .split('\n')
    .filter(line => line.trim())
    .join('</li>\n')
    + '</ul>';

  cleanContent = cleanContent
    .replace(/(<\/li>\s*){2,}/g, '</li>')
    .replace(/(<\/ul>\s*){2,}/g, '</ul>')
    .replace(/(<\/ol>\s*){2,}/g, '</ol>');

  return cleanContent;
};

export default function RecipeGenerator() {
  const [ingredients, setIngredients] = useState<string>("")
  const [preferences, setPreferences] = useState<string>("")
  const [titles, setTitles] = useState<string[]>([])
  const [selectedTitle, setSelectedTitle] = useState<string>("")
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([])

  const resetForm = () => {
    setIngredients("")
    setPreferences("")
    setTitles([])
    setSelectedTitle("")
    setRecipe(null)
    setIsLoading(false)
  }

  const handleGenerateTitles = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_URL}/api/generate-titles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredients, preferences })
      })
      const data = await response.json()
      setTitles(data.titles)
      setSelectedTitle(data.titles[0])
    } catch (error: unknown) {
      const err = error as APIError
      console.error("Error generating titles:", err.message)
    }
    setIsLoading(false)
  }

  const handleGenerateRecipe = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_URL}/api/generate-recipe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: selectedTitle, ingredients, preferences })
      })
      const data = await response.json()
      setRecipe(data)
    } catch (error: unknown) {
      const err = error as APIError
      console.error("Error generating recipe:", err.message)
    }
    setIsLoading(false)
  }, [selectedTitle, ingredients, preferences])

  useEffect(() => {
    if (selectedTitle) {
      handleGenerateRecipe()
    }
  }, [selectedTitle, handleGenerateRecipe])

  const loadSavedRecipes = async () => {
    try {
      const response = await fetch(`${API_URL}/api/recipes`);
      const data = await response.json();
      if (data && Array.isArray(data.recipes)) {
        return data.recipes;
      }
      return [];
    } catch (error: unknown) {
      const err = error as APIError;
      console.error("Error loading recipes:", err.message);
      return [];
    }
  }

  const handleSaveRecipe = async () => {
    if (recipe) {
      try {
        const response = await fetch(`${API_URL}/api/save-recipe`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(recipe)
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.recipes) {
          setSavedRecipes([...savedRecipes, recipe]);
        }
      } catch (error: unknown) {
        const err = error as APIError;
        console.error("Error saving recipe:", err.message);
      }
    }
  }

  const handleRemoveRecipe = async (title: string) => {
    try {
      if (!title) {
        console.error("No title provided");
        return;
      }

      const response = await fetch(`${API_URL}/api/remove-recipe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to remove recipe');
      }
      
      // After successful removal, reload the recipes from the server
      const updatedRecipes = await loadSavedRecipes();
      setSavedRecipes(updatedRecipes || []);

    } catch (error: unknown) {
      const err = error as APIError;
      console.error("Error removing recipe:", err.message);
    }
  }

  // Initial load of saved recipes
  useEffect(() => {
    loadSavedRecipes().then(recipes => setSavedRecipes(recipes));
  }, []);

  return (
    <div className="container mx-auto p-4 bg-pink-50 min-h-screen">
      <div className="flex justify-center items-center mb-8 w-full relative">
        <h1 className="text-4xl font-bold text-center text-pink-600">👵 Grandma June's AI Recipe Generator 👵</h1>
        <Button
          onClick={resetForm}
          className="bg-gray-500 hover:bg-gray-600 text-white absolute right-0"
          title="Start Fresh"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Reset
        </Button>
      </div>
      <Tabs defaultValue="generator" className="w-full">
        <TabsList className="w-full mb-4">
          <TabsTrigger value="generator" className="w-1/2">Recipe Generator</TabsTrigger>
          <TabsTrigger value="pantry" className="w-1/2">Grandma's Pantry</TabsTrigger>
        </TabsList>
        <TabsContent value="generator">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-pink-600">Cook Something Special! 🧁</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Textarea
                  placeholder="e.g., eggs, flour, butter, chocolate chips"
                  value={ingredients}
                  onChange={(e) => setIngredients(e.target.value)}
                  className="w-full p-2 border rounded"
                />
                <Input
                  placeholder="Any special requests?"
                  value={preferences}
                  onChange={(e) => setPreferences(e.target.value)}
                  className="w-full p-2 border rounded"
                />
                <Button 
                  onClick={handleGenerateTitles} 
                  className="w-full bg-pink-500 hover:bg-pink-600 text-white"
                >
                  {isLoading ? "Cooking up ideas..." : "Generate Recipes"}
                </Button>
                {titles.length > 0 && (
                  <Select value={selectedTitle} onValueChange={setSelectedTitle}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a recipe" />
                    </SelectTrigger>
                    <SelectContent>
                      {titles.map((title) => (
                        <SelectItem key={title} value={title}>
                          {title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {recipe && recipe.content && (
                  <div className="mt-4 bg-white p-8 rounded-lg shadow-md border border-pink-100">
                    <h1 className="text-3xl font-bold text-pink-600 mb-6 text-center">{recipe.title}</h1>
                    <div 
                      dangerouslySetInnerHTML={{ __html: formatRecipeContent(recipe.content) }} 
                      className="prose max-w-none divide-y divide-pink-100"
                    />
                    <Button 
                      onClick={handleSaveRecipe} 
                      className="mt-6 bg-green-500 hover:bg-green-600 text-white"
                    >
                      Save to Grandma's Pantry
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="pantry">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-pink-600">Grandma's Recipe Pantry 📖</CardTitle>
            </CardHeader>
            <CardContent>
              {!savedRecipes || savedRecipes.length === 0 ? (
                <p>No recipes saved yet. Start cooking to fill up your pantry!</p>
              ) : (
                <div className="space-y-4">
                  {savedRecipes
                    .filter(recipe => recipe && recipe.title && recipe.content)
                    .map((savedRecipe, index) => (
                      <div key={`${savedRecipe.title}-${index}`} className="border-b pb-4">
                        <h3 className="text-xl font-semibold text-pink-600">{savedRecipe.title}</h3>
                        <div 
                          dangerouslySetInnerHTML={{ 
                            __html: formatRecipeContent(savedRecipe.content) 
                          }} 
                          className="prose mt-2 max-w-none"
                        />
                        <Button
                          onClick={() => handleRemoveRecipe(savedRecipe.title)}
                          className="mt-2 bg-red-500 hover:bg-red-600 text-white"
                        >
                          Remove Recipe
                        </Button>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}