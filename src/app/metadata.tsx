// import { Metadata } from "next";

// export const metadata: Metadata = {
//   metadataBase: new URL('https://www.mintpark.io'),
  
//   // Basic Metadata
//   title: {
//     default: "Mint Park - Create Unique Digital Art & NFTs",
//     template: "%s | Mint Park"
//   },
//   description: "Explore and create unique digital art on Mint Park. Launch your NFT projects, connect with artists, and bridge your digital assets across blockchains.",
//   applicationName: "Mint Park",
  
//   // Enhanced Keywords
//   keywords: [
//     "create digital art",
//     "unique NFT",
//     "art marketplace",
//     "digital creation",
//     "launch NFT",
//     "bitcoin NFT",
//     "blockchain bridge",
//     "crypto art",
//     "NFT explorer",
//     "citrea blockchain",
//     "mint NFT",
//     "digital assets",
//     "web3 platform",
//     "mintpark",
//     "Mint park",
//     "bitcoin ordinals",
//     "nft marketplace",
//     "digital art platform",
//     "cross chain nft",
//     "ordinals marketplace",
//     "blockchain art platform",
//     "mint nft on bitcoin",
//     "citrea nft platform",
//     "web3 art gallery",
//     "digital collectibles"
//   ],
//   robots: {
//     index: true,
//     follow: true,
//     nocache: false,
//     googleBot: {
//       index: true,
//       follow: true,
//       'max-image-preview': 'large',
//       'max-video-preview': -1,
//       'max-snippet': -1,
//     },
//   },

//   openGraph: {
//     title: "Mint Park - Create & Explore Digital Art",
//     description: "Create, launch, and bridge unique digital art on Mint Park. Your gateway to Bitcoin NFTs and cross-chain digital assets.",
//     url: 'https://www.mintpark.io/',
//     siteName: 'Mint Park',
//     type: 'website',
//     locale: 'en_US',
//     images: [
//       {
//         url: '/og-image-large.png',
//         width: 1200,
//         height: 630,
//         alt: 'Mint Park - Digital Art Creation Platform',
//         type: 'image/png',
//       },
//       {
//         url: '/og-image-small.png',
//         width: 600,
//         height: 315,
//         alt: 'Mint Park - Digital Art Creation Platform',
//         type: 'image/png',
//       }
//     ],
//   },

//   // Twitter Card
//   twitter: {
//     card: 'summary_large_image',
//     title: 'Mint Park - Digital Art Creation Platform',
//     description: 'Create and launch unique digital art on Mint Park. Explore Bitcoin NFTs and cross-chain opportunities.',
//     images: ['/detail_icon/icon_2.png'],
//     site: '@mintpark',
//     creator: '@mintpark'
//   },

//   // Icons
//   icons: {
//     icon: '/logo.png',
//     apple: [
//       { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
//     ],
//     shortcut: '/logo.png',
//     other: [
//       {
//         rel: 'mask-icon',
//         url: '/safari-pinned-tab.svg',
//         color: '#000000'
//       }
//     ]
//   },

//   // Verification
//   verification: {
//     google: 'your-google-site-verification',
//     other: {
//       yandex: 'your-yandex-verification',
//       brave: 'your-brave-verification',
//       norton: 'your-norton-verification'
//     }
//   },

//   // Alternative Pages
//   alternates: {
//     canonical: 'https://www.mintpark.io',
//     languages: {
//       'en': 'https://www.mintpark.io',
//       'x-default': 'https://www.mintpark.io'
//     }
//   },

//   // Additional Metadata
//   category: 'technology',
//   classification: 'NFT Marketplace, Digital Art Platform',
//   creator: 'Mint Park Team',
//   publisher: 'Mint Park',

  
//   // Format Detection
//   formatDetection: {
//     telephone: false,
//     date: false,
//     address: false,
//     email: false
//   },

//   // Viewport and Theme
//   viewport: {
//     width: 'device-width',
//     initialScale: 1,
//     maximumScale: 1,
//     userScalable: false
//   },
//   themeColor: '#ffffff',
//   manifest: '/manifest.json',

//   // Other
//   archives: ['https://www.mintpark.io/archive'],
//   assets: ['https://www.mintpark.io/assets'],
//   bookmarks: ['https://www.mintpark.io/collections'],
  
//   // Apple specific
//   appleWebApp: {
//     capable: true,
//     title: 'Mint Park',
//     statusBarStyle: 'black-translucent'
//   },
// };

import { Metadata } from "next";

// Helper function to get the base URL
const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
  }
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  return 'https://mintpark-frontend.vercel.app';
};

export const metadata: Metadata = {
  metadataBase: new URL(getBaseUrl()),
  
  title: {
    default: "Mint Park - Create Unique Digital Art & NFTs",
    template: "%s | Mint Park"
  },
  description: "Explore and create unique digital art on Mint Park. Launch your NFT projects, connect with artists, and bridge your digital assets across blockchains.",
  applicationName: "Mint Park",
  
  keywords: [
    "create digital art",
    "unique NFT",
    "art marketplace",
    "digital creation",
    "launch NFT",
    "bitcoin NFT",
    "blockchain bridge",
    "crypto art",
    "NFT explorer",
    "citrea blockchain",
    "mint NFT",
    "mintpark",
    "Mint park",
    "digital assets",
    "web3 platform",
    "bitcoin ordinals",
    "nft marketplace",
    "digital art platform",
    "citrea",
    "nubit",
    "launchpad",
    "collections",
    "mint",
    "park"
  ],

  // Canonical URL configuration
  alternates: {
    canonical: getBaseUrl(),
    languages: {
      'en': getBaseUrl(),
      'x-default': getBaseUrl()
    }
  },

  // OpenGraph metadata
  openGraph: {
    url: getBaseUrl(),
    title: "Mint Park - Create & Explore Digital Art",
    description: "Create, launch, and bridge unique digital art on Mint Park. Your gateway to Bitcoin NFTs and cross-chain digital assets.",
    siteName: 'Mint Park',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: `${getBaseUrl()}/logo.png`,
        width: 1200,
        height: 630,
        alt: 'Mint Park - Digital Art Creation Platform',
        type: 'image/png',
      },
      {
        url: `${getBaseUrl()}/logo.png`,
        width: 600,
        height: 315,
        alt: 'Mint Park - Digital Art Creation Platform',
        type: 'image/png',
      }
    ],
  },

  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: 'Mint Park - Digital Art Creation Platform',
    description: 'Create and launch unique digital art on Mint Park. Explore Bitcoin NFTs and cross-chain opportunities.',
    images: [`${getBaseUrl()}/logo.png`],
    site: '@mintpark',
    creator: '@mintpark'
  },

  // Icons
  icons: {
    icon: '/logo.png',
    apple: [
      { url: '/logo.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/logo.png',
    other: [
      {
        rel: 'mask-icon',
        url: '/safari-pinned-tab.svg',
        color: '#000000'
      }
    ]
  },

  // Robots
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // Verification
  verification: {
    google: 'your-google-site-verification',
    other: {
      yandex: 'your-yandex-verification'
    }
  },

  // Additional metadata
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
  
  formatDetection: {
    telephone: false,
    date: false,
    address: false,
    email: false
  },

  category: 'technology',
  creator: 'Mint Park Team',
  publisher: 'Mint Park',
  
  manifest: '/manifest.json',
  themeColor: '#ffffff',
};

// For dynamic routes and pages
export async function generateMetadata({ 
  params,
  searchParams
}: { 
  params: { slug?: string; id?: string }
  searchParams: { [key: string]: string | string[] | undefined }
}): Promise<Metadata> {
  const path = params.slug || params.id || '';
  const baseUrl = getBaseUrl();

  return {
    ...metadata,
    alternates: {
      canonical: path ? `${baseUrl}/${path}` : baseUrl,
    },
    openGraph: {
      ...metadata.openGraph,
      url: path ? `${baseUrl}/${path}` : baseUrl,
    }
  };
}

// Helper function for specific page metadata
export function getPageMetadata(title: string, description?: string): Metadata {
  return {
    ...metadata,
    title,
    description: description || metadata?.description,
    openGraph: {
      ...metadata.openGraph,
      title,
      description: description || metadata?.openGraph?.description,
    },
    twitter: {
      ...metadata.twitter,
      title,
      description: description || metadata?.twitter?.description,
    },
  };
}