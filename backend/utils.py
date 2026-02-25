"""
Visualization Utilities
=======================
Utility functions for converting feature maps and tensors to
images suitable for web visualization.
"""

import numpy as np
import torch
from PIL import Image
import io
import base64
import matplotlib.pyplot as plt
import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend
import cv2
from typing import List, Tuple, Dict, Optional


def tensor_to_image(tensor: torch.Tensor, normalize: bool = True) -> np.ndarray:
    """
    Convert a single-channel tensor to a grayscale image.
    
    Args:
        tensor: 2D tensor (H, W)
        normalize: Whether to normalize to 0-255 range
        
    Returns:
        Grayscale image as numpy array (H, W) with values 0-255
    """
    img = tensor.cpu().numpy()
    
    if normalize:
        # Normalize to 0-1 range
        img = img - img.min()
        if img.max() > 0:
            img = img / img.max()
        # Scale to 0-255
        img = (img * 255).astype(np.uint8)
    else:
        img = np.clip(img, 0, 255).astype(np.uint8)
    
    return img


def feature_maps_to_grid(
    activation: torch.Tensor,
    max_maps: int = 16,
    grid_cols: int = 4,
    padding: int = 2
) -> np.ndarray:
    """
    Convert feature map activation to a grid of images.
    
    Args:
        activation: Tensor of shape (B, C, H, W) or (C, H, W)
        max_maps: Maximum number of feature maps to show
        grid_cols: Number of columns in the grid
        padding: Padding between grid cells
        
    Returns:
        Grid image as numpy array
    """
    # Handle batch dimension
    if activation.dim() == 4:
        activation = activation[0]  # Take first batch item
    
    # Get dimensions
    num_channels, height, width = activation.shape
    num_show = min(num_channels, max_maps)
    
    # Calculate grid dimensions
    grid_rows = (num_show + grid_cols - 1) // grid_cols
    
    # Calculate output size
    grid_height = grid_rows * (height + padding) - padding
    grid_width = grid_cols * (width + padding) - padding
    
    # Create output grid (white background)
    grid = np.ones((grid_height, grid_width), dtype=np.uint8) * 255
    
    # Fill grid with feature maps
    for idx in range(num_show):
        row = idx // grid_cols
        col = idx % grid_cols
        
        y_start = row * (height + padding)
        x_start = col * (width + padding)
        
        # Convert feature map to image
        feature_img = tensor_to_image(activation[idx])
        
        # Place in grid
        grid[y_start:y_start + height, x_start:x_start + width] = feature_img
    
    return grid


def numpy_to_base64(img: np.ndarray, format: str = 'PNG') -> str:
    """
    Convert numpy array to base64 encoded string.
    
    Args:
        img: Numpy array image (grayscale or RGB)
        format: Image format ('PNG', 'JPEG', etc.)
        
    Returns:
        Base64 encoded string
    """
    # Convert to PIL Image
    if len(img.shape) == 2:
        pil_img = Image.fromarray(img, mode='L')
    else:
        pil_img = Image.fromarray(img)
    
    # Save to buffer
    buffer = io.BytesIO()
    pil_img.save(buffer, format=format)
    buffer.seek(0)
    
    # Encode to base64
    return base64.b64encode(buffer.getvalue()).decode('utf-8')


def pil_to_base64(img: Image.Image, format: str = 'PNG') -> str:
    """
    Convert PIL Image to base64 encoded string.
    
    Args:
        img: PIL Image
        format: Image format
        
    Returns:
        Base64 encoded string
    """
    buffer = io.BytesIO()
    img.save(buffer, format=format)
    buffer.seek(0)
    return base64.b64encode(buffer.getvalue()).decode('utf-8')


def base64_to_pil(base64_str: str) -> Image.Image:
    """
    Convert base64 string to PIL Image.
    
    Args:
        base64_str: Base64 encoded image string
        
    Returns:
        PIL Image
    """
    # Handle data URL format
    if ',' in base64_str:
        base64_str = base64_str.split(',')[1]
    
    image_data = base64.b64decode(base64_str)
    return Image.open(io.BytesIO(image_data))


def create_activation_visualization(
    activations: Dict[str, torch.Tensor],
    layer_name: str,
    max_maps: int = 16
) -> Tuple[str, Dict]:
    """
    Create visualization for a specific layer's activation.
    
    Args:
        activations: Dictionary of layer activations
        layer_name: Name of the layer to visualize
        max_maps: Maximum feature maps to show
        
    Returns:
        Tuple of (base64 image string, metadata dict)
    """
    if layer_name not in activations:
        return None, {'error': f'Layer {layer_name} not found'}
    
    activation = activations[layer_name]
    
    # Handle different tensor shapes
    if activation.dim() == 2:
        # FC layer output (B, features)
        # Create a bar-like visualization
        values = activation[0].cpu().numpy()
        num_show = min(len(values), 100)
        
        fig, ax = plt.subplots(figsize=(10, 4))
        ax.bar(range(num_show), values[:num_show], color='#3B82F6')
        ax.set_xlabel('Neuron Index')
        ax.set_ylabel('Activation Value')
        ax.set_title(f'{layer_name} Activations (first {num_show} neurons)')
        ax.set_facecolor('#1F2937')
        fig.patch.set_facecolor('#111827')
        ax.tick_params(colors='white')
        ax.xaxis.label.set_color('white')
        ax.yaxis.label.set_color('white')
        ax.title.set_color('white')
        for spine in ax.spines.values():
            spine.set_color('white')
        
        # Save to base64
        buffer = io.BytesIO()
        plt.savefig(buffer, format='PNG', bbox_inches='tight', facecolor='#111827')
        buffer.seek(0)
        plt.close()
        
        base64_img = base64.b64encode(buffer.getvalue()).decode('utf-8')
        metadata = {
            'type': 'fc',
            'num_neurons': len(values),
            'shape': list(activation.shape),
            'mean': float(values.mean()),
            'std': float(values.std()),
            'max': float(values.max()),
            'min': float(values.min())
        }
        
    elif activation.dim() >= 3:
        # Conv/Pool layer output (B, C, H, W) or (C, H, W)
        if activation.dim() == 4:
            activation = activation[0]
        
        num_channels, h, w = activation.shape
        
        # Create grid visualization
        grid = feature_maps_to_grid(activation, max_maps=max_maps)
        
        # Apply colormap for better visualization
        colored = cv2.applyColorMap(grid, cv2.COLORMAP_VIRIDIS)
        colored = cv2.cvtColor(colored, cv2.COLOR_BGR2RGB)
        
        base64_img = numpy_to_base64(colored)
        metadata = {
            'type': 'conv',
            'num_channels': num_channels,
            'spatial_size': [h, w],
            'shape': [num_channels, h, w],
            'shown_maps': min(num_channels, max_maps)
        }
    else:
        return None, {'error': 'Unsupported activation shape'}
    
    return base64_img, metadata


def create_all_activations_visualization(
    activations: Dict[str, torch.Tensor],
    max_maps: int = 16
) -> Dict[str, Dict]:
    """
    Create visualizations for all layer activations.
    
    Args:
        activations: Dictionary of layer activations
        max_maps: Maximum feature maps to show per layer
        
    Returns:
        Dictionary with layer names as keys, containing image and metadata
    """
    result = {}
    
    for layer_name, activation in activations.items():
        base64_img, metadata = create_activation_visualization(
            activations, layer_name, max_maps
        )
        
        if base64_img:
            result[layer_name] = {
                'image': base64_img,
                'metadata': metadata
            }
    
    return result


def create_gradcam_overlay(
    original_image: Image.Image,
    heatmap: np.ndarray,
    alpha: float = 0.5
) -> Image.Image:
    """
    Overlay Grad-CAM heatmap on the original image.
    
    Args:
        original_image: Original PIL Image
        heatmap: Grad-CAM heatmap (H, W) with values in [0, 1]
        alpha: Blending factor for overlay
        
    Returns:
        PIL Image with overlay
    """
    # Resize original to 224x224 (AlexNet input size)
    original = original_image.copy()
    if original.mode != 'RGB':
        original = original.convert('RGB')
    original = original.resize((224, 224))
    original_np = np.array(original)
    
    # Apply colormap to heatmap
    heatmap_uint8 = (heatmap * 255).astype(np.uint8)
    heatmap_colored = cv2.applyColorMap(heatmap_uint8, cv2.COLORMAP_JET)
    heatmap_colored = cv2.cvtColor(heatmap_colored, cv2.COLOR_BGR2RGB)
    
    # Blend images
    overlay = (alpha * heatmap_colored + (1 - alpha) * original_np).astype(np.uint8)
    
    return Image.fromarray(overlay)


def create_filter_visualization(
    weights: np.ndarray,
    layer_name: str,
    max_filters: int = 16
) -> str:
    """
    Visualize convolutional filter weights.
    
    Args:
        weights: Filter weights (out_channels, in_channels, H, W)
        layer_name: Name of the layer
        max_filters: Maximum filters to show
        
    Returns:
        Base64 encoded image string
    """
    num_filters = min(weights.shape[0], max_filters)
    
    # For first layer, we can show RGB filters directly
    if weights.shape[1] == 3:  # RGB input
        grid_cols = 4
        grid_rows = (num_filters + grid_cols - 1) // grid_cols
        
        fig, axes = plt.subplots(grid_rows, grid_cols, figsize=(12, 3 * grid_rows))
        fig.patch.set_facecolor('#111827')
        
        for idx in range(num_filters):
            row = idx // grid_cols
            col = idx % grid_cols
            ax = axes[row, col] if grid_rows > 1 else axes[col]
            
            # Get filter and normalize
            filt = weights[idx].transpose(1, 2, 0)  # (H, W, C)
            filt = (filt - filt.min()) / (filt.max() - filt.min() + 1e-8)
            
            ax.imshow(filt)
            ax.set_title(f'Filter {idx}', color='white', fontsize=8)
            ax.axis('off')
        
        # Hide unused subplots
        for idx in range(num_filters, grid_rows * grid_cols):
            row = idx // grid_cols
            col = idx % grid_cols
            ax = axes[row, col] if grid_rows > 1 else axes[col]
            ax.axis('off')
        
        plt.tight_layout()
        
    else:
        # For deeper layers, show as grayscale mean across input channels
        grid_cols = 4
        grid_rows = (num_filters + grid_cols - 1) // grid_cols
        
        fig, axes = plt.subplots(grid_rows, grid_cols, figsize=(12, 3 * grid_rows))
        fig.patch.set_facecolor('#111827')
        
        for idx in range(num_filters):
            row = idx // grid_cols
            col = idx % grid_cols
            
            if grid_rows == 1:
                ax = axes[col] if grid_cols > 1 else axes
            else:
                ax = axes[row, col]
            
            # Average across input channels
            filt = weights[idx].mean(axis=0)
            filt = (filt - filt.min()) / (filt.max() - filt.min() + 1e-8)
            
            ax.imshow(filt, cmap='viridis')
            ax.set_title(f'Filter {idx}', color='white', fontsize=8)
            ax.axis('off')
        
        # Hide unused subplots
        for idx in range(num_filters, grid_rows * grid_cols):
            row = idx // grid_cols
            col = idx % grid_cols
            if grid_rows == 1:
                ax = axes[col] if grid_cols > 1 else axes
            else:
                ax = axes[row, col]
            ax.axis('off')
        
        plt.tight_layout()
    
    # Save to base64
    buffer = io.BytesIO()
    plt.savefig(buffer, format='PNG', bbox_inches='tight', facecolor='#111827')
    buffer.seek(0)
    plt.close()
    
    return base64.b64encode(buffer.getvalue()).decode('utf-8')


def create_probability_chart(
    predictions: List[Tuple[str, float]],
    top_n: int = 5
) -> str:
    """
    Create a horizontal bar chart of prediction probabilities.
    
    Args:
        predictions: List of (class_name, probability) tuples
        top_n: Number of top predictions to show
        
    Returns:
        Base64 encoded image string
    """
    predictions = predictions[:top_n]
    
    labels = [p[0] for p in predictions]
    probs = [p[1] * 100 for p in predictions]  # Convert to percentage
    
    fig, ax = plt.subplots(figsize=(10, 6))
    fig.patch.set_facecolor('#111827')
    ax.set_facecolor('#1F2937')
    
    # Create horizontal bar chart
    bars = ax.barh(range(len(labels)), probs, color='#3B82F6', height=0.6)
    
    # Customize appearance
    ax.set_yticks(range(len(labels)))
    ax.set_yticklabels(labels, fontsize=12)
    ax.set_xlabel('Confidence (%)', fontsize=12, color='white')
    ax.set_title('Top 5 Predictions', fontsize=14, color='white', pad=20)
    ax.set_xlim(0, 100)
    
    # Style ticks and spines
    ax.tick_params(colors='white')
    for spine in ax.spines.values():
        spine.set_color('#374151')
    
    # Add percentage labels on bars
    for bar, prob in zip(bars, probs):
        ax.text(bar.get_width() + 1, bar.get_y() + bar.get_height()/2,
                f'{prob:.1f}%', va='center', color='white', fontsize=10)
    
    plt.tight_layout()
    
    # Save to base64
    buffer = io.BytesIO()
    plt.savefig(buffer, format='PNG', bbox_inches='tight', facecolor='#111827')
    buffer.seek(0)
    plt.close()
    
    return base64.b64encode(buffer.getvalue()).decode('utf-8')


def create_individual_feature_maps(
    activation: torch.Tensor,
    max_maps: int = 16
) -> List[str]:
    """
    Create individual base64 images for each feature map.
    
    Args:
        activation: Tensor of shape (B, C, H, W) or (C, H, W)
        max_maps: Maximum number of feature maps to return
        
    Returns:
        List of base64 encoded image strings
    """
    if activation.dim() == 4:
        activation = activation[0]
    
    num_channels = activation.shape[0]
    num_show = min(num_channels, max_maps)
    
    images = []
    for i in range(num_show):
        feature_img = tensor_to_image(activation[i])
        
        # Apply colormap
        colored = cv2.applyColorMap(feature_img, cv2.COLORMAP_VIRIDIS)
        colored = cv2.cvtColor(colored, cv2.COLOR_BGR2RGB)
        
        images.append(numpy_to_base64(colored))
    
    return images


def resize_image_for_preview(image: Image.Image, max_size: int = 400) -> Image.Image:
    """
    Resize image while maintaining aspect ratio.
    
    Args:
        image: PIL Image
        max_size: Maximum dimension
        
    Returns:
        Resized PIL Image
    """
    ratio = min(max_size / image.width, max_size / image.height)
    if ratio < 1:
        new_size = (int(image.width * ratio), int(image.height * ratio))
        return image.resize(new_size, Image.Resampling.LANCZOS)
    return image
