import {PlayerId} from 'common/models/player-model'
import {ToastData} from 'common/types/app'
import {Deck} from 'common/types/deck'
import {LocalMessage, localMessages} from 'logic/messages'
import React from 'react'

type SessionState = {
	playerName: string
	minecraftName: string
	playerId: PlayerId
	playerSecret: string
	playerDeck: Deck
	connecting: boolean
	connected: boolean
	errorType?:
		| 'invalid_name'
		| 'invalid_version'
		| 'session_expired'
		| 'timeout'
		| string
	tooltip: {
		anchor: React.RefObject<HTMLDivElement>
		tooltip: React.ReactNode
		tooltipHeight: number
		tooltipWidth: number
	} | null
	toast: Array<ToastData>
	updates: Record<string, Array<string>>
	newPlayer: boolean //If the account was created this session
}

const defaultState: SessionState = {
	playerName: '',
	minecraftName: '',
	playerId: '' as PlayerId,
	playerSecret: '',
	playerDeck: {
		name: '',
		iconType: 'item',
		icon: 'any',
		code: '',
		cards: [],
		tags: [],
	},
	connecting: false,
	connected: false,
	tooltip: null,
	toast: [],
	updates: {},
	newPlayer: false,
}

const loginReducer = (
	state = defaultState,
	action: LocalMessage,
): SessionState => {
	switch (action.type) {
		case localMessages.LOGIN:
			return {...state, connecting: true, errorType: undefined}
		case localMessages.DISCONNECT:
			return {
				...state,
				connecting: false,
				connected: false,
				playerName: '',
				minecraftName: '',
				playerId: '' as PlayerId,
				playerSecret: '',
				playerDeck: state.playerDeck,
				errorType: action.errorMessage,
			}
		case localMessages.PLAYER_INFO_SET:
		case localMessages.PLAYER_SESSION_SET:
			return {
				...state,
				errorType: undefined,
				...action.player,
			}
		case localMessages.CONNECTED:
			return {
				...state,
				connecting: false,
				connected: true,
			}
		case localMessages.UPDATES_LOAD:
			return {
				...state,
				...action.updates,
			}
		case localMessages.INSERT_DECK:
		case localMessages.SELECT_DECK:
			return {
				...state,
				playerDeck: action.deck,
			}
		case localMessages.TOAST_OPEN:
			state.toast.push({
				id: state.toast.length + 1,
				toast: action,
				closed: false,
			})
			return {
				...state,
				toast: state.toast,
			}
		case localMessages.TOAST_CLOSE:
			const thisToast = state.toast.find((toast) => toast.id === action.id)
			if (thisToast) thisToast.closed = true
			if (state.toast.some((toast) => !toast.closed)) return state
			return {
				...state,
				toast: [],
			}
		case localMessages.EVERY_TOAST_CLOSE:
			return {
				...state,
				toast: [],
			}
		case localMessages.SHOW_TOOLTIP:
			return {
				...state,
				tooltip: {
					tooltip: action.tooltip,
					anchor: action.anchor,
					tooltipHeight: action.tooltipHeight,
					tooltipWidth: action.tooltipWidth,
				},
			}
		case localMessages.HIDE_TOOLTIP:
			return {
				...state,
				tooltip: null,
			}
		case localMessages.MINECRAFT_NAME_NEW:
		case localMessages.MINECRAFT_NAME_SET:
			return {
				...state,
				minecraftName: action.name,
			}
		case localMessages.NEW_PLAYER:
			return {
				...state,
				newPlayer: true,
			}
		default:
			return state
	}
}

export default loginReducer
