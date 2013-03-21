
module.exports = {
    
    root_path: require('path').normalize(__dirname + '/..'),
    
    development: {
        db: 'mongodb://localhost/furry_archer',
        app: {
            name: 'Furry Archer'
        }
    },
    production: {
        
    }
}