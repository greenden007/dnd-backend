"use strict";
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
const mongoose_1 = __importDefault(require("mongoose"));
const subclassSchema = new mongoose_1.default.Schema({
    subclassName: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    classId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Class',
        required: true,
    },
    features: [{
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'Feature',
        }],
    creator: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
    }
});
subclassSchema.statics.create = function (subclassData) {
    return __awaiter(this, void 0, void 0, function* () {
        const subclass = new this(subclassData);
        yield subclass.save();
        return subclass;
    });
};
subclassSchema.statics.updateSubclass = function (subclassId, updatedData) {
    return __awaiter(this, void 0, void 0, function* () {
        const subclass = yield this.findById(subclassId);
        if (!subclass) {
            throw new Error('Subclass not found');
        }
        for (const key in updatedData) {
            if (key !== '_id' && key !== '__v') {
                subclass[key] = updatedData[key];
            }
        }
        yield subclass.save();
        return subclass;
    });
};
subclassSchema.statics.deleteSubclass = function (subclassId) {
    return __awaiter(this, void 0, void 0, function* () {
        const subclass = yield this.findById(subclassId);
        if (!subclass) {
            throw new Error('Subclass not found');
        }
        yield subclass.deleteOne();
    });
};
const SubclassModel = mongoose_1.default.model('SubClass', subclassSchema);
exports.default = SubclassModel;
