module.exports = {
    mongodbMemoryServerOptions: {
        instance: {
            dbName: 'anser'
        },
        binary: {
            version: '4.0.2',
            skipMD5: true
        },
        autoStart: false
    }
};
