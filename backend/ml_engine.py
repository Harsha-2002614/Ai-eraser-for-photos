import cv2
import numpy as np
import torch
import os
import urllib.request
from ultralytics import YOLO
from segment_anything import sam_model_registry, SamPredictor

class MLEngine:
    def __init__(self):
        print("Initializing ML Engine...")
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"Using device: {self.device}")
        
        # Initialize YOLO
        self.yolo = YOLO("yolov8n.pt")
        
        # Initialize SAM
        self.sam_checkpoint = "sam_vit_b_01ec64.pth"
        self.download_sam_checkpoint()
        self.sam = sam_model_registry["vit_b"](checkpoint=self.sam_checkpoint)
        self.sam.to(device=self.device)
        self.predictor = SamPredictor(self.sam)
        print("ML Engine Initialized.")

    def download_sam_checkpoint(self):
        if not os.path.exists(self.sam_checkpoint):
            print("Downloading SAM checkpoint...")
            import ssl
            ssl._create_default_https_context = ssl._create_unverified_context
            
            url = "https://dl.fbaipublicfiles.com/segment_anything/sam_vit_b_01ec64.pth"
            urllib.request.urlretrieve(url, self.sam_checkpoint)
            print("SAM checkpoint downloaded.")

    def detect_objects(self, image_path):
        """
        Detects objects in the image using YOLOv8.
        Returns a list of detections: {'box': [x1, y1, x2, y2], 'label': str, 'conf': float}
        """
        results = self.yolo(image_path)
        detections = []
        for result in results:
            boxes = result.boxes.cpu().numpy()
            for box in boxes:
                r = box.xyxy[0].astype(int).tolist()
                conf = float(box.conf[0])
                cls = int(box.cls[0])
                label = result.names[cls]
                detections.append({
                    "box": r,
                    "label": label,
                    "conf": conf
                })
        return detections

    def generate_mask(self, image_path, box):
        """
        Generates a binary mask for the object within the box using SAM.
        box: [x1, y1, x2, y2]
        Returns: mask as numpy array (uint8, 0 or 255)
        """
        image = cv2.imread(image_path)
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        self.predictor.set_image(image)
        input_box = np.array(box)
        
        masks, _, _ = self.predictor.predict(
            point_coords=None,
            point_labels=None,
            box=input_box[None, :],
            multimask_output=False,
        )
        
        # masks[0] is the best mask
        mask = masks[0].astype(np.uint8) * 255
        return mask

    def inpaint_image(self, image_path, mask, output_path):
        """
        Inpaints the image using the mask.
        Uses OpenCV Telea algorithm.
        """
        image = cv2.imread(image_path)
        
        # Dilate mask to ensure full coverage of the object border
        kernel = np.ones((7, 7), np.uint8)
        dilated_mask = cv2.dilate(mask, kernel, iterations=5)
        
        # Inpaint with larger radius for better results
        # Radius 15, flags=cv2.INPAINT_TELEA or cv2.INPAINT_NS
        result = cv2.inpaint(image, dilated_mask, 15, cv2.INPAINT_TELEA)
        
        cv2.imwrite(output_path, result)
        return output_path
