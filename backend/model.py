"""
AlexNet Model with Intermediate Activation Capture
===================================================
This module provides the AlexNet model wrapped with forward hooks
to capture intermediate layer activations for visualization.
"""

import torch
import torch.nn as nn
import torchvision.models as models
from torchvision import transforms
from PIL import Image
import numpy as np
from typing import Dict, List, Tuple, Optional
import io
import base64


class AlexNetVisualizer:
    """
    A wrapper around the pretrained AlexNet model that captures
    intermediate activations for visualization purposes.
    """
    
    # ImageNet class labels (top 1000)
    IMAGENET_LABELS_URL = "https://raw.githubusercontent.com/pytorch/hub/master/imagenet_classes.txt"
    
    # Layer information for educational purposes
    LAYER_INFO = {
        'conv1': {
            'name': 'Convolution Layer 1',
            'kernel_size': '11x11',
            'stride': 4,
            'filters': 64,
            'description': 'Extracts low-level features like edges, corners, and basic textures. Uses large 11x11 kernels to capture broad spatial patterns from the input image.',
            'formula': 'y = Σ(x * w) + b where * is convolution'
        },
        'relu1': {
            'name': 'ReLU Activation 1',
            'description': 'Applies non-linear activation to introduce non-linearity into the model. Zeros out negative values while keeping positive values unchanged.',
            'formula': 'f(x) = max(0, x)'
        },
        'pool1': {
            'name': 'Max Pooling 1',
            'kernel_size': '3x3',
            'stride': 2,
            'description': 'Reduces spatial dimensions while retaining the most important features. Takes the maximum value from each 3x3 region.',
            'formula': 'y = max(x[i:i+k, j:j+k])'
        },
        'conv2': {
            'name': 'Convolution Layer 2',
            'kernel_size': '5x5',
            'stride': 1,
            'filters': 192,
            'description': 'Builds upon low-level features to detect more complex patterns like textures and simple shapes.',
            'formula': 'y = Σ(x * w) + b'
        },
        'relu2': {
            'name': 'ReLU Activation 2',
            'description': 'Non-linear activation that helps the network learn complex decision boundaries.',
            'formula': 'f(x) = max(0, x)'
        },
        'pool2': {
            'name': 'Max Pooling 2',
            'kernel_size': '3x3',
            'stride': 2,
            'description': 'Further reduces spatial dimensions and provides translation invariance.',
            'formula': 'y = max(x[i:i+k, j:j+k])'
        },
        'conv3': {
            'name': 'Convolution Layer 3',
            'kernel_size': '3x3',
            'stride': 1,
            'filters': 384,
            'description': 'Detects higher-level features by combining patterns from previous layers.',
            'formula': 'y = Σ(x * w) + b'
        },
        'relu3': {
            'name': 'ReLU Activation 3',
            'description': 'Continues to add non-linearity for learning complex patterns.',
            'formula': 'f(x) = max(0, x)'
        },
        'conv4': {
            'name': 'Convolution Layer 4',
            'kernel_size': '3x3',
            'stride': 1,
            'filters': 256,
            'description': 'Further refines feature representations, detecting object parts and complex textures.',
            'formula': 'y = Σ(x * w) + b'
        },
        'relu4': {
            'name': 'ReLU Activation 4',
            'description': 'Non-linear activation for learning hierarchical feature representations.',
            'formula': 'f(x) = max(0, x)'
        },
        'conv5': {
            'name': 'Convolution Layer 5',
            'kernel_size': '3x3',
            'stride': 1,
            'filters': 256,
            'description': 'Extracts the highest-level visual features, often corresponding to semantic concepts and object parts.',
            'formula': 'y = Σ(x * w) + b'
        },
        'relu5': {
            'name': 'ReLU Activation 5',
            'description': 'Final convolutional non-linearity before pooling.',
            'formula': 'f(x) = max(0, x)'
        },
        'pool5': {
            'name': 'Max Pooling 3',
            'kernel_size': '3x3',
            'stride': 2,
            'description': 'Final spatial reduction before fully connected layers.',
            'formula': 'y = max(x[i:i+k, j:j+k])'
        },
        'flatten': {
            'name': 'Flatten',
            'description': 'Converts 3D feature maps into a 1D vector for the fully connected layers.',
            'formula': 'y = reshape(x, (batch_size, -1))'
        },
        'fc6': {
            'name': 'Fully Connected Layer 1',
            'neurons': 4096,
            'description': 'First fully connected layer that combines all spatial features for high-level reasoning.',
            'formula': 'y = Wx + b'
        },
        'relu6': {
            'name': 'ReLU Activation 6',
            'description': 'Non-linear activation in the fully connected layers.',
            'formula': 'f(x) = max(0, x)'
        },
        'fc7': {
            'name': 'Fully Connected Layer 2',
            'neurons': 4096,
            'description': 'Second fully connected layer for further feature abstraction.',
            'formula': 'y = Wx + b'
        },
        'relu7': {
            'name': 'ReLU Activation 7',
            'description': 'Non-linear activation before the final classification layer.',
            'formula': 'f(x) = max(0, x)'
        },
        'fc8': {
            'name': 'Output Layer',
            'neurons': 1000,
            'description': 'Final classification layer that outputs raw scores (logits) for each of the 1000 ImageNet classes.',
            'formula': 'y = Wx + b'
        },
        'softmax': {
            'name': 'Softmax',
            'description': 'Converts raw logits into probability distribution. Each output represents the probability of the input belonging to that class.',
            'formula': 'P(class_i) = e^(z_i) / Σ(e^(z_j))'
        }
    }
    
    def __init__(self, device: str = None):
        """Initialize the AlexNet model with hooks for capturing activations."""
        self.device = device or ('cuda' if torch.cuda.is_available() else 'cpu')
        print(f"Using device: {self.device}")
        
        # Load pretrained AlexNet
        self.model = models.alexnet(weights=models.AlexNet_Weights.IMAGENET1K_V1)
        self.model = self.model.to(self.device)
        self.model.eval()
        
        # Storage for intermediate activations
        self.activations: Dict[str, torch.Tensor] = {}
        self.gradients: Dict[str, torch.Tensor] = {}
        
        # Register hooks
        self._register_hooks()
        
        # Load ImageNet labels
        self.labels = self._load_imagenet_labels()
        
        # Image preprocessing transform
        self.transform = transforms.Compose([
            transforms.Resize(256),
            transforms.CenterCrop(224),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225]
            )
        ])
    
    def _load_imagenet_labels(self) -> List[str]:
        """Load ImageNet class labels."""
        try:
            import urllib.request
            response = urllib.request.urlopen(self.IMAGENET_LABELS_URL)
            labels = [line.decode('utf-8').strip() for line in response.readlines()]
            return labels
        except Exception as e:
            print(f"Could not load ImageNet labels: {e}")
            return [f"class_{i}" for i in range(1000)]
    
    def _register_hooks(self):
        """Register forward hooks to capture intermediate activations."""
        # Map layer indices to names for the features (convolutional) part
        # AlexNet features structure:
        # 0: Conv2d(3, 64, 11, 4, 2)
        # 1: ReLU
        # 2: MaxPool2d(3, 2)
        # 3: Conv2d(64, 192, 5, 1, 2)
        # 4: ReLU
        # 5: MaxPool2d(3, 2)
        # 6: Conv2d(192, 384, 3, 1, 1)
        # 7: ReLU
        # 8: Conv2d(384, 256, 3, 1, 1)
        # 9: ReLU
        # 10: Conv2d(256, 256, 3, 1, 1)
        # 11: ReLU
        # 12: MaxPool2d(3, 2)
        
        feature_layers = {
            0: 'conv1',
            1: 'relu1',
            2: 'pool1',
            3: 'conv2',
            4: 'relu2',
            5: 'pool2',
            6: 'conv3',
            7: 'relu3',
            8: 'conv4',
            9: 'relu4',
            10: 'conv5',
            11: 'relu5',
            12: 'pool5'
        }
        
        # Register hooks for feature layers
        for idx, name in feature_layers.items():
            self.model.features[idx].register_forward_hook(
                self._get_activation_hook(name)
            )
        
        # Register hook for avgpool
        self.model.avgpool.register_forward_hook(
            self._get_activation_hook('avgpool')
        )
        
        # Classifier structure:
        # 0: Dropout
        # 1: Linear(9216, 4096)
        # 2: ReLU
        # 3: Dropout
        # 4: Linear(4096, 4096)
        # 5: ReLU
        # 6: Linear(4096, 1000)
        
        classifier_layers = {
            1: 'fc6',
            2: 'relu6',
            4: 'fc7',
            5: 'relu7',
            6: 'fc8'
        }
        
        for idx, name in classifier_layers.items():
            self.model.classifier[idx].register_forward_hook(
                self._get_activation_hook(name)
            )
    
    def _get_activation_hook(self, name: str):
        """Create a hook function that saves the activation."""
        def hook(module, input, output):
            self.activations[name] = output.detach()
        return hook
    
    def _get_gradient_hook(self, name: str):
        """Create a hook function that saves the gradients."""
        def hook(module, grad_input, grad_output):
            self.gradients[name] = grad_output[0].detach()
        return hook
    
    def preprocess_image(self, image: Image.Image) -> torch.Tensor:
        """Preprocess an image for the model."""
        if image.mode != 'RGB':
            image = image.convert('RGB')
        tensor = self.transform(image)
        return tensor.unsqueeze(0).to(self.device)
    
    def predict(self, image: Image.Image) -> Tuple[str, List[Tuple[str, float]], Dict[str, torch.Tensor]]:
        """
        Run inference on an image and return predictions with activations.
        
        Args:
            image: PIL Image to classify
            
        Returns:
            Tuple of (predicted_class, top5_probabilities, activations_dict)
        """
        # Clear previous activations
        self.activations.clear()
        
        # Preprocess and predict
        input_tensor = self.preprocess_image(image)
        
        with torch.no_grad():
            output = self.model(input_tensor)
        
        # Apply softmax to get probabilities
        probabilities = torch.nn.functional.softmax(output[0], dim=0)
        
        # Get top 5 predictions
        top5_prob, top5_idx = torch.topk(probabilities, 5)
        top5_predictions = [
            (self.labels[idx.item()], prob.item())
            for idx, prob in zip(top5_idx, top5_prob)
        ]
        
        # Best prediction
        best_class = self.labels[top5_idx[0].item()]
        
        return best_class, top5_predictions, dict(self.activations)
    
    def compute_gradcam(self, image: Image.Image, target_class: int = None) -> np.ndarray:
        """
        Compute Grad-CAM heatmap for the given image.
        
        Args:
            image: PIL Image to analyze
            target_class: Class index for Grad-CAM (None = use predicted class)
            
        Returns:
            Heatmap as numpy array (H, W) with values in [0, 1]
        """
        self.activations.clear()
        self.gradients.clear()
        
        # Enable gradients for Grad-CAM
        input_tensor = self.preprocess_image(image)
        input_tensor.requires_grad = True
        
        # Register backward hook for gradients
        target_layer = self.model.features[10]  # conv5
        
        gradients = []
        def save_gradient(module, grad_input, grad_output):
            gradients.append(grad_output[0].detach())
        
        handle = target_layer.register_backward_hook(save_gradient)
        
        # Forward pass
        output = self.model(input_tensor)
        
        # Get target class
        if target_class is None:
            target_class = output.argmax(dim=1).item()
        
        # Backward pass
        self.model.zero_grad()
        output[0, target_class].backward()
        
        # Get gradients and activations
        gradient = gradients[0]
        activation = self.activations['conv5']
        
        # Compute Grad-CAM
        weights = gradient.mean(dim=(2, 3), keepdim=True)  # Global average pooling
        cam = (weights * activation).sum(dim=1, keepdim=True)
        cam = torch.relu(cam)  # ReLU on the CAM    
        
        # Normalize to [0, 1]
        cam = cam - cam.min()
        if cam.max() > 0:
            cam = cam / cam.max()
        
        # Resize to input size
        cam = torch.nn.functional.interpolate(
            cam, size=(224, 224), mode='bilinear', align_corners=False
        )
        
        # Convert to numpy
        cam = cam.squeeze().cpu().numpy()
        
        # Remove hook
        handle.remove()
        
        return cam, target_class
    
    def get_filter_weights(self, layer_name: str = 'conv1') -> np.ndarray:
        """Get the learned filter weights from a convolutional layer."""
        layer_map = {
            'conv1': 0,
            'conv2': 3,
            'conv3': 6,
            'conv4': 8,
            'conv5': 10
        }
        
        if layer_name not in layer_map:
            return None
        
        layer = self.model.features[layer_map[layer_name]]
        weights = layer.weight.detach().cpu().numpy()
        return weights
    
    def get_layer_info(self, layer_name: str) -> Dict:
        """Get information about a specific layer."""
        return self.LAYER_INFO.get(layer_name, {})
    
    def get_all_layer_names(self) -> List[str]:
        """Get list of all capturable layer names in order."""
        return [
            'conv1', 'relu1', 'pool1',
            'conv2', 'relu2', 'pool2',
            'conv3', 'relu3',
            'conv4', 'relu4',
            'conv5', 'relu5', 'pool5',
            'fc6', 'relu6',
            'fc7', 'relu7',
            'fc8', 'softmax'
        ]


# Global model instance (singleton pattern for efficiency)
_model_instance: Optional[AlexNetVisualizer] = None


def get_model() -> AlexNetVisualizer:
    """Get or create the global model instance."""
    global _model_instance
    if _model_instance is None:
        _model_instance = AlexNetVisualizer()
    return _model_instance
