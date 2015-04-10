var mongoose = require('mongoose');



var taskSchema   = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    deadline: {
        type: Date,
        required: true
    },
    description: {
        type: String,
        default: ""
    },
    completed: {
        type: Boolean,
        default: false
    },
    assignedUser: {
        type: String,
        default: ""
    },
    assignedUserName: {
        type: String,
        default: ""
    },
    dateCreated: {
        type: Date,
        default: Date.now()
    }
});

// Export the Mongoose model
module.exports = mongoose.model('Task', taskSchema);