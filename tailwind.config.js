/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./pages/**/*.{js,ts,jsx,tsx}",
        "./*.{js,ts,jsx,tsx}" // Include root files like index.tsx
    ],
    theme: {
        extend: {
            colors: {
                nearblack: '#070A0F',
                charcoal: '#0B0F14',
                navy: '#08111A',
                'accent-green': '#0B5D4B',
                'accent-gold': '#BFA05A',
                'main-text': '#F5F7FA',
                muted: '#A8B0BA',
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
