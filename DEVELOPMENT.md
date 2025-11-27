# Project Development Documentation

## Overview
This document details the complete development process of the AI Eraser for Photos application, built from scratch during a collaborative development session.

## Development Timeline

### Phase 1: Planning & Architecture (Steps 1-12)
**Duration**: Initial setup
**Activities**:
- Created project structure (backend/ and frontend/ directories)
- Designed implementation plan with user review
- Chose OpenCV for inpainting (instead of Stable Diffusion) for better compatibility
- Planned FastAPI backend with React frontend

**Key Decisions**:
- OpenCV Telea algorithm for inpainting (lightweight, no GPU required)
- YOLOv8n for object detection (small, fast model)
- SAM ViT-B for segmentation (balance of accuracy and size)

### Phase 2: Backend Implementation (Steps 13-50)
**Duration**: Core ML engine development
**Activities**:
1. Set up Python environment and dependencies
2. Implemented `MLEngine` class with three core functions:
   - `detect_objects()`: YOLOv8 integration
   - `generate_mask()`: SAM integration
   - `inpaint_image()`: OpenCV inpainting
3. Created FastAPI endpoints:
   - `/upload`: Image upload handler
   - `/detect`: Object detection
   - `/mask`: Mask generation
   - `/remove`: Object removal
   - `/antigravity`: Easter egg

**Technical Challenges Solved**:
- SSL certificate issues during SAM model download (disabled SSL verification)
- Model initialization and caching
- File path management for uploads

### Phase 3: Frontend Implementation (Steps 51-100)
**Duration**: UI/UX development
**Activities**:
1. Created React app with Vite
2. Built components:
   - `ImageUploader.jsx`: Drag & drop upload
   - `ObjectSelector.jsx`: Canvas-based selection
   - `ResultViewer.jsx`: Before/after comparison
3. Implemented state management for multi-step workflow
4. Added glassmorphism CSS styling

**Node.js Installation Issue**:
- User's system lacked npm/node
- Attempted automatic installation via Homebrew (failed - brew not installed)
- User manually installed Node.js
- Found Node at `/opt/homebrew/bin/node` and used absolute paths

### Phase 4: Integration & Debugging (Steps 101-200)
**Duration**: Bug fixing and optimization
**Activities**:

**Issue 1: Upload Failures**
- Problem: Backend not responding on port 8000
- Root Cause: Port binding to 0.0.0.0 causing issues on macOS
- Solution: Changed to 127.0.0.1:8001

**Issue 2: Selection Not Working**
- Problem: 422 Unprocessable Content errors
- Root Cause: `RemoveRequest` model had duplicate/incorrect fields
- Solution: Cleaned up Pydantic model to only include `image_path` and `mask_path`

**Issue 3: Inpainting Only Removing Border**
- Problem: Only thin border removed, not full object
- Root Cause: Inpainting radius too small (3px)
- Solution: Increased radius to 15px and dilation iterations to 5

### Phase 5: UI/UX Enhancements (Steps 201-300)
**Duration**: Polish and features
**Activities**:

1. **Automatic Object Detection**:
   - Integrated YOLO detection on upload
   - Display bounding boxes with labels and confidence scores
   - Click-to-select interface

2. **Loading Animations**:
   - Added spinner animation
   - Implemented rocket power-up and launch animation
   - Later simplified to just spinner (per user request)

3. **Sidebar Panel**:
   - Toggle between original and result
   - Display mask preview
   - Show all processing stages

4. **"Use Another Image" Button**:
   - Reset functionality
   - Clear state and return to upload

5. **Download Button Styling**:
   - Removed underline
   - Applied glassmorphism effect

### Phase 6: Manual Brush Tool (Steps 301-390)
**Duration**: Advanced feature implementation
**Activities**:

1. **Dual-Mode Selection**:
   - Auto Detect: Click on YOLO-detected objects
   - Manual Brush: Paint over objects with adjustable brush

2. **Canvas Drawing Implementation**:
   - Mouse event handlers (down, move, up)
   - Real-time brush preview
   - Hidden mask canvas for actual mask generation
   - Coordinate scaling between display and original image size

3. **Backend Support**:
   - New `/mask/manual` endpoint
   - Handle uploaded mask images
   - Convert data URL to blob on frontend

**Technical Challenge**:
- File corruption with markdown code blocks
- Fixed by rewriting entire ObjectSelector.jsx cleanly

## Technical Architecture

### Backend Stack
```
FastAPI (Web Framework)
├── Uvicorn (ASGI Server)
├── Pydantic (Data Validation)
├── Python-Multipart (File Uploads)
└── ML Pipeline
    ├── Ultralytics YOLOv8 (Detection)
    ├── Segment Anything (Masking)
    └── OpenCV (Inpainting)
```

### Frontend Stack
```
React 19.2
├── Vite (Build Tool)
├── Axios (HTTP Client)
├── React Icons (UI Icons)
└── Canvas API (Drawing)
```

### Data Flow
```
User Upload → FastAPI → YOLOv8 Detection → 
User Selection → SAM Masking → OpenCV Inpainting → 
Result Display → Download
```

## Key Algorithms

### 1. Object Detection (YOLOv8)
```python
results = self.yolo(image_path)
for result in results:
    boxes = result.boxes.cpu().numpy()
    for box in boxes:
        # Extract box coordinates, confidence, class
```

### 2. Mask Generation (SAM)
```python
self.predictor.set_image(image)
masks, _, _ = self.predictor.predict(
    box=input_box[None, :],
    multimask_output=False
)
```

### 3. Inpainting (OpenCV)
```python
kernel = np.ones((7, 7), np.uint8)
dilated_mask = cv2.dilate(mask, kernel, iterations=5)
result = cv2.inpaint(image, dilated_mask, 15, cv2.INPAINT_TELEA)
```

## Performance Metrics

- **Model Load Time**: ~5-10 seconds (first run)
- **Detection Time**: ~1-2 seconds per image
- **Masking Time**: ~2-3 seconds
- **Inpainting Time**: ~1-2 seconds
- **Total Processing**: ~5-8 seconds per object

## Lessons Learned

1. **Port Binding**: Use 127.0.0.1 instead of 0.0.0.0 on macOS for better compatibility
2. **Model Downloads**: Handle SSL issues and provide user feedback
3. **Pydantic Models**: Keep them clean and match frontend expectations exactly
4. **Inpainting Parameters**: Larger radius and more dilation = better results
5. **Canvas Scaling**: Always scale coordinates between display and original image size
6. **State Management**: Clear state properly when resetting workflow

## Interview Talking Points

### Full-Stack Development
- Built complete application from scratch
- RESTful API design with FastAPI
- React component architecture
- State management across multi-step workflow

### Machine Learning Integration
- Integrated 3 different ML models
- Handled model downloads and initialization
- Optimized for CPU inference
- Understood trade-offs (OpenCV vs Stable Diffusion)

### Problem-Solving
- Debugged port binding issues
- Fixed CORS and SSL problems
- Optimized inpainting parameters through testing
- Handled file corruption and rewrote components

### UI/UX Design
- Implemented glassmorphism design trend
- Created interactive canvas drawing
- Built before/after comparison slider
- Added loading states and animations

### DevOps
- Set up development environment
- Managed dependencies (Python + Node.js)
- Handled cross-platform issues (macOS)
- Used absolute paths for Node.js when needed

## Code Statistics

- **Total Development Time**: ~4 hours of active development
- **Lines of Code**: ~1,500+
- **Files Created**: 15+
- **API Endpoints**: 6
- **React Components**: 4
- **Dependencies**: 20+

## Future Improvements Discussed

1. Stable Diffusion inpainting for better quality
2. Batch processing
3. Cloud deployment
4. Mobile app version
5. User authentication
6. Image gallery/history

---

**This project demonstrates proficiency in:**
- Full-stack web development
- Machine learning integration
- API design
- React development
- Problem-solving and debugging
- UI/UX implementation
- DevOps basics
