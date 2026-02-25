"""
AlexNet Vision Explorer - FastAPI Backend
==========================================
Main API server providing endpoints for image classification,
intermediate activation visualization, and Grad-CAM analysis.
"""

from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import io
from PIL import Image
import numpy as np

from model import get_model, AlexNetVisualizer
from utils import (
    create_all_activations_visualization,
    create_activation_visualization,
    create_gradcam_overlay,
    create_filter_visualization,
    create_probability_chart,
    create_individual_feature_maps,
    pil_to_base64,
    base64_to_pil,
    resize_image_for_preview
)


# Initialize FastAPI app
app = FastAPI(
    title="AlexNet Vision Explorer API",
    description="Interactive CNN visualization platform for AlexNet",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request/Response Models
class PredictionResponse(BaseModel):
    prediction: str
    probabilities: List[Dict[str, Any]]
    probability_chart: str
    activations: Dict[str, Dict[str, Any]]
    original_image: str


class LayerInfo(BaseModel):
    name: str
    layer_name: str
    description: str
    formula: Optional[str] = None
    kernel_size: Optional[str] = None
    stride: Optional[int] = None
    filters: Optional[int] = None
    neurons: Optional[int] = None


class GradCAMRequest(BaseModel):
    image_base64: str
    target_class: Optional[int] = None
    alpha: float = 0.5


class GradCAMResponse(BaseModel):
    heatmap: str
    overlay: str
    target_class: int
    class_name: str


class FilterWeightsResponse(BaseModel):
    layer_name: str
    visualization: str
    num_filters: int
    kernel_size: List[int]


# Startup event
@app.on_event("startup")
async def startup_event():
    """Initialize model on startup for faster first request."""
    print("Initializing AlexNet model...")
    get_model()
    print("Model initialized successfully!")


# Health check endpoint
@app.get("/health")
async def health_check():
    """Check if the API is running."""
    return {"status": "healthy", "model_loaded": True}


# Get layer information
@app.get("/layers", response_model=List[LayerInfo])
async def get_layers():
    """Get information about all layers in AlexNet."""
    model = get_model()
    layer_names = model.get_all_layer_names()
    
    layers = []
    for layer_name in layer_names:
        info = model.get_layer_info(layer_name)
        if info:
            layers.append(LayerInfo(
                name=info.get('name', layer_name),
                layer_name=layer_name,
                description=info.get('description', ''),
                formula=info.get('formula'),
                kernel_size=info.get('kernel_size'),
                stride=info.get('stride'),
                filters=info.get('filters'),
                neurons=info.get('neurons')
            ))
    
    return layers


# Get specific layer information
@app.get("/layers/{layer_name}", response_model=LayerInfo)
async def get_layer_info(layer_name: str):
    """Get detailed information about a specific layer."""
    model = get_model()
    info = model.get_layer_info(layer_name)
    
    if not info:
        raise HTTPException(status_code=404, detail=f"Layer '{layer_name}' not found")
    
    return LayerInfo(
        name=info.get('name', layer_name),
        layer_name=layer_name,
        description=info.get('description', ''),
        formula=info.get('formula'),
        kernel_size=info.get('kernel_size'),
        stride=info.get('stride'),
        filters=info.get('filters'),
        neurons=info.get('neurons')
    )


# Main prediction endpoint
@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    """
    Classify an image and return predictions with intermediate activations.
    
    Upload an image file and receive:
    - Top 5 class predictions with probabilities
    - Visualization of all intermediate layer activations
    - Probability chart
    """
    try:
        # Read and validate image
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Get model and run prediction
        model = get_model()
        best_class, top5_predictions, activations = model.predict(image)
        
        # Create visualizations
        activation_visuals = create_all_activations_visualization(activations)
        prob_chart = create_probability_chart(top5_predictions)
        
        # Create preview of original image
        preview_image = resize_image_for_preview(image, max_size=400)
        original_b64 = pil_to_base64(preview_image)
        
        # Format probabilities
        prob_list = [
            {"class": name, "probability": round(prob * 100, 2)}
            for name, prob in top5_predictions
        ]
        
        return {
            "prediction": best_class,
            "probabilities": prob_list,
            "probability_chart": prob_chart,
            "activations": activation_visuals,
            "original_image": original_b64
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Predict from base64 image
@app.post("/predict/base64")
async def predict_base64(data: dict):
    """
    Classify a base64-encoded image.
    
    Accepts JSON with 'image' field containing base64-encoded image.
    """
    try:
        image_b64 = data.get('image')
        if not image_b64:
            raise HTTPException(status_code=400, detail="No image provided")
        
        image = base64_to_pil(image_b64)
        
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Get model and run prediction
        model = get_model()
        best_class, top5_predictions, activations = model.predict(image)
        
        # Create visualizations
        activation_visuals = create_all_activations_visualization(activations)
        prob_chart = create_probability_chart(top5_predictions)
        
        # Create preview of original image
        preview_image = resize_image_for_preview(image, max_size=400)
        original_b64 = pil_to_base64(preview_image)
        
        # Format probabilities
        prob_list = [
            {"class": name, "probability": round(prob * 100, 2)}
            for name, prob in top5_predictions
        ]
        
        return {
            "prediction": best_class,
            "probabilities": prob_list,
            "probability_chart": prob_chart,
            "activations": activation_visuals,
            "original_image": original_b64
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Get activation for a specific layer
@app.post("/activations/{layer_name}")
async def get_layer_activation(layer_name: str, file: UploadFile = File(...)):
    """Get activation visualization for a specific layer."""
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        model = get_model()
        _, _, activations = model.predict(image)
        
        if layer_name not in activations:
            raise HTTPException(status_code=404, detail=f"Layer '{layer_name}' not found")
        
        base64_img, metadata = create_activation_visualization(
            activations, layer_name, max_maps=16
        )
        
        # Also get individual feature maps
        individual_maps = create_individual_feature_maps(
            activations[layer_name], max_maps=16
        )
        
        return {
            "layer_name": layer_name,
            "grid_image": base64_img,
            "individual_maps": individual_maps,
            "metadata": metadata,
            "layer_info": model.get_layer_info(layer_name)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Grad-CAM endpoint
@app.post("/gradcam")
async def compute_gradcam(file: UploadFile = File(...), target_class: int = None, alpha: float = 0.5):
    """
    Compute Grad-CAM visualization for an image.
    
    Returns the heatmap and overlay image showing where the model is focusing.
    """
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        model = get_model()
        
        # Compute Grad-CAM
        heatmap, used_class = model.compute_gradcam(image, target_class)
        
        # Create overlay
        overlay_image = create_gradcam_overlay(image, heatmap, alpha)
        
        # Convert to base64
        heatmap_uint8 = (heatmap * 255).astype(np.uint8)
        import cv2
        heatmap_colored = cv2.applyColorMap(heatmap_uint8, cv2.COLORMAP_JET)
        heatmap_colored = cv2.cvtColor(heatmap_colored, cv2.COLOR_BGR2RGB)
        
        from utils import numpy_to_base64
        heatmap_b64 = numpy_to_base64(heatmap_colored)
        overlay_b64 = pil_to_base64(overlay_image)
        
        return {
            "heatmap": heatmap_b64,
            "overlay": overlay_b64,
            "target_class": used_class,
            "class_name": model.labels[used_class]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Grad-CAM from base64
@app.post("/gradcam/base64")
async def compute_gradcam_base64(data: dict):
    """Compute Grad-CAM from base64-encoded image."""
    try:
        image_b64 = data.get('image')
        target_class = data.get('target_class')
        alpha = data.get('alpha', 0.5)
        
        if not image_b64:
            raise HTTPException(status_code=400, detail="No image provided")
        
        image = base64_to_pil(image_b64)
        
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        model = get_model()
        
        # Compute Grad-CAM
        heatmap, used_class = model.compute_gradcam(image, target_class)
        
        # Create overlay
        overlay_image = create_gradcam_overlay(image, heatmap, alpha)
        
        # Convert to base64
        heatmap_uint8 = (heatmap * 255).astype(np.uint8)
        import cv2
        heatmap_colored = cv2.applyColorMap(heatmap_uint8, cv2.COLORMAP_JET)
        heatmap_colored = cv2.cvtColor(heatmap_colored, cv2.COLOR_BGR2RGB)
        
        from utils import numpy_to_base64
        heatmap_b64 = numpy_to_base64(heatmap_colored)
        overlay_b64 = pil_to_base64(overlay_image)
        
        return {
            "heatmap": heatmap_b64,
            "overlay": overlay_b64,
            "target_class": used_class,
            "class_name": model.labels[used_class]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Get filter weights visualization
@app.get("/filters/{layer_name}")
async def get_filter_weights(layer_name: str):
    """Get visualization of learned filter weights for a convolutional layer."""
    try:
        model = get_model()
        weights = model.get_filter_weights(layer_name)
        
        if weights is None:
            raise HTTPException(
                status_code=404,
                detail=f"Layer '{layer_name}' not found or not a convolutional layer"
            )
        
        visualization = create_filter_visualization(weights, layer_name)
        
        return {
            "layer_name": layer_name,
            "visualization": visualization,
            "num_filters": weights.shape[0],
            "kernel_size": list(weights.shape[2:])
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Get model architecture summary
@app.get("/architecture")
async def get_architecture():
    """Get a summary of the AlexNet architecture."""
    return {
        "name": "AlexNet",
        "description": "AlexNet is a pioneering deep convolutional neural network that won the ImageNet Large Scale Visual Recognition Challenge in 2012. It consists of 5 convolutional layers, 3 max pooling layers, and 3 fully connected layers.",
        "input_size": [3, 224, 224],
        "num_classes": 1000,
        "total_params": "61 million",
        "layers": [
            {"name": "Conv1", "type": "Conv2d", "params": "3→64, 11x11, stride=4, pad=2"},
            {"name": "ReLU1", "type": "ReLU", "params": "inplace"},
            {"name": "MaxPool1", "type": "MaxPool2d", "params": "3x3, stride=2"},
            {"name": "Conv2", "type": "Conv2d", "params": "64→192, 5x5, stride=1, pad=2"},
            {"name": "ReLU2", "type": "ReLU", "params": "inplace"},
            {"name": "MaxPool2", "type": "MaxPool2d", "params": "3x3, stride=2"},
            {"name": "Conv3", "type": "Conv2d", "params": "192→384, 3x3, stride=1, pad=1"},
            {"name": "ReLU3", "type": "ReLU", "params": "inplace"},
            {"name": "Conv4", "type": "Conv2d", "params": "384→256, 3x3, stride=1, pad=1"},
            {"name": "ReLU4", "type": "ReLU", "params": "inplace"},
            {"name": "Conv5", "type": "Conv2d", "params": "256→256, 3x3, stride=1, pad=1"},
            {"name": "ReLU5", "type": "ReLU", "params": "inplace"},
            {"name": "MaxPool3", "type": "MaxPool2d", "params": "3x3, stride=2"},
            {"name": "AdaptiveAvgPool", "type": "AdaptiveAvgPool2d", "params": "6x6"},
            {"name": "Flatten", "type": "Flatten", "params": "9216"},
            {"name": "FC1", "type": "Linear", "params": "9216→4096"},
            {"name": "ReLU6", "type": "ReLU", "params": "inplace"},
            {"name": "Dropout1", "type": "Dropout", "params": "p=0.5"},
            {"name": "FC2", "type": "Linear", "params": "4096→4096"},
            {"name": "ReLU7", "type": "ReLU", "params": "inplace"},
            {"name": "Dropout2", "type": "Dropout", "params": "p=0.5"},
            {"name": "FC3", "type": "Linear", "params": "4096→1000"}
        ],
        "key_innovations": [
            "Use of ReLU activation for faster training",
            "Dropout for regularization",
            "Data augmentation",
            "GPU training with model parallelism",
            "Local Response Normalization (original version)"
        ]
    }


# Run with: uvicorn main:app --reload --host 0.0.0.0 --port 8000
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
