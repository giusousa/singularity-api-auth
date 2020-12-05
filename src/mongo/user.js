let mongoose = require('./mongo');
let bcrypt = require('bcryptjs');

let schema = new mongoose.Schema({
    creatorId:  'String',
    managerId:  'String',
    projectId:  'String',
    name:       'String',
    email:      'String',
    level:      'String',
    managerName:'String',
    attributes: 'Object',
    password:               { type: 'String',   select: false},
    passwordResetToken:     { type: 'String',   select: false},
    passwordResetExpires:   { type: 'Date',     select: false},
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