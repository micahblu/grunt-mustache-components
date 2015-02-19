/*
 * grunt-mustache-components
 * https://github.com/micahblu/grunt-mustache-components
 *
 * Copyright (c) 2014 Micah Blu
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  grunt.registerMultiTask('mustache_components', 'Extends mustache templates with Ember like components', function() {

        
    var mustache = require('mustache');
    var extend = require("extend");

    var options = this.options(),
        context = options.context,
        contextDir = options.contextDir,
        ext ='',
        filename,
        contents,
        src = this.data.src,
        dest = this.data.dest;

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

    this.filesSrc.forEach(function(template){

      var path = '';
      src.forEach( function(src) {
        src = src.substr(0, (src.indexOf("*")));

        if (template.match(src)) {
          path = template.replace(src, "");
        }
      });

      ext = template.substr(template.lastIndexOf('.'), template.length);
      filename = template.substr(template.lastIndexOf('/') + 1, template.length).replace(ext, "");
      
      var dataFile = contextDir + path.replace("/", ".").replace("mustache", "json");

      // check for a context json file, if present,
      // extend the context object with it
      if(grunt.file.exists(dataFile)){
        context = extend(context, grunt.file.readJSON(dataFile));
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
      if(!template.match(options.componentsDir) && !template.match(options.partialsDir)){

        grunt.file.write(dest + path.replace('.mustache', options.ext), contents);
      }

    });
  });
};
