// src/utils/constants.js

// Game States
export const GAME_STATES = {
    LOADING: "Loading",
    STARTING: "TakingBets",
    ACTIVE: "Running",
    OVER: "Over"
};

// Rocket States
export const ROCKET_VISIBLE_STATES = [GAME_STATES.ACTIVE, GAME_STATES.OVER];

// Game Parameters
export const CRASH_SPEED = 6e-5;
export const PREDICTING_LAPSE = 500;

// Graph Constants
export const X_AXIS_MINIMUM = 1000;
export const Y_AXIS_MINIMUM = -1;
export const Y_AXIS_MULTIPLIER = 1.5;

// Bet Types
export const BET_TYPES = {
    MANUAL: 0,
    AUTO: 1
};

// Currency mapping
export const CURRENCY_MAPPING = {
    1: "btc",
    2: "eth",
    3: "ltc",
    4: "cash",
    5: "usdt",
    6: "usdc",
    7: "xrp",
    8: "doge",
    9: "trx"
};

// Screen size breakpoint
export const MOBILE_BREAKPOINT = 600;

// Maximum profit
export const MAX_PROFIT = 1000000;

// Time constants
export const MILLISECONDS_PER_SECOND = 1000;

// Animation constants
export const DEFAULT_ANIMATION_DURATION = 500;
export const ROCKET_ANGLE_THRESHOLD = 0.2;
export const ROCKET_ANGLE_INTERPOLATION_FACTOR = 0.1;

// Emitter constants
export const EMITTER_UPDATE_FACTOR = 0.001;

export const SOCKET_URL = 'wss://localhost:8080';