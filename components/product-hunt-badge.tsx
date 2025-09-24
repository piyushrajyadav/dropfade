"use client"

import { useState } from "react"

interface ProductHuntBadgeProps {
  className?: string
  theme?: "light" | "dark"
  showAnimation?: boolean
}

export function ProductHuntBadge({ 
  className = "",
  theme = "light",
  showAnimation = true 
}: ProductHuntBadgeProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div 
      className={`inline-flex items-center justify-center ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <a
        href="https://www.producthunt.com/products/dropfade?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-dropfade"
        target="_blank"
        rel="noopener noreferrer"
        className={`
          block transition-all duration-300 ease-in-out rounded-lg overflow-hidden
          ${showAnimation ? (isHovered ? 'scale-105 shadow-lg shadow-orange-500/25' : 'hover:scale-105') : ''}
          ${showAnimation ? 'transform-gpu' : ''}
        `}
      >
        <img
          src={`https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1019236&theme=${theme}&t=${Date.now()}`}
          alt="DropFade - Secure, Anonymous File & Text Sharing with One-Time Access | Product Hunt"
          className="w-[250px] h-[54px] object-contain"
          width={250}
          height={54}
        />
      </a>
    </div>
  )
}

// Alternative compact version for smaller spaces
export function ProductHuntBadgeCompact({ 
  className = "",
  theme = "light" 
}: ProductHuntBadgeProps) {
  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <a
        href="https://www.producthunt.com/products/dropfade?embed=true&utm_source=badge-top-post-badge&utm_medium=badge&utm_source=badge-dropfade"
        target="_blank"
        rel="noopener noreferrer"
        className="block transition-all duration-300 ease-in-out hover:scale-105 rounded-lg overflow-hidden"
      >
        <img
          src={`https://api.producthunt.com/widgets/embed-image/v1/top-post-badge.svg?post_id=1019236&theme=${theme}&period=daily&t=${Date.now()}`}
          alt="DropFade - Secure, Anonymous File & Text Sharing with One-Time Access | Product Hunt"
          className="w-[200px] h-[43px] object-contain"
          width={200}
          height={43}
        />
      </a>
    </div>
  )
}

// Floating Product Hunt badge for sticky positioning
export function ProductHuntFloatingBadge({ 
  position = "top-right",
  theme = "light" 
}: { 
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left"
  theme?: "light" | "dark" 
}) {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  const positionClasses = {
    "top-right": "top-4 right-4",
    "top-left": "top-4 left-4", 
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4"
  }

  return (
    <div className={`fixed ${positionClasses[position]} z-50 group`}>
      <div className="relative">
        <button
          onClick={() => setIsVisible(false)}
          className="absolute -top-2 -right-2 w-6 h-6 bg-gray-500 hover:bg-gray-700 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
          aria-label="Close"
        >
          ×
        </button>
        <a
          href="https://www.producthunt.com/products/dropfade?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-dropfade"
          target="_blank"
          rel="noopener noreferrer"
          className="block transition-all duration-300 ease-in-out hover:scale-105 rounded-lg overflow-hidden shadow-lg hover:shadow-xl"
        >
          <img
            src={`https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1019236&theme=${theme}&t=${Date.now()}`}
            alt="DropFade - Product Hunt"
            className="w-[180px] h-[39px] object-contain"
            width={180}
            height={39}
          />
        </a>
      </div>
    </div>
  )
}