"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const reportShema = new mongoose_1.Schema({
    taskerId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    details: { type: String, required: true },
});
const Report = (0, mongoose_1.model)('Report', reportShema);
exports.default = Report;
