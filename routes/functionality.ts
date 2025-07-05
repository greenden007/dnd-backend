import express, { Router, Request, Response, NextFunction } from 'express';
import auth from '../middleware/auth';
import Character from '../models/Character';
import Campaign from '../models/Campaign';
import Class from '../models/Class';
import Feature from '../models/Features';
import { ItemModel as Item } from '../models/Item';
import Race from '../models/Race';
import Spell from '../models/Spell';
import Subclass from '../models/Subclass';
import User, { User as UserType } from '../models/User';
import { catchAsync } from '../utils/errorHandler';
import { validateObjectId } from '../middleware/validateObjectId';
import 'dotenv/config';

const router = Router();

// MongoDB ObjectId pattern for validation
const objectIdPattern = /^[0-9a-fA-F]{24}$/;

// Helper function to validate MongoDB ObjectId
function isValidObjectId(id: string): boolean {
  return objectIdPattern.test(id);
}
/**
 * Middleware to check if the user is the creator/owner of a resource
 * @param modelName The mongoose model to use for finding the resource
 * @param paramName The parameter name containing the resource ID
 * @param source Where to look for the parameter ('query' or 'body')
 * @param creatorField The field name that stores the creator/owner ID (default: 'creator')
 */
function checkOwnership(modelName: string, paramName: string, source: 'query' | 'body' | 'params' = 'params', creatorField: string = 'creator') {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication error: User not found' });
    }
    let id;
    if (source === 'params') {
      id = req.params[paramName];
    } else if (source === 'query') {
      id = req.query[paramName];
    } else {
      id = req.body[paramName];
    }
    const Model = getModelByName(modelName);
    
    const resource = await Model.findById(id);
    if (!resource) {
      return res.status(404).json({ message: `${modelName} not found` });
    }
    
    // Check if the user is the creator/owner of the resource
    if (resource[creatorField] && resource[creatorField].toString() !== req.user!.id) {
      return res.status(403).json({ 
        message: `Forbidden: Only the ${creatorField === 'owner' ? 'owner' : 'creator'} can perform this action` 
      });
    }
    
    (req as any).resource = resource;
    next();
  });
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

// CREATE a new character
router.post('/character', catchAsync(auth), catchAsync(async (req: Request, res: Response): Promise<void> => {
    const { name, race, classes, background } = req.body;
    const character = new Character({
        name,
        race,
        classes,
        background,
        creator: req.user!.id,
    });
    await character.save();
    await User.findByIdAndUpdate(req.user!.id, { $addToSet: { characters: character._id } });
    res.status(201).json(character);
}));

// GET all characters for the logged-in user
router.get('/characters', catchAsync(auth), catchAsync(async (req: Request, res: Response): Promise<void> => {
    const characters = await Character.find({ creator: req.user!.id });
    res.status(200).json(characters);
}));

// GET a single character by ID
router.get('/character/:id', catchAsync(auth), validateObjectId('id', 'params'), checkOwnership('Character', 'id', 'params', 'creator'), catchAsync(async (req: Request, res: Response): Promise<void> => {
    const character = (req as any).resource;
    res.status(200).json(character);
}));

// UPDATE a character by ID
router.put('/character/:id', catchAsync(auth), validateObjectId('id', 'params'), checkOwnership('Character', 'id', 'params', 'creator'), catchAsync(async (req: Request, res: Response): Promise<void> => {
    const updatedCharacter = await Character.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedCharacter) {
        res.status(404).json({ message: 'Character not found' });
        return;
    }
    res.status(200).json(updatedCharacter);
}));

// DELETE a character by ID
router.delete('/character/:id', catchAsync(auth), validateObjectId('id', 'params'), checkOwnership('Character', 'id', 'params', 'creator'), catchAsync(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const character = (req as any).resource;

    await Character.findByIdAndDelete(id);
    await User.findByIdAndUpdate(character.creator, { $pull: { characters: id } });

    res.status(200).json({ message: 'Character deleted successfully' });
}));

//-----------------------------------------------------------------------------
// Feature Routes
//-----------------------------------------------------------------------------

// CREATE a new feature
router.post('/feature', catchAsync(auth), catchAsync(async (req: Request, res: Response) => {
    const featureData = req.body;
    featureData.creator = req.user!.id; // Set the creator to the current user
    const newFeature = await Feature.create(featureData);
    res.status(201).json(newFeature);
}));

// GET a single feature by ID
router.get('/feature/:id', catchAsync(auth), validateObjectId('id', 'params'), catchAsync(async (req: Request, res: Response) => {
    const feature = await Feature.findById(req.params.id);
    if (!feature) {
        res.status(404).json({ message: 'Feature not found' });
        return;
    }
    res.status(200).json(feature);
}));

// UPDATE a feature by ID
router.put('/feature/:id', catchAsync(auth), validateObjectId('id', 'params'), checkOwnership('Feature', 'id'), catchAsync(async (req: Request, res: Response) => {
    const updatedFeature = await Feature.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedFeature) {
        res.status(404).json({ message: 'Feature not found' });
        return;
    }
    res.status(200).json(updatedFeature);
}));

// DELETE a feature by ID
router.delete('/feature/:id', catchAsync(auth), validateObjectId('id', 'params'), checkOwnership('Feature', 'id'), catchAsync(async (req: Request, res: Response) => {
    const feature = await Feature.findByIdAndDelete(req.params.id);
    if (!feature) {
        res.status(404).json({ message: 'Feature not found' });
        return;
    }
    res.status(200).json({ message: 'Feature deleted successfully' });
}));

//-----------------------------------------------------------------------------
// Class Routes
//-----------------------------------------------------------------------------

// CREATE a new class
router.post('/class', catchAsync(auth), catchAsync(async (req: Request, res: Response) => {
    const classData = req.body;
    classData.creator = req.user!.id;
    const newClass = await Class.create(classData);
    res.status(201).json(newClass);
}));

// GET a single class by ID
router.get('/class/:id', catchAsync(auth), validateObjectId('id', 'params'), catchAsync(async (req: Request, res: Response) => {
    const classInfo = await Class.findById(req.params.id);
    if (!classInfo) {
        res.status(404).json({ message: 'Class not found' });
        return;
    }
    res.status(200).json(classInfo);
}));

// UPDATE a class by ID
router.put('/class/:id', catchAsync(auth), validateObjectId('id', 'params'), checkOwnership('Class', 'id'), catchAsync(async (req: Request, res: Response) => {
    const updatedClass = await Class.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedClass) {
        res.status(404).json({ message: 'Class not found' });
        return;
    }
    res.status(200).json(updatedClass);
}));

// DELETE a class by ID
router.delete('/class/:id', catchAsync(auth), validateObjectId('id', 'params'), checkOwnership('Class', 'id'), catchAsync(async (req: Request, res: Response) => {
    const deletedClass = await Class.findByIdAndDelete(req.params.id);
    if (!deletedClass) {
        res.status(404).json({ message: 'Class not found' });
        return;
    }
    res.status(200).json({ message: 'Class deleted successfully' });
}));

//-----------------------------------------------------------------------------
// Spell Routes
//-----------------------------------------------------------------------------

// CREATE a new spell
router.post('/spell', catchAsync(auth), catchAsync(async (req: Request, res: Response) => {
    const spellData = req.body;
    spellData.creator = req.user!.id;
    const newSpell = await Spell.create(spellData);
    res.status(201).json(newSpell);
}));

// GET a single spell by ID
router.get('/spell/:id', catchAsync(auth), validateObjectId('id', 'params'), catchAsync(async (req: Request, res: Response) => {
    const spellInfo = await Spell.findById(req.params.id);
    if (!spellInfo) {
        res.status(404).json({ message: 'Spell not found' });
        return;
    }
    res.status(200).json(spellInfo);
}));

// UPDATE a spell by ID
router.put('/spell/:id', catchAsync(auth), validateObjectId('id', 'params'), checkOwnership('Spell', 'id'), catchAsync(async (req: Request, res: Response) => {
    const updatedSpell = await Spell.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedSpell) {
        res.status(404).json({ message: 'Spell not found' });
        return;
    }
    res.status(200).json(updatedSpell);
}));

// DELETE a spell by ID
router.delete('/spell/:id', catchAsync(auth), validateObjectId('id', 'params'), checkOwnership('Spell', 'id'), catchAsync(async (req: Request, res: Response) => {
    const deletedSpell = await Spell.findByIdAndDelete(req.params.id);
    if (!deletedSpell) {
        res.status(404).json({ message: 'Spell not found' });
        return;
    }
    res.status(200).json({ message: 'Spell deleted successfully' });
}));

//-----------------------------------------------------------------------------
// Campaign Routes
//-----------------------------------------------------------------------------

// CREATE a new campaign
router.post('/campaign', catchAsync(auth), catchAsync(async (req: Request, res: Response) => {
    const campaignData = req.body;
    campaignData.owner = req.user!.id;
    const newCampaign = await Campaign.create(campaignData);
    await User.findByIdAndUpdate(req.user!.id, { $push: { campaigns: newCampaign._id } });
    res.status(201).json(newCampaign);
}));

// GET user's campaigns
router.get('/my-campaigns', catchAsync(auth), catchAsync(async (req: Request, res: Response) => {
    const userWithCampaigns = await User.findById(req.user!.id).populate('campaigns');
    if (!userWithCampaigns) {
        res.status(404).json({ message: 'User not found' });
        return;
    }
    res.status(200).json(userWithCampaigns.campaigns);
}));

// GET a campaign by ID
router.get('/campaign/:id', catchAsync(auth), validateObjectId('id', 'params'), catchAsync(async (req: Request, res: Response) => {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
        res.status(404).json({ message: 'Campaign not found' });
        return;
    }
    // Ensure user is the owner or a player
    const isPlayer = campaign.players.some(p => p.equals(req.user!.id));
    if (!campaign.owner!.equals(req.user!.id) && !isPlayer) {
        res.status(403).json({ message: 'Forbidden' });
        return;
    }
    res.status(200).json(campaign);
}));

// UPDATE a campaign by ID
router.put('/campaign/:id', catchAsync(auth), validateObjectId('id', 'params'), checkOwnership('Campaign', 'id'), catchAsync(async (req: Request, res: Response) => {
    const updatedCampaign = await Campaign.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedCampaign) {
        res.status(404).json({ message: 'Campaign not found' });
        return;
    }
    res.status(200).json(updatedCampaign);
}));

// DELETE a campaign by ID
router.delete('/campaign/:id', catchAsync(auth), validateObjectId('id', 'params'), checkOwnership('Campaign', 'id'), catchAsync(async (req: Request, res: Response) => {
    const campaign = req.resource; // Fetched by checkOwnership middleware

    // Remove campaign reference from all characters within it
    if (campaign.characters && campaign.characters.length > 0) {
        await Character.updateMany({ _id: { $in: campaign.characters } }, { $set: { campaign: null } });
    }

    // Remove campaign reference from all users (owner and players)
    await User.updateMany({ campaigns: campaign._id }, { $pull: { campaigns: campaign._id } });

    await Campaign.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Campaign deleted successfully' });
}));

// Create a new item
router.post('/item', catchAsync(auth), catchAsync(async (req: Request, res: Response) => {
    const itemData = req.body;
    itemData.owner = req.user!.id;
    const newItem = await Item.create(itemData);
    res.status(201).json(newItem);
}));

// GET an item by ID
router.get('/item/:id', catchAsync(auth), validateObjectId('id', 'params'), catchAsync(async (req: Request, res: Response) => {
    const item = await Item.findById(req.params.id);
    if (!item) {
        res.status(404).json({ message: 'Item not found' });
        return;
    }
    res.status(200).json(item);
}));

// UPDATE an item by ID
router.put('/item/:id', catchAsync(auth), validateObjectId('id', 'params'), checkOwnership('Item', 'id'), catchAsync(async (req: Request, res: Response) => {
    const updatedItem = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedItem) {
        res.status(404).json({ message: 'Item not found' });
        return;
    }
    res.status(200).json(updatedItem);
}));

// DELETE an item by ID
router.delete('/item/:id', catchAsync(auth), validateObjectId('id', 'params'), checkOwnership('Item', 'id'), catchAsync(async (req: Request, res: Response) => {
    const deletedItem = await Item.findByIdAndDelete(req.params.id);
    if (!deletedItem) {
        res.status(404).json({ message: 'Item not found' });
        return;
    }
    res.status(200).json({ message: 'Item deleted successfully' });
}));

//-----------------------------------------------------------------------------
// Race Routes
//-----------------------------------------------------------------------------

// CREATE a new race
router.post('/race', catchAsync(auth), catchAsync(async (req: Request, res: Response) => {
    const raceData = req.body;
    raceData.owner = req.user!.id;
    const newRace = await Race.create(raceData);
    await User.findByIdAndUpdate(req.user!.id, { $push: { races: newRace._id } });
    res.status(201).json(newRace);
}));

// GET a race by ID
router.get('/race/:id', catchAsync(auth), validateObjectId('id', 'params'), catchAsync(async (req: Request, res: Response) => {
    const race = await Race.findById(req.params.id);
    if (!race) {
        res.status(404).json({ message: 'Race not found' });
        return;
    }
    res.status(200).json(race);
}));

// UPDATE a race by ID
router.put('/race/:id', catchAsync(auth), validateObjectId('id', 'params'), checkOwnership('Race', 'id'), catchAsync(async (req: Request, res: Response) => {
    const updatedRace = await Race.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedRace) {
        res.status(404).json({ message: 'Race not found' });
        return;
    }
    res.status(200).json(updatedRace);
}));

// DELETE a race by ID
router.delete('/race/:id', catchAsync(auth), validateObjectId('id', 'params'), checkOwnership('Race', 'id'), catchAsync(async (req: Request, res: Response) => {
    const deletedRace = await Race.findByIdAndDelete(req.params.id);
    if (!deletedRace) {
        res.status(404).json({ message: 'Race not found' });
        return;
    }
    // Also remove the race from any user who might have it
    await User.updateMany({ races: req.params.id }, { $pull: { races: req.params.id } });
    res.status(200).json({ message: 'Race deleted successfully' });
}));

// ADD a character to a campaign
router.post('/campaign/:id/characters', catchAsync(auth), 
    validateObjectId('id', 'params'), 
    validateObjectId('characterId', 'body'), 
    checkOwnership('Campaign', 'id'), 
    catchAsync(async (req: Request, res: Response) => {
        const { id: campaignId } = req.params;
        const { characterId } = req.body;

        const character = await Character.findById(characterId);
        if (!character || !character.owner) {
            res.status(404).json({ message: 'Character or character owner not found' });
            return;
        }

        // Use $addToSet to avoid duplicates
        await Campaign.findByIdAndUpdate(campaignId, { 
            $addToSet: { characters: characterId, players: character.owner }
        });
        await Character.findByIdAndUpdate(characterId, { campaign: campaignId });
        await User.findByIdAndUpdate(character.owner, { $addToSet: { campaigns: campaignId } });

        res.status(200).json({ message: 'Character added to campaign successfully' });
    })
);

// REMOVE a character from a campaign
router.delete('/campaign/:id/characters/:characterId', catchAsync(auth), 
    validateObjectId('id', 'params'), 
    validateObjectId('characterId', 'params'), 
    checkOwnership('Campaign', 'id'), 
    catchAsync(async (req: Request, res: Response) => {
        const { id: campaignId, characterId } = req.params;

        const character = await Character.findById(characterId);
        if (!character || !character.owner) {
            res.status(404).json({ message: 'Character or character owner not found' });
            return;
        }

        // Pull character from campaign's character list
        await Campaign.findByIdAndUpdate(campaignId, { $pull: { characters: characterId } });

        // Unset campaign on the character
        await Character.findByIdAndUpdate(characterId, { $set: { campaign: null } });

        // Check if the owner has any other characters in this campaign
        const otherCharsCount = await Character.countDocuments({ owner: character.owner, campaign: campaignId });

        // If they have no other characters in this campaign, remove them as a player
        if (otherCharsCount === 0) {
            await Campaign.findByIdAndUpdate(campaignId, { $pull: { players: character.owner } });
            // Also remove the campaign from the user's list
            await User.findByIdAndUpdate(character.owner, { $pull: { campaigns: campaignId } });
        }

        res.status(200).json({ message: 'Character removed from campaign successfully' });
    })
);

//-----------------------------------------------------------------------------
// Subclass Routes
//-----------------------------------------------------------------------------

// CREATE a new subclass
router.post('/subclass', catchAsync(auth), catchAsync(async (req: Request, res: Response) => {
    const subclassData = req.body;
    subclassData.owner = req.user!.id;
    const newSubclass = await Subclass.create(subclassData);

    // Add subclass to the user's list of subclasses
    await User.findByIdAndUpdate(req.user!.id, { $push: { subclasses: newSubclass._id } });

    // Add subclass to the corresponding class's list of subclasses
    if (newSubclass.classId) {
        await Class.findByIdAndUpdate(newSubclass.classId, { $push: { subclasses: newSubclass._id } });
    }

    res.status(201).json(newSubclass);
}));

// GET a subclass by ID
router.get('/subclass/:id', catchAsync(auth), validateObjectId('id', 'params'), catchAsync(async (req: Request, res: Response) => {
    const subclass = await Subclass.findById(req.params.id);
    if (!subclass) {
        res.status(404).json({ message: 'Subclass not found' });
        return;
    }
    res.status(200).json(subclass);
}));

// UPDATE a subclass by ID
router.put('/subclass/:id', catchAsync(auth), validateObjectId('id', 'params'), checkOwnership('Subclass', 'id'), catchAsync(async (req: Request, res: Response) => {
    const updatedSubclass = await Subclass.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedSubclass) {
        res.status(404).json({ message: 'Subclass not found' });
        return;
    }
    res.status(200).json(updatedSubclass);
}));

// DELETE a subclass by ID
router.delete('/subclass/:id', catchAsync(auth), validateObjectId('id', 'params'), checkOwnership('Subclass', 'id'), catchAsync(async (req: Request, res: Response) => {
    const subclassId = req.params.id;
    const deletedSubclass = await Subclass.findByIdAndDelete(subclassId);

    if (!deletedSubclass) {
        res.status(404).json({ message: 'Subclass not found' });
        return;
    }

    // Remove the subclass from the corresponding class's list of subclasses
    if (deletedSubclass.classId) {
        await Class.findByIdAndUpdate(deletedSubclass.classId, { $pull: { subclasses: subclassId } });
    }

    // Remove the subclass from the user's list of subclasses
    await User.findByIdAndUpdate(deletedSubclass.owner, { $pull: { subclasses: subclassId } });

    res.status(200).json({ message: 'Subclass deleted successfully' });
}));

export default router;
