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
    status:    {
        type: 'Boolean',
        default: false
    },
    redis:    {
        type: 'Boolean',
        default: false
    },
    socket:   {
        type: 'Boolean',
        default: false
    },
    socketQueryStart: 'Object',
    socketCreatePreQuery:'String',
    socketCreatePolicy:'String',
    type:           'String',
}, { timestamps: true });

let model = mongoose.model( 'Route', schema)

module.exports = model