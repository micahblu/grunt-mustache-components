
# grunt-mustache-components

> Extends mustache templating with partial like components that accept context

##Concept 

Have you ever had the need to reuse a mustache partial in the same page but with different content? Then this task may be useful. It has a similar syntax to that of a partial accept you can pass name=value pair attributes providing context to the template keys inside.

## Getting Started
This plugin requires Grunt `~0.4.5`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-mustache-components --save-dev
```
Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-mustache-components');
```

### Usage
In your project's Gruntfile, add a section named `mustache_components`

```js
grunt.initConfig({
  mustache_components: {
    options: {
      componentsDir: "src/templates/components/", 
      partialsDir: "src/templates/partials/",
      contextDir: "src/templates/data/", // Location of JSON files to provide template context
      ext: '.html', // Save as extension
      context: {} // Manually provide context
    },
    your_target: {
      src: ['src/**/*.mustache'],
      dest: 'dist/'
    }
  },
});
```

#### Template syntax

The component syntax is very similar to that of a mustache partial.

_templates/index.mustache_
```html
    {{^ recipe name=chickenRecipe.name ingredients=chickenRecipe.ingredients instructions=chickenRecipe.instructions}}
    <hr>
    {{^ recipe name=peaSoupRecipe.name ingredients=peaSoupRecipe.ingredients instructions=peaSoupRecipe.instructions}}
    <hr>
    {{^ recipe quantity=3 num=45 name="Turkey Burgers" foo=bar ingredients="Premium ground turkey 93/7 (No Jenny O!)" instructions="Add about 2 tablespoons of Extra Virgin olive oil to a large bowl. Add the ground turkey and work into medium sized balls. Gently smash the turkey balls till they're roughly 1/2 in height. Cook on medium high heat, flipping once and enjoy!"}}
```

#### Context

_templates/data/index.json_
```json
{
  "chickenRecipe": {
    "name": "Dry Rub Oven Roasted Chicken",
    "ingredients": "1 Whole chicken, our special dry rub",
    "instructions": "Rub our special dry rub on the chicken and put in the oven, prehead 400 degrees and cook for 45 minutes"
  },

  "peaSoupRecipe": {
    "name": "Slow Cooked Split Pea Soup",
    "ingredients": "1 Bag of split peas",
    "instructions": "Put parts water to peas in a large boiling pot and cook medium low for 2 1/2 hours"
  }
}
```

#### Component File

_templates/components/recipe.mustache_
```html

<h2>{{name}}</h2>

<b>Ingredients:</b>
<p>{{ingredients}}</p>

<b>Instructions:?</b>
<p>{{instructions}}</p>

```
*Note the component name must match the name provided in the component tag

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
 - 0.0.3
 - 0.0.2
 - 0.0.1