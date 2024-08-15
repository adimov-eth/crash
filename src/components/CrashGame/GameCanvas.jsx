import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as PIXI from 'pixi.js';
import { useCrashGame } from '../../contexts/CrashGameContext';
import CrashEngine from '../../engine/CrashEngine';
import { GAME_STATES } from '../../utils/constants';
import { formatMultiplier } from '../../utils/formatters';
import { Assets } from '../../assets';

const GameCanvas = () => {
    const { gameState, currentMultiplier, crashPoint, gameId } = useCrashGame();
    const canvasRef = useRef(null);
    const appRef = useRef(null);
    const engineRef = useRef(null);
    const rocketRef = useRef(null);
    const curveGraphicsRef = useRef(null);
    const multiplierTextRef = useRef(null);

    const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });

    const handleResize = useCallback(() => {
        if (canvasRef.current && appRef.current) {
            const { width, height } = canvasRef.current.getBoundingClientRect();
            setCanvasSize({ width, height });
            appRef.current.renderer.resize(width, height);
            if (engineRef.current) {
                engineRef.current.onResize(width, height);
            }
            if (multiplierTextRef.current) {
                multiplierTextRef.current.position.set(width / 2, height / 2);
            }
        }
    }, []);

    useEffect(() => {
        // Create PIXI Application
        appRef.current = new PIXI.Application({
            view: canvasRef.current,
            width: canvasSize.width,
            height: canvasSize.height,
            backgroundColor: 0x0d0e20,
        });

        // Create CrashEngine
        engineRef.current = new CrashEngine();

        // Create curve graphics
        curveGraphicsRef.current = new PIXI.Graphics();
        appRef.current.stage.addChild(curveGraphicsRef.current);

        // Create rocket sprite
        rocketRef.current = new PIXI.Sprite(PIXI.Texture.from(Assets.defaultRocket));
        rocketRef.current.anchor.set(0.5);
        appRef.current.stage.addChild(rocketRef.current);

        // Create multiplier text
        multiplierTextRef.current = new PIXI.Text('1.00x', {
            fontFamily: 'Arial',
            fontSize: 24,
            fill: 0xffffff,
        });
        multiplierTextRef.current.anchor.set(0.5);
        multiplierTextRef.current.position.set(canvasSize.width / 2, canvasSize.height / 2);
        appRef.current.stage.addChild(multiplierTextRef.current);

        // Set up ticker
        appRef.current.ticker.add(() => {
            if (engineRef.current && gameState === GAME_STATES.ACTIVE) {
                const { x, y } = engineRef.current.getElapsedPosition(engineRef.current.elapsedTime);
                if (rocketRef.current) {
                    rocketRef.current.position.set(x, y);
                    rocketRef.current.rotation = engineRef.current.getRocketAngle();
                }
                updateCurve();
            }
        });

        handleResize();
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (appRef.current) {
                appRef.current.destroy(true);
            }
        };
    }, [handleResize]);

    useEffect(() => {
        if (engineRef.current) {
            engineRef.current.gameId = gameId;
            engineRef.current.state = gameState;
            if (gameState === GAME_STATES.ACTIVE) {
                engineRef.current.startTime = Date.now();
            } else if (gameState === GAME_STATES.OVER) {
                engineRef.current.finalMultiplier = crashPoint;
            }
        }

        // Update visibility of rocket based on game state
        if (rocketRef.current) {
            rocketRef.current.visible = CrashEngine.RocketVisibleStates.includes(gameState);
        }
    }, [gameState, gameId, crashPoint]);

    useEffect(() => {
        if (multiplierTextRef.current) {
            multiplierTextRef.current.text = formatMultiplier(currentMultiplier);
        }
    }, [currentMultiplier]);

    const updateCurve = () => {
        if (curveGraphicsRef.current && engineRef.current) {
            curveGraphicsRef.current.clear();
            curveGraphicsRef.current.lineStyle(3, 0x00ff00);
            
            let lastX = null;
            for (let elapsed = 0; elapsed <= engineRef.current.elapsedTime; elapsed += 100) {
                const { x, y } = engineRef.current.getElapsedPosition(elapsed);
                if (elapsed === 0) {
                    curveGraphicsRef.current.moveTo(x, y);
                } else {
                    if (lastX === null || x - lastX >= 10) {
                        curveGraphicsRef.current.lineTo(x, y);
                        lastX = x;
                    }
                }
            }
        }
    };

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <canvas ref={canvasRef} />
        </div>
    );
};

export default GameCanvas;