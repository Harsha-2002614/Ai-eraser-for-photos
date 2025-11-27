from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import uvicorn
import shutil
import os
import uuid
from ml_engine import MLEngine

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount uploads directory to serve images
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Initialize ML Engine
ml_engine = MLEngine()

class Box(BaseModel):
    x1: int
    y1: int
    x2: int
    y2: int

class MaskRequest(BaseModel):
    image_path: str
    box: Box

class RemoveRequest(BaseModel):
    image_path: str
    mask_path: str

@app.get("/")
def read_root():
    return {"message": "AI Eraser Backend is running!"}

@app.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    file_extension = file.filename.split(".")[-1]
    filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = os.path.join("uploads", filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    return {"path": file_path, "url": f"/uploads/{filename}"}

@app.post("/detect")
async def detect_objects(image_path: str):
    if not os.path.exists(image_path):
        raise HTTPException(status_code=404, detail="Image not found")
    
    detections = ml_engine.detect_objects(image_path)
    return {"detections": detections}

@app.post("/mask")
async def generate_mask(request: MaskRequest):
    if not os.path.exists(request.image_path):
        raise HTTPException(status_code=404, detail="Image not found")
    
    box = [request.box.x1, request.box.y1, request.box.x2, request.box.y2]
    mask = ml_engine.generate_mask(request.image_path, box)
    
    # Save mask
    mask_filename = f"mask_{uuid.uuid4()}.png"
    mask_path = os.path.join("uploads", mask_filename)
    import cv2
    cv2.imwrite(mask_path, mask)
    
    return {"mask_path": mask_path, "mask_url": f"/uploads/{mask_filename}"}

@app.post("/mask/manual")
async def upload_manual_mask(file: UploadFile = File(...)):
    """Handle manually drawn mask from frontend"""
    mask_filename = f"mask_{uuid.uuid4()}.png"
    mask_path = os.path.join("uploads", mask_filename)
    
    with open(mask_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    return {"mask_path": mask_path, "mask_url": f"/uploads/{mask_filename}"}

@app.post("/remove")
async def remove_object(request: RemoveRequest):
    if not os.path.exists(request.image_path) or not os.path.exists(request.mask_path):
        raise HTTPException(status_code=404, detail="File not found")
    
    import cv2
    mask = cv2.imread(request.mask_path, cv2.IMREAD_GRAYSCALE)
    
    output_filename = f"result_{uuid.uuid4()}.png"
    output_path = os.path.join("uploads", output_filename)
    
    ml_engine.inpaint_image(request.image_path, mask, output_path)
    
    return {"result_path": output_path, "result_url": f"/uploads/{output_filename}"}

@app.get("/antigravity")
def trigger_antigravity():
    import webbrowser
    webbrowser.open("https://xkcd.com/353/")
    return {"message": "Objects Removed… and Gravity Removed!"}

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8001)
