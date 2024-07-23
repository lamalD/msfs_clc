import React from "react"
import { cn } from "@/lib/utils";

interface AppleSpinnerProps {
    className?: string;
}

export const AppleSpinner = ({ className }: AppleSpinnerProps) => {
    return (
        // <svg className={`animate-spin h-5 w-5 text-gray-400 ${className}`} viewBox="0 0 24 24">
        // <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        // <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0a8 8 0 0116 0v4a8 8 0 01-8 8z"/>
        // </svg>
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn("animate-spin", className)}
            >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
    )
}