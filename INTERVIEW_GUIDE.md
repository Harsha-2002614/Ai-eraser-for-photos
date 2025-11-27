# Interview Guide: AI Eraser for Photos

## 30-Second Elevator Pitch

"I built a full-stack web application that uses AI to remove unwanted objects from photos. It combines YOLOv8 for object detection, Meta's Segment Anything Model for precise masking, and OpenCV for background filling. Users can either click on auto-detected objects or manually paint over them with a brush tool. The app features a modern glassmorphism UI built with React and FastAPI backend."

## Project Highlights

### 1. Full-Stack Development
**What I Did:**
- Built complete application from scratch with React frontend and FastAPI backend
- Designed RESTful API with 6 endpoints
- Implemented multi-step workflow with state management
- Created responsive UI with glassmorphism design

**Technical Details:**
- Frontend: React 19.2, Vite, Axios, Canvas API
- Backend: FastAPI, Python 3.13, Uvicorn
- 1,500+ lines of code across 15+ files

### 2. Machine Learning Integration
**What I Did:**
- Integrated 3 different ML models into production pipeline
- Handled model downloads (375MB SAM model)
- Optimized for CPU inference (works without GPU)
- Implemented dual-mode selection (auto + manual)

**Models Used:**
- YOLOv8n (6.5MB) - 80+ object classes
- SAM ViT-B (375MB) - Pixel-perfect segmentation
- OpenCV Telea - Background inpainting

### 3. Problem-Solving Examples

**Problem 1: Port Binding Issues**
- Issue: Backend not responding on default port 8000
- Investigation: Used `lsof` to check port usage
- Solution: Changed from 0.0.0.0:8000 to 127.0.0.1:8001
- Learning: macOS networking quirks

**Problem 2: Poor Inpainting Quality**
- Issue: Only thin border removed, not full object
- Investigation: Tested different radius values
- Solution: Increased radius from 3px to 15px, dilation from 2 to 5 iterations
- Learning: Parameter tuning is crucial for ML results

**Problem 3: API Validation Errors**
- Issue: 422 errors on object removal
- Investigation: Checked backend logs, found Pydantic model mismatch
- Solution: Cleaned up `RemoveRequest` model structure
- Learning: Frontend-backend contract must match exactly

### 4. Advanced Features

**Canvas Drawing System:**
- Implemented mouse event handlers for brush drawing
- Dual-canvas approach (display + hidden mask canvas)
- Coordinate scaling between display and original image size
- Adjustable brush size (5-50px)

**Before/After Comparison:**
- Slider-based comparison viewer
- Image clipping with CSS overflow
- Responsive design

**Sidebar Panel:**
- Toggle between original and result
- Display processing stages (original, mask, result)
- Thumbnail previews

## Technical Deep Dives

### Architecture Decision: Why OpenCV over Stable Diffusion?

**Considered Options:**
1. OpenCV Inpainting (Telea/Navier-Stokes)
2. Stable Diffusion Inpainting

**Decision: OpenCV**

**Reasoning:**
- No GPU requirement (works on any machine)
- Faster inference (~1-2 seconds vs 10-30 seconds)
- Smaller footprint (no 4GB+ model download)
- Sufficient quality for most use cases
- Better for demo/portfolio purposes

**Trade-off:**
- SD would give better quality on complex backgrounds
- OpenCV works best with simple/uniform backgrounds

### API Design Decisions

**Endpoint Structure:**
```
POST /upload        → Upload image
POST /detect        → Run YOLO detection
POST /mask          → Generate SAM mask from box
POST /mask/manual   → Upload manually drawn mask
POST /remove        → Inpaint using mask
GET  /antigravity   → Easter egg
```

**Why This Design:**
- Separation of concerns (each step is independent)
- Allows for different mask sources (auto vs manual)
- Easy to test each step independently
- Stateless (all data passed in requests)

### State Management Strategy

**React State:**
```javascript
- step: Current workflow step (1-4)
- imagePath: Server path to uploaded image
- imageUrl: URL for display
- detections: YOLO detection results
- maskUrl: Generated mask URL
- resultUrl: Final result URL
- loading: Processing state
- showOriginal: Toggle for preview
```

**Why This Approach:**
- Simple useState for small app
- Could scale to Redux/Context if needed
- Clear state transitions between steps

## Common Interview Questions & Answers

### Q: "Walk me through the data flow of your application"

**A:** "When a user uploads an image, it goes to the FastAPI backend which saves it and returns a path. The frontend then automatically calls the detect endpoint, which runs YOLOv8 and returns bounding boxes with labels and confidence scores.

The user can either click on a detected object or switch to manual mode and paint over it. For auto mode, we send the bounding box to the mask endpoint which uses SAM to generate a pixel-perfect mask. For manual mode, we upload the drawn mask directly.

Finally, both the original image and mask go to the remove endpoint, which uses OpenCV's inpainting algorithm to fill in the masked area. The result is displayed with a before/after slider and can be downloaded."

### Q: "What was the most challenging part?"

**A:** "The most challenging part was implementing the manual brush tool. I had to work with the Canvas API to handle mouse events, draw in real-time, and maintain two separate canvases - one for display and one for the actual mask.

The tricky part was coordinate scaling. The displayed image might be 600px wide, but the original could be 3000px. I had to scale all brush strokes from display coordinates to original image coordinates so the mask would match the actual image size.

I also had to convert the canvas to a data URL, then to a blob, then upload it to the backend - which required understanding different data formats and browser APIs."

### Q: "How would you improve this application?"

**A:** "Several ways:

1. **Better Inpainting**: Integrate Stable Diffusion for higher quality results, with a toggle for users to choose speed vs quality.

2. **Batch Processing**: Allow users to upload multiple images and process them in a queue.

3. **Cloud Deployment**: Deploy on AWS/GCP with S3 for storage, containerize with Docker, set up CI/CD.

4. **Performance**: Add caching for repeated operations, implement WebSockets for real-time progress updates, optimize model loading.

5. **Features**: Add undo/redo, multiple object removal in one session, custom model training on user data.

6. **Mobile**: Create React Native app or PWA for mobile use."

### Q: "How did you handle errors and edge cases?"

**A:** "I implemented several error handling strategies:

1. **Try-Catch Blocks**: All async operations wrapped in try-catch with user-friendly error messages
2. **Backend Validation**: Pydantic models validate all inputs
3. **File Existence Checks**: Verify files exist before processing
4. **CORS Configuration**: Allow cross-origin requests for development
5. **Loading States**: Show spinner during processing to prevent multiple submissions
6. **Model Download**: Handle SSL issues and provide feedback during first-run download

Edge cases handled:
- Empty detections (no objects found)
- Invalid file formats
- Network failures
- Port conflicts
- Missing dependencies"

## Metrics to Mention

- **Development Time**: ~4 hours active development
- **Code Volume**: 1,500+ lines
- **Technologies**: 10+ (React, FastAPI, YOLOv8, SAM, OpenCV, etc.)
- **API Endpoints**: 6
- **Processing Speed**: 5-8 seconds per object
- **Model Accuracy**: 80+ object classes with 90%+ confidence

## GitHub Repository Tips

**README Should Include:**
- ✅ Project banner/badges
- ✅ Feature list with emojis
- ✅ Architecture diagram
- ✅ Installation instructions
- ✅ API documentation
- ✅ Screenshots/GIFs
- ✅ Tech stack details
- ✅ Use cases

**Good Commit Messages:**
- "feat: Add manual brush tool for precise selection"
- "fix: Resolve port binding issue on macOS"
- "perf: Increase inpainting radius for better results"
- "docs: Add comprehensive README and development guide"

## Closing Statement

"This project demonstrates my ability to build complete full-stack applications, integrate complex ML models, solve real-world problems, and create polished user experiences. I'm comfortable working across the entire stack from UI design to ML inference, and I enjoy the challenge of making advanced AI accessible through intuitive interfaces."

---

**Remember:**
- Be enthusiastic about the technical challenges
- Show you understand trade-offs and decisions
- Demonstrate problem-solving process
- Highlight both breadth (full-stack) and depth (ML integration)
- Be honest about what you'd improve
