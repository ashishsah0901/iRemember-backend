const mongoose = require('mongoose');

const NoteScheme = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    tag: {
        type: String,
        default: 'General'
    },
    date: {
        type: Date,
        default: Date.name
    }
});

module.exports = mongoose.model('note', NoteScheme);