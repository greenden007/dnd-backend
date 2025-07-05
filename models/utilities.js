"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addStatBlockNewBlock = exports.addStatBlock = exports.setStatBlock = exports.updateCurrency = exports.updateStatBlock = exports.setCurrency = exports.currency = exports.statBlock = void 0;
const statBlock = {
    strength: {
        type: Number,
        default: 10,
    },
    dexterity: {
        type: Number,
        default: 10,
    },
    constitution: {
        type: Number,
        default: 10,
    },
    intelligence: {
        type: Number,
        default: 10,
    },
    wisdom: {
        type: Number,
        default: 10,
    },
    charisma: {
        type: Number,
        default: 10,
    }
};
exports.statBlock = statBlock;
const currency = {
    copper: {
        type: Number,
        default: 0,
    },
    silver: {
        type: Number,
        default: 0,
    },
    gold: {
        type: Number,
        default: 0,
    },
    electrum: {
        type: Number,
        default: 0,
    },
    platinum: {
        type: Number,
        default: 0,
    }
};
exports.currency = currency;
const updateStatBlock = (statBlock, stat, amount) => {
    if (statBlock.hasOwnProperty(stat)) {
        statBlock[stat] += amount;
    }
    else {
        throw new Error(`Stat ${stat} does not exist in stat block`);
    }
};
exports.updateStatBlock = updateStatBlock;
const setStatBlock = (statBlock, newStats) => {
    for (const stat in newStats) {
        if (statBlock.hasOwnProperty(stat)) {
            statBlock[stat] = newStats[stat];
        }
        else {
            throw new Error(`Stat ${stat} does not exist in stat block`);
        }
    }
};
exports.setStatBlock = setStatBlock;
const updateCurrency = (currency, type, amount) => {
    if (currency.hasOwnProperty(type)) {
        currency[type] += amount;
    }
    else {
        throw new Error(`Currency type ${type} does not exist in currency`);
    }
};
exports.updateCurrency = updateCurrency;
const setCurrency = (currency, newCurrency) => {
    for (const type in newCurrency) {
        if (currency.hasOwnProperty(type)) {
            currency[type] = newCurrency[type];
        }
        else {
            throw new Error(`Currency type ${type} does not exist in currency`);
        }
    }
};
exports.setCurrency = setCurrency;
const addStatBlock = (statBlock, addedStats) => {
    for (const stat in addedStats) {
        if (statBlock.hasOwnProperty(stat)) {
            statBlock[stat] += addedStats[stat];
        }
        else {
            throw new Error(`Stat ${stat} does not exist in stat block`);
        }
    }
};
exports.addStatBlock = addStatBlock;
const addStatBlockNewBlock = (statBlock, addedStats) => {
    const newStatBlock = Object.assign({}, statBlock);
    for (const stat in addedStats) {
        if (newStatBlock.hasOwnProperty(stat)) {
            newStatBlock[stat] += addedStats[stat];
        }
        else {
            throw new Error(`Stat ${stat} does not exist in stat block`);
        }
    }
    return newStatBlock;
};
exports.addStatBlockNewBlock = addStatBlockNewBlock;
