#!/usr/bin/env node
const yargs = require('yargs')
const {inquirerPrompt} = require('./inquirer')
const path = require('path')
const {copyDir, checkMkdirExists, copyFile, copyTemplate} = require('./copy')
const {install} = require("./manager")
const downloadGitRepo = require('download-git-repo')
const ora = require('ora')
const inquirer = require('inquirer')
const fs = require('fs-extra') // 引入fs-extra


function downLoadTemplate(template, dest, projectName) {
  const loading = ora('正在下载模版...')
  loading.start()
  downloadGitRepo(template, dest, function (err) {
    if (err) {
      console.log('创建模版失败', err)
      loading.fail('创建模版失败：' + err.message) // 失败loading
    } else {
      console.log('创建模版成功')
      loading.succeed('创建模版成功!') // 成功loading
      // 添加引导信息(每个模版可能都不一样，要按照模版具体情况来)
      console.log('please cd your project dictionary and install dependencies, for example:')
      console.log(`\ncd ${projectName}`)
      console.log('npm i')
      console.log('npm start\n')
    }
  })
}

yargs.command(
  ['create', 'c'],
  '新建一个模板',
  function (yargs) {
    return yargs.option('name', {
      alias: 'n',
      demand: true,
      describe: '模板名称',
      type: 'string'
    })
  },
  function (argv) {
    inquirerPrompt(argv).then(answers => {
      console.log(answers)
      // 方式2：直接从git远程地址进行拷贝
      const {template, name} = answers
      const dest = path.join(process.cwd(), name)

      const isMkdirExists = checkMkdirExists(
        path.resolve(process.cwd(), `./${name}`)
      )
      if (isMkdirExists) {
        console.log(`${name}文件夹已经存在!`)
        inquirer.prompt({
          type: 'confirm',
          name: 'force',
          message: '目录已存在，是否覆盖？',
        }).then(answers => {
          const {force} = answers
          // 如果覆盖就删除文件夹继续往下执行，否的话就退出进程
          force ? fs.removeSync(dest) : process.exit(1)
          downLoadTemplate(template, dest, name)
        })
      } else {
        downLoadTemplate(template, dest, name)
      }

      // 方式1：从本地拷贝文件的方式
      // const {name, type} = answers
      // const isMkdirExists = checkMkdirExists(
      //   path.resolve(process.cwd(), `./src/pages/${name}/index.js`)
      // )
      // if (isMkdirExists) {
      //   console.log(`${name}/index.js文件已经存在!`)
      // } else {
      //   copyTemplate(
      //     path.resolve(__dirname, `./template/${type}/index.tpl`),
      //     path.resolve(process.cwd(), `./src/pages/${name}/index.js`),
      //     {
      //       name,
      //     }
      //   )
      //
      //   install(process.cwd(),answers)
      // }
    })
  }
).argv


