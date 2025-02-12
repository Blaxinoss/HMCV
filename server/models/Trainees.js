const mongoose = require('mongoose');

// Define the Trainee schema
const TraineeSchema = mongoose.Schema({
    name: {
        type: String,
        required: true, // Name is mandatory
        trim: true       // Removes whitespace
    },
    phone: {
        type: String,
        required: true,  // Phone is mandatory
        match: [/^\d{10,15}$/, 'Please provide a valid phone number'] // Basic phone validation
    },
    subscriptionStartDate: {
        type: Date,
        required: true    // Start date is mandatory
    },
    subscriptionEndDate: {
        type: Date,
        required: true    // End date is mandatory
    },
    totalCost: {
        type: Number,
        required: true,   // Total cost is mandatory
        min: 0            // Ensures cost is non-negative
    },
    paid: {
        type: Number,
        default: 0,       // Default paid amount is 0
        min: 0
    },
    remaining: {
        type: Number,
        default: function () { return this.totalCost - this.paid; }, // Calculate based on total cost and paid
        min: 0
    },
    discount: {
        type: Number,
        default: 0,       // Default discount is 0
        min: 0,
    },
    deleteFlag: {
        type: Boolean,
        default: false,

    },
    accountFreezeStatus: {
        type: Boolean,
        default: false    // Default account freeze status is "not frozen"
    },
    freezeStartDate: {
        type: Date,
        default: null,
    },
    isSession: {
        type: Boolean,
        default: false,
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true }, // Include virtuals when converting to JSON
    toObject: { virtuals: true } // Include virtuals when converting to a plain object
});

TraineeSchema.virtual('daysLeft').get(function () {
    if (!this.subscriptionEndDate) return null;
    const today = new Date()
    const difference = new Date(this.subscriptionEndDate) - today
    const daysLeft = Math.ceil(difference / (1000 * 60 * 60 * 24))
    return daysLeft;
})

// Create the Trainee model
const Trainees = mongoose.model('Trainees', TraineeSchema);

module.exports = Trainees;
