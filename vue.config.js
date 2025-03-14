
module.exports = {

    configureWebpack: {

        // other webpack options to merge in ...

    },

    // devServer Options don't belong into `configureWebpack`

    devServer: {

        // public: '0.0.0.0:8080',
        publicPath:'./',
        hot: true,

        disableHostCheck: true,

    }



};


