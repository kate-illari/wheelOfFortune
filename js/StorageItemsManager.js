Sys.ns("S");

S.StorageManager = {
    initStorage: function () {
        window.localStorage.setItem("itemsList", JSON.stringify([
                {name: "SYM0", count: 1},
                {name: "SYM1", count: 1},
                {name: "SYM2", count: 1},
                {name: "SYM3", count: 1},
                {name: "SYM4", count: 1},
                {name: "SYM5", count: 1},
                {name: "SYM6", count: 1},
                {name: "SYM7", count: 1},
                {name: "SYM8", count: 1},
                {name: "SYM9", count: 1},
                {name: "SYM10", count: 1},
                {name: "SYM11", count: 1}
            ])
        );
    },

    randomInt: function (min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    getSectorItemsList: function () {
        var list = [];

        JSON.parse(window.localStorage.getItem("itemsList")).forEach(function (item) {
            list.push(item.name);
        });

        console.warn(list);
        return list;
    },

    addItems: function (itemName, amount) {
        var itemsList = JSON.parse(window.localStorage.getItem("itemsList")),
            updatedList = itemsList.map(function (item) {
                if (itemName === item.name) {
                    item.count += amount;
                }
                return item;
            });

        window.localStorage.setItem("itemsList", JSON.stringify(updatedList));
    },

    removeItems: function (itemName, amount) {
        var itemsList = JSON.parse(window.localStorage.getItem("itemsList")),
            updatedList = itemsList.map(function (item) {
                if (itemName === item.name) {
                    if (item.count - amount > 0) {
                        item.count -= amount;
                    } else {
                        item.count = 0;
                    }
                }
                return item
            });

        window.localStorage.setItem("itemsList", JSON.stringify(updatedList));
    },

    addItem: function (index, amount) {
        var itemsList = JSON.parse(window.localStorage.getItem("itemsList")),
            updatedList = itemsList.map(function (item, itemIdx) {
                if (index === itemIdx) {
                    item.count += amount;
                }
                return item;
            });

        window.localStorage.setItem("itemsList", JSON.stringify(updatedList));
    },


    removeItem: function (index, amount) {
        var itemsList = JSON.parse(window.localStorage.getItem("itemsList")),
            updatedList = itemsList.map(function (item, itemIdx) {
                if (index === itemIdx) {
                    if (item.count - amount > 0) {
                        item.count -= amount;
                    } else {
                        item.count = 0;
                    }
                }
                return item;
            });

        window.localStorage.setItem("itemsList", JSON.stringify(updatedList));
    },

    setItemCount: function (index, amount) {
        var itemsList = JSON.parse(window.localStorage.getItem("itemsList")),
            updatedList = itemsList.map(function (item, itemIdx) {
                if (index === itemIdx) {
                    item.count = amount;
                }
                return item;
            });

        window.localStorage.setItem("itemsList", JSON.stringify(updatedList));
    },

    countItemsProbabilities: function (items, total) {
        var probabilities = [];

        items.forEach(function (item) {
            probabilities.push(Math.floor(item.count * 100 / total));
        });

        return probabilities;
    },

    countTotalItemsSum: function (itemsList) {
        var sum = 0;

        itemsList.forEach(function (item) {
            sum += item.count;
        });

        return sum;
    },

    getRandomItemAccordingToProbability: function () {
        var itemsList = JSON.parse(window.localStorage.getItem("itemsList")),
            totalItemsSum = this.countTotalItemsSum(itemsList),
            itemsProbabilities = this.countItemsProbabilities(itemsList, totalItemsSum),
            probabilityArray = [],
            random;

        itemsList.forEach(function (item, idx) {
            for (var i = 0; i < itemsProbabilities[idx]; i++) {
                probabilityArray.push(idx);
            }
        });

        random = this.randomInt(0, 100);

        return probabilityArray[random];
    },

    isNoMoreItems: function () {
        return JSON.parse(window.localStorage.getItem("itemsList")).every(item => item.count === 0);
    },

    findSectorToStopOn: function () {
        var me = this,
            randomIndex = me.getRandomItemAccordingToProbability(),
            itemsList = JSON.parse(window.localStorage.getItem("itemsList")),
            randomItem = itemsList[randomIndex];

        console.error(randomItem);

        if (randomItem.count > 0) {
            randomItem.count--;
            window.localStorage.setItem("itemsList", JSON.stringify(itemsList));

            return randomIndex;
        } else {
            console.warn("no more ", randomItem.name);
            debugger;
            return me.findSectorToStopOn();
        }
    }
};


