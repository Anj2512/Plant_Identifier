from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import json
import os

app = FastAPI(title="PlantSense Plant Data API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# load JSON data when server starts
with open(os.path.join(os.path.dirname(__file__), 'plants.json'), 'r') as f:
    PLANT_DB = json.load(f)

@app.get("/")
def root():
    return {
        "name": "PlantSense Plant Data API",
        "version": "1.0.0",
        "endpoints": ["/plants", "/plants/{name}", "/plants/{name}/care", "/plants/{name}/toxicity"]
    }

@app.get("/plants")
def get_all_plants():
    return {
        "count": len(PLANT_DB),
        "plants": list(PLANT_DB.keys())
    }

@app.get("/plants/{plant_name}")
def get_plant(plant_name: str):
    for key in PLANT_DB:
        if key.lower() == plant_name.lower():
            return {"name": key, "data": PLANT_DB[key]}
    return {"error": f"Plant '{plant_name}' not found"}, 404

@app.get("/plants/{plant_name}/care")
def get_care(plant_name: str):
    for key in PLANT_DB:
        if key.lower() == plant_name.lower():
            plant = PLANT_DB[key]
            return {
                "name": key,
                "watering": plant.get("watering"),
                "sunlight": plant.get("sunlight"),
                "soil": plant.get("soil"),
                "care_tips": plant.get("care_tips"),
                "propagation": plant.get("propagation")
            }
    return {"error": f"Plant '{plant_name}' not found"}

@app.get("/plants/{plant_name}/toxicity")
def get_toxicity(plant_name: str):
    for key in PLANT_DB:
        if key.lower() == plant_name.lower():
            return {
                "name": key,
                "toxicity": PLANT_DB[key].get("toxicity"),
                "common_pests": PLANT_DB[key].get("common_pests")
            }
    return {"error": f"Plant '{plant_name}' not found"}