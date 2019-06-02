const OFFSET = 10;
const TOP_OFFSET = 80;

export class Menu extends PIXI.Container{
    constructor (config) {
        super();

        this.onItemImgChange = config.onItemImgChange;
        this.onCountChange = config.onCountChange;

        const input = document.createElement('input');
        input.accept = "image/*";
        input.id = "inpt";
        input.type = "file";
        input.onchange = this.updateImageLocally.bind(this);

        document.body.appendChild(input);

        const itemsListContainer = new PIXI.Container();
        itemsListContainer.position.y = TOP_OFFSET;

        const itemsList = JSON.parse(window.localStorage.getItem("itemsList"));
        this.itemGroups = this.createItemsListInterface(itemsList, itemsListContainer);
        this.addChild(itemsListContainer);

        this.hideMenu();
    }

    onStorageUpdated () {
        console.log("updating the storage");
        const itemsList = JSON.parse(window.localStorage.getItem("itemsList"));
        this.itemGroups.forEach(function (item, index) {
            item.countText.text = itemsList[index].count;
        });

    }

    showMenu () {
        this.visible = true;
    }

    hideMenu () {
        this.visible = false;
    }

    createItemsListInterface (itemsList, parentContainer) {
        var me = this,
            itemGroup, itemGroups = [];

        PIXI.loader
            .load(
                itemsList.forEach(function (item, itemIndex) {
                    itemGroup = me.createItemContainer(parentContainer, item, itemIndex);
                    itemGroups[itemIndex] = itemGroup;
                })
            );

        return itemGroups;
    }

    createItemContainer (parentContainer, item, itemIndex) {
        const itemContainer = new PIXI.Container();
        let itemGroup = {};

        itemGroup.button = this.addButton(itemContainer, item.name, itemIndex);
        itemGroup.countText = this.addTxt(itemContainer, item.count);
        itemGroup.buttons = this.addPlusMinusButtons(itemContainer, itemIndex, item.count);
        itemContainer.position.set(OFFSET, (OFFSET * itemIndex) + (itemIndex * itemContainer.height));

        this.addItemsListBg(itemContainer);

        parentContainer.addChild(itemContainer);
        return itemGroup;
    }

    addItemsListBg (container) {
        var graphics = new PIXI.Graphics();

        graphics.beginFill(0x3d5c5c);
        graphics.lineStyle(2, 0xDE3249, 1);
        graphics.drawRect(0, 0, container.width, container.height);
        graphics.endFill();
        graphics.blendMode = 2;

        container.addChildAt(graphics, 0);
    }

    addButton (parentContainer, name, itemIndex) {
        const me = this;
        const texture = new PIXI.Texture.from("assets/images/prizes/" + name + ".png");
        const itemImage = new PIXI.Sprite(texture);

        itemImage.height = 50;
        itemImage.width = 50;

        itemImage.interactive = true;
        itemImage.buttonMode = true;
        itemImage.on('pointerdown', me.onItemClick.bind(me, itemImage, itemIndex));

        parentContainer.addChild(itemImage);
    }

    addTxt (parentContainer, count) {
        const style = new PIXI.TextStyle({
                fill: '#d8df75',
                fontSize: 15,
                fontFamily: 'Arial'
            }),
            txt = new PIXI.Text(count, style);

        txt.anchor.set(0.5);
        txt.position.set(100, parentContainer.width / 2);

        parentContainer.addChild(txt);
        return txt;
    }

    addPlusMinusButtons (parentContainer, itemIndex) {
        const me = this;
        let buttons = {};

        buttons.plusButton = me.initIncrementButton(
            {
                x: 160,
                y: 0,
                width: 20,
                height: 20,
                texture: new PIXI.Texture.from("assets/images/buttons/plus.png"),
                callback: me.onPlusButtonClick.bind(me, itemIndex),
                parentContainer: parentContainer
            });

        buttons.minusButton = me.initIncrementButton(
            {
                x: 160,
                y: 30,
                width: 20,
                height: 20,
                texture: new PIXI.Texture.from("assets/images/buttons/minus.png"),
                callback: me.onMinusButtonClick.bind(me, itemIndex),
                parentContainer: parentContainer
            });

        return buttons;
    }

    initIncrementButton (config) {
        let button = new PIXI.Sprite(config.texture);

        button.position.set(config.x, config.y);
        button.interactive = true;
        button.buttonMode = true;
        button.width = config.width;
        button.height = config.height;
        button.on("pointerdown", config.callback);
        config.parentContainer.addChild(button);

        return button;
    }

    onPlusButtonClick (itemIndex) {
        let newCount = JSON.parse(window.localStorage.getItem("itemsList"))[itemIndex].count + 1;

        this.onCountChange(itemIndex, newCount);
        this.updateCountText(itemIndex, newCount);
    }

    onMinusButtonClick (itemIndex) {
        const currentCount = JSON.parse(window.localStorage.getItem("itemsList"))[itemIndex].count;
        let newCount;

        if((currentCount - 1) <= 0){
            newCount = 0;
        } else {
            newCount = currentCount - 1 ;
        }

        this.onCountChange(itemIndex, newCount);
        this.updateCountText(itemIndex, newCount);
    }

    updateCountText (itemIndex, newCount) {
        if(!newCount){
            this.itemGroups[itemIndex].countText.text = JSON.parse(window.localStorage.getItem("itemsList"))[itemIndex].count;
            return;
        }
        this.itemGroups[itemIndex].countText.text = newCount;
    }

    onItemClick (targetSprite, itemIndex) {
        document.getElementById("inpt").click();
        this.targetSprite = targetSprite;
        this.itemIndex = itemIndex;
    }

    updateImageLocally () {
        var me = this,
            file = document.getElementById("inpt").files[0],
            reader = new FileReader();

        reader.onload = function () {
            me.targetSprite.setTexture(new PIXI.Texture.from(reader.result));
            me.onItemImgChange(me.itemIndex, new PIXI.Texture.from(reader.result));
        };

        if (file) {
            reader.readAsDataURL(file);
        }

    }


}