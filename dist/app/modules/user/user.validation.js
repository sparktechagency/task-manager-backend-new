"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userValidation = void 0;
const zod_1 = require("zod");
const user_constants_1 = require("./user.constants");
const userValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        fullName: zod_1.z.string().min(1, { message: 'Full name is required' }),
        email: zod_1.z.string().email({ message: 'Invalid email format' }),
        password: zod_1.z
            .string()
            .min(6, { message: 'Password must be at least 6 characters long' }),
        phone: zod_1.z
            .string()
            .min(10, { message: 'Phone number must be at least 10 digits' }),
        taxNum: zod_1.z.string().min(1, { message: 'Tax number is required' }),
        bsnNum: zod_1.z.string().min(1, { message: 'BSN number is required' }),
        role: zod_1.z.enum([user_constants_1.USER_ROLE.POSTER, user_constants_1.USER_ROLE.TASKER]),
        image: zod_1.z.string().optional(),
    }),
});
exports.userValidation = {
    userValidationSchema,
};
