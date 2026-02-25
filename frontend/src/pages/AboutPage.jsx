import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { 
  FaBrain, FaLayerGroup, FaHistory, FaLightbulb, 
  FaGraduationCap, FaCog, FaArrowRight, FaChevronDown 
} from 'react-icons/fa'
import { getArchitecture } from '../services/api'

function AboutPage() {
  const [architecture, setArchitecture] = useState(null)
  const [expandedSection, setExpandedSection] = useState('overview')

  useEffect(() => {
    fetchArchitecture()
  }, [])

  const fetchArchitecture = async () => {
    try {
      const data = await getArchitecture()
      setArchitecture(data)
    } catch (err) {
      console.error('Failed to fetch architecture:', err)
    }
  }

  const sections = [
    {
      id: 'overview',
      icon: FaBrain,
      title: 'Overview',
      content: (
        <div className="space-y-4">
          <p className="text-gray-300 leading-relaxed">
            AlexNet is a deep convolutional neural network that won the ImageNet Large Scale 
            Visual Recognition Challenge (ILSVRC) in 2012 by a significant margin. This victory 
            marked the beginning of the deep learning revolution in computer vision.
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-white/5 rounded-xl text-center">
              <div className="text-3xl font-bold text-blue-400 mb-1">61M</div>
              <div className="text-sm text-gray-400">Parameters</div>
            </div>
            <div className="p-4 bg-white/5 rounded-xl text-center">
              <div className="text-3xl font-bold text-purple-400 mb-1">8</div>
              <div className="text-sm text-gray-400">Layers</div>
            </div>
            <div className="p-4 bg-white/5 rounded-xl text-center">
              <div className="text-3xl font-bold text-green-400 mb-1">1000</div>
              <div className="text-sm text-gray-400">Classes</div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'architecture',
      icon: FaLayerGroup,
      title: 'Architecture',
      content: (
        <div className="space-y-4">
          <p className="text-gray-300 leading-relaxed mb-4">
            AlexNet consists of 5 convolutional layers, 3 max pooling layers, and 3 fully 
            connected layers, totaling 8 learnable layers.
          </p>
          <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
            {architecture?.layers?.map((layer, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center gap-4 p-3 bg-white/5 rounded-lg"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 text-sm font-mono">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">{layer.name}</span>
                    <span className="text-xs px-2 py-0.5 bg-white/10 rounded text-gray-400">
                      {layer.type}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 font-mono">{layer.params}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'history',
      icon: FaHistory,
      title: 'History',
      content: (
        <div className="space-y-4">
          <p className="text-gray-300 leading-relaxed">
            AlexNet was designed by Alex Krizhevsky, along with Ilya Sutskever and Geoffrey 
            Hinton. It was submitted to the ImageNet challenge in 2012 and achieved a top-5 
            error rate of 15.3%, compared to 26.2% achieved by the second-best entry.
          </p>
          <div className="relative pl-6 border-l-2 border-blue-500/30 space-y-6">
            {[
              { year: '2009', event: 'ImageNet dataset created with 14M+ images' },
              { year: '2010', event: 'First ILSVRC challenge begins' },
              { year: '2012', event: 'AlexNet wins ILSVRC, sparking deep learning revolution' },
              { year: '2014', event: 'VGGNet and GoogLeNet push boundaries further' },
              { year: '2015', event: 'ResNet achieves superhuman performance' },
            ].map((item, idx) => (
              <div key={idx} className="relative">
                <div className="absolute -left-[29px] w-4 h-4 bg-blue-500 rounded-full" />
                <div className="text-blue-400 font-bold">{item.year}</div>
                <div className="text-gray-300 text-sm">{item.event}</div>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'innovations',
      icon: FaLightbulb,
      title: 'Key Innovations',
      content: (
        <div className="space-y-4">
          {[
            {
              title: 'ReLU Activation',
              desc: 'Used ReLU instead of tanh or sigmoid, enabling much faster training.',
              color: 'yellow'
            },
            {
              title: 'Dropout Regularization',
              desc: 'Introduced dropout (p=0.5) in FC layers to prevent overfitting.',
              color: 'blue'
            },
            {
              title: 'Data Augmentation',
              desc: 'Image translations, horizontal reflections, and PCA color augmentation.',
              color: 'green'
            },
            {
              title: 'GPU Training',
              desc: 'Trained on two GTX 580 GPUs with model parallelism.',
              color: 'purple'
            },
            {
              title: 'Local Response Normalization',
              desc: 'Normalized responses to create competition among adjacent neurons.',
              color: 'orange'
            },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`p-4 rounded-xl border-l-4 bg-white/5
                ${item.color === 'yellow' ? 'border-yellow-500' : ''}
                ${item.color === 'blue' ? 'border-blue-500' : ''}
                ${item.color === 'green' ? 'border-green-500' : ''}
                ${item.color === 'purple' ? 'border-purple-500' : ''}
                ${item.color === 'orange' ? 'border-orange-500' : ''}
              `}
            >
              <h4 className="text-white font-semibold mb-1">{item.title}</h4>
              <p className="text-gray-400 text-sm">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      )
    },
    {
      id: 'concepts',
      icon: FaGraduationCap,
      title: 'Core Concepts',
      content: (
        <div className="space-y-6">
          {[
            {
              title: 'Convolution',
              formula: 'y[i,j] = Σ Σ x[i+m, j+n] × k[m, n]',
              desc: 'Slides a learned filter across the input to detect patterns.'
            },
            {
              title: 'ReLU Activation',
              formula: 'f(x) = max(0, x)',
              desc: 'Introduces non-linearity by zeroing negative values.'
            },
            {
              title: 'Max Pooling',
              formula: 'y = max(region)',
              desc: 'Downsamples by taking maximum values in local regions.'
            },
            {
              title: 'Softmax',
              formula: 'P(i) = e^(z_i) / Σ e^(z_j)',
              desc: 'Converts logits to probability distribution.'
            },
          ].map((concept, idx) => (
            <div key={idx} className="space-y-2">
              <h4 className="text-white font-semibold">{concept.title}</h4>
              <div className="p-3 bg-black/30 rounded-lg border border-white/10">
                <code className="text-blue-400 font-mono text-sm">{concept.formula}</code>
              </div>
              <p className="text-gray-400 text-sm">{concept.desc}</p>
            </div>
          ))}
        </div>
      )
    },
    {
      id: 'technical',
      icon: FaCog,
      title: 'Technical Details',
      content: (
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-white/5 rounded-xl">
              <h4 className="text-gray-400 text-sm mb-2">Input Size</h4>
              <div className="text-white font-mono">224 × 224 × 3</div>
            </div>
            <div className="p-4 bg-white/5 rounded-xl">
              <h4 className="text-gray-400 text-sm mb-2">Output</h4>
              <div className="text-white font-mono">1000 classes</div>
            </div>
            <div className="p-4 bg-white/5 rounded-xl">
              <h4 className="text-gray-400 text-sm mb-2">Training Data</h4>
              <div className="text-white font-mono">1.2M images</div>
            </div>
            <div className="p-4 bg-white/5 rounded-xl">
              <h4 className="text-gray-400 text-sm mb-2">Top-5 Error</h4>
              <div className="text-white font-mono">15.3%</div>
            </div>
          </div>
          
          <div className="p-4 bg-white/5 rounded-xl">
            <h4 className="text-gray-400 text-sm mb-3">Layer Output Sizes</h4>
            <div className="space-y-2 text-sm font-mono">
              <div className="flex justify-between text-gray-300">
                <span>Input</span><span>224×224×3</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Conv1 → Pool1</span><span>27×27×64</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Conv2 → Pool2</span><span>13×13×192</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Conv3</span><span>13×13×384</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Conv4</span><span>13×13×256</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Conv5 → Pool5</span><span>6×6×256</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>FC6, FC7</span><span>4096</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>FC8 (Output)</span><span>1000</span>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ]

  return (
    <div className="min-h-[calc(100vh-8rem)] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl 
                        bg-gradient-to-br from-blue-500 to-purple-600 mb-6">
            <FaBrain className="text-4xl text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">About AlexNet</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Learn about the architecture that revolutionized computer vision and 
            kicked off the modern deep learning era.
          </p>
        </motion.div>

        {/* Accordion Sections */}
        <div className="space-y-4">
          {sections.map((section, idx) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="glass-card overflow-hidden"
            >
              <button
                onClick={() => setExpandedSection(
                  expandedSection === section.id ? null : section.id
                )}
                className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-blue-500/20">
                    <section.icon className="text-xl text-blue-400" />
                  </div>
                  <span className="text-lg font-semibold text-white">
                    {section.title}
                  </span>
                </div>
                <motion.div
                  animate={{ rotate: expandedSection === section.id ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <FaChevronDown className="text-gray-400" />
                </motion.div>
              </button>

              <motion.div
                initial={false}
                animate={{
                  height: expandedSection === section.id ? 'auto' : 0,
                  opacity: expandedSection === section.id ? 1 : 0
                }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="p-6 pt-0 border-t border-white/10">
                  {section.content}
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <p className="text-gray-400 mb-4">
            Ready to see AlexNet in action?
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 btn-primary"
          >
            Try the Visualization
            <FaArrowRight />
          </a>
        </motion.div>
      </div>
    </div>
  )
}

export default AboutPage
