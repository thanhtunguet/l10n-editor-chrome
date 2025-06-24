/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html', './src/popup.html', './src/options.html'],
    theme: {
        extend: {},
    },
    plugins: [],
    // Ensure Tailwind doesn't conflict with Ant Design
    corePlugins: {
        preflight: false,
    },
} 