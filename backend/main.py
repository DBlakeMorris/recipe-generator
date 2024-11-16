from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import google.generativeai as genai
import os
from dotenv import load_dotenv
from app.routes import router
from app.utils import setup_directories

# Load environment variables
load_dotenv()

# Configure the API
genai.configure(api_key=os.getenv('AIzaSyCfM0vm3xCDM2U-UOL9X-eD_cIbqQ7peXk'))

# Initialize FastAPI
app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Set up directories
setup_directories()

# Include API routes
app.include_router(router)

# Mount static files
app.mount("/", StaticFiles(directory="frontend/build", html=True))

if __name__ == "__main__":
    import uvicorn
    print("Starting Recipe Generator...")
    uvicorn.run(app, host="0.0.0.0", port=8000)