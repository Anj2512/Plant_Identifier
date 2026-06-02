from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import tensorflow as tf
from tensorflow.keras.preprocessing import image
import numpy as np
import cv2
import requests
import os
from PIL import Image
import io




PLANT_DATA = {}

app = FastAPI()

# allow React frontend to talk to this server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# load model and class names once when server starts
print("Loading model...")
model = tf.keras.models.load_model('backend/model/plant_model.keras')
with open('backend/model/class_names.txt', 'r') as f:
    class_names = [line.strip() for line in f.readlines()]
print(f"Model loaded. Classes: {class_names}")


def preprocess_image(img_bytes):
    # convert bytes to numpy array for opencv
    nparr = np.frombuffer(img_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    # check for blur
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    blur_score = cv2.Laplacian(gray, cv2.CV_64F).var()
    is_blurry = blur_score < 50

    # check brightness
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    brightness = hsv[:, :, 2].mean()
    is_dark = brightness < 50

    # resize and normalize for model
    img_resized = cv2.resize(img, (224, 224))
    img_rgb = cv2.cvtColor(img_resized, cv2.COLOR_BGR2RGB)
    img_array = np.array(img_rgb) / 255.0
    img_array = np.expand_dims(img_array, axis=0)

    return img_array, is_blurry, is_dark

PLANT_API_URL = "http://127.0.0.1:8001"  # note port 8001, not 8000

# cuz i accidentally called the spider plant a snake plant during trainging 
NAME_REMAP = {
    "Snake Plant": "Spider Plant",
}


def get_plant_info(plant_name):
    plant_name = NAME_REMAP.get(plant_name, plant_name)
    try:
        encoded_name = plant_name.replace(' ', '%20')
        response = requests.get(f"{PLANT_API_URL}/plants/{encoded_name}")
        if response.status_code == 200:
            info = response.json().get("data", {})
        else:
            info = None
    except Exception as e:
        print(f"Plant API call failed: {e}")
        info = None

    if info is None:
        return None

    try:
        # use scientific name if available, otherwise common name
        search_term = info.get('scientific_name', plant_name)
        inat_url = f"https://api.inaturalist.org/v1/taxa?q={search_term}&rank=species&limit=1"
        inat_response = requests.get(inat_url, headers={"User-Agent": "PlantSenseApp/1.0"})
        if inat_response.status_code == 200:
            data = inat_response.json()
            if data.get('results') and len(data['results']) > 0:
                taxon = data['results'][0]
                info["image"] = taxon.get('default_photo', {}).get('medium_url', None)
                info["wikipedia_url"] = taxon.get('wikipedia_url', None)
            else:
                info["image"] = None
                info["wikipedia_url"] = None
    except Exception as e:
        print(f"iNaturalist fetch failed: {e}")
        info["image"] = None
        info["wikipedia_url"] = None

    return info

@app.get("/plant-info/{plant_name}")
def get_plant_info_endpoint(plant_name: str):
    result = get_plant_info(plant_name)
    if result:
        return result
    return {"error": f"No info found for {plant_name}"}

@app.post("/identify")
async def identify_plant(file: UploadFile = File(...)):
    # read image bytes
    img_bytes = await file.read()

    # preprocess with opencv
    img_array, is_blurry, is_dark = preprocess_image(img_bytes)

    # build camera feedback warnings
    warnings = []
    if is_blurry:
        warnings.append("Image is blurry, try holding the camera steadier")
    if is_dark:
        warnings.append("Image is too dark, try moving to better lighting")

    # run through model
    predictions = model.predict(img_array)
    top_3_indices = np.argsort(predictions[0])[::-1][:3]

    # build results
    results = []
    for i in top_3_indices:
        plant_name = class_names[i]
        confidence = float(predictions[0][i] * 100)
        plant_info = get_plant_info(plant_name)

        results.append({
            "name": NAME_REMAP.get(plant_name, plant_name),
            "confidence": round(confidence, 1),
            "info": plant_info
        })

    return {
        "results": results,
        "warnings": warnings
    }

@app.get("/")
def root():
    return {"message": "Plant identifier API is running"}