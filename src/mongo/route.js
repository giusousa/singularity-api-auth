let mongoose = require('./mongo');

let schema = new mongoose.Schema({
    url:            'String',
    projectId:      'String',
    supermanagerId: 'String',
    methods:        'Object',
    policy:         'Object',
    preDatabase:    'Object',  
    posDatabase:    'Object',
    params:         'Object',
    modelDb:        'Object',
    status:         'Boolean',
    redis:          'Boolean',
    socket:           'Boolean',
    socketQueryStart: 'Object',
    socketCreatePreQuery:'String',
    socketCreatePolicy:'String',
}, { timestamps: true });

let model = mongoose.model( 'Route', schema)

module.exports = model