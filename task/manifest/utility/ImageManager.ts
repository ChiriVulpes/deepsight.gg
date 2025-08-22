import convert from 'color-convert'
import type { Metadata, Sharp } from 'sharp'
import sharp from 'sharp'

type ImageInput = string | Sharp

namespace ImageManager {

	const channels = 4 // RGBA

	/**
	 * Loads an image into a sharp instance, handling both local file paths and remote URLs
	 */
	export async function get (inputPathOrUrl: string | Sharp): Promise<Sharp> {
		if (typeof inputPathOrUrl !== 'string')
			return inputPathOrUrl

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
		image = await get(image)

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
	export async function extractForeground (iconImage: ImageInput, backgroundImage: ImageInput, validator?: (buffer: Buffer, metadata: Metadata) => boolean) {
		iconImage = await get(iconImage)
		backgroundImage = await get(backgroundImage)

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
			return undefined

		return sharp(foregroundBuffer, {
			raw: {
				width: width,
				height: height,
				channels: channels,
			},
		})
	}

	function getLuminance (r: number, g: number, b: number) {
		return 0.2126 * r + 0.7152 * g + 0.0722 * b
	}

	/**
	 * Removes one or more overlay images from a flattened source image.
	 * This function first performs a quick check to see if an overlay could possibly be present. 
	 * If so, it reverses the "source-over" alpha compositing operation for each pixel.
	 */
	export async function subtractOverlays (overlaysIn: ImageInput[], image: ImageInput): Promise<{ result: Sharp, subtracted: ImageInput[] }> {
		const overlays = await Promise.all(overlaysIn.map(get))
		image = await get(image)

		if (!overlays.length)
			return { result: image, subtracted: [] }

		const mainMetadata = await image.metadata()
		const { width, height } = mainMetadata

		const allImages = [image, ...overlays]
		const allMetadata = await Promise.all(allImages.map(img => img.metadata()))

		for (const meta of allMetadata)
			if (meta.width !== width || meta.height !== height)
				throw new Error('All images (flattened and overlays) must have the same dimensions.')

		const allBuffers = await Promise.all(allImages.map(img => img.ensureAlpha().raw().toBuffer()))

		let currentBuffer = allBuffers[0]
		const overlayBuffers = allBuffers.slice(1)

		// each pixel of the flattened image must be no more than this threshold less than the overlay alpha
		const ALPHA_DEVIATION_THRESHOLD = 12
		// EXCEPT for this percentage of pixels:
		const MAX_VIOLATION_PIXELS_PERCENTAGE = 0.01
		const totalPixels = width * height
		const allowedViolations = Math.ceil(totalPixels * MAX_VIOLATION_PIXELS_PERCENTAGE)

		const subtracted: ImageInput[] = []

		NextBuffer: for (let i = 0; i < overlayBuffers.length; i++) {
			const overlayBuffer = overlayBuffers[i]
			let violationCounter = 0
			for (let i = 0; i < currentBuffer.length; i += channels) {
				const flattenedPixelAlpha = currentBuffer[i + 3]
				const overlayPixelAlpha = overlayBuffer[i + 3]
				if (flattenedPixelAlpha + ALPHA_DEVIATION_THRESHOLD < overlayPixelAlpha) {
					violationCounter++
					if (violationCounter > allowedViolations)
						continue NextBuffer
				}
			}

			subtracted.push(overlaysIn[i])

			const nextBuffer = Buffer.alloc(currentBuffer.length)
			for (let i = 0; i < currentBuffer.length; i += channels) {
				const flatR = currentBuffer[i]
				const flatG = currentBuffer[i + 1]
				const flatB = currentBuffer[i + 2]
				const flatA = currentBuffer[i + 3] / 255.0

				const overR = overlayBuffer[i]
				const overG = overlayBuffer[i + 1]
				const overB = overlayBuffer[i + 2]
				const overA = overlayBuffer[i + 3] / 255.0

				if (overA === 0) {
					// overlay is transparent here, no change is needed
					currentBuffer.copy(nextBuffer, i, i, i + channels)
					continue
				}

				const oneMinusOverA = 1 - overA
				let resultA = 0
				if (oneMinusOverA > 1e-6)
					resultA = (flatA - overA) / oneMinusOverA

				resultA = Math.max(0, Math.min(1, resultA))

				let resultR = 0, resultG = 0, resultB = 0
				const denominator = resultA * oneMinusOverA

				if (denominator > 1e-6) {
					resultR = (flatR * flatA - overR * overA) / denominator
					resultG = (flatG * flatA - overG * overA) / denominator
					resultB = (flatB * flatA - overB * overA) / denominator
				}

				nextBuffer[i] = Math.max(0, Math.min(255, Math.round(resultR)))
				nextBuffer[i + 1] = Math.max(0, Math.min(255, Math.round(resultG)))
				nextBuffer[i + 2] = Math.max(0, Math.min(255, Math.round(resultB)))
				nextBuffer[i + 3] = Math.round(resultA * 255)
			}

			currentBuffer = nextBuffer
		}

		return {
			result: sharp(currentBuffer, {
				raw: {
					width: width,
					height: height,
					channels: channels,
				},
			}),
			subtracted,
		}
	}

}

export default ImageManager
