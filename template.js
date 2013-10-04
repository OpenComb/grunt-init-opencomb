/*
 * Licensed under the MIT license.
 */

'use strict';

var fs = require('fs') ;
var path = require('path')

// Basic template description.
exports.description = 'Create a OpenComb Application.';

// Template-specific notes to be displayed before question prompts.
exports.notes = 'xxx' ;

// Template-specific notes to be displayed after question prompts.
exports.after = 'yyy' ;

// Any existing file or directory matching this wildcard will cause a warning.
exports.warnOn = '*';

// The actual init template.
exports.template = function(grunt, init, done) {

    init.process(
        {}
        , [
            init.prompt('version','0.9.4')
        ]
        , function(err,prop){

            var folders = ['bin','log','public'] ;
            for(var i=0; i<folders.length;i++)
                fs.mkdirSync( process.cwd()+path.sep+folders[i] ) ;

            var files = init.filesToCopy() ;
            init.copyAndProcess(files);


            console.log (prop)
//            fs.mkdirSync
        }
    )

};
