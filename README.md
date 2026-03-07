# 🧠 AlexNet Vision Explorer with AI 

An interactive CNN visualization platform that allows you to explore how AlexNet processes images layer by layer cov , polling , activation function.

![AlexNet Vision Explorer](https://img.shields.io/badge/Deep%20Learning-AlexNet-blue) ![React](https://img.shields.io/badge/Frontend-React-61DAFB) ![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688) ![PyTorch](https://img.shields.io/badge/ML-PyTorch-EE4C2C)

## ✨ Features

- **Image Upload & Classification**: Upload any image and see AlexNet's predictions with confidence scores
- **Layer-by-Layer Visualization**: Explore intermediate activations at every layer
- **Animated Layer Navigation**: Watch the forward pass with auto-play animation
- **Grad-CAM Heatmaps**: Visualize where the model focuses its attention
- **Interactive Comparison**: Before/after slider to compare original and processed images
- **Educational Tooltips**: Learn about convolutions, ReLU, pooling, and more
- **Modern UI**: Dark glassmorphic design with smooth animations

## 🏗️ Architecture

```
alexnet-vision-explorer/
├── backend/
│   ├── main.py          # FastAPI server with endpoints
│   ├── model.py         # AlexNet wrapper with hooks
│   ├── utils.py         # Visualization utilities
│   └── requirements.txt # Python dependencies
│
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable React components
│   │   ├── pages/       # Page components
│   │   ├── hooks/       # Custom React hooks
│   │   ├── services/    # API service layer
│   │   ├── App.jsx      # Main app component
│   │   └── index.css    # Global styles
│   ├── package.json     # Node dependencies
│   └── vite.config.js   # Vite configuration
│
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- Node.js 18+
- npm or yarn

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd alexnet-vision-explorer/backend
   ```

2. **Create a virtual environment (recommended):**
   ```bash
   python -m venv venv
   
   # Windows
   .\venv\Scripts\activate
   
   # Mac/Linux
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Start the server:**
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

   The API will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd alexnet-vision-explorer/frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173`

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/layers` | Get all layer information |
| GET | `/layers/{name}` | Get specific layer info |
| POST | `/predict` | Classify an image (file upload) |
| POST | `/predict/base64` | Classify from base64 image |
| POST | `/gradcam` | Generate Grad-CAM visualization |
| GET | `/filters/{name}` | Get filter weight visualization |
| GET | `/architecture` | Get model architecture summary |

## 🎨 UI Features

### Home Page
- Drag & drop image upload
- Top-5 predictions with probability bars
- Quick navigation to exploration tools

### Layer Explorer
- Interactive layer slider
- Auto-play animation
- Detailed layer information
- Mathematical formulas

### Grad-CAM Page
- Original vs heatmap comparison
- Adjustable overlay opacity
- Color legend for attention interpretation

### About Page
- AlexNet architecture breakdown
- Historical context
- Core concept explanations

## 🛠️ Technical Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **React Router** - Navigation
- **Axios** - HTTP client
- **React Dropzone** - File uploads

### Backend
- **FastAPI** - Web framework
- **PyTorch** - Deep learning
- **Torchvision** - Pretrained models
- **PIL/Pillow** - Image processing
- **OpenCV** - Image manipulation
- **Matplotlib** - Visualization

## 🌐 Deployment

### Backend Deployment (Render/Railway)

1. Create a `Procfile`:
   ```
   web: uvicorn main:app --host 0.0.0.0 --port $PORT
   ```

2. Set environment variables:
   ```
   PYTHON_VERSION=3.10
   ```

### Frontend Deployment (Vercel/Netlify)

1. Build the project:
   ```bash
   npm run build
   ```

2. Set environment variables:
   ```
   VITE_API_URL=https://your-backend-url.com
   ```

## 📝 Environment Variables

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000
```

### Backend
No required environment variables for local development.

## 🔧 Customization

### Adding New Visualizations

1. Add hook in `model.py`:
   ```python
   self.model.layer.register_forward_hook(self._get_activation_hook('name'))
   ```

2. Add endpoint in `main.py`
3. Create visualization in `utils.py`
4. Add UI component in frontend

### Modifying Styles

Edit `tailwind.config.js` for colors and themes, or `index.css` for custom CSS.

## 📚 Learning Resources

- [AlexNet Paper (2012)](https://papers.nips.cc/paper/2012/hash/c399862d3b9d6b76c8436e924a68c45b-Abstract.html)
- [PyTorch AlexNet Documentation](https://pytorch.org/vision/main/models/alexnet.html)
- [Grad-CAM Paper](https://arxiv.org/abs/1610.02391)
- [ImageNet Dataset](https://www.image-net.org/)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Alex Krizhevsky, Ilya Sutskever, and Geoffrey Hinton for creating AlexNet
- The PyTorch team for pretrained models
- The ImageNet team for the dataset

## 📬 Contact

- **Instagram**: [@itsprincepratap](https://www.instagram.com/itsprincepratap)
- **Email**: [theprincepratap@gmail.com](mailto:theprincepratap@gmail.com)

---

Made with ❤️ for AI Education
