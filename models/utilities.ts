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
}

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
}

const updateStatBlock = (statBlock: any, stat: string, amount: number) => {
    if (statBlock.hasOwnProperty(stat)) {
        statBlock[stat] += amount;
    } else {
        throw new Error(`Stat ${stat} does not exist in stat block`);
    }
}

const setStatBlock = (statBlock: any, newStats: any) => {
    for (const stat in newStats) {
        if (statBlock.hasOwnProperty(stat)) {
            statBlock[stat] = newStats[stat];
        } else {
            throw new Error(`Stat ${stat} does not exist in stat block`);
        }
    }
}

const updateCurrency = (currency: any, type: string, amount: number) => {
    if (currency.hasOwnProperty(type)) {
        currency[type] += amount;
    } else {
        throw new Error(`Currency type ${type} does not exist in currency`);
    }
}

const setCurrency = (currency: any, newCurrency: any) => {
    for (const type in newCurrency) {
        if (currency.hasOwnProperty(type)) {
            currency[type] = newCurrency[type];
        } else {
            throw new Error(`Currency type ${type} does not exist in currency`);
        }
    }
}

const addStatBlock = (statBlock: any, addedStats: any) => {
    for (const stat in addedStats) {
        if (statBlock.hasOwnProperty(stat)) {
            statBlock[stat] += addedStats[stat];
        } else {
            throw new Error(`Stat ${stat} does not exist in stat block`);
        }
    }
}

const addStatBlockNewBlock = (statBlock: any, addedStats: any) => {
    const newStatBlock = { ...statBlock };
    for (const stat in addedStats) {
        if (newStatBlock.hasOwnProperty(stat)) {
            newStatBlock[stat] += addedStats[stat];
        } else {
            throw new Error(`Stat ${stat} does not exist in stat block`);
        }
    }
    return newStatBlock;
}

module.exports = {statBlock, currency, setCurrency, updateStatBlock, updateCurrency, setStatBlock, addStatBlock, addStatBlockNewBlock};