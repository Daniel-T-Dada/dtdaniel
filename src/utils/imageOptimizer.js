import { getPlaiceholder } from 'plaiceholder';

export async function getOptimizedImageData(imageUrl) {
    try {
        // Get base64 blur data
        const { base64, img } = await getPlaiceholder(imageUrl, { size: 10 });

        return {
            ...img,
            blurDataURL: base64,
            placeholder: 'blur',
        };
    } catch (error) {
        console.error('Error generating optimized image data:', error);
        return {
            src: imageUrl,
            placeholder: 'empty',
        };
    }
}

export function generateSrcSet(imageUrl, sizes = [640, 750, 828, 1080, 1200, 1920]) {
    if (!imageUrl) return null;

    // For Firebase Storage URLs, we can use the _thumb parameter
    if (imageUrl.includes('firebasestorage.googleapis.com')) {
        return sizes.map(size => ({
            src: `${imageUrl}?w=${size}`,
            width: size,
        }));
    }

    // For other URLs, return the original image
    return [{
        src: imageUrl,
        width: 1920, // Default max width
    }];
}

export function getSizes(defaultSize = '100vw') {
    return {
        default: defaultSize,
        sm: '50vw',
        md: '33vw',
        lg: '25vw',
    };
}

// Helper function to determine if an image should be lazy loaded
export function shouldLazyLoad(index, priority = false) {
    if (priority) return false;
    return index > 0; // Only eager load the first image
}

// Function to generate image loading priority
export function getImagePriority(index, isHero = false) {
    if (isHero) return true;
    return index === 0;
} 