module.exports = (req, res, next) => {
    if (req.query) {
        Object.keys(req.query).map(key => {
            const itemQuery = req.query[key];
            
            if (toString.call(itemQuery) === '[object Array]' && itemQuery[0] && itemQuery[0].slice(0,1) === '{')
                req.query[key] = itemQuery.map(v => (JSON.parse(v)));

            if (typeof itemQuery === 'string' && itemQuery.slice(0,1) === '{') 
                req.query[key] = JSON.parse(itemQuery)
        })
    }
    next()
};