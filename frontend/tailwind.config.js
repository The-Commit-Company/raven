/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--color-background)',
        overlay: 'var(--color-overlay)',
        panel: {
          solid: 'var(--color-panel-solid)',
          translucent: 'var(--color-panel-translucent)',
        },
        surface: 'var(--color-surface)',
        transparent: 'var(--color-transparent)',
        gray: {
          1: 'var(--gray-1)',
          2: 'var(--gray-2)',
          3: 'var(--gray-3)',
          4: 'var(--gray-4)',
          5: 'var(--gray-5)',
          6: 'var(--gray-6)',
          7: 'var(--gray-7)',
          8: 'var(--gray-8)',
          9: {
            DEFAULT: 'var(--gray-9)',
            contrast: 'var(--gray-contrast)',
          },
          10: 'var(--gray-10)',
          11: 'var(--gray-11)',
          12: 'var(--gray-12)',
        },
        slate: {
          1: 'var(--slate-1)',
          2: 'var(--slate-2)',
          3: 'var(--slate-3)',
          4: 'var(--slate-4)',
          5: 'var(--slate-5)',
          6: 'var(--slate-6)',
          7: 'var(--slate-7)',
          8: 'var(--slate-8)',
          9: {
            DEFAULT: 'var(--slate-9)',
            contrast: 'var(--slate-contrast)',
          },
          10: 'var(--slate-10)',
          11: 'var(--slate-11)',
          12: 'var(--slate-12)',
        },
        accent: {
          1: 'var(--accent-1)',
          2: 'var(--accent-2)',
          3: 'var(--accent-3)',
          4: 'var(--accent-4)',
          5: 'var(--accent-5)',
          6: 'var(--accent-6)',
          7: 'var(--accent-7)',
          8: 'var(--accent-8)',
          9: {
            DEFAULT: 'var(--accent-9)',
            contrast: 'var(--accent-contrast)',
          },
          10: 'var(--accent-10)',
          11: 'var(--accent-11)',
          12: 'var(--accent-12)',
          a1: 'var(--accent-a1)',
          a2: 'var(--accent-a2)',
          a3: 'var(--accent-a3)',
          a4: 'var(--accent-a4)',
          a5: 'var(--accent-a5)',
          a6: 'var(--accent-a6)',
          a7: 'var(--accent-a7)',
          a8: 'var(--accent-a8)',
          a9: {
            DEFAULT: 'var(--accent-a9)',
            contrast: 'var(--accent-a9-contrast)',
          },
          a10: 'var(--accent-a10)',
          a11: 'var(--accent-a11)',
          a12: 'var(--accent-a12)',
        },
        iris: {
          1: 'var(--iris-1)',
          2: 'var(--iris-2)',
          3: 'var(--iris-3)',
          4: 'var(--iris-4)',
          5: 'var(--iris-5)',
          6: 'var(--iris-6)',
          7: 'var(--iris-7)',
          8: 'var(--iris-8)',
          9: {
            DEFAULT: 'var(--iris-9)',
            contrast: 'var(--iris-contrast)',
          },
          10: 'var(--iris-10)',
          11: 'var(--iris-11)',
          12: 'var(--iris-12)',
        },
        red: {
          1: 'var(--red-1)',
          2: 'var(--red-2)',
          3: 'var(--red-3)',
          4: 'var(--red-4)',
          5: 'var(--red-5)',
          6: 'var(--red-6)',
          7: 'var(--red-7)',
          8: 'var(--red-8)',
          9: {
            DEFAULT: 'var(--red-9)',
            contrast: 'var(--red-contrast)',
          },
          10: 'var(--red-10)',
          11: 'var(--red-11)',
          12: 'var(--red-12)',
        },
        green: {
          1: 'var(--green-1)',
          2: 'var(--green-2)',
          3: 'var(--green-3)',
          4: 'var(--green-4)',
          5: 'var(--green-5)',
          6: 'var(--green-6)',
          7: 'var(--green-7)',
          8: 'var(--green-8)',
          9: {
            DEFAULT: 'var(--green-9)',
            contrast: 'var(--green-contrast)',
          },
          10: 'var(--green-10)',
          11: 'var(--green-11)',
          12: 'var(--green-12)',
        }
      },
      borderRadius: {
        radius1: 'var(--radius-1)',
        radius2: 'var(--radius-2)',
        radius3: 'var(--radius-3)',
        radius4: 'var(--radius-4)',
        radius5: 'var(--radius-5)',
        radius6: 'var(--radius-6)',
      },
      animation: {
        fadein: 'fadeIn .25s ease-out',
        fadeinSlow: 'fadeIn 1s ease-in',
        'pulse-bounce': 'pulse-bounce 1.5s infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        'pulse-bounce': {
          '0%, 100%': {
            transform: 'translateY(0)',
            opacity: 0.2,
          },
          '50%': {
            transform: 'translateY(-1px)',
            opacity: 0.8,
          },
        },
      },
      transitionTimingFunction: {
        // Quad is the strongest easing curve
        // Circ is the weakest easing curve
        'ease-in-quad': 'cubic-bezier(.55, .085, .68, .53)',
        'ease-in-cubic': 'cubic-bezier(.55, .055, .675, .19)',
        'ease-in-quart': 'cubic-bezier(.895, .03, .685, .22)',
        'ease-in-quint': 'cubic-bezier(.755, .05, .855, .06)',
        'ease-in-expo': 'cubic-bezier(.95, .05, .795, .035)',
        'ease-in-circ': 'cubic-bezier(.6, .04, .98, .335)',

        'ease-out-quad': 'cubic-bezier(.25, .46, .45, .94)',
        'ease-out-cubic': 'cubic-bezier(.215, .61, .355, 1)',
        'ease-out-quart': 'cubic-bezier(.165, .84, .44, 1)',
        'ease-out-quint': 'cubic-bezier(.23, 1, .32, 1)',
        'ease-out-expo': 'cubic-bezier(.19, 1, .22, 1)',
        'ease-out-circ': 'cubic-bezier(.075, .82, .165, 1)',

        'ease-in-out-quad': 'cubic-bezier(.455, .03, .515, .955)',
        'ease-in-out-cubic': 'cubic-bezier(.645, .045, .355, 1)',
        'ease-in-out-quart': 'cubic-bezier(.77, 0, .175, 1)',
        'ease-in-out-quint': 'cubic-bezier(.86, 0, .07, 1)',
        'ease-in-out-expo': 'cubic-bezier(1, 0, 0, 1)',
        'ease-in-out-circ': 'cubic-bezier(.785, .135, .15, .86)',

        'ease': 'cubic-bezier(0.25, 0.1, 0.25, 1)'
      }
    },
  },
  darkMode: 'class',
  plugins: [
    import("tailwindcss-animate"),
  ],
  corePlugins: {
    preflight: false,
  }
}
