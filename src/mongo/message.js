let mongoose = require('./mongo');

let schema = new mongoose.Schema({
    contactId:      'String',
    userId:         'String',
    userName:       'String',
    message:        'String',
}, { timestamps: true });

let model = mongoose.model( 'Message', schema)

module.exports = model