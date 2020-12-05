module.exports = (body = {}, query = {}) => {

    // Percorre os parâmetros de 'BODY' em busca de parâmetros que sejam objetos. Caso encontrados,
    // a função executará a reestruturação para que apenas os parâmetros filhos sejam atualizados
    if (query.editSubKey === true || query.editSubKey === undefined) {
        
        body = Object.keys(body).reduce((acc, key) => {
            const item = acc[key];

            if (toString.call(item) === '[object Object]' && key !== '$push') {
                delete acc[key];

                Object.keys(item).map(subKey => {
                    acc[ key + '.' + subKey] = item[subKey]
                })
            }

            return acc;

        }, body);
    }

    delete query.editSubKey

    return {body, query}
}