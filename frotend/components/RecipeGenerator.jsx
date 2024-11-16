REACT_COMPONENT = """
"use client"

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CakeIcon, ChefHatIcon, CookingPotIcon, UtensilsCrossedIcon } from 'lucide-react'

export default function RecipeGenerator() {
  const [ingredients, setIngredients] = useState("")
  const [preferences, setPreferences] = useState("")
  const [titles, setTitles] = useState<string[]>([])
  const [selectedTitle, setSelectedTitle] = useState("")
  const [recipe, setRecipe] = useState<{ title: string; content: string } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [savedRecipes, setSavedRecipes] = useState<{ title: string; content: string }[]>([])

  const handleGenerateTitles = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/generate-titles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredients, preferences })
      })
      const data = await response.json()
      setTitles(data.titles)
      setSelectedTitle(data.titles[0])
    } catch (error) {
      console.error("Error generating titles:", error)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    if (selectedTitle) {
      handleGenerateRecipe()
    }
  }, [selectedTitle])

  const handleGenerateRecipe = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/generate-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: selectedTitle, ingredients, preferences })
      })
      const data = await response.json()
      setRecipe(data)
    } catch (error) {
      console.error("Error generating recipe:", error)
    }
    setIsLoading(false)
  }

  const handleSaveRecipe = async () => {
    if (recipe) {
      try {
        const response = await fetch('/api/save-recipe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(recipe)
        })
        const data = await response.json()
        setSavedRecipes([...savedRecipes, recipe])
      } catch (error) {
        console.error("Error saving recipe:", error)
      }
    }
  }

  const handleRemoveRecipe = async (title: string) => {
    try {
      await fetch('/api/remove-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title })
      })
      setSavedRecipes(savedRecipes.filter(recipe => recipe.title !== title))
    } catch (error) {
      console.error("Error removing recipe:", error)
    }
  }

  useEffect(() => {
    // Load saved recipes on component mount
    const loadSavedRecipes = async () => {
      try {
        const response = await fetch('/api/recipes')
        const data = await response.json()
        setSavedRecipes(data.recipes)
      } catch (error) {
        console.error("Error loading recipes:", error)
      }
    }
    loadSavedRecipes()
  }, [])

  return (
    <div className="container mx-auto p-4 bg-pink-50 min-h-screen">
      <h1 className="text-4xl font-bold text-center text-pink-600 mb-8">👵 Grandma June's AI Recipe Generator 👵</h1>
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
                <Button onClick={handleGenerateTitles} className="w-full bg-pink-500 hover:bg-pink-600 text-white">
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
                {recipe && (
                  <div className="mt-4">
                    <h2 className="text-2xl font-bold text-pink-600 mb-2">{recipe.title}</h2>
                    <div dangerouslySetInnerHTML={{ __html: recipe.content }} className="prose" />
                    <Button onClick={handleSaveRecipe} className="mt-4 bg-green-500 hover:bg-green-600 text-white">
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
              {savedRecipes.length === 0 ? (
                <p>No recipes saved yet. Start cooking to fill up your pantry!</p>
              ) : (
                <ul className="space-y-4">
                  {savedRecipes.map((savedRecipe) => (
                    <li key={savedRecipe.title} className="border-b pb-4">
                      <h3 className="text-xl font-semibold text-pink-600">{savedRecipe.title}</h3>
                      <div dangerouslySetInnerHTML={{ __html: savedRecipe.content }} className="prose mt-2" />
                      <Button
                        onClick={() => handleRemoveRecipe(savedRecipe.title)}
                        className="mt-2 bg-red-500 hover:bg-red-600 text-white"
                      >
                        Remove Recipe
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
"""