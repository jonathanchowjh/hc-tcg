import {CARDS_LIST} from 'common/cards'
import {GameModel} from 'common/models/game-model'
import {PlayerModel} from 'common/models/player-model'
import {Database, setupDatabase} from 'db/db'
import dotenv from 'dotenv'
import {Hook} from '../../common/types/hooks'

export class RootModel {
	public players: Record<string, PlayerModel> = {}
	public games: Record<string, GameModel> = {}
	public queue: Array<string> = []
	public db: Database
	/** Game code ->  time code was created, and info */
	public privateQueue: Record<
		string,
		{
			createdTime: number
			playerId: string | null
			gameCode: string
			spectatorCode: string | undefined
			spectatorsWaiting: Array<string>
			/** Code used by API consumers to cancel a game. */
			apiSecret?: string | null
		}
	> = {}
	public hooks = {
		newGame: new Hook<string, (game: GameModel) => void>(),
		gameRemoved: new Hook<string, (game: GameModel) => void>(),
		playerJoined: new Hook<string, (player: PlayerModel) => void>(),
		playerLeft: new Hook<string, (player: PlayerModel) => void>(),
		privateCancelled: new Hook<string, (code: string) => void>(),
	}
	public updates: Record<string, Array<string>> = {}

	public constructor() {
		const env = dotenv.config()
		this.db = setupDatabase(CARDS_LIST, {...env, ...process.env}, 14)
		this.db.new()
	}

	public createPrivateGame(playerId: string | null) {
		const gameCode = (Math.random() + 1).toString(16).substring(2, 8)
		const spectatorCode = (Math.random() + 1).toString(16).substring(2, 8)
		const apiSecret = (Math.random() + 1).toString(16).substring(2)
		this.privateQueue[gameCode] = {
			createdTime: Date.now(),
			playerId,
			gameCode,
			spectatorCode,
			spectatorsWaiting: [],
			apiSecret,
		}
		return {gameCode, spectatorCode, apiSecret}
	}

	public getGameIds() {
		return Object.keys(this.games)
	}
	public getGames() {
		return Object.values(this.games)
	}
	public getPlayerIds() {
		return Object.keys(this.players)
	}
	public getPlayers() {
		return Object.values(this.players)
	}
	public addPlayer(player: PlayerModel) {
		this.players[player.id] = player
	}
	public addGame(game: GameModel) {
		this.games[game.id] = game
	}
}
