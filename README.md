# 🎨 AI Eraser for Photos

A powerful AI-powered web application that removes unwanted objects from images using state-of-the-art machine learning models. Built with React, FastAPI, YOLOv8, and Meta's Segment Anything Model (SAM).

![Project Banner](https://img.shields.io/badge/AI-Object_Removal-blue) ![Python](https://img.shields.io/badge/Python-3.13-green) ![React](https://img.shields.io/badge/React-19.2-61dafb) ![FastAPI](https://img.shields.io/badge/FastAPI-Latest-009688)

## 🌟 Features

### 🤖 Dual Selection Modes
- **Auto Detect Mode**: AI automatically detects objects using YOLOv8 (80+ object classes)
- **Manual Brush Mode**: Paint over objects with adjustable brush size (5-50px) for pixel-perfect control

### 🎯 Advanced AI Pipeline
1. **Object Detection**: YOLOv8 pre-trained model for automatic object recognition
2. **Precise Masking**: Meta's Segment Anything Model (SAM) for pixel-accurate segmentation
3. **Smart Inpainting**: OpenCV Telea algorithm with 15px radius for seamless background filling

### ✨ Premium UI/UX
- **Glassmorphism Design**: Modern, sleek interface with backdrop blur effects
- **Interactive Preview**: Before/After slider comparison
- **Sidebar Panel**: View original, mask, and result thumbnails
- **Responsive Controls**: Smooth animations and transitions
- **Dark Mode**: Eye-friendly dark theme

### 🎉 Special Features
- **Antigravity Mode**: Fun Easter egg (XKCD comic reference)
- **Real-time Preview**: See changes as you work
- **Download Results**: Export cleaned images instantly

## 🏗️ Architecture

### Tech Stack

**Frontend:**
- React 19.2 with Vite
- Axios for API communication
- React Icons
- Canvas API for drawing
- CSS3 with Glassmorphism effects

**Backend:**
- FastAPI (Python 3.13)
- YOLOv8 (Ultralytics)
- Segment Anything Model (Meta)
- OpenCV for image processing
- PyTorch for ML inference

**ML Models:**
- YOLOv8n (6.5MB) - Object detection
- SAM ViT-B (375MB) - Segmentation
- OpenCV Inpainting - Background filling

### System Flow

```
┌─────────────┐
│   Upload    │
│   Image     │
└──────┬──────┘
       │
       ▼
┌─────────────────────────┐
│  Auto Detect (YOLOv8)   │
│  OR                     │
│  Manual Brush Drawing   │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│  Generate Mask (SAM)    │
│  OR                     │
│  Upload Manual Mask     │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│  Inpaint (OpenCV)       │
│  Remove Object          │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│  Display Result         │
│  Download Option        │
└─────────────────────────┘
```

## 🚀 Installation & Setup

### Prerequisites
- Python 3.13+
- Node.js 18+
- npm or yarn

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
```

**Dependencies:**
- fastapi
- uvicorn
- python-multipart
- opencv-python
- numpy
- ultralytics (YOLOv8)
- segment-anything
- torch
- torchvision
- pillow

### Frontend Setup

```bash
cd frontend
npm install
```

**Dependencies:**
- react
- axios
- react-icons
- react-router-dom
- vite

## 🎮 Usage

### Start Backend Server

```bash
cd "/path/to/Ai Eraser for Photos"
python3 backend/main.py
```

Server runs on: `http://127.0.0.1:8001`

### Start Frontend Development Server

```bash
cd "/path/to/Ai Eraser for Photos/frontend"
npm run dev
```

App runs on: `http://localhost:5173`

### Using the Application

1. **Upload Image**: Drag & drop or click to select JPG/PNG
2. **Choose Mode**:
   - **Auto Detect**: Click on detected objects
   - **Manual Brush**: Paint over objects with adjustable brush
3. **Process**: AI removes the object and fills background
4. **Review**: Use slider to compare before/after
5. **Download**: Save the cleaned image

## 📡 API Endpoints

### POST /upload
Upload an image file
- **Input**: multipart/form-data (image file)
- **Output**: `{ path, url }`

### POST /detect
Detect objects in image using YOLOv8
- **Input**: `{ image_path }`
- **Output**: `{ detections: [{ box, label, conf }] }`

### POST /mask
Generate mask from bounding box using SAM
- **Input**: `{ image_path, box: { x1, y1, x2, y2 } }`
- **Output**: `{ mask_path, mask_url }`

### POST /mask/manual
Upload manually drawn mask
- **Input**: multipart/form-data (mask image)
- **Output**: `{ mask_path, mask_url }`

### POST /remove
Remove object using mask and inpainting
- **Input**: `{ image_path, mask_path }`
- **Output**: `{ result_path, result_url }`

### GET /antigravity
Trigger Easter egg
- **Output**: `{ message }`

## 🎨 Key Implementation Details

### Inpainting Parameters
- **Radius**: 15px (optimized for smooth results)
- **Dilation**: 5 iterations with 7x7 kernel
- **Algorithm**: OpenCV Telea (cv2.INPAINT_TELEA)

### Canvas Drawing
- **Brush**: Circular, adjustable 5-50px
- **Mask Format**: Binary (black/white) PNG
- **Scaling**: Automatic scaling between display and original image size

### Performance Optimizations
- **Device Detection**: Auto-selects CUDA if available, falls back to CPU
- **Model Caching**: Models loaded once at startup
- **Lazy Loading**: SAM checkpoint downloaded only on first run

## 🐛 Troubleshooting

### Upload Fails
- Ensure backend is running on port 8001
- Check CORS settings in `backend/main.py`

### No Objects Detected
- YOLO works best with common objects (people, animals, vehicles)
- Try different images or use Manual Brush mode

### Poor Inpainting Quality
- Works best with simple/uniform backgrounds
- Try Manual Brush for better mask precision
- Complex backgrounds may show artifacts

### First Run
- SAM model (375MB) downloads automatically
- Takes 2-3 minutes depending on connection
- Stored in project root directory

## 📊 Project Statistics

- **Total Lines of Code**: ~1,500+
- **Components**: 4 React components
- **API Endpoints**: 6
- **ML Models**: 3 (YOLO, SAM, OpenCV)
- **Supported Formats**: JPG, PNG
- **Detection Classes**: 80+ (COCO dataset)

## 🎯 Use Cases

- Remove photobombers from travel photos
- Clean up product photography
- Remove unwanted background objects
- Fix messy backgrounds
- Prepare images for professional use

## 🔮 Future Enhancements

- [ ] Stable Diffusion inpainting for better quality
- [ ] Batch processing multiple images
- [ ] Custom model training
- [ ] Mobile app version
- [ ] Cloud deployment
- [ ] User authentication
- [ ] Image history/gallery

## 👨‍💻 Technical Highlights for Interviews

### Problem-Solving
- Implemented dual-mode selection (auto + manual) for flexibility
- Solved port binding issues by using 127.0.0.1:8001
- Fixed CORS for cross-origin requests
- Handled SSL certificate issues for model downloads

### Full-Stack Development
- **Frontend**: React hooks, Canvas API, state management
- **Backend**: RESTful API design, file handling, ML integration
- **DevOps**: Development server setup, dependency management

### ML/AI Integration
- Integrated 3 different ML models in production pipeline
- Optimized inference for CPU/GPU
- Handled large model downloads gracefully

### UI/UX Design
- Glassmorphism effects with CSS
- Responsive design
- Interactive canvas drawing
- Real-time preview updates

## 📝 License

This project was created for educational and portfolio purposes.

## 🙏 Acknowledgments

- **YOLOv8**: Ultralytics
- **SAM**: Meta AI Research
- **OpenCV**: Open Source Computer Vision Library
- **FastAPI**: Sebastián Ramírez
- **React**: Meta

---

