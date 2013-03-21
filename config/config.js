
module.exports = {
    
    development: {
        root_path: require('path').normalize(__dirname + '/..'),
        db: 'mongodb://localhost/furry_archer',
        app: {
            name: 'Furry Archer'
        }
    },
    production: {
        
    }
}