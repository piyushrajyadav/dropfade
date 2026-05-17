"use client"

import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export function Navbar() {
  const { theme, setTheme } = useTheme()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-20 items-center justify-between px-4 md:px-6">
        {/* Left: Logo */}
        <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity group">
          <div className="relative h-9 w-9 transition-transform group-hover:scale-110">
            <Image 
              src="/logos/drop.png" 
              alt="DropFade" 
              fill
              className="object-contain"
            />
          </div>
          <span className="font-bold text-xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            DropFade
          </span>
        </Link>
        
        {/* Right: Actions */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Access Button */}
          <Link href="/access">
            <Button 
              variant="ghost" 
              size="sm" 
              className="font-semibold text-base hover:bg-accent/10 hover:text-accent transition-all"
            >
              Access Drop
            </Button>
          </Link>

          {/* Divider */}
          <div className="h-8 w-px bg-border/60 hidden sm:block" />

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="h-10 w-10 hover:bg-accent/10 hover:text-accent transition-all"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* Product Hunt Badge */}
          <a 
            href="https://www.producthunt.com/products/dropfade?utm_source=badge-follow&utm_medium=badge&utm_source=badge-dropfade" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hidden lg:block hover:opacity-80 transition-opacity"
          >
            <img 
              src="https://api.producthunt.com/widgets/embed-image/v1/follow.svg?product_id=1110435&theme=light" 
              alt="DropFade on Product Hunt" 
              style={{ width: '200px', height: '43px' }} 
              width="200" 
              height="43" 
            />
          </a>
        </div>
      </div>
    </header>
  )
}
