#!/usr/bin/env node

const spawn = require('cross-spawn')
const chalk = require('chalk')
const glob = require('glob')
const which = require('which')
const path = require('path')
const fs = require('fs')

const bin = path.resolve('./node_modules/.bin') // getNpmBinFolder()

const error = chalk.bold.red
const check = chalk.bold.green
const highlight = chalk.underline.magentaBright

/**
 * Create a new directory synchronously
 * @param {String} path 
 */
const mkdirSync = (path) => {
  try {
    fs.mkdirSync(path)
  } catch (e) {
    if (e.code !== 'EEXIST') throw e
  }  
}

/**
 * Configure a command-line interface using yargs
 */
const argv = require('yargs')
  .scriptName('vue-gettext-cli')
  .usage('Usage: $0 <command> [options]')
  .command('extract', 'Extract annotated string to translate from template / javascript files.',
  {
      source: {
        alias: 's',
        describe: "Path to source folder",
        type: 'string',
        nargs: 1,
        default: path.resolve('./src')
      },

      destination: {
        alias: 'd',
        describe: "Path to translations output folder",
        type: 'string',
        nargs: 1,
        default: path.resolve('./translations')
      },

      locales: {
        alias: 'l',
        describe: "Locales prefixes list",
        type: 'array',                
        default: ['en']
      },

      extensions: {
        alias: 'e',
        describe: "Supported file extensions list",
        type: 'array',                
        default: ['jade', 'html', 'js', 'vue']
      },      

      template: {        
        alias: 'p',
        describe: "Name of the generated portable object template (.pot) file",
        type: 'string',
        nargs: 1,
        default: 'template.pot'
      }
  }, (argv) => {

      // Verify gettext's tools (dependencies) requirements
      try {
        which.sync('msginit')
        if (argv.verbose) console.log(check(`msginit dependency found.`))
        which.sync('msgmerge')
        if (argv.verbose) console.log(check(`msgmerge dependency found.`))
        which.sync('msgattrib')
        if (argv.verbose) console.log(check(`msgattrib dependency found.`))
      } catch (e) {
        console.log(error(`${e}`))
        process.exit(-1)
      }

      console.log(highlight("Extracting annotated strings..."))
      
      extract(argv)
    }
  )
  .command('compile', 'Compile portable object (.po) translation files to JavaScript Object Notation (.json) file(s).',
  {
      source: {
        alias: 's',
        describe: "Path to portable object (.po) files folder",
        type: 'string',
        nargs: 1,
        default: path.resolve('./translations/locales')
      },

      destination: {
        alias: 'd',
        describe: "Path to translations folder",
        type: 'string',
        nargs: 1,
        default: path.resolve('./src/translations')
      },

      locales: {
        alias: 'l',
        describe: "Locales prefixes list",
        type: 'array',                
        default: ['en']
      },
    
      combined: {
        alias: 'c',
        describe: "Compile translations to a single file",
        type: 'boolean',                
        default: false
      }
  },
    (argv) => {
      
      const combined = argv.combined

      if (combined){
        console.log(highlight("Compiling locales to single json file..."))
      } else {
        console.log(highlight("Compiling locales to separate json files..."))
      }
      
      compile(argv)
    }
  )
  .help('help')
  .alias('help', 'h')
  .option('verbose', {
    alias: 'v',
    describe: "Display more info during process",
    type: 'boolean',
    default: false
  })
  .demandCommand(1)  // A command must be specified
  .epilog('Copyright (c) spinico, 2019')
  .argv

/**
 * Extract annotated string translations from sources to generate locale '.po' files
 * @param {Object} argv 
 */
function extract(argv){

  const extract = path.join(bin, 'gettext-extract') 

  const source = path.join(argv.source, '**','*.') 
  const destination = argv.destination
  const template = path.join(destination, argv.template) 
  const locales = path.join(destination, 'locales')
  
  if (argv.verbose) console.log(chalk.cyan("Source path: " + source))

  if (!fs.existsSync(destination)) {
    mkdirSync(destination)
  } 

  if (argv.verbose) console.log(chalk.cyan("Destination path: " + destination))

  if (!fs.existsSync(locales)) {
    mkdirSync(locales)    
  }

  if (argv.verbose) console.log(chalk.cyan("Locales path: " + locales))

  glob(source + `{${argv.extensions.join(",")}}`, (e, files) => {
    if (e) {
      console.error(error(e))
      process.exit(-1)
    }

    const args = ['--attribute', 'v-translate', '--output', `${template}`].concat(files)
    const result = spawn.sync(`${extract}`, args, { stdio: 'inherit' })

    if (result.error !== null) {
      console.error(error(result.error))
      process.exit(-1)
    }
    
    // Update locales using current template
    update(locales, template, argv)
  })
}

/**
 * Update an existing locale file or create a new one
 * @param {String} folder 
 * @param {String} template 
 * @param {Object} argv 
 */
function update(folder, template, argv){    

  const locales = argv.locales

  for (locale of locales) {
    let args, result
    const file = path.join(folder, locale + '.po')

    if (!fs.existsSync(file)) {
      // Create a new locale file using gettext's msginit      
      args = ['--no-translator', '--no-wrap', `--locale=${locale}.UTF-8`, `--input=${template}`, `--output-file=${file}`]
      result = spawn.sync('msginit', args, { stdio: 'inherit' })      
    } else {
      process.stdout.write(`Updating ${file} locale file`)
      
      // Update existing locale file using gettext's msgmerge      
      args = [`--lang=${locale}`, '--no-wrap', '--backup=none', '--update', `${file}`, `${template}`]
      result = spawn.sync('msgmerge', args, { stdio: 'inherit' })     
    }

    if (result.error !== null) {
      console.error(error(result.error))
      process.exit(-1)
    } 

    // Remove obsolete entries (if any)
    args = ['--no-wrap', '--no-obsolete', `--output-file=${file}`, `${file}`]
    spawn.sync('msgattrib', args, { stdio: 'inherit' })
  }
}

/**
 * Compile translations '.po' files to json file(s)
 * @param {Object} argv 
 */
function compile(argv){

  const compile = path.join(bin, 'gettext-compile')

  const source = argv.source
  const destination = argv.destination
  const locales = argv.locales
  const combined = argv.combined

  if (argv.verbose) console.log(chalk.cyan("Source path: " + source))

  if (!fs.existsSync(destination)) {
    mkdirSync(destination)
  } 

  if (argv.verbose) console.log(chalk.cyan("Destination path: " + destination))

  if (!combined) { // Generate separate translations (.json) files

    for (locale of locales) {
      const file = path.join(source, locale + '.po')   

      if (fs.existsSync(file)){
        const json = path.join(destination, locale + '.json')

        const args = ['--output', json, file]
        const result = spawn.sync(`${compile}`, args, { stdio: 'inherit' })

        if (result.error !== null) {
          console.error(error(result.error))
          process.exit(-1)
        }
      }
    }

  } else { // Generate a single (combined) translations (.json) file

    glob(path.join(source, '**', '*.po'), (e, files) => {
      if (e) {
        console.error(error(e))
        process.exit(-1)
      }
      const json = path.join(destination, 'translations.json')

      const args = ['--output', json].concat(files)
      const result = spawn.sync(`${compile}`, args, { stdio: 'inherit' })
  
      if (result.error !== null) {
        console.error(error(result.error))
        process.exit(-1)
      }    
    })
      
  }
}

/**
 * Get the local node_modules' .bin folder using "npm bin" command
 * Fallback to path resolve if not found
 */
function getNpmBinFolder(){
    
  const result = spawn.sync('npm', ['bin'], { stdio: 'pipe', encoding: 'utf-8' })
  const folder = result.stdout.replace(/(\r\n|\n|\r)/gm, "") // Remove newline (if any)
  
  if (!fs.existsSync(folder)) {  
    console.log(chalk.magenta("The local npm bin folder " + folder + " was not found, resolving from current path instead."))
    return path.resolve('./node_modules/.bin')
  }
  
  return folder
}
