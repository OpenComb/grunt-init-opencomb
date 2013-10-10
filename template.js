/*
 * Licensed under the MIT license.
 */

var fs = require('fs') ;
var path = require('path') ;
var child_process = require('child_process') ;

var opencombReposUrl = "git://github.com/OpenComb/OpenComb.git" ;
var defaultOpencombVersion = '0.9.4' ;
var opencombDeps = ['ocsteps','octemplate'] ;
var dest = process.cwd() ;

// Basic template description.
exports.description = 'Create a OpenComb Application.';

// Template-specific notes to be displayed before question prompts.
exports.notes = '' ;

// Template-specific notes to be displayed after question prompts.
exports.after = "\r\n    A OpenComb application has created in "+dest + ". \r\n\r\n"
    + "    Run `node index.js` to start this application and enjoy it :)\r\n" ;

// Any existing file or directory matching this wildcard will cause a warning.
exports.warnOn = '*';

// The actual init template.
exports.template = function(grunt, init, done) {

    
    init.process(
        {}
        , [
            init.prompt('OpenComb Version',defaultOpencombVersion)
            , init.prompt('Listen tcp port','6060')
            , init.prompt('Database name','opencomb')
            , init.prompt('Database server','localhost')
            , init.prompt('Database username','<empty>')
            , init.prompt('Database password','<empty>')
            , init.prompt('Download OpenComb from github.com ?','y/N')
        ]
        , function(err,prop){

            if(err)
                return ;

            var fromGithub = prop['Download OpenComb from github.com ?']!='y/N' ;

            var folders = ['bin','log','public'] ;
            for(var i=0; i<folders.length;i++)
                fs.mkdirSync( process.cwd()+path.sep+folders[i] ) ;

            init.writePackageJSON('package.json', {
                name: prop['Application Name'],
                version: '0.1.0',
                node_version: '>= 0.8.0',
                dependencies: {
                    opencomb: prop['OpenComb Version']
                }
            });

            var files = init.filesToCopy() ;
            init.copyAndProcess(files) ;

            // install opencomb
            var args = ['install'] ;
            if( fromGithub )
                args.push(opencombReposUrl+'#'+prop['OpenComb Version']) ;
            else
                args.push('opencomb@'+prop['OpenComb Version']) ;

            cmd('npm',args,{},function(code,signal){
                if(code) {
                    grunt.log.error('install opencomb package failed, code: '+code+', signal: '+signal) ;
                    done() ;
                    return ;
                }

                // write config.json
                var tplConfig = require(dest+'/node_modules/opencomb/config.tpl.json') ;
                tplConfig.db.server = prop['Database server'] ;
                tplConfig.db.name = prop['Database name'] ;
                tplConfig.db.username = prop['Database username']=='<empty>'? '': prop['Database username'] ;
                tplConfig.db.password = prop['Database password']=='<empty>'? '': prop['Database password'] ;
                tplConfig.server.port = parseInt(prop['Listen tcp port']) ;

                fs.writeFile(
                    dest+'/config.json'
                    , JSON.stringify(tplConfig,null,2)
                    , function(err){
                        if(err)
                        {
                            grunt.log.error("can not write config.json:"+err) ;
                            return ;
                        }

                        done() ;
                    }
                ) ;
            }) ;
        }) ;
};



function cmd(cmd,args,opts,callback){
    var npm = child_process.spawn(cmd,args,opts) ;
    npm.stdout.on("data",output) ;
    npm.stderr.on("data",output) ;
    npm.on("close",callback) ;
}
function output(data){
    process.stdout.write(data.toString()) ;
}
