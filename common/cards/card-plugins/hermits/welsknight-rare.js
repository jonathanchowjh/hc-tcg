import HermitCard from './_hermit-card'
import {flipCoin} from '../../../../server/utils'
import {GameModel} from '../../../../server/models/game-model'

class WelsknightRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'welsknight_rare',
			name: 'Wels',
			rarity: 'rare',
			hermitType: 'pvp',
			health: 280,
			primary: {
				name: "Knight's Blade",
				cost: ['any'],
				damage: 40,
				power: null,
			},
			secondary: {
				name: 'Vengeance',
				cost: ['pvp', 'pvp', 'pvp'],
				damage: 100,
				power:
					'Add 20hp damage if your HP is orange. Add 40hp damage if your HP is red.',
			},
		})
	}

	/**
	 * @param {GameModel} game
	 */
	onAttach(game, instance) {
		const {currentPlayer} = game.ds

		currentPlayer.hooks.onAttack[instance] = (attack) => {
			const attackId = this.getInstanceKey(instance, 'attack')
			if (attack.id !== attackId || attack.type !== 'secondary') return

			if (!attack.attacker) return

			if (attack.attacker.row.health < 200) attack.addDamage(20)
			if (attack.attacker.row.health < 100) attack.addDamage(20)
		}
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 */
	onDetach(game, instance) {
		const {currentPlayer} = game.ds
		// Remove hooks
		delete currentPlayer.hooks.onAttack[instance]
	}
}

export default WelsknightRareHermitCard
