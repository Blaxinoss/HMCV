const mongoose = require('mongoose');

const TrainersSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,

    },
    phone: {
        type: Number,
        required: true,
        unique: true,
        match: [/\d{12,15}/, 'please provide a valid number']
    },
    salary: {
        type: Number,
        required: true,

    },
    raise: {
        type: Number,
        default: 0,
    },
    deleteFlag: {
        type: Boolean,
        default: false,

    },

})

TrainersSchema.virtual('salaryAfterDiscount').get(function () {
    return this.salary - (this.raise || 0);

});

TrainersSchema.set('toJSON', { virtuals: true });

const Trainers = mongoose.model('Trainers', TrainersSchema)

module.exports = Trainers;