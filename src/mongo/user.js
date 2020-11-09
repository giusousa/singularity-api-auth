let mongoose = require('./mongo');
let bcrypt = require('bcryptjs');

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
    
    password:  {
        type: 'String',
        select: false,
    },

    passwordResetToken: {
        type: 'String',
        select: false,
    },

    passwordResetExpires: {
        type: Date,
        select: false,
    },
    
    level: {
        type: 'String'
    },

    stores: {
        type: 'Object',
    },

    secrets: {
        type: 'Object',
        select: false,
    },

    attributes: {
        type: 'Object',
    },


    project: {
        type: 'String'
    },

    managerId: {
        type: 'String',
    },

    managerName: {
        type: 'String',
    },

    creatorId: {
        type: 'String',
    },
}, { timestamps: true });

schema.pre('save', async function(next) {
    const hash = await bcrypt.hash(this.password, 10);
    this.password = hash;

    next();
});

schema.pre('findOneAndUpdate', async function(next) {
    const password = this.getUpdate().$set.password;
    if (password) {
        const hash = await bcrypt.hash(password, 10);
        this.getUpdate().$set.password = hash;
    }
    next();
});

let model = mongoose.model( 'User', schema)
module.exports = model

//module.exports = {mongoose, schema}