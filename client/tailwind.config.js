/** @type {import('tailwindcss').Config} */


/**
 * Typography System Reference
 * 
 * Text Hierarchy:
 * - Page Titles: text-4xl font-bold
 * - Section Headers: text-2xl font-bold
 * - Subsection Headers: text-xl font-bold
 * - Card Titles: text-lg font-bold
 * - Body Text: text-base font-normal
 * - Small Text: text-sm font-normal
 * - Micro Text: text-xs font-normal
 * 
 * Font Weights:
 * - Bold: Important headers, CTAs
 * - Semibold: Secondary headers
 * - Medium: Navigation, important body text
 * - Normal: Body text, descriptions
 * 
 * Special Text:
 * - Brand Text: font-honk text-4xl tracking-wide
 * - Stats: text-2xl font-bold
 * - Navigation: text-sm font-medium
 * - Labels: text-xs font-medium uppercase
 */

/**
 * Style System Reference
 * 
 * Page Background: #FFFEFF (Pure off-white)
 * 
 * Border Widths:
 * - Cards & Containers: 1px black border
 * - Buttons & Interactive: 2px black border
 * 
 * Color Distribution (60-30-10):
 * - 60%: Background & Base Elements (#FFFEFF, light grays)
 * - 30%: Secondary/Container Elements (light variants)
 * - 10%: Interactive/Accent Elements (DEFAULT variants)
 * 
 * Light Variants:
 * - spring: #BDFFD9
 * - turquoise: #E7FEFC
 * - orange: #FFEBE8
 * - lemon: #FEFDE7
 * - red: #FFEBE8
 * 
 * Button Colors:
 * - spring (green)  : Primary actions (Links, Navigation, Checkout)
 * - turquoise (blue): Information/Secondary actions
 * - red            : Destructive actions (Delete, Cancel, Logout)
 * 
 * Section Backgrounds:
 * - Background: #FFFEFF for page
 * - Container: Light variants for sections
 * - Cards: Pure white with 1px black border
 * 
 * Social Actions:
 * - watch: orange  : Watch/Subscribe actions
 * - follow: spring : Follow/Connect actions
 * - like: red     : Like/Heart actions
 * - comment: turquoise: Comment/Reply actions
 * 
 * Content Types:
 * - article: lemon
 * - project: orange
 * - post: turquoise
 * - portfolio: spring
 * 
 * User Roles:
 * - admin: red
 * - moderator: orange
 * - contributor: turquoise
 * - member: spring
 * 
 * Status Indicators:
 * - active: spring
 * - pending: orange
 * - archived: neutral
 * - featured: lemon
 * 
 * Best Practices:
 * 1. Use light variants for large areas
 * 2. Use DEFAULT variants for interactive elements
 * 3. Use dark variants for emphasis/hover states
 * 4. Keep consistent meaning across the app
 * 5. Consider accessibility in color choices
 * 
 * Usage Examples:
 * 
 * Buttons:
 * <Button variant="spring" className="border-2 border-black">Primary Action</Button>
 * <Button variant="red" className="border-2 border-black">Delete</Button>
 * 
 * Cards:
 * <Card className="bg-white border border-black">...</Card>
 * 
 * Sections:
 * <PageSection className="bg-[#FFFEFF]">
 *   <SectionFull className="bg-turquoise-light">
 *     <Card className="bg-white border border-black">...</Card>
 *   </SectionFull>
 * </PageSection>
 */

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'honk': ['Honk', 'system-ui'],
        'sans': ['Inter', 'sans-serif'],
        'heading': ['Inter', 'sans-serif'],
      },
      fontSize: {
        'xs': '0.75rem',
        'sm': '0.875rem',
        'base': '1rem',
        'lg': '1.125rem',
        'xl': '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
      },
      fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
      spacing: {
        '1': '0.25rem',
        '2': '0.5rem',
        '3': '0.75rem',
        '4': '1rem',
      },
      borderRadius: {
        'none': '0',
        'sm': '0.375rem',
        'md': '0.5rem',
        'lg': '0.75rem',
        'full': '9999px',
      },
      borderWidth: {
        DEFAULT: '1px',
        '0': '0',
        '2': '2px',
        '4': '4px',
      },
      colors: {
        spring: {
          light: '#BDFFD9',
          DEFAULT: '#17FF7C',
          dark: '#00cc5c',
        },
        turquoise: {
          light: '#E7FEFC',
          DEFAULT: '#16F5E4',
          dark: '#2563EB',
        },
        orange: {
          light: '#FFEBE8',
          DEFAULT: '#FF900D',
          dark: '#cc7000',
        },
        lemon: {
          light: '#FEFDE7',
          DEFAULT: '#F5F111',
          dark: '#c4c000',
        },
        red: {
          light: '#FFEBE8',
          DEFAULT: '#FF3E1C',
          dark: '#cc2500',
        },
        // Replace existing gray scale with our neutral scale
        neutral: {
          white: '#FFFFFF',
          100: '#F5F5F5',
          200: '#E5E5E5',
          300: '#D4D4D4',
          400: '#A3A3A3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          black: '#000000',
        },
        // Keep these system colors for shadcn compatibility
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-delay-1': 'float 6s ease-in-out infinite 0.2s',
        'float-delay-2': 'float 6s ease-in-out infinite 0.4s',
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'fade-in-delay-1': 'fadeIn 0.6s ease-out 0.2s forwards',
        'fade-in-delay-2': 'fadeIn 0.6s ease-out 0.4s forwards',
        'fade-in-delay-3': 'fadeIn 0.6s ease-out 0.6s forwards',
        'bounce': 'bounce 2s infinite',
        'bounce-on-click': 'bounceClick 0.2s ease-in-out',
        'carousel': 'carousel 30s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        bounceClick: {
          '0%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
          '100%': { transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        carousel: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-300%)' }
        },
      },
      textShadow: {
        'lg': '4px 4px 0px rgba(37, 99, 235, 0.2)',
      },
      transitionProperty: {
        'scroll': 'opacity, transform',
        'all': 'all',
      },
      transitionDuration: {
        '200': '200ms',
      },
      transitionTimingFunction: {
        'DEFAULT': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      // Add semantic color mappings
      semantic: {
        // Content types
        contentTypes: {
          article: 'lemon',
          project: 'orange',
          post: 'turquoise',
          portfolio: 'spring'
        },
        // User roles
        userRoles: {
          admin: 'red',
          moderator: 'orange',
          contributor: 'turquoise',
          member: 'spring'
        },
        // Status indicators
        status: {
          active: 'spring',
          pending: 'orange',
          archived: 'neutral',
          featured: 'lemon'
        },
        // Social actions
        social: {
          watch: 'orange',
          follow: 'spring',
          like: 'red',
          comment: 'turquoise'
        }
      },
      typography: {
        header: {
          page: 'text-4xl font-bold tracking-tight',
          section: 'text-2xl font-bold',
          subsection: 'text-xl font-bold',
          card: 'text-lg font-bold'
        },
        body: {
          large: 'text-lg font-normal',
          base: 'text-base font-normal',
          small: 'text-sm font-normal',
          micro: 'text-xs font-normal'
        },
        special: {
          brand: 'font-honk text-4xl tracking-wide',
          stats: 'text-2xl font-bold',
          nav: 'text-sm font-medium',
          label: 'text-xs font-medium uppercase'
        },
        semantic: {
          error: 'text-red-DEFAULT',
          success: 'text-spring-DEFAULT',
          info: 'text-turquoise-DEFAULT',
          warning: 'text-orange-DEFAULT'
        }
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms')({
      strategy: 'class',
    }),
  ],
}