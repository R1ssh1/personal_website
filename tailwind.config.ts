import type { Config } from 'tailwindcss'

const config: Config = {
	content: [
		'./src/pages/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/components/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/app/**/*.{js,ts,jsx,tsx,mdx}',
	],
	darkMode: 'class',
	theme: {
		extend: {
			colors: {
				'light-primary': '#FFFFFF',
				'light-secondary': '#F8F9FA',
				'light-text': '#1B2951',
				'light-accent': '#3B82F6',
				'light-muted': '#6B7280',
				'dark-primary': '#1F1F23',
				'dark-secondary': '#2A2A2F',
				'dark-text': '#F8F9FA',
				'dark-accent': '#8B5CF6',
				'dark-muted': '#9CA3AF',
				text: 'var(--color-text)',
			},
			fontFamily: {
				logo: [
					'Playfair Display',
					'serif'
				],
				nav: [
					'Inter',
					'sans-serif'
				]
			},
			backdropBlur: {
				glass: '12px'
			},
			backgroundImage: {
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
				'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))'
			},
			animation: {
				'fade-in': 'fade-in 0.5s ease-in-out',
				'slide-up': 'slide-up 0.5s ease-out',
				'theme-transition': 'theme-transition 0.3s ease-in-out',
				float: 'float 3s ease-in-out infinite',
				'star-movement-bottom': 'star-movement-bottom 3s ease-in-out infinite alternate',
				'star-movement-top': 'star-movement-top 3s ease-in-out infinite alternate',
				'star-movement-bottom-fast': 'star-movement-bottom 1.5s ease-in-out infinite alternate',
				'star-movement-top-fast': 'star-movement-top 1.5s ease-in-out infinite alternate',
				shine: 'shine 5s ease-in-out infinite'
			},
			keyframes: {
				'fade-in': {
					'0%': {
						opacity: '0'
					},
					'100%': {
						opacity: '1'
					}
				},
				'slide-up': {
					'0%': {
						transform: 'translateY(10px)',
						opacity: '0'
					},
					'100%': {
						transform: 'translateY(0px)',
						opacity: '1'
					}
				},
				'theme-transition': {
					'0%': {
						opacity: '0.8'
					},
					'100%': {
						opacity: '1'
					}
				},
				float: {
					'0%, 100%': {
						transform: 'translateY(0px)'
					},
					'50%': {
						transform: 'translateY(-4px)'
					}
				},
				'star-movement-bottom': {
					'0%': { transform: 'translate(0%, 0%)', opacity: '1' },
					'100%': { transform: 'translate(-100%, 0%)', opacity: '0' }
				},
				'star-movement-top': {
					'0%': { transform: 'translate(0%, 0%)', opacity: '1' },
					'100%': { transform: 'translate(100%, 0%)', opacity: '0' }
				},
				shine: {
					'0%': { 'background-position': '100%' },
					'100%': { 'background-position': '-100%' }
				}
			},
			borderRadius: {
				lg: '0.5rem',
				md: '0.375rem',
				sm: '0.25rem'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
}
export default config
