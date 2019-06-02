const CONFIG = {
    x: 10,
    y: 10
};

export class OpenCloseButton extends PIXI.Sprite{

    constructor (config) {
        super();

        this.position.set(CONFIG.x, CONFIG.y);
        this.interactive = true;
        this.buttonMode = true;
        this.on('pointerdown', this.onButtonClick.bind(this));
        this.openCallback = config.openCallback;
        this.closeCallback = config.closeCallback;

        this.currentState = "closed";
        this.setClosedTexture();
    }

    onButtonClick () {
        if(this.currentState === "closed"){
            this.currentState = "opened";
            this.setOpenedTexture();
            this.openCallback();
        } else if (this.currentState === "opened"){
            this.currentState = "closed";
            this.setClosedTexture();
            this.closeCallback();
        } else {
            console.error("Check for error, current state is ", this.currentState);
        }
    }

    setClosedTexture () {
        this.texture = new PIXI.Texture.from("assets/images/buttons/settings.png")
    }

    setOpenedTexture () {
        this.texture = new PIXI.Texture.from("assets/images/buttons/error.png")
    }

    onForseClosed () {
        this.currentState = "closed";
        this.setClosedTexture();
        this.closeCallback();
    }
}