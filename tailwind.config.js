
/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./pages/**/*.{js,ts,jsx,tsx}" // Ensure all paths are covered
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            colors: {
                nearblack: '#070A0F',
                charcoal: '#0B0F14',
                navy: '#08111A',
                'accent-green': '#0B5D4B',
                'accent-gold': '#BFA05A',
            }
        },
    },
    plugins: [],
}
