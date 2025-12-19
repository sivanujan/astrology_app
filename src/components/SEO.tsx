import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title?: string;
    description?: string;
    keywords?: string;
    image?: string;
    url?: string;
}

const SEO: React.FC<SEOProps> = ({
    title = "SivaAstro - Advanced AI Vedic Astrology",
    description = "Get accurate Vedic Astrology predictions powered by Advanced AI. Discover your Job, Marriage, and Foreign Travel possibilities.",
    keywords = "astrology, vedic astrology, horoscope, marriage prediction, job prediction",
    image = "https://sivaastro.com/icon.png",
    url = "https://sivaastro.com/"
}) => {
    const siteTitle = title === "SivaAstro - Advanced AI Vedic Astrology" ? title : `${title} | SivaAstro`;

    return (
        <Helmet>
            {/* Standard Metrics */}
            <title>{siteTitle}</title>
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords} />

            {/* Open Graph / Facebook */}
            <meta property="og:title" content={siteTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />
            <meta property="og:url" content={url} />
            <meta property="og:type" content="website" />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={siteTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image} />
        </Helmet>
    );
};

export default SEO;
