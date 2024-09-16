/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "7rem",
      screens: {
        "2xl": "1400px",
      },
    },
    fontSize: {
      xs: ["10px", "12px"],
      sm: ["12px", "16px"],
      md: ["14px", "18px"],
      md2: ["15px", "24px"],
      lg: ["17px", "24px"],
      lg2: ["16px", "20px"],
      xl: ["20px", "24px"],
      "2xl": ["24px", "36px"],
      "3xl": ["32px", "40px"],
      "4xl": ["40px", "54px"],
      "5xl": ["56px", "58px"],
      "6xl": ["64px", "64px"],
      btnSmall: ["13px", "16px"],
      btnMedium: ["15px", "24px"],
      logoSize: ["40px", "44px"],
      logoMobile: ["20px", "28px"],
      cartDesktop: ["28px", "40px"],
      faq: ["24px", "36px"],
      aboutUs: ["24px", "36px"],
      faqExtended: ["20px", "28px"],
      featured: ["32px", "44px"],
      blueTitle: ["56px", "68px"],
      smallTitles: ["16px", "22px"],
      profileTitle: ["28px", "36px"],
    },
    extend: {
      backdropBlur: {
        sm: "4px",
        "2xl": "32px",
        "3xl": "60px",
      },
      backgroundImage: {
        backgroundImg: "url('/background.png')",
        slideImg: "url('/slide.png')",
        "secondary-less": "var(--Black-less-opacity, rgba(33, 37, 41, 0.70))",
      },
      fontFamily: {
        chakra: ["Chakra Petch", "sans-serif"],
      },
      colors: {
        brand: "#D3F85A",
        background: "#212529",
        brandBlack: "var(--Black-less-opacity, rgba(52, 61, 64, 0.50))",
        bannerBlack: "var(--Black-less-opacity, rgba(33, 37, 41, 0.70))",
        neutral00: "#ffffff",
        neutral50: "#F8F9FA",
        neutral100: "#CED4DA",
        neutral200: "#ADB5BD",
        neutral300: "#6C757D",
        neutral400: "#495057",
        neutral500: "#343A40",
        neutral600: "#212529",
        neutral700: "#2CB59E",
        gradientStart: "#343A40",
        gradientEnd: "#343A40",
        neutral500Rgb: "rgba(52, 58, 64, 0.7)",
      },
      border: {
        border1: "border-width: 1px",
      },
      backgrounds: {
        primaryBrandGrad: "",
        neutral500: "#2B2B2B",
      },
      boxShadow: {
        shadowBrand: "0 0 240px 0 #FD7C5B",
        shadowFeatured: "0 0 240px 0 #464DFF",
        shadowHover: "0 60px 203px 1px rgba(211, 248, 90, 0.5)",
        shadowBrands: "0 4px 24px 1px rgba(211, 248, 90, 0.5)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        "slide-up": {
          from: { transform: "translateY(100%)" },
          to: { transform: "translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "slide-up": "slide-up 0.3s ease-in-out",
      },
    },
  },
  variants: {
    extend: {
      backdropBlur: ["responsive"],
    },
  },
  plugins: [require("tailwindcss-animate")],
};