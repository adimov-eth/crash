import { Server } from 'mock-socket'
import { GAME_STATES } from '../utils/constants'

const MOCK_SERVER_URL = 'ws://localhost:8080'

export function createMockWebSocketServer() {
  const mockServer = new Server(MOCK_SERVER_URL)

  let gameState = GAME_STATES.STARTING
  let currentMultiplier = 1
  let crashPoint = null
  let gameId = '123456'

  mockServer.on('connection', socket => {
    console.log('New client connected')

    // Simulate game updates
    setInterval(() => {
      switch (gameState) {
        case GAME_STATES.STARTING:
          gameState = GAME_STATES.ACTIVE
          currentMultiplier = 1
          crashPoint = null
          gameId = Math.random().toString(36).substring(7)
          break
        case GAME_STATES.ACTIVE:
          currentMultiplier += 0.01
          if (currentMultiplier >= 2 && Math.random() < 0.1) {
            gameState = GAME_STATES.OVER
            crashPoint = currentMultiplier
          }
          break
        case GAME_STATES.OVER:
          setTimeout(() => {
            gameState = GAME_STATES.STARTING
          }, 3000)
          break
      }

      socket.send(JSON.stringify({
        type: 'gameUpdate',
        data: {
          state: gameState,
          currentMultiplier,
          crashPoint,
          gameId
        }
      }))
    }, 100)

    // Handle client messages
    socket.on('message', data => {
      const message = JSON.parse(data)
      if (message.type === 'placeBet') {
        // Simulate bet placement
        socket.send(JSON.stringify({
          type: 'betPlaced',
          data: {
            userId: 'user123',
            amount: message.data.amount,
            autoCashoutAt: message.data.autoCashoutAt
          }
        }))
      } else if (message.type === 'cashout') {
        // Simulate cashout
        socket.send(JSON.stringify({
          type: 'playerCashout',
          data: {
            userId: 'user123',
            amount: message.data.amount * currentMultiplier
          }
        }))
      }
    })
  })

  return mockServer
}