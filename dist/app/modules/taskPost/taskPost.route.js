"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middleware/auth"));
const user_constants_1 = require("../user/user.constants");
const taskPost_controller_1 = require("./taskPost.controller");
const fileUpload_1 = __importDefault(require("../../middleware/fileUpload"));
const upload = (0, fileUpload_1.default)('./public/uploads/task');
const taskRouter = express_1.default.Router();
taskRouter
    .post('/create-task-post', upload.fields([{ name: 'taskImages', maxCount: 5 }]), (0, auth_1.default)(user_constants_1.USER_ROLE.POSTER), 
// validateRequest(videoValidation.VideoSchema),
taskPost_controller_1.taskPostController.createTaskPost)
    .get('/', taskPost_controller_1.taskPostController.getAllTask)
    .get('/map-task', taskPost_controller_1.taskPostController.getAllTaskByMap)
    .get('/task-dashboard-overview', taskPost_controller_1.taskPostController.getTaskOverview)
    .get('/task-pending-complete-cancel-overview', taskPost_controller_1.taskPostController.getAllTaskPendingCompleteCancel)
    .get('/task-overview-poster', (0, auth_1.default)(user_constants_1.USER_ROLE.POSTER), taskPost_controller_1.taskPostController.getAllTaskOverviewPoster)
    .get('/task-overview-tasker-poster', (0, auth_1.default)(user_constants_1.USER_ROLE.TASKER, user_constants_1.USER_ROLE.POSTER), taskPost_controller_1.taskPostController.getAllTaskOverviewTaskerPoster)
    .get('/task-complete-income-overview-chart', (0, auth_1.default)(user_constants_1.USER_ROLE.TASKER), taskPost_controller_1.taskPostController.getAllCompleteTaskOverviewChartByTasker)
    .get('/filter', taskPost_controller_1.taskPostController.getAllTaskByFilter)
    .get('/poster-tasker', (0, auth_1.default)(user_constants_1.USER_ROLE.POSTER, user_constants_1.USER_ROLE.TASKER), taskPost_controller_1.taskPostController.getAllTaskByTaskerPoster)
    .get('/tasker-cancel-task', (0, auth_1.default)(user_constants_1.USER_ROLE.TASKER), taskPost_controller_1.taskPostController.getAllCancelTaskByTasker)
    // .get('/tasker', auth(USER_ROLE.TASKER), taskPostController.getAllTaskByTasker)
    .get('/:id', taskPost_controller_1.taskPostController.getSingleTaskPost)
    .patch('/accept/:id', 
// auth(USER_ROLE.ADMIN),
taskPost_controller_1.taskPostController.taskAcceptByAdmin)
    .patch('/cancel/:id', 
// auth(USER_ROLE.ADMIN),
taskPost_controller_1.taskPostController.taskCancelByAdmin)
    .delete('/:id', (0, auth_1.default)(user_constants_1.USER_ROLE.POSTER), taskPost_controller_1.taskPostController.deleteSingleTaskPost)
    .patch('/tasker-accept-request/:id', (0, auth_1.default)(user_constants_1.USER_ROLE.TASKER), taskPost_controller_1.taskPostController.taskerTaskAcceptRequest)
    .patch('/tasker-offer-request/:id', (0, auth_1.default)(user_constants_1.USER_ROLE.TASKER), taskPost_controller_1.taskPostController.taskerTaskOfferRequest)
    .patch('/tasker-offer-adjust/:id', (0, auth_1.default)(user_constants_1.USER_ROLE.TASKER, user_constants_1.USER_ROLE.POSTER), taskPost_controller_1.taskPostController.taskOfferPriceAdjust)
    .patch('/poster-again-offer-request/:id', (0, auth_1.default)(user_constants_1.USER_ROLE.POSTER), taskPost_controller_1.taskPostController.posterAgainTaskOfferRequest)
    .patch('/poster-accepted/:id', (0, auth_1.default)(user_constants_1.USER_ROLE.POSTER), taskPost_controller_1.taskPostController.posterTaskAccepted)
    .patch('/poster-canceled/:id', (0, auth_1.default)(user_constants_1.USER_ROLE.POSTER, user_constants_1.USER_ROLE.TASKER), taskPost_controller_1.taskPostController.posterTaskerTaskCanceled)
    .patch('/task-complete/:id', (0, auth_1.default)(user_constants_1.USER_ROLE.TASKER), taskPost_controller_1.taskPostController.taskCompleteByTasker)
    .patch('/task-payment-request/:id', (0, auth_1.default)(user_constants_1.USER_ROLE.TASKER), taskPost_controller_1.taskPostController.taskPaymentRequest)
    .patch('/task-payment-request/:id', (0, auth_1.default)(user_constants_1.USER_ROLE.TASKER), taskPost_controller_1.taskPostController.taskPaymentRequest)
    .patch('/task-payment-confirm/:id', (0, auth_1.default)(user_constants_1.USER_ROLE.POSTER), taskPost_controller_1.taskPostController.taskPaymentConfirm)
    .patch('/task-review-confirm/:id', (0, auth_1.default)(user_constants_1.USER_ROLE.POSTER, user_constants_1.USER_ROLE.TASKER), taskPost_controller_1.taskPostController.taskReviewConfirm);
exports.default = taskRouter;
