import { useState, useEffect } from 'react'

type Theme = 'light' | 'dark'

export function useTheme() {
    const [theme, setTheme] = useState<Theme>('light')
    const [mounted, setMounted] = useState(false)

    // Get system preference
    const getSystemTheme = (): Theme => {
        if (typeof window !== 'undefined') {
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
        }
        return 'light'
    }

    // Initialize theme on mount
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') as Theme
        const systemTheme = getSystemTheme()
        const initialTheme = savedTheme || systemTheme

        setTheme(initialTheme)
        updateTheme(initialTheme)
        setMounted(true)
    }, [])

    // Update theme in DOM and localStorage
    const updateTheme = (newTheme: Theme) => {
        if (typeof window !== 'undefined') {
            const root = window.document.documentElement
            root.classList.remove('light', 'dark')
            root.classList.add(newTheme)
            localStorage.setItem('theme', newTheme)
        }
    }

    // Toggle between light and dark
    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light'
        setTheme(newTheme)
        updateTheme(newTheme)
    }

    // Set specific theme
    const setThemeMode = (newTheme: Theme) => {
        setTheme(newTheme)
        updateTheme(newTheme)
    }

    return {
        theme,
        toggleTheme,
        setTheme: setThemeMode,
        mounted, // Use this to prevent hydration mismatches
    }
}
