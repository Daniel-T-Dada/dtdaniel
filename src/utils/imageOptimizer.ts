import { getPlaiceholder } from 'plaiceholder';

export interface OptimizedImage {
    src?: string;
    width?: number;
    height?: number;
    blurDataURL?: string;
    placeholder?: 'blur' | 'empty';
    type?: string;
    [key: string]: any;
}

export async function getOptimizedImageData(imageUrl: string): Promise<OptimizedImage> {
    try {
        // Fetch image and convert to buffer for plaiceholder
        const buffer = await fetch(imageUrl).then(async (res) => Buffer.from(await res.arrayBuffer()));
        const { base64, metadata } = await getPlaiceholder(buffer, { size: 10 });

        return {
            ...metadata,
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

export interface ImageSize {
    src: string;
    width: number;
}

export function generateSrcSet(imageUrl: string, sizes: number[] = [640, 750, 828, 1080, 1200, 1920]): ImageSize[] | null {
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

export function getSizes(defaultSize: string = '100vw'): { default: string; sm: string; md: string; lg: string } {
    return {
        default: defaultSize,
        sm: '50vw',
        md: '33vw',
        lg: '25vw',
    };
}

// Helper function to determine if an image should be lazy loaded
export function shouldLazyLoad(index: number, priority: boolean = false): boolean {
    if (priority) return false;
    return index > 0; // Only eager load the first image
}

// Function to generate image loading priority
export function getImagePriority(index: number, isHero: boolean = false): boolean {
    if (isHero) return true;
    return index === 0;
}
