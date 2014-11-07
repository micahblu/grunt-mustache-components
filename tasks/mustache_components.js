/*
 * grunt-mustache-components
 * https://github.com/micahblu/grunt-mustache-components
 *
 * Copyright (c) 2014 Micah Blu
 * Licensed under the MIT license.
 * 
 * @version 0.0.3
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

        // check for a context json file, if present, extend the context object with it
        if(grunt.file.exists(contextDir + contextFile)){
            context = extend(context, grunt.file.readJSON(contextDir + contextFile));
        }

        // grab current contents of template to string
        contents = grunt.file.read(template);

        // Transculde partials
        contents = partialsTransclusion(contents, ext, options.partialsDir);
        
        // Transclude components
        contents = componentsTransclusion(contents, context, ext, options.componentsDir);

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
          file = template.replace(omit, dest).replace(ext, (options.ext || '.html'));
          //console.log("wrote " + file);
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

    function componentsTransclusion(template, context, ext, componentsDir){

      var components,
          componentName,
          component,
          componentName = '',
          componentContext = {},
          varTokens = [],
          strTokens = [],
          intTokens = [],
          pair = [],
          value = '';

      if(!context){
        return template;
      }
      while(components = template.match(/\{\{\^ (.+)\}\}/g)){

        for(var i=0, j=components.length; i<j; i++){

          componentName = components[i].match(/\{\{\^\s(\w+)/)[1];

          strTokens = components[i].match(/\w+=(['"][^'"]+['"])/g);
          intTokens = components[i].match(/\w+=([0-9]+)/g);
          varTokens = components[i].match(/\w+=([^'"0-9\s\}]+)/g);

          component = grunt.file.read(componentsDir + componentName + ext);

         // console.log(component);
          if(strTokens) {
            strTokens.forEach(function(nv){
              pair = nv.split('=');
              componentContext[pair[0]] = pair[1].replace(/['"]/g, '');
            });
          }

          if(intTokens) {
            intTokens.forEach(function(nv){
              pair = nv.split('=');
              componentContext[pair[0]] = pair[1];
            });
          }

          if(varTokens) {
            varTokens.forEach(function(nv){
              pair = nv.split('=');
              
              if(pair[1].match(/\./g)){
                value = context;
                pair[1].split('.').forEach(function(prop){
                  value = value[prop];
                });
              }else{
                value = context[pair[1]];
              }
              componentContext[pair[0]] = value;
            }); 
          }
          
          component = mustache.render(component, componentContext);
          template = template.replace(components[i], component);
        }
      }

      template = mustache.render(template, context);

      return template;
    }
  });
};
