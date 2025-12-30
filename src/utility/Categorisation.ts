import type { ItemPlug, ItemSocketDefinition } from 'conduit.deepsight.gg/item/Item'
import type { DeepsightPlugCategoryName, DeepsightPlugFullName } from 'deepsight.gg/DeepsightPlugCategorisation'
import type { InventoryItemSocketTypes } from 'model/Items'

type PlugCategorisationExpression =
	| DeepsightPlugFullName
	| `${DeepsightPlugCategoryName}/*`
	| '*Enhanced'
	| `${DeepsightPlugCategoryName}/*Enhanced`
	| '*Empty'
	| `${DeepsightPlugCategoryName}/*Empty`
	| '*Empty*'
	| `${DeepsightPlugCategoryName}/*Empty*`
	| '*Default'
	| `${DeepsightPlugCategoryName}/*Default`
	// | 'Masterwork/ExoticCatalyst*'
	| `${keyof { [N in DeepsightPlugFullName as N extends CatNameSuffix<infer R> ? R : never]: 0 }}*`

type CatNameSuffix<T extends string> = `${T}Enhanced` | `${T}Empty` | `${T}Default`

namespace Categorisation {

	export const IsMasterwork = matcher('Masterwork/*')
	export const IsIntrinsic = matcher(
		'Intrinsic/*',
		'!Intrinsic/Shaped',
		'!Intrinsic/ArmorStat',
		'!Intrinsic/ArmorArchetype',
		'!Intrinsic/ArmorLegacy'
	)
	export const IsIntrinsicPerk = matcher(...[
		'Intrinsic/Frame', 'Intrinsic/FrameEnhanced',
		'Intrinsic/Origin', 'Intrinsic/OriginEnhanced',
		'Intrinsic/Armor', 'Intrinsic/ArmorArtifice',
		'Intrinsic/Exotic', 'Masterwork/ExoticCatalyst',
	] satisfies PlugCategorisationExpression[])
	export const IsPerk = matcher('Perk/*')
	export const IsEnhanced = matcher('*Enhanced')
	export const IsEmpty = matcher('*Empty*')
	export const IsDefault = matcher('*Default')
	export const IsOrnament = matcher('Cosmetic/Ornament*')
	export const IsShaderOrnament = matcher('Cosmetic/Shader', 'Cosmetic/Ornament*')
	export const IsEmptyOrIncompleteCatalyst = matcher('Masterwork/ExoticCatalyst*', '!Masterwork/ExoticCatalyst')
	export const IsExoticCatalyst = matcher('Masterwork/ExoticCatalyst*')
	export const IsFrame = matcher('Intrinsic/Frame*')
	export const IsOrigin = matcher('Intrinsic/Origin*')

	export function matcher (...expressions: (PlugCategorisationExpression | `!${PlugCategorisationExpression}`)[]) {
		const positiveExpressions = expressions.filter(expr => expr[0] !== '!') as PlugCategorisationExpression[]
		const negativeExpressions = expressions.filter(expr => expr[0] === '!').map(expr => expr.slice(1) as PlugCategorisationExpression)

		return function (categorised?: ItemPlug | ItemSocketDefinition | InventoryItemSocketTypes | DeepsightPlugFullName): boolean {
			if (typeof categorised === 'object' && 'definition' in categorised)
				categorised = categorised.definition

			const categorisation = typeof categorised === 'string' ? categorised : categorised?.type
			if (!categorisation)
				return false

			if (positiveExpressions.length && !matchesExpressions(categorisation, positiveExpressions))
				return false

			if (negativeExpressions.length && matchesExpressions(categorisation, negativeExpressions))
				return false

			return true
		}

		function matchesExpressions (categorisation: DeepsightPlugFullName, expressions: PlugCategorisationExpression[]): boolean {
			for (const expression of expressions) {
				if (expression === categorisation)
					return true

				if (expression.startsWith('*') && expression.endsWith('*'))
					if (categorisation.includes(expression.slice(1, -1)))
						return true
					else
						continue

				if (expression.startsWith('*'))
					if (categorisation.endsWith(expression.slice(1)))
						return true
					else
						continue

				if (expression.endsWith('*'))
					if (categorisation.startsWith(expression.slice(0, -1)))
						return true
					else
						continue

				if (expression.includes('*')) {
					const [start, end] = expression.split('*')
					if (categorisation.startsWith(start) && categorisation.endsWith(end))
						return true
					else
						continue
				}
			}

			return false
		}
	}
}

export default Categorisation
