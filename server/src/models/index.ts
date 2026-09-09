// models/index.ts

import type { Request } from 'express';

import { TraineeSchema } from './Trainees.js';
import { userSchema } from './User.js';
import { TrainersSchema } from './Trainers.js';
import { CouponSchema } from './Coupons.js';
import { expenseSchema } from './Expense.js';


export const db = (req: Request) => ({
    Trainees: req.getModel('Trainees', TraineeSchema),
    Trainers: req.getModel('Trainers', TrainersSchema),
    Coupon: req.getModel('Coupon', CouponSchema),
    User: req.getModel('User', userSchema),
    Expense: req.getModel('Expense', expenseSchema),

});