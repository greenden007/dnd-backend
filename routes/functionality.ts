import * as express from 'express';
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
import User from '../models/User';
require('dotenv').config();

// MongoDB ObjectId pattern for validation
const objectIdPattern = /^[0-9a-fA-F]{24}$/;

// Helper function to validate MongoDB ObjectId
function isValidObjectId(id: string): boolean {
  return objectIdPattern.test(id);
}

/**
 * Middleware to validate that a MongoDB ObjectId parameter exists and is valid
 * @param paramName The name of the parameter to validate (from req.query or req.body)
 * @param source Where to look for the parameter ('query' or 'body')
 */
function validateObjectId(paramName: string, source: 'query' | 'body' = 'query') {
  return (req: any, res: any, next: any) => {
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
function checkOwnership(modelName: string, paramName: string, source: 'query' | 'body' = 'query', creatorField: string = 'creator') {
  return async (req: any, res: any, next: any) => {
    try {
      const id = source === 'query' ? req.query[paramName] : req.body[paramName];
      const Model = getModelByName(modelName);
      
      const resource = await Model.findById(id);
      if (!resource) {
        return res.status(404).json({ message: `${modelName} not found` });
      }
      
      // Check if the user is the creator/owner of the resource
      if (resource[creatorField] && resource[creatorField].toString() !== req.user.id) {
        return res.status(403).json({ 
          message: `Forbidden: Only the ${creatorField === 'owner' ? 'owner' : 'creator'} can perform this action` 
        });
      }
      
      req.resource = resource;
      next();
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  };
}

/**
 * Helper function to get the model by name
 * @param modelName The name of the model
 */
function getModelByName(modelName: string): any {
  const models: {[key: string]: any} = {
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
function asyncHandler(handler: Function) {
  return async (req: any, res: any, next: any) => {
    try {
      await handler(req, res, next);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  };
}

// Get all characters for the current user
router.get('/characters', auth, asyncHandler(async (req: any, res: any) => {
    const characters = await User.findById(req.user.id).populate('characters');
    if (!characters) {
        return res.status(404).json({ message: 'No characters found' });
    }
    res.status(200).json(characters);
}));

// Create a new character
router.post('/create-character', auth, asyncHandler(async (req: any, res: any) => {
    const { character } = req.body;
    if (!character) {
        return res.status(400).json({ message: 'Character data is required' });
    }
    character.owner = req.user.id; // Set the owner to the current user
    const newCharacter = await Character.create(character);
    await User.updateOne({ _id: req.user.id }, { $push: { characters: newCharacter._id } });
    res.status(201).json(newCharacter);
}));

// Get character info by ID
router.get('/character-info', auth, validateObjectId('characterId', 'query'), asyncHandler(async (req: any, res: any) => {
    const { characterId } = req.query;
    const character = await Character.findById(characterId);
    
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
        const campaign = await Campaign.findById(character.campaign);
        if (campaign) {
            isCampaignMember = campaign.players.includes(req.user.id) || campaign.owner.toString() === req.user.id;
        }
    }
    
    if (!isOwner && !isCampaignMember) {
        return res.status(403).json({ message: 'Forbidden' });
    }
    
    return res.status(200).json(character);
}));

// Update character
router.put('/update-character', auth, 
    validateObjectId('characterId', 'body'),
    checkOwnership('Character', 'characterId', 'body', 'owner'),
    asyncHandler(async (req: any, res: any) => {
        const { characterId, updatedCharacter } = req.body;
        
        if (!updatedCharacter) {
            return res.status(400).json({ message: 'Updated character data is required' });
        }
        
        await Character.updateCharacter(characterId, updatedCharacter);
        res.status(200).json({ message: 'Character updated successfully' });
    })
);

// Delete character
router.delete('/delete-character', auth, 
    validateObjectId('characterId', 'body'),
    checkOwnership('Character', 'characterId', 'body', 'owner'),
    asyncHandler(async (req: any, res: any) => {
        const { characterId } = req.body;
        await Character.deleteCharacter(characterId);
        res.status(200).json({ message: 'Character deleted successfully' });
    })
);

// Create a new feature
router.post('/create-feature', auth, asyncHandler(async (req: any, res: any) => {
    const { feature } = req.body;
    if (!feature) {
        return res.status(400).json({ message: 'Feature data is required' });
    }
    feature.creator = req.user.id; // Set the creator to the current user
    const newFeature = await Feature.create(feature);
    res.status(201).json(newFeature);
}));

// Get feature info by ID
router.get('/feature-info', auth, 
    validateObjectId('featureId', 'query'),
    asyncHandler(async (req: any, res: any) => {
        const { featureId } = req.query;
        const feature = await Feature.findById(featureId);
        
        if (!feature) {
            return res.status(404).json({ message: 'Feature not found' });
        }
        
        return res.status(200).json(feature);
    })
);

// Update feature
router.put('/feature-update', auth, 
    validateObjectId('featureId', 'body'),
    checkOwnership('Feature', 'featureId', 'body'),
    asyncHandler(async (req: any, res: any) => {
        const { featureId, updatedFeature } = req.body;
        
        if (!updatedFeature) {
            return res.status(400).json({ message: 'Updated feature data is required' });
        }
        
        await Feature.updateFeature(featureId, updatedFeature);
        res.status(200).json({ message: 'Feature updated successfully' });
    })
);

// Delete feature
router.delete('/feature-delete', auth, 
    validateObjectId('featureId', 'body'),
    checkOwnership('Feature', 'featureId', 'body'),
    asyncHandler(async (req: any, res: any) => {
        const { featureId } = req.body;
        await Feature.deleteFeaturesSchema(featureId);
        res.status(200).json({ message: 'Feature deleted successfully' });
    })
);

// Create a new class
router.post('/create-class', auth, asyncHandler(async (req: any, res: any) => {
    const { classData } = req.body;
    if (!classData) {
        return res.status(400).json({ message: 'Class data is required' });
    }
    classData.creator = req.user.id; // Set the creator to the current user
    const newClass = await Class.create(classData);
    res.status(201).json(newClass);
}));

// Get class info by ID
router.get('/class-info', auth, 
    validateObjectId('classId', 'query'),
    asyncHandler(async (req: any, res: any) => {
        const { classId } = req.query;
        const classInfo = await Class.findById(classId);
        
        if (!classInfo) {
            return res.status(404).json({ message: 'Class not found' });
        }
        
        return res.status(200).json(classInfo);
    })
);

// Update class
router.put('/class-update', auth, 
    validateObjectId('classId', 'body'),
    checkOwnership('Class', 'classId', 'body'),
    asyncHandler(async (req: any, res: any) => {
        const { classId, updatedClass } = req.body;
        
        if (!updatedClass) {
            return res.status(400).json({ message: 'Updated class data is required' });
        }
        
        await Class.updateClass(classId, updatedClass);
        res.status(200).json({ message: 'Class updated successfully' });
    })
);

// Delete class
router.delete('/class-delete', auth, 
    validateObjectId('classId', 'body'),
    checkOwnership('Class', 'classId', 'body'),
    asyncHandler(async (req: any, res: any) => {
        const { classId } = req.body;
        await Class.deleteClass(classId);
        res.status(200).json({ message: 'Class deleted successfully' });
    })
);

// Create a new spell
router.post('/create-spell', auth, asyncHandler(async (req: any, res: any) => {
    const { spell } = req.body;
    if (!spell) {
        return res.status(400).json({ message: 'Spell data is required' });
    }
    spell.creator = req.user.id; // Set the creator to the current user
    const newSpell = await Spell.create(spell);
    res.status(201).json(newSpell);
}));

// Get spell info by ID
router.get('/spell-info', auth, 
    validateObjectId('spellId', 'query'),
    asyncHandler(async (req: any, res: any) => {
        const { spellId } = req.query;
        const spellInfo = await Spell.findById(spellId);
        
        if (!spellInfo) {
            return res.status(404).json({ message: 'Spell not found' });
        }
        
        return res.status(200).json(spellInfo);
    })
);

// Update spell
router.put('/spell-update', auth, 
    validateObjectId('spellId', 'body'),
    checkOwnership('Spell', 'spellId', 'body'),
    asyncHandler(async (req: any, res: any) => {
        const { spellId, updatedSpell } = req.body;
        
        if (!updatedSpell) {
            return res.status(400).json({ message: 'Updated spell data is required' });
        }
        
        await Spell.updateSpell(spellId, updatedSpell);
        res.status(200).json({ message: 'Spell updated successfully' });
    })
);

// Delete spell
router.delete('/spell-delete', auth, 
    validateObjectId('spellId', 'body'),
    checkOwnership('Spell', 'spellId', 'body'),
    asyncHandler(async (req: any, res: any) => {
        const { spellId } = req.body;
        await Spell.deleteSpell(spellId);
        res.status(200).json({ message: 'Spell deleted successfully' });
    })
);

// Create a new campaign
router.post('/create-campaign', auth, asyncHandler(async (req: any, res: any) => {
    const { campaign } = req.body;
    if (!campaign) {
        return res.status(400).json({ message: 'Campaign data is required' });
    }
    campaign.owner = req.user.id; // Set the owner to the current user
    const newCampaign = await Campaign.create(campaign);
    await User.updateOne({ _id: req.user.id }, { $push: { campaigns: newCampaign._id } });
    res.status(201).json(newCampaign);
}));

// Get user's campaigns
router.get('/my-campaigns', auth, asyncHandler(async (req: any, res: any) => {
    const campaigns = await User.findById(req.user.id).populate('campaigns');
    if (!campaigns) {
        return res.status(404).json({ message: 'No campaigns found' });
    }
    res.status(200).json(campaigns);
}));

// Get campaign info by ID with access control
router.get('/campaign-info', auth, validateObjectId('campaignId', 'query'), asyncHandler(async (req: any, res: any) => {
    const { campaignId } = req.query;
    const campaignInfo = await Campaign.findById(campaignId);
    
    if (!campaignInfo) {
        return res.status(404).json({ message: 'Campaign not found' });
    }
    
    // Check if user is the owner or a player in the campaign
    if (!campaignInfo.players.includes(req.user.id) && campaignInfo.owner.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Forbidden'});
    }
    
    return res.status(200).json(campaignInfo);
}));

// Delete campaign with owner check
router.delete('/campaign-delete', auth, 
    validateObjectId('campaignId', 'body'),
    checkOwnership('Campaign', 'campaignId', 'body', 'owner'),
    asyncHandler(async (req: any, res: any) => {
        const { campaignId } = req.body;
        const campaign = req.resource; // Already fetched by checkOwnership middleware
        
        // Update all characters to remove campaign reference
        for (const characterId of campaign.characters) {
            const character = await Character.findById(characterId);
            if (character) {
                const copyCharacter = JSON.parse(JSON.stringify(character));
                copyCharacter.campaign = null;
                await Character.updateCharacter(characterId, copyCharacter);
            }
        }
        
        await Campaign.deleteCampaign(campaignId);
        res.status(200).json({ message: 'Campaign deleted successfully' });
    })
);

// Create a new item
router.post('/create-item', auth, asyncHandler(async (req: any, res: any) => {
    const { item } = req.body;
    if (!item) {
        return res.status(400).json({ message: 'Item data is required' });
    }
    item.creator = req.user.id; // Set the creator to the current user
    const newItem = await Item.create(item);
    res.status(201).json(newItem);
}));

// Get item info by ID
router.get('/item-info', auth, 
    validateObjectId('itemId', 'query'),
    asyncHandler(async (req: any, res: any) => {
        const { itemId } = req.query;
        const itemInfo = await Item.findById(itemId);
        
        if (!itemInfo) {
            return res.status(404).json({ message: 'Item not found' });
        }
        
        return res.status(200).json(itemInfo);
    })
);

// Update item
router.put('/item-update', auth, 
    validateObjectId('itemId', 'body'),
    checkOwnership('Item', 'itemId', 'body'),
    asyncHandler(async (req: any, res: any) => {
        const { itemId, updatedItem } = req.body;
        
        if (!updatedItem) {
            return res.status(400).json({ message: 'Updated item data is required' });
        }
        
        await Item.updateItem(itemId, updatedItem);
        res.status(200).json({ message: 'Item updated successfully' });
    })
);

// Delete item
router.delete('/item-delete', auth, 
    validateObjectId('itemId', 'body'),
    checkOwnership('Item', 'itemId', 'body'),
    asyncHandler(async (req: any, res: any) => {
        const { itemId } = req.body;
        await Item.deleteItem(itemId);
        res.status(200).json({ message: 'Item deleted successfully' });
    })
);

// Create a new race
router.post('/create-race', auth, asyncHandler(async (req: any, res: any) => {
    const { race } = req.body;
    if (!race) {
        return res.status(400).json({ message: 'Race details not complete' });
    }
    race.creator = req.user.id;
    const newRace = await Race.create(race);
    res.status(201).json(newRace);
}));

// Get race info by ID
router.get('/race-info', auth, 
    validateObjectId('raceId', 'query'),
    asyncHandler(async (req: any, res: any) => {
        const { raceId } = req.query;
        const raceInfo = await Race.findById(raceId);
        
        if (!raceInfo) {
            return res.status(404).json({ message: 'Race not found' });
        }
        
        return res.status(200).json(raceInfo);
    })
);

// Update race
router.put('/race-update', auth, 
    validateObjectId('raceId', 'body'),
    checkOwnership('Race', 'raceId', 'body'),
    asyncHandler(async (req: any, res: any) => {
        const { raceId, updatedRace } = req.body;
        
        if (!updatedRace) {
            return res.status(400).json({ message: 'Updated race data is required' });
        }
        
        await Race.updateRace(raceId, updatedRace);
        return res.status(200).json({ message: 'Race updated successfully' });
    })
);

// Delete race
router.delete('/race-delete', auth, 
    validateObjectId('raceId', 'body'),
    checkOwnership('Race', 'raceId', 'body'),
    asyncHandler(async (req: any, res: any) => {
        const { raceId } = req.body;
        await Race.deleteRace(raceId);
        return res.status(200).json({ message: 'Race deleted successfully' });
    })
);

// Middleware to validate character and campaign IDs
function validateCharacterAndCampaign(req: any, res: any, next: any) {
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
router.put('/add-character-to-campaign', auth, 
    validateCharacterAndCampaign,
    asyncHandler(async (req: any, res: any) => {
        const { characterId, campaignId } = req.body;
        
        const character = await Character.findById(characterId);
        const campaign = await Campaign.findById(campaignId);

        if (!character) {
            return res.status(404).json({ message: 'Character not found' });
        }
        if (!campaign) {
            return res.status(404).json({ message: 'Campaign not found' });
        }

        await Campaign.addCharacter(campaignId, characterId);
        await Character.updateCharacter(characterId, { campaign: campaignId });
        await Campaign.addPlayer(campaignId, character.owner);
        await User.updateOne({ _id: character.owner }, { $push: { campaigns: campaignId } });
        res.status(200).json({ message: 'Character added to campaign successfully' });
    })
);

// Remove character from campaign
router.put('/remove-character-from-campaign', auth, 
    validateCharacterAndCampaign,
    asyncHandler(async (req: any, res: any) => {
        const { characterId, campaignId } = req.body;
        
        const character = await Character.findById(characterId);
        const campaign = await Campaign.findById(campaignId);
        
        if (!character) {
            return res.status(404).json({ message: 'Character not found' });
        }
        if (!campaign) {
            return res.status(404).json({ message: 'Campaign not found' });
        }

        await Campaign.removeCharacter(campaignId, characterId);
        await Character.updateCharacter(characterId, { campaign: null });
        await Campaign.removePlayer(campaignId, character.owner);
        await User.updateOne({ _id: character.owner }, { $pull: { campaigns: campaignId } });
        res.status(200).json({ message: 'Character removed from campaign successfully' });
    })
);

// Create a new subclass
router.post('/create-subclass', auth, asyncHandler(async (req: any, res: any) => {
    const { subclass } = req.body;
    if (!subclass) {
        return res.status(400).json({ message: 'Subclass data is required' });
    }
    subclass.creator = req.user.id; // Set the creator to the current user
    const newSubclass = await Subclass.create(subclass);
    res.status(201).json(newSubclass);
}));

// Get subclass info by ID
router.get('/subclass-info', auth, 
    validateObjectId('subclassId', 'query'),
    asyncHandler(async (req: any, res: any) => {
        const { subclassId } = req.query;
        const subclassInfo = await Subclass.findById(subclassId);
        
        if (!subclassInfo) {
            return res.status(404).json({ message: 'Subclass not found' });
        }
        
        return res.status(200).json(subclassInfo);
    })
);

// Update subclass
router.put('/subclass-update', auth, 
    validateObjectId('subclassId', 'body'),
    checkOwnership('Subclass', 'subclassId', 'body'),
    asyncHandler(async (req: any, res: any) => {
        const { subclassId, updatedSubclass } = req.body;
        
        if (!updatedSubclass) {
            return res.status(400).json({ message: 'Updated subclass data is required' });
        }
        
        await Subclass.updateSubclass(subclassId, updatedSubclass);
        res.status(200).json({ message: 'Subclass updated successfully' });
    })
);

// Delete subclass
router.delete('/subclass-delete', auth, 
    validateObjectId('subclassId', 'body'),
    checkOwnership('Subclass', 'subclassId', 'body'),
    asyncHandler(async (req: any, res: any) => {
        const { subclassId } = req.body;
        await Subclass.deleteSubclass(subclassId);
        res.status(200).json({ message: 'Subclass deleted successfully' });
    })
);

module.exports = router;
