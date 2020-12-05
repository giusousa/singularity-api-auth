let mongoose = require('./mongo');

let schema = new mongoose.Schema({
    name:           'String',
    supermanagerId: 'String',
    status:         'Boolean',
    statusAdmin:    'Boolean',
    managerWorkspace:'Boolean'
}, { timestamps: true });

let model = mongoose.model( 'Project', schema)

module.exports = model