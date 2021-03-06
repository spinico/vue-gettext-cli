# vue-gettext-cli

Localization workflow command-line interface for Vue.JS web application.

This utility is based on the proposed workflow for the [vue-gettext](https://github.com/Polyconseil/vue-gettext) plugin package.

This command-line interface uses the [easygettext](https://github.com/Polyconseil/easygettext) tools to extract the annotated strings to portable object (.po) files and convert them back to JavaScript Object Notation (.json).  

## Dependencies

This package relies on the [GNU gettext](https://www.gnu.org/software/gettext/) toolset (tested with version 0.19.8.1). Precompiled binaries for Windows can be found [here](https://mlocati.github.io/articles/gettext-iconv-windows.html).

**Important**: Make sure to add the path to the gettext binaries (`msginit`, `msgmerge` and `msgattrib`) to your PATH environment variable.   

## Install

This package can be installed as a development dependency using NPM or Yarn.

#### NPM

	npm install vue-gettext-cli --save-dev

#### Yarn

	yarn add vue-gettext-cli --dev

## Usage

	vue-gettext-cli <command> [options]

To display the options for each available commands:

	vue-gettext-cli extract --help 
	vue-gettext-cli compile --help

## Commands

### Extract

vue-gettext-cli **extract** [options]

*Extract annotated string to translate from template / javascript files.*

	Options:

	--version             Display version number                [boolean]
	--help, -h            Display command help                  [boolean]
	--verbose, -v         Display more info during process      [boolean] [default: false]
	--source, -s          Path to source folder                 [string]  [default: "./src"]
	--destination, -d     Path to translations output folder    [string]  [default: "./translations"]
	--locales, -l         Locales prefixes list                 [array]   [default: ["en"]]
	--extensions, -e      Supported file extensions list        [array]   [default: ["jade", "html", "htm", "js", "pug", "vue", "ts"]]
	--startDelimiter, -sd Custom start delimiter                [string]  [default: "{{"] 
	--endDelimiter, -ed   Custom end delimiter                  [string]  [default: "}}"]  
	--template, -p        Name of the generated portable object [string]  [default: "template.pot"]
	                      template (.pot) file

### Compile
vue-gettext-cli **compile** [options]

*Compile portable object (.po) translation files to JavaScript Object Notation (.json) file(s).*

	Options:

	--version          Display version number                     [boolean]
	--help, -h         Display command help                       [boolean]
	--verbose, -v      Display more info during process           [boolean] [default: false]
	--source, -s       Path to portable object (.po) files folder [string]  [default: "./translations/locales"]
	--destination, -d  Path to translations folder                [string]  [default: "./src/translations"]
	--locales, -l      Locales prefixes list                      [array]   [default: ["en"]]
	--combined, -c     Compile translations to a single file      [boolean] [default: false]

## Workflow

#### 1. Annotate

Edit the Vue.JS templates files (.html, .vue, .jade, .js) and annotate each translatable string as required for your application localization using the [tokens](https://github.com/Polyconseil/easygettext#gettext-extract) supported by the `easygettext`'s extract tools.

#### 2. Extract

Locate and parse each source files matching the list of extensions specified to generate the portable object template (.pot). Then create or update the portable object (.po) for each locales specified using the previously generated .pot file.

The vue-gettext-cli `extract` command can be use to streamline the process of creating the po locales. For example, using the default values:

	vue-gettext-cli extract

This command will look for *.jade, *.html, *.js and *.vue extensions file within the relative `./src` source folder. It will then extract annotated tokens to generate a `template.pot` file in the `./translations` folder and finally create or update the `en` (english) locale `./translations/locales/en.po` file.

#### 3. Translate

Having generated the translation file(s) in the previous step, you can now use an application like [Poedit](https://poedit.net/) to edit and update the gettext translations (.po) files for each supported language of your application.

#### 4. Convert

Locate and parse the updated gettext translations (.po) files and compile each of the locales to JavaScript Notation Object (.json) format. The compile operation can generate a single .json file containing all locales (by specifying the `--combined` option) or split each locale to its own .json file.

The vue-gettext-cli `compile` command can be used to convert from the .po locales to .json file format. For example, using the default values:

	vue-gettext-cli compile

This command will look for *.po extension file(s) within the relative `./translations/locales` folder that matches the `en`(english) locale. It will then generate an `en.json` file in the `./src/translations` folder. The JSON format translations file can then be used with the [vue-gettext](https://github.com/Polyconseil/vue-gettext) plugin to localize your Vue.JS web application. 

For additional locales, the `--locales` option can be used to specify a list of space separated locales ids. For example to process locales for english (en), french (fr_FR) and spanish (es), you would call the compile command as follow:

	vue-gettext-cli compile --locales en fr_FR es

**Remark**: this command will only process locales for which a .po file exists.  


## Exemple

The following presents a step-by-step workflow configuration using a generic Vue.JS project with [vue-gettext](https://github.com/Polyconseil/vue-gettext) for localization support.

#### 1. Create a new Vue.JS project using [Vue CLI 3](https://cli.vuejs.org/).

	vue create my-project

**Remark**: a default project configuration is used for this example.

Then change to the newly created project directory.

	cd my-project 

#### 2. Install the `vue-gettext` plugin as a dependency.

	npm install vue-gettext --save

#### 3. Install the `vue-gettext-cli` tool as a development dependency.

	npm install vue-gettext-cli --save-dev

**Note**: remember to install [GNU gettext](https://www.gnu.org/software/gettext/) toolset and include the binaries to your PATH environment variable. 


#### 4. Edit the HelloWorld component as follow:

**./src/components/HelloWorld.vue**

	<template>
	  <div class="hello">
	    <select name="language" :value="$language.current" @change="onChange">
	      <option v-for="(value, key) in $language.available" :value="key" :key="key">{{ value }}</option>
	    </select>
	    <h3>    
	      <translate>#WELCOME#</translate>
	    </h3>
	  </div>
	</template>
	
	<script>
	import Vue from 'vue'
	
	export default {
	  name: 'HelloWorld',
	  methods:{
	      onChange(event){
	          const value = event.target.value;
	
	          // Only load locale translation if not previously loaded
	          if (!Vue.$translations.hasOwnProperty(value)) {
	
	            import('@/translations/' + value + '.json').then( (locale) => {        
	              this.$language.merge(locale);
	              this.$language.current = value;
	            })       
	
	          } else {          
	            this.$language.current = value;
	          }
	      }
	    }
	}
	</script>	

	<!-- Add "scoped" attribute to limit CSS to this component only -->
	<style scoped>
	h3 {
	  margin: 40px 0 0;
	}
	ul {
	  list-style-type: none;
	  padding: 0;
	}
	li {
	  display: inline-block;
	  margin: 0 10px;
	}
	a {
	  color: #42b983;
	}
	</style>


#### 5. Edit the `package.json` to add tasks to run extract and compile translations to the `scripts` section for english, french and spanish locales.

**package.json**

	{ 
	  ... 
	  "scripts": {
		...		
		"localize-extract": "vue-gettext-cli extract --locales en fr es",
		"localize-compile": "vue-gettext-cli compile --locales en fr es"		
	  },
	  ...
	}

#### 6. Extract the annnotated strings from the HelloWorld component.

	npm run localize-extract
	
	Extracting annotated strings...
	[easygettext] extracting: './src/App.vue
	[easygettext] extracting: './src/components/HelloWorld.vue
	[easygettext] extracting: './src/main.js
	./translations/locales/en.po created.
	./translations/locales/fr.po created.
	./translations/locales/es.po created.

Now you can edit each .po file using [Poedit](https://poedit.net/) and set the #WELCOME# value for each locales.

#### 7. Convert the edited .po translations to .json files for each locales.

	npm run localize-compile
	
	Compiling locales to separate json files...
	[gettext] processing PO file: ./translations/locales/en.po
	[gettext] processing PO file: ./translations/locales/fr.po
	[gettext] processing PO file: ./translations/locales/es.po

#### 8. Update the project's `main.js` file to use the translations with the `vue-gettext` plugin.

**main.js**

	import Vue from 'vue'		
	import App from './App.vue'
	import GetTextPlugin from 'vue-gettext'	

	// Default translations to english language
	import translations from '@/translations/en.json'
	
	Vue.config.productionTip = false
	
	Vue.use(GetTextPlugin,{
	  availableLanguages: {
	    en: 'English',
	    es: 'Spanish',
	    fr: 'Français'
	  },
	  defaultLanguage: 'en',
	  languageVmMixin: {
	    methods: {
	      merge (locale) {
	        Object.assign(translations, locale);        
	      },
	    }
	  },
	  translations: translations,
	  silent: true,
	})
	
	new Vue({
	
	  created () {
	    const ll_CC = navigator.language || navigator.userLanguage;     
	    const language = ll_CC.split("-", 1);
	
	    if (!Vue.$translations.hasOwnProperty(language)){
	
	      import('@/translations/' + language + '.json').then( (locale) => {        
	        this.$language.merge(locale);
	        this.$language.current = language;      
	      })       
	    } 
	  },
	
	  render: h => h(App),
	}).$mount('#app')

#### 9. Run the local server.

	npm run serve

Now you can access the web application on the local server url (usually `http://localhost:8080`).

#### 10. Test localization

By default, the web application will initially import and select english language locale. If your current browser language is one of the declared locales, it should automatically be loaded and selected. 

The selection of another (not previously selected) language will trigger an import call to load the corresponding locale.      

## [MIT](http://opensource.org/licenses/MIT) License

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

---
