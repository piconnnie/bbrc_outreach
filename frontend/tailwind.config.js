/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Mantis-inspired Palette
                primary: {
                    50: '#e6f7ff', // Light Blue background
                    100: '#bae7ff',
                    500: '#1890ff', // Standard Ant/Mantis Blue
                    600: '#096dd9',
                    700: '#0050b3',
                },
                secondary: {
                    50: '#f8fafc',
                    200: '#e2e8f0',
                    900: '#0f172a',
                },
                success: '#52c41a',
                warning: '#faad14',
                error: '#ff4d4f',
            },
            fontFamily: {
                sans: ['Inter', 'Roboto', 'sans-serif'], // Mantis uses Public Sans/Roboto
            },
            boxShadow: {
                'card': '0 2px 8px rgba(0, 0, 0, 0.15)', // Reduced, sharper shadow
            }
        },
    },
    plugins: [],
}
