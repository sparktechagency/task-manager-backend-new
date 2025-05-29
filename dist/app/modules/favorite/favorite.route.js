"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = __importDefault(require("../../middleware/auth"));
const user_constants_1 = require("../user/user.constants");
const favorite_controller_1 = require("./favorite.controller");
const favoriteBusinessRoutes = (0, express_1.Router)();
favoriteBusinessRoutes.post('', (0, auth_1.default)(user_constants_1.USER_ROLE.CUSTOMER), 
//   validateRequest(paymnetValidation),
favorite_controller_1.favoriteBusinessController.createFavoriteBusiness);
favoriteBusinessRoutes.get('', (0, auth_1.default)(user_constants_1.USER_ROLE.CUSTOMER), favorite_controller_1.favoriteBusinessController.getAllFavoriteBusinessByUser);
// saveStoryRoutes.delete(
//   '/:id',
//   auth(USER_ROLE.USER),
//   SaveStoryController.deletedSaveStory,
// );
exports.default = favoriteBusinessRoutes;
