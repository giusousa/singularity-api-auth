const mongoose = require('./mongo');

module.exports = (collectionName, collectionModel) => {

    const modelCreate = mongoose.models[collectionName]

    if (modelCreate)
        return modelCreate

    const schema = new mongoose.Schema(collectionModel, { timestamps: true });

    const model = mongoose.model(collectionName, schema)    
    return model

};

function clearModel (collectionName) {
    const modelCreate = mongoose.models[collectionName];
    if (modelCreate)
        delete mongoose.models[collectionName]
};

module.exports.clearModel = clearModel