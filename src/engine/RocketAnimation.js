import * as PIXI from 'pixi.js';
import { Assets } from '@/assets';

export class Rocket extends PIXI.Container {
    constructor(skin, emitterConfig) {
        super();
    
        this.ship = PIXI.Sprite.from(skin || Assets.defaultRocket);
        this.ship.anchor.set(0.5, 0);
        this.ship.y = -15;

        this.ship.filters = [new PIXI.filters.DropShadowFilter({
            alpha: 0.35,
            blur: 0,
            quality: 4,
            distance: 3,
            color: 0
        })];

        const scaleFactor = 100 / this.ship.height;
        this.ship.height = 100;
        this.ship.width = this.ship.width * scaleFactor;

        const trailContainer = new PIXI.Container();
            this.trailEmitter = new PIXI.particles.Emitter(trailContainer, {
            ...emitterConfig,
            textures: [PIXI.Texture.from(Assets.fire), PIXI.Texture.from(Assets.particle)],
            pos: {
                ...emitterConfig.pos,
                y: this.ship.y + this.ship.height + 5
            }
        });

        this.addChild(trailContainer, this.ship);

        this._targetX = 0;
        this._targetY = 0;
        this._targetAngle = 0;
        this._crashed = false;
        this._updateAngle = false;
    }

    get angle() {
        return super.angle;
    }

    set angle(value) {
        if (Math.abs(value - super.angle) > 0.2) {
            this._targetAngle = value;
            this._updateAngle = true;
        }
    }

    get crashed() {
        return this._crashed;
    }

    set crashed(value) {
        this.visible = false;
        this._crashed = value;
        this.trailEmitter.emit = false;
        this.trailEmitter.cleanup();
    }

    tick(deltaTime) {
        if (this._crashed) return;

        if (this._updateAngle) {
            super.angle = Wt(super.angle, this._targetAngle, 0.1);
            this._updateAngle = false;
        }

        if (this.trailEmitter.emit) {
            this.trailEmitter.update(0.001 * deltaTime);
        }
    }

    destroy() {
        super.destroy();
        this.trailEmitter.emit = false;
        this.trailEmitter.cleanup();
        this.trailEmitter.destroy();
        this.trailEmitter = undefined;
    }
}

// Helper function (you might want to move this to a utilities file)
function Wt(current, target, factor) {
    return (1 - factor) * current + factor * target;
}