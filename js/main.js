var app = new PIXI.Application(window.innerWidth, window.innerHeight, {backgroundColor : 0x000000});
document.body.appendChild(app.view);

var prerenderCallbacks = [animate],
    lastTimeStepOccured = 0,
    currentStepTime = 0,
    currentTime = 0,
    animationBuffer = [];


lastTimeStepOccured = updateTime();

var test = new S.BonusWheel({
    name: "freespins",
    spineSlot: "1st_back",
    highlightSlot: "1st_back2",
    sectors: [0,1,2,3,4,5,6,7,8,2,6,7],
    maxSpeed: 6,
    minSpeed: 0.2,
    accelerationDuration: 1000,
    minimumSpinsBeforeStop: 2
}, function () {
    console.log("onStartBounceCompleteCallback");
});

if(!window.localStorage.getItem("itemsList")){
    window.localStorage.setItem("itemsList", JSON.stringify([
            { name: "STUB", count: 0 },
            { name: "notebook", count: 10 },
            { name: "bottle", count: 150 },
            { name: "mug", count: 30 },
            { name: "sticker", count: 48 },
            { name: "gift", count: 8 },
            { name: "notebook", count: 60 },
            { name: "mug", count: 36 },
            { name: "sticker", count: 9 }
        ])
    );
}

// move the sprite to the center of the screen

test.position.set(app.screen.width / 2, app.screen.height / 2);

app.stage.addChild(test);

// Listen for animate update
app.ticker.add(function(delta) {
    prerenderCallbacks.forEach(function(cb) {
        cb();
    });
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

function spacePressHandler(event) {
    if(event.keyCode === 32){
        var itemsLeft = !isNoMoreItems(),
            itemsList = JSON.parse(window.localStorage.getItem("itemsList")),
            sectorToStopOn;

        if(!itemsLeft){
            console.error("no more items at all");
        } else {
            sectorToStopOn = findSectorToStopOn();

            test.start();
            document.removeEventListener("keypress", spacePressHandler);

            test.setStoppingAngle(sectorToStopOn);
            test.startStopping().then(function () {
                document.addEventListener("keypress", spacePressHandler);
                test.playGiftAnimation(itemsList[sectorToStopOn].name);
            });
        }
    }
}

function isNoMoreItems() {
    return JSON.parse(window.localStorage.getItem("itemsList")).every(item => item.count === 0);
}

function findSectorToStopOn() {
    var randomIndex = getRandomItemAccordingToProbability(),
        itemsList = JSON.parse(window.localStorage.getItem("itemsList")),
        randomItem = itemsList[randomIndex];

    console.error(randomItem);

    if(randomItem.count > 0){
        randomItem.count--;
        window.localStorage.setItem("itemsList", JSON.stringify(itemsList));

        return randomIndex;
    } else {
        console.warn("no more ", randomItem.name);
        debugger;
        return findSectorToStopOn();
    }
}

function getRandomItemAccordingToProbability() {
    var itemsList = JSON.parse(window.localStorage.getItem("itemsList")),
        totalItemsSum = countTotalItemsSum(itemsList),
        itemsProbabilities = countItemsProbabilities(itemsList, totalItemsSum),
        probabilityArray = [],
        random;

    itemsList.forEach(function (item, idx) {
        for(var i = 0; i < itemsProbabilities[idx]; i++){
            probabilityArray.push(idx);
        }
    });

    random = randomInt(0, 100);

    console.error(probabilityArray[random]);
    return probabilityArray[random];
}

function countTotalItemsSum(itemsList) {
    var sum = 0;

    itemsList.forEach(function (item) {
        sum += item.count;
    });

    return sum;
}

function countItemsProbabilities(items, total) {
    var probabilities = [];

    items.forEach(function (item) {
        probabilities.push(Math.floor( item.count * 100 / total ));
    });

    return probabilities;
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function addItems(itemName, amount) {
    var itemsList = JSON.parse(window.localStorage.getItem("itemsList")),
        updatedList = itemsList.map(function (item) {
        if(itemName === item.name){
            item.count += amount;
        }
        return item;
    });

    window.localStorage.setItem("itemsList", JSON.stringify(updatedList));
}

function removeItems(itemName, amount) {
    var itemsList = JSON.parse(window.localStorage.getItem("itemsList")),
        updatedList = itemsList.map(function (item) {
        if(itemName === item.name){
            if(item.count - amount > 0){
                item.count -= amount;
            }else{
                item.count = 0;
            }
        }
        return item
    });

    window.localStorage.setItem("itemsList", JSON.stringify(updatedList));
}



document.addEventListener("keypress", spacePressHandler);
