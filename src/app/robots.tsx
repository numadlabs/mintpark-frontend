// app/robots.ts
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.mintpark.io';
    
    return {
        rules: [
            {
                userAgent: '*',
                allow: [
                    '/',
                    '/collections/*',
                    '/launchpad/*',
                    '/assets/*',
                    '/orders/*',
                    '/my-assets/*',
                ],
                disallow: [
                    '/api/*',
                    '/auth/*',
                    '/create/*',          
                    '/components/*',      
                    '/lib/*',             
                    '/store/*',          
                    '/types/*',          
                    '/validations/*',     
                    '/hooks/*',           
                    '/service/*',        
                    '/*.tsx$',            
                    '/*.ts$',            
                    '/*.json$',           
                    '/privacy-policy/preview',
                    '/terms-conditions/preview',
                    '*/_*',               
                    '*/private/*',        
                    '*/draft/*',         
                ],
                // Crawl-delay is optional but can help manage server load
                crawlDelay: 10
            },
            // Specific rules for Googlebot
            {
                userAgent: 'Googlebot',
                allow: [
                    '/',
                    '/collections/*',
                    '/launchpad/*',
                    '/assets/*',
                    '/orders/*',
                    '/my-assets/*',
                ],
                disallow: [
                    '/api/*',
                    '/auth/*',
                ],
            }
        ],
        // Use absolute URLs for sitemap and host
        sitemap: `${baseUrl}/sitemap.xml`,
        host: baseUrl,
    };
}