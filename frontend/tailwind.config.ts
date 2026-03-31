/** @type {import('tailwindcss').Config} */
export default {
    darkMode: "class", // QUAN TRỌNG: bật dark theo class

    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],

    theme: {
        extend: {
            maxWidth: {
                'dashboard': '1536px',        // cap for ultrawide monitors
            },
            fontSize: {
                'fluid-xs':  'clamp(0.625rem, 0.5vw + 0.375rem, 0.6875rem)',   // ~10-11px
                'fluid-sm':  'clamp(0.6875rem, 0.5vw + 0.4375rem, 0.8125rem)', // ~11-13px
                'fluid-base':'clamp(0.875rem, 1vw + 0.25rem, 1.25rem)',         // ~14-20px
                'fluid-lg':  'clamp(1.125rem, 1.2vw + 0.25rem, 1.625rem)',      // ~18-26px
            },
            spacing: {
                '4.5': '1.125rem',
                '5.5': '1.375rem',
            },
        },
    },

    plugins: [],
};