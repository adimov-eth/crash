// src/engine/CrashEngine.js
import { GAME_STATES, CRASH_SPEED, PREDICTING_LAPSE, X_AXIS_MINIMUM, Y_AXIS_MINIMUM, Y_AXIS_MULTIPLIER } from '@utils/constants';
import { SeededRandom } from '@/utils/random';
import { Rocket} from './RocketAnimation';
import { Assets } from '@/assets';

class CrashEngine {
    constructor(app, rocketsConfig = []) {
        this.app = app;
        this.rocketsConfig = rocketsConfig;
        this.currentRocketConfig = null;
        this.state = GAME_STATES.LOADING;
        this.gameId = null;
        this.startTime = 0;
        this.elapsedTime = 0;
        this.finalElapsed = 0;
        this.finalMultiplier = 0;
        this.crashPoint = null;
        this.betAmount = 0;
        this.graphWidth = 0;
        this.graphHeight = 0;
        this.plotWidth = 0;
        this.plotHeight = 0;
        this.plotOffsetX = 0;
        this.plotOffsetY = 0;
        this.xAxis = 0;
        this.yAxis = 0;
        this.xIncrement = 0;
        this.yIncrement = 0;
        this.xAxisMinimum = X_AXIS_MINIMUM;
        this.yAxisMinimum = Y_AXIS_MINIMUM;
        this.elapsedOffset = 0;
        this.yAxisMultiplier = Y_AXIS_MULTIPLIER;
        this.lastGameTick = null;
        this.tickTimeout = null;
        this.lag = false;
        this.lagTimeout = null;

        this.updateRocketConfig();

        this.createSeededRocket = (seed) => {
            const { skins, emitter } = this.currentRocketConfig;
            const randomIndex = Math.floor(Math.random() * skins.length);
            return new Rocket(skins[randomIndex] || Assets.defaultRocket, emitter);
            };
    }

    updateRocketConfig() {
        this.currentRocketConfig = this.getRocketConfig();
    }

    getRocketConfig() {
        if (!this.rocketsConfig || !this.rocketsConfig.rockets || !this.rocketsConfig.rockets.default) {
            // Fallback to a default configuration if the passed config is incomplete
            return {
                skins: [Assets.defaultRocket],
                emitter: {
                    lifetime: { min: 0.1, max: 0.3 },
                    frequency: 0.001,
                    spawnChance: 1,
                    particlesPerWave: 1,
                    emitterLifetime: 0,
                    maxParticles: 1000,
                    addAtBack: false,
                    pos: { x: 0, y: 0 },
                    behaviors: [
                        {
                            type: 'alpha',
                            config: {
                                alpha: {
                                    list: [
                                        { value: 0.8, time: 0 },
                                        { value: 0, time: 1 }
                                    ]
                                }
                            }
                        },
                        {
                            type: 'scale',
                            config: {
                                scale: {
                                    list: [
                                        { value: 1, time: 0 },
                                        { value: 0.3, time: 1 }
                                    ]
                                }
                            }
                        },
                        {
                            type: 'color',
                            config: {
                                color: {
                                    list: [
                                        { value: "fb1010", time: 0 },
                                        { value: "f5b830", time: 0.5 },
                                        { value: "2020ff", time: 1 }
                                    ]
                                }
                            }
                        },
                        {
                            type: 'moveSpeed',
                            config: {
                                speed: {
                                    list: [
                                        { value: 200, time: 0 },
                                        { value: 100, time: 1 }
                                    ]
                                }
                            }
                        },
                        {
                            type: 'rotationStatic',
                            config: { min: 0, max: 360 }
                        },
                        {
                            type: 'textureRandom',
                            config: {
                                textures: [Assets.fire, Assets.particle]
                            }
                        },
                        {
                            type: 'spawnShape',
                            config: {
                                type: 'torus',
                                data: {
                                    x: 0,
                                    y: 0,
                                    radius: 10,
                                    innerRadius: 0,
                                    affectRotation: false
                                }
                            }
                        }
                    ]
                }
            };
        }
      }

    

    onGameTick(timestamp) {
        this.lastGameTick = Date.now();
        this.lag = false;
        const timeDiff = this.lastGameTick - timestamp;
        if (this.startTime > timeDiff) {
            this.startTime = timeDiff;
        }
        if (this.lagTimeout) {
            clearTimeout(this.lagTimeout);
        }
        this.lagTimeout = setTimeout(this.checkForLag, PREDICTING_LAPSE);
    }

    checkForLag = () => {
        this.lag = true;
    };

    tick() {
        this.elapsedTime = this.getElapsedTime();
        this.multiplier = this.state !== GAME_STATES.OVER
            ? CrashEngine.getElapsedPayout(this.elapsedTime)
            : this.finalMultiplier;
        this.yAxisMinimum = this.yAxisMultiplier;
        this.yAxis = this.yAxisMinimum;
        this.xAxis = Math.max(this.elapsedTime + this.elapsedOffset, this.xAxisMinimum);
        if (this.multiplier > this.yAxisMinimum) {
            this.yAxis = this.multiplier;
        }
        this.xIncrement = this.plotWidth / this.xAxis;
        this.yIncrement = this.plotHeight / this.yAxis;
    }

    clearTickTimeouts() {
        clearTimeout(this.tickTimeout);
        clearTimeout(this.lagTimeout);
    }

    destroy() {
        this.clearTickTimeouts();
    }

    getElapsedTime() {
        if (this.state === GAME_STATES.OVER) {
            return this.finalElapsed;
        }
        if (this.state !== GAME_STATES.ACTIVE) {
            return 0;
        }
        return Date.now() - this.startTime;
    }

    getElapsedPosition(elapsed) {
        const multiplier = CrashEngine.getElapsedPayout(elapsed) - 1;
        return {
            x: elapsed * this.xIncrement,
            y: this.plotHeight - multiplier * this.yIncrement
        };
    }

    getYMultiplier(y) {
        return Math.ceil(1000 * (this.yAxis - y / this.plotHeight * this.yAxis + 1)) / 1000;
    }

    getMultiplierY(multiplier) {
        return this.plotHeight - (multiplier - 1) * this.yIncrement;
    }

    onResize(width, height) {
        this.graphWidth = width;
        this.graphHeight = height;
        this.plotOffsetX = 50;
        this.plotOffsetY = 40;
        this.plotWidth = width - this.plotOffsetX;
        this.plotHeight = height - this.plotOffsetY;
    }

    static getMultiplierElapsed(multiplier) {
        return 100 * Math.ceil(Math.log(multiplier) / Math.log(Math.E) / CRASH_SPEED / 100);
    }

    static getElapsedPayout(elapsed) {
        const payout = ~~(100 * Math.E ** (CRASH_SPEED * elapsed)) / 100;
        if (!Number.isFinite(payout)) {
            throw new Error("Infinite payout");
        }
        return Math.max(payout, 1);
    }
}

CrashEngine.States = GAME_STATES;
CrashEngine.RocketVisibleStates = [GAME_STATES.ACTIVE, GAME_STATES.OVER];

export default CrashEngine;