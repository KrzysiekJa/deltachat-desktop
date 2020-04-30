#!/usr/bin/env node

let hasError = false

const errorFunction = (err) => {
  console.error(err);
  hasError = true;
}

function attachErrorCatcher(c){
  c.on('error', errorFunction)
  c.on('exit', (code)=>{
    if (code != 0) errorFunction('ERR CODE '+ code)
  })
  return c
}

const HELP = `
run ./bin/build/builder.js
(you need to run this in the projects directory)

General options:

-S              disable sourcemaps
-w, --watch     watch folder
--prod          Enable minify and other optimisations that are disabled during development

Only run specific stuff (default is everything):

--styles        build only styles
--js            build only scripts
--translations  build only translations
--static        copy only static files

${/* --special      release stuff like generating thumbnails for bg images */''}
`.trim() + '\n'

import child from 'child_process'
import fs from 'fs-extra'
import globWatch from 'glob-watcher'
import _rc from 'rc'

const rc = _rc('Deltachat-Desktop-Builder', {
  // only some things are run:
  styles: false,
  js: false,
  translations: false,
  static: false,
  special: false,
  // general options
  S: false, // no source maps
  watch: false,
  w: false, // watch
  prod: false // production mode
})

import { jsBuilder } from './build-js.js'

if (rc.help || rc.h) {
  process.stdout.write(HELP)
  process.exit()
}

const buildEverything = !(rc.styles || rc.js || rc.translations || rc.static || rc.special)

const watch = rc.watch || rc.w
const sourceMaps = !rc.S
const envDev = !rc.prod

// General Preperations

fs.ensureDirSync('./html-dist')
// TODO check wether we are in the richt directory

// SCSS
if (buildEverything || rc.styles) {
  const command = [
    'node-sass', 'scss/manifest.scss', 'html-dist/main.css',
    '--output-style', 'compressed'
  ]

  if (watch) command.push('--watch')
  if (sourceMaps) command.push('--source-map', 'true')

  const { stdout, stderr } = attachErrorCatcher(child.spawn('npx', command))
  stdout.pipe(process.stdout)
  stderr.pipe(process.stderr)
}

// JS

if (buildEverything || rc.js) {
  jsBuilder(watch, sourceMaps, envDev)
  .catch(errorFunction)
}

// TRANSLATIONS

if (buildEverything || rc.translations) {
  const buildTranslations = (done) => {
    const c = attachErrorCatcher(
      child.spawn('node', ['bin/convert-translations-from-xml-to-json.js'])
    )
    const { stdout, stderr } = c
    stdout.pipe(process.stdout)
    stderr.pipe(process.stderr)
    if (done) c.on('close', done)
  }
  buildTranslations()
  if (watch) {
    // (whats the usecase of this? live update after pulling in translations??)
    globWatch(['./_locales/*.xml'], buildTranslations)
  }
}

// STATIC

if (buildEverything || rc.static) {
  const copyAction = async () => {
    // docs of fs-extra.copy https://github.com/jprichardson/node-fs-extra/blob/master/docs/copy.md
    await fs.copy('./static/', './html-dist/')
    console.log('DONE: copy files from static folder')
  }
  copyAction().catch(errorFunction)
  if (watch) {
    // (whats the usecase of this? live update after pulling in translations??)
    globWatch(['./static/*'], (done) => {
      copyAction.then(done)
    })
  }
}

// Special (misc tasks like generating thumbnails for the background images)

// TODO "special", make sure that that code runs in another process
// and that it checks the hashes of the files first
// in order to don't do work when not nessesary
// (compare with cache file, that has the previous hashes)

// TODO -> log all verbose output to seperate temp log files

process.on('beforeExit', ()=>{
  process.exitCode = hasError?1:0
})