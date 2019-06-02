const CONFIG = {
    x: 50,
    y: 10
};

export class SoundButton extends PIXI.Sprite {
    constructor (config) {
        super();

        this.position.set(CONFIG.x, CONFIG.y);
        this.interactive = true;
        this.buttonMode = true;
        this.on('pointerdown', this.onButtonClick.bind(this));
        this.soundOn = config.soundOn;
        this.soundOff = config.soundOff;

        this.currentState = "on";
        this.setOnTexture();
    }

    onButtonClick () {
        if(this.currentState === "off"){
            this.currentState = "on";
            this.setOnTexture();
            this.soundOn();
        } else if (this.currentState === "on"){
            this.currentState = "off";
            this.setOffTexture();
            this.soundOff();
        } else {
            console.error("Check for error, current state is ", this.currentState);
        }
    }

    setOffTexture () {
        this.texture = new PIXI.Texture.from("assets/images/buttons/soundOff.png")
    }

    setOnTexture () {
        this.texture = new PIXI.Texture.from("assets/images/buttons/soundOn.png")
    }
}