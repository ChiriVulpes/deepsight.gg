import convert from 'color-convert'
import type { Metadata, Sharp } from 'sharp'
import sharp from 'sharp'

type ImageInput = string | Sharp

namespace ImageManager {

	/**
	 * Loads an image into a sharp instance, handling both local file paths and remote URLs
	 */
	export async function get (inputPathOrUrl: string): Promise<Sharp> {
		if (!inputPathOrUrl.startsWith('http://') && !inputPathOrUrl.startsWith('https://'))
			// assume it's a local file path
			return sharp(inputPathOrUrl)

		// is remote URL
		const response = await fetch(inputPathOrUrl)
		if (!response.ok)
			throw new Error(`Failed to fetch image from ${inputPathOrUrl}: ${response.statusText}`)

		const arrayBuffer = await response.arrayBuffer()
		const imageBuffer = Buffer.from(arrayBuffer)
		return sharp(imageBuffer)
	}

	export async function getMedianColour (image: ImageInput) {
		image = typeof image === 'string' ? await get(image) : image

		const metadata = await image.metadata()
		const width = metadata.width
		const height = metadata.height
		const colours: number[] = []
		const usedPadding = 0.2

		const { data, info } = await image.ensureAlpha().raw().toBuffer({ resolveWithObject: true })
		const channels = info.channels // Should be 4 for RGBA

		for (let x = 0; x < width; x = x > width * usedPadding && x < width * (1 - usedPadding) ? Math.floor(x + width * (1 - usedPadding * 2)) : x + 1) {
			for (let y = 0; y < height; y = y > height * usedPadding && y < height * (1 - usedPadding) ? Math.floor(y + height * (1 - usedPadding * 2)) : y + 1) {
				const idx = (y * width + x) * channels
				const r = data[idx]
				const g = data[idx + 1]
				const b = data[idx + 2]
				const [h, s, l] = convert.rgb.hsl(r, g, b)
				colours.push(l * 1e6 + h * 1e3 + s)
			}
		}

		colours.sort((a, b) => a - b)
		const median = colours[Math.floor(colours.length / 2)]

		const hslToRgb = convert.hsl.rgb as any as (h: number, s: number, l: number) => [number, number, number]
		return hslToRgb(Math.floor((median % 1e6) / 1e3), median % 1e3, Math.floor(median / 1e6))
	}

	/**
	 * Extracts a foreground layer from a flattened image of foreground/background. 
	 * Uses a "line projection" in color space for colors and a luminance key for shadows/highlights.
	 */
	export async function extractForeground (iconImage: ImageInput, backgroundImage: ImageInput, outputPath: string, validator?: (buffer: Buffer, metadata: Metadata) => boolean) {
		const channels = 4 // RGBA

		iconImage = typeof iconImage === 'string' ? await get(iconImage) : iconImage
		backgroundImage = typeof backgroundImage === 'string' ? await get(backgroundImage) : backgroundImage

		const [iconMetadata, backgroundMetadata] = await Promise.all([
			iconImage.metadata(),
			backgroundImage.metadata(),
		])

		if (iconMetadata.width !== backgroundMetadata.width || iconMetadata.height !== backgroundMetadata.height)
			throw new Error('Icon and background images must have identical dimensions.')

		const width = iconMetadata.width
		const height = iconMetadata.height

		const [iconBuffer, backgroundBuffer] = await Promise.all([
			iconImage.ensureAlpha().raw().toBuffer(),
			backgroundImage.ensureAlpha().raw().toBuffer(),
		])

		const foregroundBuffer = Buffer.alloc(iconBuffer.length)

		for (let i = 0; i < iconBuffer.length; i += channels) {
			const iconR = iconBuffer[i]
			const iconG = iconBuffer[i + 1]
			const iconB = iconBuffer[i + 2]
			const iconA = iconBuffer[i + 3]

			const bgR = backgroundBuffer[i]
			const bgG = backgroundBuffer[i + 1]
			const bgB = backgroundBuffer[i + 2]

			if (iconA === 0) {
				foregroundBuffer.writeUInt32LE(0, i)
				continue
			}

			// --- Method 1: Alpha from Color Vector Projection ---
			const dR = iconR - bgR
			const dG = iconG - bgG
			const dB = iconB - bgB

			let t = Infinity
			// Find how far we need to travel along the vector (dR, dG, dB) from the
			// background color to hit a boundary of the RGB cube (0 or 255).
			if (dR > 0) t = Math.min(t, (255 - bgR) / dR)
			else if (dR < 0) t = Math.min(t, (0 - bgR) / dR)

			if (dG > 0) t = Math.min(t, (255 - bgG) / dG)
			else if (dG < 0) t = Math.min(t, (0 - bgG) / dG)

			if (dB > 0) t = Math.min(t, (255 - bgB) / dB)
			else if (dB < 0) t = Math.min(t, (0 - bgB) / dB)

			// The alpha is the ratio of the current distance to the max possible distance.
			// Since the icon color is 1 unit along the vector, alpha is 1/t.
			// If t < 1, the icon color is already outside the gamut defined by the
			// background, meaning it must be fully opaque.
			const alpha_color = t < 1 ? 1.0 : 1.0 / t

			// --- Method 2: Alpha from Luminance ---
			const lumIcon = getLuminance(iconR, iconG, iconB)
			const lumBg = getLuminance(bgR, bgG, bgB)
			let alpha_lum = 0
			if (lumIcon < lumBg && lumBg > 0) { // Shadow case
				alpha_lum = 1 - lumIcon / lumBg
			}
			else if (lumIcon > lumBg) { // Highlight case
				const lumRange = 255 - lumBg
				if (lumRange > 0) {
					alpha_lum = (lumIcon - lumBg) / lumRange
				}
			}

			// --- Combine and De-composite ---
			const final_alpha = Math.max(alpha_color, alpha_lum)
			const clamped_alpha = Math.max(0, Math.min(1, final_alpha))

			foregroundBuffer[i + 3] = Math.round(clamped_alpha * 255)

			let fgR, fgG, fgB
			if (clamped_alpha > 1e-6) {
				fgR = (iconR - bgR * (1 - clamped_alpha)) / clamped_alpha
				fgG = (iconG - bgG * (1 - clamped_alpha)) / clamped_alpha
				fgB = (iconB - bgB * (1 - clamped_alpha)) / clamped_alpha
			}
			else {
				fgR = 0
				fgG = 0
				fgB = 0
			}

			foregroundBuffer[i] = Math.max(0, Math.min(255, Math.round(fgR)))
			foregroundBuffer[i + 1] = Math.max(0, Math.min(255, Math.round(fgG)))
			foregroundBuffer[i + 2] = Math.max(0, Math.min(255, Math.round(fgB)))
		}

		if (validator && !validator(foregroundBuffer, iconMetadata))
			return false

		await sharp(foregroundBuffer, {
			raw: {
				width: width,
				height: height,
				channels: channels,
			},
		})
			.png()
			.toFile(outputPath)

		return true
	}

	function getLuminance (r: number, g: number, b: number) {
		return 0.2126 * r + 0.7152 * g + 0.0722 * b
	}

}

export default ImageManager
