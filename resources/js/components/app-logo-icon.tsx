import { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg
            {...props}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* Elegant geometric R monogram mark */}
            <path d="M7 4h6.5a4 4 0 0 1 0 8H7V4z" fill="currentColor" fillOpacity="0.18" />
            <path d="M7 3v18" />
            <path d="M7 4h6.5a4 4 0 0 1 0 8H7" />
            <path d="M12.5 12l5.5 8" />
            <circle cx="18" cy="6" r="1.5" fill="currentColor" />
        </svg>
    );
}
