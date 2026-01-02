import localFont from 'next/font/local'

// Open Sauce Sans - Primary body font (brand's secondary font)
// Professional, clean sans-serif for body text, UI elements, and general content
export const openSauceSans = localFont({
  src: [
    {
      path: './OpenSauceSans-Light.ttf',
      weight: '300',
      style: 'normal',
    },
    {
      path: './OpenSauceSans-LightItalic.ttf',
      weight: '300',
      style: 'italic',
    },
    {
      path: './OpenSauceSans-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: './OpenSauceSans-Italic.ttf',
      weight: '400',
      style: 'italic',
    },
    {
      path: './OpenSauceSans-Medium.ttf',
      weight: '500',
      style: 'normal',
    },
    {
      path: './OpenSauceSans-MediumItalic.ttf',
      weight: '500',
      style: 'italic',
    },
    {
      path: './OpenSauceSans-SemiBold.ttf',
      weight: '600',
      style: 'normal',
    },
    {
      path: './OpenSauceSans-SemiBoldItalic.ttf',
      weight: '600',
      style: 'italic',
    },
    {
      path: './OpenSauceSans-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
    {
      path: './OpenSauceSans-BoldItalic.ttf',
      weight: '700',
      style: 'italic',
    },
  ],
  variable: '--font-open-sauce-sans',
  display: 'swap',
})

// Open Sauce One - Alternative display font
// Monospace-style variant for code, technical content, or distinctive headings
export const openSauceOne = localFont({
  src: [
    {
      path: './OpenSauceOne-Light.ttf',
      weight: '300',
      style: 'normal',
    },
    {
      path: './OpenSauceOne-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: './OpenSauceOne-Medium.ttf',
      weight: '500',
      style: 'normal',
    },
    {
      path: './OpenSauceOne-SemiBold.ttf',
      weight: '600',
      style: 'normal',
    },
    {
      path: './OpenSauceOne-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-open-sauce-one',
  display: 'swap',
})
