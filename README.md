# vue-gettext-cli

Localization workflow command-line utility for Vue.js web application.

This utility is based on the proposed workflow for the [vue-gettext](https://github.com/Polyconseil/vue-gettext) plugin package.

This command-line utility uses the [easygettext](https://github.com/Polyconseil/easygettext) tools to extract the annotated strings to portable object (.po) files and convert / compile them back to JavaScript Object Notation (.json).  

## Dependencies

This package relies on the [GNU gettext toolset](https://www.gnu.org/software/gettext/). 

Precompiled binaries for Windows can be found [here](https://mlocati.github.io/articles/gettext-iconv-windows.html).

This utility has been developped using GNU gettext tools version 0.19.8.1.

**Important**: Make sure to add the path to the toolset binaries to your PATH environment variable.   

## Install

	npm install vue-gettext-cli --save-dev

## Usage

	vue-gettext-cli <command> [options]

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

#### 3. Update

Use an application like [Poedit](https://poedit.net/) to edit the gettext (.po) translations files for each supported language of your application.

#### 4. Convert

Locate and parse the gettext translations (.po) files and compile each of the locales to JavaScript Notation Object (.json) format. The compile operation can generate a single .json file containing all locales or split each locale to its own .json file.


## License

[MIT](http://opensource.org/licenses/MIT)

---
