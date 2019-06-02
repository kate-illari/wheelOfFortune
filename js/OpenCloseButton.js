Sys.ns("S");

S.OpenCloseButton = {

    CONFIG: {
        x: 10,
        y: 10
    },

    constructor: function (config) {
        S.OpenCloseButton.superclass.constructor.call(this, config.texture);


        this.position.set(this.CONFIG.x, this.CONFIG.y);
        this.interactive = true;
        this.buttonMode = true;
        this.on('pointerdown', this.onButtonClick.bind(this));
        this.openCallback = config.openCallback;
        this.closeCallback = config.closeCallback;

        this.currentState = "closed";
        this.setClosedTexture();
    },

    onButtonClick: function () {
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
    },

    setClosedTexture: function () {
        this.texture = new PIXI.Texture.from("assets/images/buttons/settings.png")
    },

    setOpenedTexture: function () {
        this.texture = new PIXI.Texture.from("assets/images/buttons/error.png")
    },

    onForseClosed: function () {
        this.currentState = "closed";
        this.setClosedTexture();
        this.closeCallback();
    }
};

S.OpenCloseButton = Sys.extend(PIXI.Sprite, S.OpenCloseButton, "S.OpenCloseButton");