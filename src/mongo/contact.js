let mongoose = require('./mongo');

let schema = new mongoose.Schema({
    project:       'String',

    managerId:     'String',
    managerName:   'String',

    storeId:       'String',
    storeName:     'String',

    userId:        'String',
    userName:      'String',

    group:         'Object',

    status:        'Boolean',
    score:         'Number',
    type:          'String',
    title:         'String',

    attributes:    'Object',


}, { timestamps: true });

let model = mongoose.model( 'Contact', schema)

module.exports = model