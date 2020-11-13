
module.exports = (body) => {
    const { attributes, ...rest } = body;
    const newBody = { ...rest };
    Object.keys(attributes).map(prop =>  newBody['attributes.'+prop] = attributes[prop] );
    return newBody
};