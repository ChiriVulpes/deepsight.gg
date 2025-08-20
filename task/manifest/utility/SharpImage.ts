import type { Sharp } from 'sharp'
import sharp from 'sharp'

/**
 * Loads an image into a sharp instance, handling both local file paths and remote URLs.
 * @param inputPathOrUrl The file path or URL of the image.
 * @returns A sharp image instance.
 */
export default async function SharpImage (inputPathOrUrl: string): Promise<Sharp> {
	if (inputPathOrUrl.startsWith('http://') || inputPathOrUrl.startsWith('https://')) {
		const response = await fetch(inputPathOrUrl)
		if (!response.ok) {
			throw new Error(
				`Failed to fetch image from ${inputPathOrUrl}: ${response.statusText}`,
			)
		}
		const arrayBuffer = await response.arrayBuffer()
		const imageBuffer = Buffer.from(arrayBuffer)
		return sharp(imageBuffer)
	}
	else {
		// Assume it's a local file path
		return sharp(inputPathOrUrl)
	}
}
