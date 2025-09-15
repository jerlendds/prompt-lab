import React, { useState } from 'react'
import { PromptIcon, TerminalIcon, CollectionIcon } from './icons/Icons.jsx'

export default function ActionButtons() {
  const [activeModal, setActiveModal] = useState(null)

  const openModal = (type) => {
    setActiveModal(type)
  }

  const closeModal = () => {
    setActiveModal(null)
  }

  const buttons = [
    {
      type: 'prompt',
      label: 'Prompt',
      icon: <PromptIcon />,
      gradient: 'from-drab-700 via-beaker-800 to-drab-800',
      hoverGradient: 'from-drab-600 via-beaker-700 to-drab-700',
      glowColor: 'beaker-500'
    },
    {
      type: 'template', 
      label: 'Template',
      icon: <TerminalIcon />,
      gradient: 'from-drab-700 via-blue-900 to-drab-800',
      hoverGradient: 'from-drab-600 via-blue-800 to-drab-700',
      glowColor: 'blue-500'
    },
    {
      type: 'collection',
      label: 'Collection', 
      icon: <CollectionIcon />,
      gradient: 'from-drab-700 via-orange-900 to-drab-800',
      hoverGradient: 'from-drab-600 via-orange-800 to-drab-700',
      glowColor: 'orange-500'
    }
  ]

  return (
    <>
      {/* Big Dog Buttons */}
      <div className="flex items-center gap-3 px-4">
        {buttons.map(({ type, label, icon, gradient, hoverGradient, glowColor }) => (
          <button
            key={type}
            onClick={() => openModal(type)}
            className={`group relative overflow-hidden rounded-lg bg-gradient-to-r ${gradient} border border-drab-600/50 px-5 py-2.5 font-semibold text-drab-100 shadow-lg transition-all duration-300 hover:scale-[1.02] hover:bg-gradient-to-r hover:${hoverGradient} hover:border-${glowColor}/40 hover:shadow-${glowColor}/20 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-${glowColor}/40`}
          >
            {/* Glow effect overlay */}
            <div className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-0 blur-lg transition-opacity duration-300 group-hover:opacity-20`}></div>
            
            {/* Button content */}
            <div className="relative flex items-center gap-2 text-sm font-bold uppercase tracking-wide">
              <span className="w-4 h-4">{icon}</span>
              {label}
              <span className="text-lg font-black">+</span>
            </div>
            
            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 translate-x-[-100%] skew-x-12 transition-all duration-700 group-hover:translate-x-[100%] group-hover:opacity-60"></div>
          </button>
        ))}
      </div>

      {/* Modal Overlay */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
            onClick={closeModal}
          ></div>
          
          {/* Modal */}
          <div className="relative z-10 w-full max-w-lg transform transition-all duration-300 scale-100">
            <div className="bg-gradient-to-br from-drab-800/95 to-drab-900/98 backdrop-blur-xl border border-beaker-500/30 rounded-2xl shadow-2xl shadow-beaker-500/20 overflow-hidden">
              {/* Neon edge glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-beaker-400/20 via-transparent to-beaker-400/20 rounded-2xl blur-sm"></div>
              
              {/* Modal content */}
              <div className="relative p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-black text-transparent bg-gradient-to-r from-beaker-300 to-teal-300 bg-clip-text uppercase tracking-wider">
                    Create {activeModal}
                  </h2>
                  <button
                    onClick={closeModal}
                    className="text-drab-400 hover:text-beaker-300 transition-colors duration-200 text-xl font-bold"
                  >
                    ×
                  </button>
                </div>
                
                {/* Form scaffold */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-beaker-300 mb-2 uppercase tracking-wide">
                      Title
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-drab-700/50 border border-beaker-500/30 rounded-lg text-drab-100 placeholder-drab-400 focus:border-beaker-400/60 focus:bg-drab-700/70 focus:outline-none focus:ring-2 focus:ring-beaker-400/30 transition-all duration-200"
                      placeholder={`Enter ${activeModal} title...`}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-beaker-300 mb-2 uppercase tracking-wide">
                      Description
                    </label>
                    <textarea
                      rows={4}
                      className="w-full px-4 py-3 bg-drab-700/50 border border-beaker-500/30 rounded-lg text-drab-100 placeholder-drab-400 focus:border-beaker-400/60 focus:bg-drab-700/70 focus:outline-none focus:ring-2 focus:ring-beaker-400/30 transition-all duration-200 resize-none"
                      placeholder={`Describe your ${activeModal}...`}
                    ></textarea>
                  </div>
                  
                  {activeModal === 'prompt' && (
                    <div>
                      <label className="block text-sm font-bold text-beaker-300 mb-2 uppercase tracking-wide">
                        Prompt Content
                      </label>
                      <textarea
                        rows={6}
                        className="w-full px-4 py-3 bg-drab-700/50 border border-beaker-500/30 rounded-lg text-drab-100 placeholder-drab-400 focus:border-beaker-400/60 focus:bg-drab-700/70 focus:outline-none focus:ring-2 focus:ring-beaker-400/30 transition-all duration-200 resize-none font-mono"
                        placeholder="Enter your prompt here..."
                      ></textarea>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-bold text-beaker-300 mb-2 uppercase tracking-wide">
                      Tags
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-drab-700/50 border border-beaker-500/30 rounded-lg text-drab-100 placeholder-drab-400 focus:border-beaker-400/60 focus:bg-drab-700/70 focus:outline-none focus:ring-2 focus:ring-beaker-400/30 transition-all duration-200"
                      placeholder="Enter tags separated by commas..."
                    />
                  </div>
                </div>
                
                {/* Action buttons */}
                <div className="flex justify-end gap-3 mt-8">
                  <button
                    onClick={closeModal}
                    className="px-6 py-3 bg-drab-600/50 hover:bg-drab-500/60 text-drab-200 hover:text-drab-100 border border-drab-500/50 rounded-lg transition-all duration-200 font-semibold"
                  >
                    Cancel
                  </button>
                  <button className="px-8 py-3 bg-gradient-to-r from-beaker-600 to-teal-500 hover:from-beaker-500 hover:to-teal-400 text-white border border-beaker-500/50 rounded-lg transition-all duration-200 font-bold uppercase tracking-wide shadow-lg hover:shadow-beaker-400/30 hover:scale-105 active:scale-95">
                    Create {activeModal}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}