"use client"
import { useState } from "react"
import { Moon, Sun } from "lucide-react"
import { cn } from "@/lib/utils"

interface ThemeToggleProps {
    className?: string
    onChange?: (isDark: boolean) => void
}

export function ThemeToggle({ className, onChange }: ThemeToggleProps) {
    const [isDark, setIsDark] = useState(false)

    const toggle = () => {
        const next = !isDark
        setIsDark(next)
        onChange?.(next)
        if (next) {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }
    }

    return (
        <div
            className={cn(
                "flex w-16 h-8 p-1 rounded-full cursor-pointer transition-all duration-300",
                isDark
                    ? "bg-slate-900 border border-slate-700"
                    : "bg-white border border-zinc-200",
                className
            )}
            onClick={toggle}
            role="button"
            tabIndex={0}
        >
            <div className="flex justify-between items-center w-full">
                <div
                    className={cn(
                        "flex justify-center items-center w-6 h-6 rounded-full transition-transform duration-300",
                        isDark
                            ? "transform translate-x-0 bg-slate-700"
                            : "transform translate-x-8 bg-gray-200"
                    )}
                >
                    {isDark ? (
                        <Moon className="w-4 h-4 text-white" strokeWidth={1.5} />
                    ) : (
                        <Sun className="w-4 h-4 text-gray-700" strokeWidth={1.5} />
                    )}
                </div>
                <div
                    className={cn(
                        "flex justify-center items-center w-6 h-6 rounded-full transition-transform duration-300",
                        isDark ? "bg-transparent" : "transform -translate-x-8"
                    )}
                >
                    {isDark ? (
                        <Sun className="w-4 h-4 text-gray-500" strokeWidth={1.5} />
                    ) : (
                        <Moon className="w-4 h-4 text-black" strokeWidth={1.5} />
                    )}
                </div>
            </div>
        </div>
    )
}
