/*
 * grunt-mustache-components
 * https://github.com/micahblu/grunt-mustache-components
 *
 * Copyright (c) 2014 Micah Blu
 * Licensed under the MIT license.
 * 
 * @version 0.0.1
 */

'use strict';

module.exports = function(grunt) {

  grunt.registerMultiTask('mustache_components', 'Reusable mustache components that can be passed context', function() {

    var mustache = require('mustache');
    var extend = require("extend");

    var options = this.options(),
        context = options.context,
        contextDir = options.contextDir,
        contextFile = '',
        ext ='',
        filename,
        contents,
        dest = this.data.dest,
        src = this.data.src[0].replace(/\*.+/g, ''),
        ignoreDirs = [options.componentsDir, options.partialsDir, options.contextDir],
        ignoreDirRegex = new RegExp(ignoreDirs.join("|").replace(new RegExp(src, "g"), ''));


    var srcdirs, omit = '', template, write = true, file;
    
    this.files.forEach(function(filepair){
      srcdirs = filepair.orig.src[0].split('/');
      srcdirs.forEach(function(dir){
        if(!/\*/g.test(dir)){
          omit += dir + '/';
        }
      });

      filepair.src.forEach(function(template){

        ext = template.substr(template.lastIndexOf('.'), template.length);
        contextFile = template.replace(omit, '').replace(ignoreDirRegex, '').replace(ext, '.json').replace(/\//g, '.');

        // check for a context json file, if present,
        // extend the context object with it
        if(grunt.file.exists(contextDir + contextFile)){
            context = extend(context, grunt.file.readJSON(contextDir + contextFile));
        }

        // grab current contents of template to string
        contents = grunt.file.read(template);

        // Transculde partials
        contents = partialsTransclusion(contents, ext, options.partialsDir);
        
        // Transclude components
        contents = componentsTransclusion(contents, ext, options.componentsDir);

        // Render template content with context
        contents = mustache.render(contents, context);
        
        // All good write new file to dest
        ignoreDirs.forEach(function(dir){
          if(template.indexOf(dir) > -1){
            write  = false;
            return;
          } 
        });
        
        if(write){
          file = template.replace(omit, dest).replace(ext, options.ext);
          console.log("wrote " + file);
          grunt.file.write(file, contents);
        }
        
      });
      omit = '';
      write = true;
    });

    return;

    if(!grunt.file.isDir(dest)){
      grunt.log.warn('Destination must be a directory');
      return false;
    }

    //console.log(grunt.file.expand({cwd: dest}, '*').join(grunt.util.linefeed));

    function partialsTransclusion(template, ext, partialsDir){

      var partials,
          partialName,
          partial;

      while(partials = template.match(/\{\{> (.+?)\}\}/g)){

        for(var i=0, j=partials.length; i<j; i++){

          partialName = partials[i].match(/\{\{> (.+?)\}\}/)[1];

          partial = grunt.file.read(partialsDir + partialName  + ext);
          
          template = template.replace(partials[i], partial);
        }
      }
      return template;
    }

    function componentsTransclusion(template, ext, componentsDir){

      var components,
          componentName,
          component,
          componentStr,
          componentContext = {},
          componentTokens = '',
          nvpair = [];

      while(components = template.match(/\{\{\^ (.+?)\}\}/g)){

        for(var i=0, j=components.length; i<j; i++){

          // temporarily replace empty spaces within attribute value strings with a '&nbsp;'
          componentStr = components[i].replace(/(['"].+?)\s(.+?['"])/, '$1&nbsp;$2');

          // separate component string by empty spaces into tokens 
          componentTokens = componentStr.match(/\{\{\^ (.+?)\}\}/)[1].split(" ");

          component = grunt.file.read(componentsDir + componentTokens[0]  + ext);
          
          componentTokens = componentTokens.splice(1);
          
          componentTokens.forEach(function(token){
            nvpair = token.split("=");
            // If token is encapsulated with ['"] then it is a string literal, 
            // other wise map value from passed context
            if(nvpair[1].match(/['"]/)){
              nvpair[1] = nvpair[1].replace(/&nbsp;/g, " ");

              componentContext[nvpair[0]] = nvpair[1].replace(/['"]/g, "");
            }else{
              componentContext[nvpair[0]] = context[nvpair[1]];
            }
          });

          component = mustache.render(component, componentContext);

          template = template.replace(components[i], component);
        }
      }

      template = mustache.render(template, context);

      return template;
    }
  });
};
