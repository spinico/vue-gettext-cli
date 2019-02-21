# vue-gettext-cli

Localization workflow command-line interface for Vue.js web application.

This utility is based on the proposed workflow for the [vue-gettext](https://github.com/Polyconseil/vue-gettext) plugin package.

This command-line interface uses the [easygettext](https://github.com/Polyconseil/easygettext) tools to extract the annotated strings to portable object (.po) files and convert them back to JavaScript Object Notation (.json).  

## Dependencies

This package relies on the [GNU gettext](https://www.gnu.org/software/gettext/) toolset (tested with version 0.19.8.1).

Precompiled binaries for Windows can be found [here](https://mlocati.github.io/articles/gettext-iconv-windows.html).

**Important**: Make sure to add the path to the gettext binaries (`msginit`, `msgmerge` and `msgattrib`) to your PATH environment variable.   

## Install

	npm install vue-gettext-cli --save-dev

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

	--version          Display version number                [boolean]
	--help, -h         Display command help                  [boolean]
	--verbose, -v      Display more info during process      [boolean] [default: false]
	--source, -s       Path to source folder                 [string]  [default: "./src"]
	--destination, -d  Path to translations output folder    [string]  [default: "./translations"]
	--locales, -l      Locales prefixes list                 [array]   [default: ["en"]]
	--extensions, -e   Supported file extensions list        [array]   [default: ["jade","html","js","vue"]]
	--template, -p     Name of the generated portable object [string]  [default: "template.pot"]
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

#### 1. Annotation

Edit the Vue.js templates files (.html, .vue, .jade, .js) and annotate each translatable string as required for your application localization using the [tokens](https://github.com/Polyconseil/easygettext#gettext-extract) supported by the `easygettext`'s extract tools.

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

This command will look for *.po extension file(s) within the relative `./translations/locales` folder that matches the `en`(english) locale. It will then generate an `en.json` file in the `./src/translations` folder. The JSON format translations file can then be used with the [vue-gettext](https://github.com/Polyconseil/vue-gettext) plugin to localize your Vue.js web application. 

For additional locales, the `--locales` option can be used to specify a list of space separated locales ids. For example to process locales for english (en), french (fr_FR) and spanish (es), you would call the compile command as follow:

	vue-gettext-cli compile --locales en fr_FR es

**Remark**: this command will only process locales for which a .po file exists.  

## License

[MIT](http://opensource.org/licenses/MIT)

---
