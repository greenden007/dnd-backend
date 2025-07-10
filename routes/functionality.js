"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = __importStar(require("express"));
const router = express.Router();
const auth = require('../middleware/auth');
const Class = require('../models/Class');
const Character = require('../models/Character');
const Campaign = require('../models/Campaign');
const Item = require('../models/Item');
const Race = require('../models/Race');
const Spell = require('../models/Spell');
const Feature = require('../models/Features');
const Subclass = require('../models/Subclass');
const User_1 = __importDefault(require("../models/User"));
require('dotenv').config();
// MongoDB ObjectId pattern for validation
const objectIdPattern = /^[0-9a-fA-F]{24}$/;
// Helper function to validate MongoDB ObjectId
function isValidObjectId(id) {
    return objectIdPattern.test(id);
}
/**
 * Middleware to validate that a MongoDB ObjectId parameter exists and is valid
 * @param paramName The name of the parameter to validate (from req.query or req.body)
 * @param source Where to look for the parameter ('query' or 'body')
 */
function validateObjectId(paramName, source = 'query') {
    return (req, res, next) => {
        const id = source === 'query' ? req.query[paramName] : req.body[paramName];
        if (!id) {
            return res.status(400).json({ message: `${paramName} is required` });
        }
        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: `Invalid ${paramName} format` });
        }
        next();
    };
}
/**
 * Middleware to check if the user is the creator/owner of a resource
 * @param modelName The mongoose model to use for finding the resource
 * @param paramName The parameter name containing the resource ID
 * @param source Where to look for the parameter ('query' or 'body')
 * @param creatorField The field name that stores the creator/owner ID (default: 'creator')
 */
function checkOwnership(modelName, paramName, source = 'query', creatorField = 'creator') {
    return (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        try {
            const id = source === 'query' ? req.query[paramName] : req.body[paramName];
            const Model = getModelByName(modelName);
            const resource = yield Model.findById(id);
            if (!resource) {
                return res.status(404).json({ message: `${modelName} not found` });
            }
            // Check if the user is the creator/owner of the resource
            if (resource[creatorField] && resource[creatorField].toString() !== req.user._id) {
                return res.status(403).json({
                    message: `Forbidden: Only the ${creatorField === 'owner' ? 'owner' : 'creator'} can perform this action`
                });
            }
            req.resource = resource;
            next();
        }
        catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error' });
        }
    });
}
/**
 * Helper function to get the model by name
 * @param modelName The name of the model
 */
function getModelByName(modelName) {
    const models = {
        'Character': Character,
        'Campaign': Campaign,
        'Class': Class,
        'Feature': Feature,
        'Item': Item,
        'Race': Race,
        'Spell': Spell,
        'Subclass': Subclass
    };
    return models[modelName];
}
/**
 * Standard error handler for async routes
 * @param handler The async route handler function
 */
function asyncHandler(handler) {
    return (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        try {
            yield handler(req, res, next);
        }
        catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error' });
        }
    });
}
// Get all characters for the current user
router.get('/characters', auth, asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const characters = yield User_1.default.findById(req.user.id).populate('characters');
    if (!characters) {
        return res.status(404).json({ message: 'No characters found' });
    }
    res.status(200).json(characters);
})));
// Create a new character
router.post('/create-character', auth, asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { character } = req.body;
    if (!character) {
        return res.status(400).json({ message: 'Character data is required' });
    }
    character.owner = req.user.id; // Set the owner to the current user
    const newCharacter = yield Character.create(character);
    yield User_1.default.updateOne({ _id: req.user.id }, { $push: { characters: newCharacter._id } });
    res.status(201).json(newCharacter);
})));
// Get character info by ID
router.get('/character-info', auth, validateObjectId('characterId', 'query'), asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { characterId } = req.query;
    const character = yield Character.findById(characterId);
    if (!character) {
        return res.status(404).json({ message: 'Character not found' });
    }
    // Check if character has owner
    if (!character.owner) {
        return res.status(403).json({ message: 'Character has no owner' });
    }
    // Only allow the owner and members of the campaign to view the character
    const isOwner = character.owner.toString() === req.user.id;
    let isCampaignMember = false;
    if (character.campaign) {
        const campaign = yield Campaign.findById(character.campaign);
        if (campaign) {
            isCampaignMember = campaign.players.includes(req.user.id) || campaign.owner.toString() === req.user.id;
        }
    }
    if (!isOwner && !isCampaignMember) {
        return res.status(403).json({ message: 'Forbidden' });
    }
    return res.status(200).json(character);
})));
// Update character
router.put('/update-character', auth, validateObjectId('characterId', 'body'), checkOwnership('Character', 'characterId', 'body', 'owner'), asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { characterId, updatedCharacter } = req.body;
    if (!updatedCharacter) {
        return res.status(400).json({ message: 'Updated character data is required' });
    }
    yield Character.updateCharacter(characterId, updatedCharacter);
    res.status(200).json({ message: 'Character updated successfully' });
})));
// Delete character
router.delete('/delete-character', auth, validateObjectId('characterId', 'body'), checkOwnership('Character', 'characterId', 'body', 'owner'), asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { characterId } = req.body;
    yield Character.deleteCharacter(characterId);
    res.status(200).json({ message: 'Character deleted successfully' });
})));
// Create a new feature
router.post('/create-feature', auth, asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { feature } = req.body;
    if (!feature) {
        return res.status(400).json({ message: 'Feature data is required' });
    }
    feature.creator = req.user.id; // Set the creator to the current user
    const newFeature = yield Feature.create(feature);
    res.status(201).json(newFeature);
})));
// Get feature info by ID
router.get('/feature-info', auth, validateObjectId('featureId', 'query'), asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { featureId } = req.query;
    const feature = yield Feature.findById(featureId);
    if (!feature) {
        return res.status(404).json({ message: 'Feature not found' });
    }
    return res.status(200).json(feature);
})));
// Update feature
router.put('/feature-update', auth, validateObjectId('featureId', 'body'), checkOwnership('Feature', 'featureId', 'body'), asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { featureId, updatedFeature } = req.body;
    if (!updatedFeature) {
        return res.status(400).json({ message: 'Updated feature data is required' });
    }
    yield Feature.updateFeature(featureId, updatedFeature);
    res.status(200).json({ message: 'Feature updated successfully' });
})));
// Delete feature
router.delete('/feature-delete', auth, validateObjectId('featureId', 'body'), checkOwnership('Feature', 'featureId', 'body'), asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { featureId } = req.body;
    yield Feature.deleteFeaturesSchema(featureId);
    res.status(200).json({ message: 'Feature deleted successfully' });
})));
// Create a new class
router.post('/create-class', auth, asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { classData } = req.body;
    if (!classData) {
        return res.status(400).json({ message: 'Class data is required' });
    }
    classData.creator = req.user.id; // Set the creator to the current user
    const newClass = yield Class.create(classData);
    res.status(201).json(newClass);
})));
// Get class info by ID
router.get('/class-info', auth, validateObjectId('classId', 'query'), asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { classId } = req.query;
    const classInfo = yield Class.findById(classId);
    if (!classInfo) {
        return res.status(404).json({ message: 'Class not found' });
    }
    return res.status(200).json(classInfo);
})));
// Update class
router.put('/class-update', auth, validateObjectId('classId', 'body'), checkOwnership('Class', 'classId', 'body'), asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { classId, updatedClass } = req.body;
    if (!updatedClass) {
        return res.status(400).json({ message: 'Updated class data is required' });
    }
    yield Class.updateClass(classId, updatedClass);
    res.status(200).json({ message: 'Class updated successfully' });
})));
// Delete class
router.delete('/class-delete', auth, validateObjectId('classId', 'body'), checkOwnership('Class', 'classId', 'body'), asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { classId } = req.body;
    yield Class.deleteClass(classId);
    res.status(200).json({ message: 'Class deleted successfully' });
})));
// Create a new spell
router.post('/create-spell', auth, asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { spell } = req.body;
    if (!spell) {
        return res.status(400).json({ message: 'Spell data is required' });
    }
    spell.creator = req.user.id; // Set the creator to the current user
    const newSpell = yield Spell.create(spell);
    res.status(201).json(newSpell);
})));
// Get spell info by ID
router.get('/spell-info', auth, validateObjectId('spellId', 'query'), asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { spellId } = req.query;
    const spellInfo = yield Spell.findById(spellId);
    if (!spellInfo) {
        return res.status(404).json({ message: 'Spell not found' });
    }
    return res.status(200).json(spellInfo);
})));
// Update spell
router.put('/spell-update', auth, validateObjectId('spellId', 'body'), checkOwnership('Spell', 'spellId', 'body'), asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { spellId, updatedSpell } = req.body;
    if (!updatedSpell) {
        return res.status(400).json({ message: 'Updated spell data is required' });
    }
    yield Spell.updateSpell(spellId, updatedSpell);
    res.status(200).json({ message: 'Spell updated successfully' });
})));
// Delete spell
router.delete('/spell-delete', auth, validateObjectId('spellId', 'body'), checkOwnership('Spell', 'spellId', 'body'), asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { spellId } = req.body;
    yield Spell.deleteSpell(spellId);
    res.status(200).json({ message: 'Spell deleted successfully' });
})));
// Create a new campaign
router.post('/create-campaign', auth, asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { campaign } = req.body;
    if (!campaign) {
        return res.status(400).json({ message: 'Campaign data is required' });
    }
    campaign.owner = req.user.id; // Set the owner to the current user
    const newCampaign = yield Campaign.create(campaign);
    yield User_1.default.updateOne({ _id: req.user.id }, { $push: { campaigns: newCampaign._id } });
    res.status(201).json(newCampaign);
})));
// Get user's campaigns
router.get('/my-campaigns', auth, asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const campaigns = yield User_1.default.findById(req.user.id).populate('campaigns');
    if (!campaigns) {
        return res.status(404).json({ message: 'No campaigns found' });
    }
    res.status(200).json(campaigns);
})));
// Get campaign info by ID with access control
router.get('/campaign-info', auth, validateObjectId('campaignId', 'query'), asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { campaignId } = req.query;
    const campaignInfo = yield Campaign.findById(campaignId);
    if (!campaignInfo) {
        return res.status(404).json({ message: 'Campaign not found' });
    }
    // Check if user is the owner or a player in the campaign
    if (!campaignInfo.players.includes(req.user.id) && campaignInfo.owner.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Forbidden' });
    }
    return res.status(200).json(campaignInfo);
})));
// Delete campaign with owner check
router.delete('/campaign-delete', auth, validateObjectId('campaignId', 'body'), checkOwnership('Campaign', 'campaignId', 'body', 'owner'), asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { campaignId } = req.body;
    const campaign = req.resource; // Already fetched by checkOwnership middleware
    // Update all characters to remove campaign reference
    for (const characterId of campaign.characters) {
        const character = yield Character.findById(characterId);
        if (character) {
            const copyCharacter = JSON.parse(JSON.stringify(character));
            copyCharacter.campaign = null;
            yield Character.updateCharacter(characterId, copyCharacter);
        }
    }
    yield Campaign.deleteCampaign(campaignId);
    res.status(200).json({ message: 'Campaign deleted successfully' });
})));
// Create a new item
router.post('/create-item', auth, asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { item } = req.body;
    if (!item) {
        return res.status(400).json({ message: 'Item data is required' });
    }
    item.creator = req.user.id; // Set the creator to the current user
    const newItem = yield Item.create(item);
    res.status(201).json(newItem);
})));
// Get item info by ID
router.get('/item-info', auth, validateObjectId('itemId', 'query'), asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { itemId } = req.query;
    const itemInfo = yield Item.findById(itemId);
    if (!itemInfo) {
        return res.status(404).json({ message: 'Item not found' });
    }
    return res.status(200).json(itemInfo);
})));
// Update item
router.put('/item-update', auth, validateObjectId('itemId', 'body'), checkOwnership('Item', 'itemId', 'body'), asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { itemId, updatedItem } = req.body;
    if (!updatedItem) {
        return res.status(400).json({ message: 'Updated item data is required' });
    }
    yield Item.updateItem(itemId, updatedItem);
    res.status(200).json({ message: 'Item updated successfully' });
})));
// Delete item
router.delete('/item-delete', auth, validateObjectId('itemId', 'body'), checkOwnership('Item', 'itemId', 'body'), asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { itemId } = req.body;
    yield Item.deleteItem(itemId);
    res.status(200).json({ message: 'Item deleted successfully' });
})));
// Create a new race
router.post('/create-race', auth, asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { race } = req.body;
    if (!race) {
        return res.status(400).json({ message: 'Race details not complete' });
    }
    race.creator = req.user.id;
    const newRace = yield Race.create(race);
    res.status(201).json(newRace);
})));
// Get race info by ID
router.get('/race-info', auth, validateObjectId('raceId', 'query'), asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { raceId } = req.query;
    const raceInfo = yield Race.findById(raceId);
    if (!raceInfo) {
        return res.status(404).json({ message: 'Race not found' });
    }
    return res.status(200).json(raceInfo);
})));
// Update race
router.put('/race-update', auth, validateObjectId('raceId', 'body'), checkOwnership('Race', 'raceId', 'body'), asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { raceId, updatedRace } = req.body;
    if (!updatedRace) {
        return res.status(400).json({ message: 'Updated race data is required' });
    }
    yield Race.updateRace(raceId, updatedRace);
    return res.status(200).json({ message: 'Race updated successfully' });
})));
// Delete race
router.delete('/race-delete', auth, validateObjectId('raceId', 'body'), checkOwnership('Race', 'raceId', 'body'), asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { raceId } = req.body;
    yield Race.deleteRace(raceId);
    return res.status(200).json({ message: 'Race deleted successfully' });
})));
// Middleware to validate character and campaign IDs
function validateCharacterAndCampaign(req, res, next) {
    const { characterId, campaignId } = req.body;
    if (!characterId || !campaignId) {
        return res.status(400).json({ message: 'Character ID and Campaign ID are required' });
    }
    if (!isValidObjectId(characterId)) {
        return res.status(400).json({ message: 'Invalid character ID format' });
    }
    if (!isValidObjectId(campaignId)) {
        return res.status(400).json({ message: 'Invalid campaign ID format' });
    }
    next();
}
// Add character to campaign
router.put('/add-character-to-campaign', auth, validateCharacterAndCampaign, asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { characterId, campaignId } = req.body;
    const character = yield Character.findById(characterId);
    const campaign = yield Campaign.findById(campaignId);
    if (!character) {
        return res.status(404).json({ message: 'Character not found' });
    }
    if (!campaign) {
        return res.status(404).json({ message: 'Campaign not found' });
    }
    yield Campaign.addCharacter(campaignId, characterId);
    yield Character.updateCharacter(characterId, { campaign: campaignId });
    yield Campaign.addPlayer(campaignId, character.owner);
    yield User_1.default.updateOne({ _id: character.owner }, { $push: { campaigns: campaignId } });
    res.status(200).json({ message: 'Character added to campaign successfully' });
})));
// Remove character from campaign
router.put('/remove-character-from-campaign', auth, validateCharacterAndCampaign, asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { characterId, campaignId } = req.body;
    const character = yield Character.findById(characterId);
    const campaign = yield Campaign.findById(campaignId);
    if (!character) {
        return res.status(404).json({ message: 'Character not found' });
    }
    if (!campaign) {
        return res.status(404).json({ message: 'Campaign not found' });
    }
    yield Campaign.removeCharacter(campaignId, characterId);
    yield Character.updateCharacter(characterId, { campaign: null });
    yield Campaign.removePlayer(campaignId, character.owner);
    yield User_1.default.updateOne({ _id: character.owner }, { $pull: { campaigns: campaignId } });
    res.status(200).json({ message: 'Character removed from campaign successfully' });
})));
// Create a new subclass
router.post('/create-subclass', auth, asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { subclass } = req.body;
    if (!subclass) {
        return res.status(400).json({ message: 'Subclass data is required' });
    }
    subclass.creator = req.user.id; // Set the creator to the current user
    const newSubclass = yield Subclass.create(subclass);
    res.status(201).json(newSubclass);
})));
// Get subclass info by ID
router.get('/subclass-info', auth, validateObjectId('subclassId', 'query'), asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { subclassId } = req.query;
    const subclassInfo = yield Subclass.findById(subclassId);
    if (!subclassInfo) {
        return res.status(404).json({ message: 'Subclass not found' });
    }
    return res.status(200).json(subclassInfo);
})));
// Update subclass
router.put('/subclass-update', auth, validateObjectId('subclassId', 'body'), checkOwnership('Subclass', 'subclassId', 'body'), asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { subclassId, updatedSubclass } = req.body;
    if (!updatedSubclass) {
        return res.status(400).json({ message: 'Updated subclass data is required' });
    }
    yield Subclass.updateSubclass(subclassId, updatedSubclass);
    res.status(200).json({ message: 'Subclass updated successfully' });
})));
// Delete subclass
router.delete('/subclass-delete', auth, validateObjectId('subclassId', 'body'), checkOwnership('Subclass', 'subclassId', 'body'), asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { subclassId } = req.body;
    yield Subclass.deleteSubclass(subclassId);
    res.status(200).json({ message: 'Subclass deleted successfully' });
})));
module.exports = router;
