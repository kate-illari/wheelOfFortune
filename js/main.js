import {SoundButton} from "./SoundButton";
import {FullScreenButton} from "./FullScreenButton";
import {ScrollContainer} from "./ScrollContainer";
import {StorageManager} from "./StorageItemsManager";
import {BonusWheel} from "./BonusWheel";
import {OpenCloseButton} from "./OpenCloseButton";
import {Menu} from "./Menu";

export const animationBuffer = [];

var app = new PIXI.Application(window.innerWidth, window.innerHeight, {backgroundColor : 0x000000});
document.body.appendChild(app.view);

var ambientSound = new Audio("assets/sounds/ambient.mp3");
var winSound = new Audio("assets/sounds/AUTOMOBILE.mp3");

function startAmbient() {
    ambientSound.volume = 0.5;
    ambientSound.play();
    ambientSound.loop = true;
}

ambientSound.addEventListener("loadeddata", () => {
    startAmbient();
});

const soundButton = new SoundButton({
    soundOn: function () {
        ambientSound.volume = 0.5;
        winSound.volume = 1;
    },
    soundOff: function () {
        ambientSound.volume = 0;
        winSound.volume = 0;
    }
});

const fullScreenButton = new FullScreenButton({
    enterFullscreenMode: function () {
        document.documentElement.requestFullscreen();
    },
    exitFullscreenMode: function () {
        document.exitFullscreen();
    }
});

var scrollContainer = new ScrollContainer(0, 0, 500, 1000, 1500);

var prerenderCallbacks = [animate],
    lastTimeStepOccured = 0,
    currentStepTime = 0,
    currentTime = 0;

lastTimeStepOccured = updateTime();

if(!window.localStorage.getItem("itemsList")){
    StorageManager.initStorage();
}

var wheel = new BonusWheel({
    name: "freespins",
    spineSlot: "1st_back",
    highlightSlot: "1st_back2",
    sectors: [0,1,2,3,4,5,6,7,8,9,10,11],
    maxSpeed: 16,
    minSpeed: 0.15,
    accelerationDuration: 1800,
    minimumSpinsBeforeStop: 3,
    sectorItemsList: StorageManager.getSectorItemsList(),
    image: "SYM0"
}, function () {
    console.log("onStartBounceCompleteCallback");
}, app);

// move the sprite to the center of the screen
wheel.position.set(app.screen.width / 2, app.screen.height / 2);

window.addEventListener("resize", function() {
    app.renderer.resize(window.innerWidth, window.innerHeight);
    wheel.position.set(window.innerWidth / 2, window.innerHeight / 2);
});

// Listen for animate update
app.ticker.add(function(delta) {
    prerenderCallbacks.forEach(function(cb) {
        cb();
    });
    scrollContainer.hideOffscreenElements();
});

function animate(){
    animationBuffer.forEach(function(holder){
        if ( holder.running ){
            holder.run({
                timeStep: currentStepTime,
                time: currentTime
            });
        }
    });
}

function updateTime() {
    var now = Date.now(),
        diff = now - lastTimeStepOccured;

    // Check if more time than allowed has passed since the last frame
    if (diff > 250) {
        diff = 1000 / 60;
    }

    currentStepTime = diff | 0;
    currentTime += currentStepTime;

    return now;
}

app.stage.addChild(wheel);

var openCloseButton = new OpenCloseButton({
    openCallback: function () {
        menu.showMenu();
    },
    closeCallback: function () {
        menu.hideMenu();
    }
});

var menu = new Menu({
    onItemImgChange: function (index, texture) {
        wheel.changeTexture(index, texture);
    },
    onCountChange: function (index, count) {
        StorageManager.setItemCount(index, count);
    }
});

//app.stage.addChild(menu);
scrollContainer.addChild(menu);
app.stage.addChild(scrollContainer);
app.stage.addChild(soundButton);
app.stage.addChild(fullScreenButton);
app.stage.addChild(openCloseButton);


window.addEventListener("resize", refreshAll);
function refreshAll() {
    wheel.refresh();
}

function spacePressHandler(event) {
    if(event.keyCode === 32){
        var itemsLeft = !StorageManager.isNoMoreItems(),
            itemsList = JSON.parse(window.localStorage.getItem("itemsList")),
            sectorToStopOn;

        if(!itemsLeft){
            console.error("no more items at all");
        } else {
            winSound.play();
            sectorToStopOn = StorageManager.findSectorToStopOn();
            menu.onStorageUpdated();
            console.warn("stopping at: ", sectorToStopOn);

            openCloseButton.onForseClosed();
            wheel.start();
            document.removeEventListener("keypress", spacePressHandler);

            wheel.setStoppingAngle(sectorToStopOn);
            wheel.startStopping().then(function () {
                wheel.playGiftAnimation(itemsList[sectorToStopOn].name, function () {
                    document.addEventListener("keypress", spacePressHandler);
                });
            });
        }
    }
}

document.addEventListener("keypress", spacePressHandler);
