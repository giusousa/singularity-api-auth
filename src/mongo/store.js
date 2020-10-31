let mongoose = require('./mongo');

let schema = new mongoose.Schema({
    name:       'String',
    cpfCnpj:    'String',
    birth:      'String',

    telephone1: 'String',
    telephone2: 'String',
    email:      'String',
    whatsapp:   'String',

    address:    'String',
    addressNumber: 'String',
    addressComplement: 'String',
    addressRef: 'String',
    district:   'String',
    city:       'String',
    uf:         'String',
    cep:        'String',
    
    attributes: {
        type: 'Object',
    },

    project: {
        type: 'String',
    },

    managerId: {
        type: 'String',
    },
    type: {
        type: 'String'
    },
    modules: {
        type: 'Object'
    },
    project: {
        type: 'String'
    },
});


let model = mongoose.model( 'Store', schema)

module.exports = model