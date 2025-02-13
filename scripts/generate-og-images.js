const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage, registerFont } = require('canvas');

async function generateOGImage(type = 'default', text = '') {
    // Create canvas with OG image dimensions
    const width = 1200;
    const height = 630;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Set background
    ctx.fillStyle = '#1e293b'; // dark slate blue
    ctx.fillRect(0, 0, width, height);

    // Add gradient overlay
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, 'rgba(79, 70, 229, 0.4)'); // indigo
    gradient.addColorStop(1, 'rgba(45, 212, 191, 0.4)'); // teal
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Add text
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Main title
    ctx.font = 'bold 72px Arial';
    ctx.fillText(type === 'blog' ? 'Blog' : 'Daniel Dada', width / 2, height / 2 - 40);

    // Subtitle
    ctx.font = '36px Arial';
    const subtitle = type === 'blog'
        ? 'Thoughts on Tech, Life, and Everything in Between'
        : 'Full Stack Developer';
    ctx.fillText(subtitle, width / 2, height / 2 + 40);

    // Save the image
    const buffer = canvas.toBuffer('image/png');
    const publicDir = path.join(process.cwd(), 'public', 'images');

    if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
    }

    fs.writeFileSync(
        path.join(publicDir, `og-${type}.png`),
        buffer
    );

    console.log(`Generated OG image: og-${type}.png`);
}

async function main() {
    try {
        await generateOGImage('default');
        await generateOGImage('blog');
        console.log('All OG images generated successfully');
    } catch (error) {
        console.error('Error generating OG images:', error);
    }
}

main(); 