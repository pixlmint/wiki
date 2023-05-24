var importer = require("node-sass-import");
exports.files = {
    javascripts: {
        joinTo: {
            'vendor.js': /^(?!app)/, // Files that are not in `app` dir.
            'app.js': /^app/
        }
    },
    stylesheets: {
        joinTo: 'app.css',
    }
};

exports.plugins = {
    babel: {presets: ['es2015']},
    vue: {
        extractCSS: true,
        out: 'public/build/components.css',
        sass: {
            options: ['--quiet'],
            importer: importer
        }
    },
    sass: {
        allowCache: true,
        sourceMapEmbed: false,
        precision: 8 // Added precision for arithmetic operations
    }
};

exports.paths = {
    public: 'dist',
    watched: ['app'],
}
