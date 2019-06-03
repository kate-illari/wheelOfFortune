import {BonusWheelItem} from "./BonusWheelItem";
import {AnimationHolder} from "./AnimationHolder";

const CIRCLE_DEG = 360;
    //the minimum difference (angle) between current wheel stop and previous wheel stop:
const MIN_DIFF = 270;
const START_BOUNCE = {
    //negative value, since the wheel moves backwards
    maxSpeed: -0.5,
        //time fraction of the whole acceleration time
        timeFraction: 1/500
};

const WHEEL_ITEMS_CENTER_OFFSET = 300;
const WHEEL_ITEM_CONFIG = {
    width: 100,
    height: 100
};

export class BonusWheel extends PIXI.Container {
    
    constructor (config, onStartBounceCompleteCallback, app) {
        super();
        var me = this;

        me.sectorItemsList = config.sectorItemsList;

        me.background = me._initBackground(me, "wheel_bg");

        me._initBgSpine(me, "glow", app);

        me.background.anchor.set(0.5,0.5);

        //degrees per frame
        me.maxSpeed = config.maxSpeed;
        me.minSpeed = config.minSpeed;

        me.sprite = me._initWheelSprite(me, "wheelWin");
        me.wheelItems = me._initWheelItems(me.sprite);

        //will be added to a separate spine slot:
        me.highlightSprite = typeof config.image !== "undefined" ? me._initSprite(config.image, PIXI.BLEND_MODES.ADD) : me._initEmptySprite();
        me.sectorsAngles = me._mapSectorsAgles(config.sectors);
        me.animations = me._initAnimations(config);
        me.onStartBounceCompleteCallback = onStartBounceCompleteCallback;
        me.config = config;

        me.pick = me._initPickSprite(me);
        me.gift = me._initGiftSprite(me, "SYM0");

        me.reset();
        me.refresh();
    }

    _initBackground (container, imageName) {
        return container.addChild(new PIXI.Sprite.fromImage("assets/images/"+imageName+".jpg"))
    }

    _initBgSpine (container, spineName, app) {
        var me = this,
            glow;

        PIXI.loader
            .add('glow', 'assets/spine/glow.json')
            .load(onAssetsLoaded);

        function onAssetsLoaded(loader,res) {
            // instantiate the spine animation
            glow = new PIXI.spine.Spine(res.glow.spineData);
            glow.skeleton.setToSetupPose();
            glow.update(0);
            glow.autoUpdate = false;

            me.background.addChild(glow);

            // once position and scaled, set the animation to play
            glow.state.setAnimation(0, 'spin', true);
            app.ticker.add(function() {
                glow.update(0.02);
            });

            glow.visible = false;
            me.bgAnimation = glow;
        }

    }

    _initWheelSprite (container, imageName) {
        var sprite = new PIXI.Sprite.fromImage("assets/images/"+imageName+".png");
        sprite.anchor.set(0.5, 0.5);
        container.addChild(sprite);

        return sprite;
    }

    /**
     * Adds wheel items - sprites that rotate together with the wheel
     *
     * @param {PIXI.Container|PIXI.Sprite} parent - wheelItems will be added here
     * @returns {Array<S.BonusWheelItem>}
     * @private
     */
    _initWheelItems(parent){
        var me = this,
            sizedContainer,
            bonusWheelItem,
            whellItems = [];

        me.sectorItemsList.forEach(function (item, index) {
            sizedContainer = new PIXI.Container();

            bonusWheelItem = new BonusWheelItem({
                parent: sizedContainer,
                texture: new PIXI.Texture.fromImage("assets/images/prizes/" + item + ".png"),
                sectorIndex: index,
                centerOffset: WHEEL_ITEMS_CENTER_OFFSET,
                totalSectorsNum: me.sectorItemsList.length
            });

            bonusWheelItem.width = WHEEL_ITEM_CONFIG.width;
            bonusWheelItem.height = WHEEL_ITEM_CONFIG.height;

            parent.addChild(sizedContainer);
            whellItems.push(bonusWheelItem);
        });

        return whellItems;
    }

    _initPickSprite (container) {
        var sprite = new PIXI.Sprite.fromImage("assets/images/pick.png");
        sprite.anchor.set(0.5, 0.5);
        container.addChild(sprite);
        sprite.position.y = -460;

        return sprite;
    }

    _initGiftSprite (container, imageName) {
        var sprite = this._initSprite(imageName, PIXI.BLEND_MODES.NORMAL);

        container.addChild(sprite);
        sprite.width = 100;
        sprite.height = 100;
        sprite.position.y = -250;
        sprite.visible = false;
        sprite.animation = new AnimationHolder({
            addToAnimationLoop: true,
            target: sprite,
            children: [
                {
                    prop: "position",
                    animate: {
                        200: {y: -(WHEEL_ITEMS_CENTER_OFFSET)},
                        1500: {y: 0},
                        5000: {y: 0},
                        5500: {y: -(WHEEL_ITEMS_CENTER_OFFSET)},
                    }
                },
                {
                    prop: "width",
                    animate: {
                        200: WHEEL_ITEM_CONFIG.width,
                        1500: WHEEL_ITEM_CONFIG.width * 3,
                        5000: WHEEL_ITEM_CONFIG.width * 3,
                        5500: WHEEL_ITEM_CONFIG.width
                    }
                },
                {
                    prop: "height",
                    animate: {
                        200: WHEEL_ITEM_CONFIG.height,
                        1500: WHEEL_ITEM_CONFIG.height * 3,
                        5000: WHEEL_ITEM_CONFIG.height * 3,
                        5500: WHEEL_ITEM_CONFIG.height
                    }
                }
            ]
        });

        return sprite;
    }

    /**
     *
     * @param animSprite - win presentation sprite
     * @private
     */
    _onWinAnimationComplete(animSprite){
        animSprite.visible = false;
        this.wheelItems.forEach(function(wheelItem){
            wheelItem.show();
        });
        this.bgAnimation.visible = false;
    }

    _initSprite (imageName, blendMode) {
        var sprite = new PIXI.Sprite.fromImage("assets/images/prizes/"+imageName+".png");

        sprite.anchor.set(0.5, 0.5);
        sprite.blendMode = blendMode;

        return sprite;
    }

    _initEmptySprite () {
        return new PIXI.Sprite(PIXI.Texture.EMPTY);
    }

    /**
     * @param {Array} sectorsNames - list of sectors names on the wheel
     * @returns {Object} sectorsAngles - config with all the sectors mapped to angles of wheel rotation
     */
    _mapSectorsAgles (sectorsNames) {
        var sectorsNumber = sectorsNames.length,
            degreesPerSector = CIRCLE_DEG / sectorsNumber,
            sectorsAngles = {};

        sectorsNames.forEach(function (sectorName, index) {
            //forced to use array of angles, since we might have multiple sectors for one value
            //for instance, the key wheel has 6 sectors with 0 and 2 sectors with 1
            if(!sectorsAngles[sectorName]){
                sectorsAngles[sectorName] = [];
            }
            sectorsAngles[sectorName].push(degreesPerSector * index);
        });

        return sectorsAngles
    }

    /**
     * These are not "animations" in common understanding of the Animation.Holder, they are rather tickers,
     * that perform certain update functions on every frame
     *
     * @param {Object} config - wheel config
     * @returns {Object} list of all available animations
     */
    _initAnimations (config) {
        return {
            "accelerationTicker": this._initAccelerationTicker(config.accelerationDuration),
            "uniformRotationTicker": this._initUnformRotationTicker(),
            "decelerationTicker": this._initDecelerationTicker()
        }
    }

    /**
     * @param {number} accelerationTime - time it will take to accelerate from 0 to maximum speed
     * @returns {Object} animation holder that gradually(with easing) increases currentSpeed
     * that will be used in _updateSpriteAngle on each frame for smooth wheel start
     */
    _initAccelerationTicker (accelerationTime) {
        var me = this;

        return new AnimationHolder({
            target: me,
            prop: "currentSpeed",
            onUpdate: me._updateSpriteAngle.bind(me),
            onEnd: me.startUniformRotation.bind(me),
            animate: [
                {
                    time: 0,
                    value: 0,
                    ease: Animation.utils.powerTwoOut
                },
                //the wheel bounce back on start:
                {
                    time: accelerationTime * START_BOUNCE.timeFraction,
                    value: START_BOUNCE.maxSpeed,
                    ease: Animation.utils.powerTwoIn
                },
                {
                    time: accelerationTime,
                    value: me.maxSpeed
                }
            ],
            addToAnimationLoop: true
        });
    }

    /**
     * @returns {Object} animation holder that calls _updateSpriteAngle on every frame
     * by this moment, the speed reaches maximum value, so this spins the wheel uniformly
     */
    _initUnformRotationTicker () {
        var me = this;

        return new AnimationHolder({
            onUpdate: me._updateSpriteAngle.bind(me),
            addToAnimationLoop: true,
            loop: true
        });
    }

    /**
     * @returns {Object} animation holder that calls decelerateRotation on every frame and smoothly stops the wheel
     */
    _initDecelerationTicker () {
        var me = this;

        return new AnimationHolder({
            addToAnimationLoop: true,
            onUpdate: me.decelerateRotation.bind(me),
            loop: true
        });
    }

    startUniformRotation () {
        var me = this;
        //resolving promise (there's no callback on restore):
        me.onWheelStartCallback && me.onWheelStartCallback();
        //in regular case it would've reached maxSpeed naturally by this moment, but on restores we're forced to set it manually:
        me.currentSpeed = me.maxSpeed;
        me.animations.uniformRotationTicker.play();
    }

    /**
     *  decreases currentSpeed depending on currentAngle relative to finalAngle
     *  the closer we are to the finalAngle the slower we go
     *  calls _updateSpriteAngle to apply new speed
     */
    decelerateRotation () {
        var me = this,
            currentAngle = me.sprite.rotation * PIXI.RAD_TO_DEG,
            distanceLeft = me.finalAngle - currentAngle,
            maxSpeedFraction = distanceLeft / me.stoppingDistance,
            timePassedFromStart = 1 - maxSpeedFraction;

        me.currentSpeed = Animation.utils.powerTwoIn(me.maxSpeed, 0, timePassedFromStart);

        //proceed with uniform rotation if the speed might become too low:
        if (me.currentSpeed < me.minSpeed) {
            me.currentSpeed = me.minSpeed;
        }

        me._updateSpriteAngle();
    }

    /**
     *  Changes the sprite angle by adding currentSpeed to it, stops the deceleration ticker if reached final angle
     */
    _updateSpriteAngle () {
        var me = this,
            currentRotation = me.sprite.rotation * PIXI.RAD_TO_DEG,
            timeScale = me.getTimeScale(),
            newRawRotation = currentRotation + me.currentSpeed * timeScale,
            newRotation;

        //startBounce completion condition:
        if(me.prevFrameSpeed < 0 && me.currentSpeed > 0){
            me.onStartBounceCompleteCallback(me.config.name);
        }

        if (newRawRotation >= me.finalAngle) {
            newRotation = me.finalAngle;
            me.currentSpeed = 0;
            me.animations.decelerationTicker.stop();

            //resolving promise:
            me.onWheelStopped();
        } else {
            newRotation = newRawRotation;
        }

        me.sprite.rotation = newRotation * PIXI.DEG_TO_RAD;
        me.highlightSprite.rotation = me.sprite.rotation;
        me.prevFrameSpeed = me.currentSpeed;
    }

    /**
     *  Returns timescale coefficient to adjust the animation duration on low FPS
     *
     *  @returns {number} - deltaTime correction coefficient
     */
    getTimeScale () {
        var me = this,
            //todo: remove before release:
            timeScale = 1.5,
            oneFrameDuration = 1000/60,
            now = Date.now(),
            prev = me.lastTick ? me.lastTick : now - oneFrameDuration;

        me.lastTick = now;

        //todo: remove before release:
        return (now - prev) * timeScale/oneFrameDuration;
    }

    start (callback) {
        this.onWheelStartCallback = callback;
        this.animations.accelerationTicker.play();


    }

    startDeceleration (prevWheelStoppingDistance, onWheelStopped) {
        var me = this;

        me.onWheelStopped = onWheelStopped;
        me.animations.uniformRotationTicker.stop();
        me._updateStoppingDistance(prevWheelStoppingDistance);
        me.animations.decelerationTicker.play();

        this.bgAnimation.visible = true;
        this.bgAnimation.state.setAnimation(0, 'spin', true);
    }

    /**
     *  updates distance to the destination point and final sprite angle at the moment of stopping
     *  depending on currentAngle, stopAngle and prevWheelStoppingDistance
     *
     *  @param {number} prevWheelStoppingDistance - distance, the previous wheel has to cover before full stop
     */
    _updateStoppingDistance (prevWheelStoppingDistance) {

        var me = this,
            currentAngle = me.sprite.rotation * PIXI.RAD_TO_DEG,
            //using % me.CIRCLE_DEG here to simply calculations:
            currentAngleReduced = currentAngle % CIRCLE_DEG,
            angleToFullCircleLeft = CIRCLE_DEG - currentAngleReduced,
            stopAngle = me.getStoppingAngle(),
            minDistanceToTarget = angleToFullCircleLeft + stopAngle,
            //number of 360 degrees wheel revolutions before stop
            revolutionsBeforeStop = me.getRevolutionsBeforeStop(minDistanceToTarget, prevWheelStoppingDistance);

        me.stoppingDistance = minDistanceToTarget + revolutionsBeforeStop * CIRCLE_DEG;
        me.finalAngle = currentAngle + me.stoppingDistance;
    }

    /**
     * Calculates the number of extra revolutions to make depending on previous wheel stopping distance
     * (current wheel distance should always be greater than the previous one)
     *
     * @param {number} minDistanceToTarget - minimum possible distance between current and final angles
     * @param {number} prevWheelStoppingDistance - distance the previous wheel will cover before full stop
     * @returns {number} spinsBeforeStop - number of extra revolutions before full stop
     */
    getRevolutionsBeforeStop (minDistanceToTarget, prevWheelStoppingDistance) {
        var me = this,
            revsBeforeStop = 0,
            targetDistance = prevWheelStoppingDistance + MIN_DIFF,
            currentValue = minDistanceToTarget;
        
        while(currentValue < targetDistance){
            revsBeforeStop++;
            currentValue = minDistanceToTarget + CIRCLE_DEG * revsBeforeStop;
        }

        revsBeforeStop = Math.max(revsBeforeStop, me.config.minimumSpinsBeforeStop);

        return revsBeforeStop;
    }

    /**
     * Randomly selects from all available sectors angles for itemToStopOn
     * (for instance, out of 6 options for 0 level on level wheel) and sets it as stopAngle
     *
     * @param {number | string} itemToStopOn - value on the sector whe wheel should stop on
     * @returns {void}
     */
    setStoppingAngle (itemToStopOn) {
        var me = this,
            targetAngles = me.sectorsAngles[itemToStopOn],
            targetAnglesCount = targetAngles.length,
            randomAngleIndex = Math.floor(Math.random() * targetAnglesCount);

        me.stopAngle = targetAngles[randomAngleIndex];
    }

    getStoppingAngle () {
        return this.stopAngle;
    }

    getCurrentStoppingDistance () {
        return this.stoppingDistance;
    }

    playGiftAnimation (name, onEndCallback) {
        var me = this,
            gift = me.gift,
            totalSectorsNum = me.sectorItemsList.length,
            currentItemIndex = Math.round( totalSectorsNum / CIRCLE_DEG * me.stopAngle),
            currentWheelItem = me.wheelItems[currentItemIndex];

        currentWheelItem.hide();

        gift.texture = currentWheelItem.texture;
        gift.visible = true;

        gift.animation.onEnd = function () {
            me._onWinAnimationComplete(gift);
            onEndCallback();
        };

        gift.animation.play();

        me.bgAnimation.state.setAnimation(0, 'win', true);
    }

    reset () {
        var me = this;

        me.stoppingDistance = Infinity;
        me.finalAngle = Infinity;
        me.sprite.rotation = 0;
        me.currentSpeed = 0;
        me.lastTick = 0;
    }

    startStopping () {
        var me = this;

        return new Promise(function (resolve) {
            me.startDeceleration(0, function () {
                resolve();
            })
        })
    }

    changeTexture (itemIndex, texture) {
        this.wheelItems[itemIndex].texture = texture;
    }

    refresh () {
        this.scale.set(window.innerHeight / 1080);
    }

}