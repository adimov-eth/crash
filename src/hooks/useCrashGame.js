// src/hooks/useCrashGame.js
import { useState, useEffect, useRef, useCallback } from 'react';
import { useSocket } from '@/hooks/useSocket';
import CrashEngine from '@/engine/CrashEngine';
import { GAME_STATES, CRASH_SPEED, PREDICTING_LAPSE } from '@/utils/constants';
import { formatCurrency, formatMultiplier } from '@/utils/formatters';
import { getActiveGame, placeBet, cashout } from '@/services/crashApi';

export const useCrashGame = () => {
    const [gameState, setGameState] = useState(GAME_STATES.LOADING);
    const [currentMultiplier, setCurrentMultiplier] = useState(1);
    const [crashPoint, setCrashPoint] = useState(null);
    const [bets, setBets] = useState({});
    const [playerBet, setPlayerBet] = useState(null);
    const [cashoutAmount, setCashoutAmount] = useState(null);
    const [isAutoCashout, setIsAutoCashout] = useState(false);
    const [autoCashoutMultiplier, setAutoCashoutMultiplier] = useState(null);

    const engineRef = useRef(null);
    const gameIdRef = useRef(null);

    const socket = useSocket();

    useEffect(() => {
        engineRef.current = new CrashEngine();
        fetchActiveGame();

        return () => {
            if (engineRef.current) {
                engineRef.current.destroy();
            }
        };
    }, []);

    const fetchActiveGame = async () => {
        try {
            const game = await getActiveGame();
            gameIdRef.current = game.id;
            updateGameState(game);
        } catch (error) {
            console.error('Failed to fetch active game:', error);
        }
    };

    const updateGameState = useCallback((gameData) => {
        setGameState(gameData.state);
        if (gameData.state === GAME_STATES.ACTIVE) {
            engineRef.current.startTime = Date.now();
            engineRef.current.state = GAME_STATES.ACTIVE;
        } else if (gameData.state === GAME_STATES.OVER) {
            setCrashPoint(gameData.crashPoint);
            engineRef.current.finalMultiplier = gameData.crashPoint;
            engineRef.current.state = GAME_STATES.OVER;
        }
    }, []);

    const placeBetHandler = async (amount, autoCashoutAt = null) => {
        try {
            const response = await placeBet(amount, autoCashoutAt);
            setPlayerBet({ amount, autoCashoutAt });
            setIsAutoCashout(!!autoCashoutAt);
            setAutoCashoutMultiplier(autoCashoutAt);
            return response;
        } catch (error) {
            console.error('Failed to place bet:', error);
            throw error;
        }
    };

    const cashoutHandler = useCallback(async () => {
        if (!playerBet || gameState !== GAME_STATES.ACTIVE) return;
        
        try {
            const response = await cashout(gameIdRef.current);
            const cashoutMultiplier = engineRef.current.multiplier;
            setCashoutAmount(playerBet.amount * cashoutMultiplier);
            setPlayerBet(null);
            return response;
        } catch (error) {
            console.error('Failed to cashout:', error);
            throw error;
        }
    }, [playerBet, gameState]); 

    useEffect(() => {
        if (!socket.isConnected) return;

        socket.on('gameUpdate', updateGameState);
        socket.on('betPlaced', (bet) => {
            setBets((prevBets) => ({ ...prevBets, [bet.userId]: bet }));
        });
        socket.on('playerCashout', (cashoutData) => {
            setBets((prevBets) => ({
                ...prevBets,
                [cashoutData.userId]: { ...prevBets[cashoutData.userId], cashedOut: true, cashoutMultiplier: cashoutData.multiplier }
            }));
        });

        return () => {
            socket.off('gameUpdate');
            socket.off('betPlaced');
            socket.off('playerCashout');
        };
    }, [socket, updateGameState]);

    useEffect(() => {
        if (gameState !== GAME_STATES.ACTIVE) return;

        const tickInterval = setInterval(() => {
            const elapsed = Date.now() - engineRef.current.startTime;
            const multiplier = Math.pow(Math.E, CRASH_SPEED * elapsed);
            setCurrentMultiplier(multiplier);

            if (isAutoCashout && multiplier >= autoCashoutMultiplier) {
                cashoutHandler();
            }
        }, PREDICTING_LAPSE);

        return () => clearInterval(tickInterval);
    }, [gameState, isAutoCashout, autoCashoutMultiplier, cashoutHandler]);

    return {
        gameState,
        currentMultiplier: formatMultiplier(currentMultiplier),
        crashPoint: crashPoint ? formatMultiplier(crashPoint) : null,
        bets,
        playerBet,
        cashoutAmount: cashoutAmount ? formatCurrency(cashoutAmount) : null,
        placeBet: placeBetHandler,
        cashout: cashoutHandler,
        setAutoCashoutMultiplier,
    };
};