import React, { createContext, useContext, useReducer, useCallback, useRef, useEffect } from 'react';
import CrashEngine from '../engine/CrashEngine';
import { useSocket } from '../hooks/useSocket';
import { GAME_STATES } from '../utils/constants';
import { formatCurrency, formatMultiplier } from '../utils/formatters';
import { getActiveGame, placeBet, cashout } from '../services/crashApi';

const CrashGameContext = createContext();

const initialState = {
  gameState: GAME_STATES.LOADING,
  gameHistory: [],
  currentMultiplier: 1,
  crashPoint: null,
  bets: {},
  playerBet: null,
  cashoutAmount: null,
  isAutoCashout: false,
  autoCashoutMultiplier: null,
  gameId: null,
  error: null,
};

function crashGameReducer(state, action) {
  switch (action.type) {
    case 'SET_GAME_STATE':
      return { ...state, gameState: action.payload };
    case 'SET_CURRENT_MULTIPLIER':
      return { ...state, currentMultiplier: action.payload };
    case 'SET_CRASH_POINT':
      return { ...state, crashPoint: action.payload };
    case 'SET_BETS':
      return { ...state, bets: action.payload };
    case 'SET_PLAYER_BET':
      return { ...state, playerBet: action.payload };
    case 'SET_CASHOUT_AMOUNT':
      return { ...state, cashoutAmount: action.payload };
    case 'SET_AUTO_CASHOUT':
      return { ...state, isAutoCashout: action.payload };
    case 'SET_AUTO_CASHOUT_MULTIPLIER':
      return { ...state, autoCashoutMultiplier: action.payload };
    case 'SET_GAME_ID':
      return { ...state, gameId: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'ADD_TO_GAME_HISTORY':
      return {
        ...state,
        gameHistory: [action.payload, ...state.gameHistory].slice(0, 50),
      };
    default:
      return state;
  }
}

export function CrashGameProvider({ children }) {
  const [state, dispatch] = useReducer(crashGameReducer, initialState);
  const socket = useSocket();
  const engineRef = useRef(new CrashEngine());

  const updateGameState = useCallback((gameData) => {
    dispatch({ type: 'SET_GAME_STATE', payload: gameData.state });
    dispatch({ type: 'SET_GAME_ID', payload: gameData.id });

    if (gameData.state === GAME_STATES.ACTIVE) {
      engineRef.current.startTime = Date.now();
      engineRef.current.state = GAME_STATES.ACTIVE;
    } else if (gameData.state === GAME_STATES.OVER) {
      dispatch({ type: 'SET_CRASH_POINT', payload: gameData.crashPoint });
      engineRef.current.finalMultiplier = gameData.crashPoint;
      engineRef.current.state = GAME_STATES.OVER;
    }
  }, []);

  const fetchActiveGame = useCallback(async () => {
    try {
      const game = await getActiveGame();
      updateGameState(game);
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch active game' });
    }
  }, [updateGameState]);

  const placeBetHandler = useCallback(async (amount, autoCashoutAt = null) => {
    try {
      const response = await placeBet(amount, autoCashoutAt);
      dispatch({ type: 'SET_PLAYER_BET', payload: { amount, autoCashoutAt } });
      dispatch({ type: 'SET_AUTO_CASHOUT', payload: !!autoCashoutAt });
      dispatch({ type: 'SET_AUTO_CASHOUT_MULTIPLIER', payload: autoCashoutAt });
      return response;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to place bet' });
      throw error;
    }
  }, []);

  const cashoutHandler = useCallback(async () => {
    if (!state.playerBet || state.gameState !== GAME_STATES.ACTIVE) return;
    
    try {
      const response = await cashout(state.gameId);
      const cashoutMultiplier = engineRef.current.multiplier;
      const cashoutAmount = state.playerBet.amount * cashoutMultiplier;
      dispatch({ type: 'SET_CASHOUT_AMOUNT', payload: cashoutAmount });
      dispatch({ type: 'SET_PLAYER_BET', payload: null });
      return response;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to cashout' });
      throw error;
    }
  }, [state.playerBet, state.gameState, state.gameId]);

  useEffect(() => {
    fetchActiveGame();
    
    const gameTickInterval = setInterval(() => {
      if (state.gameState === GAME_STATES.ACTIVE) {
        const elapsed = Date.now() - engineRef.current.startTime;
        const multiplier = CrashEngine.getElapsedPayout(elapsed);
        dispatch({ type: 'SET_CURRENT_MULTIPLIER', payload: multiplier });

        if (state.isAutoCashout && multiplier >= state.autoCashoutMultiplier) {
          cashoutHandler();
        }
      }
    }, 100); // Update every 100ms

    return () => clearInterval(gameTickInterval);
  }, [fetchActiveGame, state.gameState, state.isAutoCashout, state.autoCashoutMultiplier, cashoutHandler]);

  useEffect(() => {
    if (!socket.isConnected) return;
  
    const handleBetPlaced = (bet) => {
      dispatch({ type: 'SET_BETS', payload: (prevBets) => ({ ...prevBets, [bet.userId]: bet }) });
    };
  
    const handlePlayerCashout = (cashoutData) => {
      dispatch({
        type: 'SET_BETS',
        payload: (prevBets) => ({
          ...prevBets,
          [cashoutData.userId]: {
            ...prevBets[cashoutData.userId],
            cashedOut: true,
            cashoutMultiplier: cashoutData.multiplier
          }
        })
      });
    };
  
    socket.on('gameUpdate', updateGameState);
    socket.on('betPlaced', handleBetPlaced);
    socket.on('playerCashout', handlePlayerCashout);
  
    return () => {
      socket.off('gameUpdate');
      socket.off('betPlaced');
      socket.off('playerCashout');
    };
  }, [socket, updateGameState]);

  const value = {
    ...state,
    placeBet: placeBetHandler,
    cashout: cashoutHandler,
    setAutoCashoutMultiplier: (multiplier) => dispatch({ type: 'SET_AUTO_CASHOUT_MULTIPLIER', payload: multiplier }),
    fetchActiveGame,
    formattedMultiplier: formatMultiplier(state.currentMultiplier),
    formattedCrashPoint: state.crashPoint ? formatMultiplier(state.crashPoint) : null,
    formattedCashoutAmount: state.cashoutAmount ? formatCurrency(state.cashoutAmount) : null,
  };

  return <CrashGameContext.Provider value={value}>{children}</CrashGameContext.Provider>;
}

export function useCrashGame() {
  const context = useContext(CrashGameContext);
  if (context === undefined) {
    throw new Error('useCrashGame must be used within a CrashGameProvider');
  }
  return context;
}