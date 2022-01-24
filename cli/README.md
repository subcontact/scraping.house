oclif-hello-world
=================

oclif example Hello World CLI

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/oclif-hello-world.svg)](https://npmjs.org/package/oclif-hello-world)
[![CircleCI](https://circleci.com/gh/oclif/hello-world/tree/main.svg?style=shield)](https://circleci.com/gh/oclif/hello-world/tree/main)
[![Downloads/week](https://img.shields.io/npm/dw/oclif-hello-world.svg)](https://npmjs.org/package/oclif-hello-world)
[![License](https://img.shields.io/npm/l/oclif-hello-world.svg)](https://github.com/oclif/hello-world/blob/main/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g @scraping.house/cli
$ s COMMAND
running command...
$ s (--version)
@scraping.house/cli/0.0.0 darwin-x64 node-v17.3.0
$ s --help [COMMAND]
USAGE
  $ s COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`s config get [FILE]`](#s-config-get-file)
* [`s config set [FILE]`](#s-config-set-file)
* [`s help [COMMAND]`](#s-help-command)
* [`s linked company [FILE]`](#s-linked-company-file)
* [`s linked group [FILE]`](#s-linked-group-file)
* [`s linked login`](#s-linked-login)
* [`s linked logout`](#s-linked-logout)
* [`s linked me get [FILE]`](#s-linked-me-get-file)
* [`s linked me post [FILE]`](#s-linked-me-post-file)
* [`s linked page [FILE]`](#s-linked-page-file)
* [`s linked profile [FILE]`](#s-linked-profile-file)
* [`s plugins`](#s-plugins)
* [`s plugins:inspect PLUGIN...`](#s-pluginsinspect-plugin)
* [`s plugins:install PLUGIN...`](#s-pluginsinstall-plugin)
* [`s plugins:link PLUGIN`](#s-pluginslink-plugin)
* [`s plugins:uninstall PLUGIN...`](#s-pluginsuninstall-plugin)
* [`s plugins update`](#s-plugins-update)

## `s config get [FILE]`

describe the command here

```
USAGE
  $ s config get [FILE] [-n <value>] [-f]

FLAGS
  -f, --force
  -n, --name=<value>  name to print

DESCRIPTION
  describe the command here

EXAMPLES
  $ s config get
```

## `s config set [FILE]`

describe the command here

```
USAGE
  $ s config set [FILE] [-n <value>] [-f]

FLAGS
  -f, --force
  -n, --name=<value>  name to print

DESCRIPTION
  describe the command here

EXAMPLES
  $ s config set
```

## `s help [COMMAND]`

Display help for s.

```
USAGE
  $ s help [COMMAND] [-n]

ARGUMENTS
  COMMAND  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for s.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v5.1.10/src/commands/help.ts)_

## `s linked company [FILE]`

describe the command here

```
USAGE
  $ s linked company [FILE] [-n <value>] [-f]

FLAGS
  -f, --force
  -n, --name=<value>  name to print

DESCRIPTION
  describe the command here

EXAMPLES
  $ s linked company
```

## `s linked group [FILE]`

describe the command here

```
USAGE
  $ s linked group [FILE] [-n <value>] [-f]

FLAGS
  -f, --force
  -n, --name=<value>  name to print

DESCRIPTION
  describe the command here

EXAMPLES
  $ s linked group
```

## `s linked login`

login to LinkedIn account

```
USAGE
  $ s linked login -u <value> [-p <value>] [--cookiePath <value>] [-f] [--headless]

FLAGS
  -f, --force             Override existing configuration
  -p, --password=<value>  LinkedIn password
  -u, --username=<value>  (required) LinkedIn username
  --cookiePath=<value>    The path to save cookie file to
  --[no-]headless         Use browser in headless mode

DESCRIPTION
  login to LinkedIn account

EXAMPLES
  $ s linked login
```

## `s linked logout`

remove the saved LinkedIn account

```
USAGE
  $ s linked logout [-u <value>]

FLAGS
  -u, --username=<value>  username of the account to remove

DESCRIPTION
  remove the saved LinkedIn account

EXAMPLES
  $ s linked logout
```

## `s linked me get [FILE]`

describe the command here

```
USAGE
  $ s linked me get [FILE] [-n <value>] [-f]

FLAGS
  -f, --force
  -n, --name=<value>  name to print

DESCRIPTION
  describe the command here

EXAMPLES
  $ s linked me get
```

## `s linked me post [FILE]`

describe the command here

```
USAGE
  $ s linked me post [FILE] [-n <value>] [-f]

FLAGS
  -f, --force
  -n, --name=<value>  name to print

DESCRIPTION
  describe the command here

EXAMPLES
  $ s linked me post
```

## `s linked page [FILE]`

describe the command here

```
USAGE
  $ s linked page [FILE] [-n <value>] [-f]

FLAGS
  -f, --force
  -n, --name=<value>  name to print

DESCRIPTION
  describe the command here

EXAMPLES
  $ s linked page
```

## `s linked profile [FILE]`

describe the command here

```
USAGE
  $ s linked profile [FILE] [-n <value>] [-f]

FLAGS
  -f, --force
  -n, --name=<value>  name to print

DESCRIPTION
  describe the command here

EXAMPLES
  $ s linked profile
```

## `s plugins`

List installed plugins.

```
USAGE
  $ s plugins [--core]

FLAGS
  --core  Show core plugins.

DESCRIPTION
  List installed plugins.

EXAMPLES
  $ s plugins
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v2.0.12/src/commands/plugins/index.ts)_

## `s plugins:inspect PLUGIN...`

Displays installation properties of a plugin.

```
USAGE
  $ s plugins:inspect PLUGIN...

ARGUMENTS
  PLUGIN  [default: .] Plugin to inspect.

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Displays installation properties of a plugin.

EXAMPLES
  $ s plugins:inspect myplugin
```

## `s plugins:install PLUGIN...`

Installs a plugin into the CLI.

```
USAGE
  $ s plugins:install PLUGIN...

ARGUMENTS
  PLUGIN  Plugin to install.

FLAGS
  -f, --force    Run yarn install with force flag.
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Installs a plugin into the CLI.

  Can be installed from npm or a git url.

  Installation of a user-installed plugin will override a core plugin.

  e.g. If you have a core plugin that has a 'hello' command, installing a user-installed plugin with a 'hello' command
  will override the core plugin implementation. This is useful if a user needs to update core plugin functionality in
  the CLI without the need to patch and update the whole CLI.

ALIASES
  $ s plugins add

EXAMPLES
  $ s plugins:install myplugin 

  $ s plugins:install https://github.com/someuser/someplugin

  $ s plugins:install someuser/someplugin
```

## `s plugins:link PLUGIN`

Links a plugin into the CLI for development.

```
USAGE
  $ s plugins:link PLUGIN

ARGUMENTS
  PATH  [default: .] path to plugin

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Links a plugin into the CLI for development.

  Installation of a linked plugin will override a user-installed or core plugin.

  e.g. If you have a user-installed or core plugin that has a 'hello' command, installing a linked plugin with a 'hello'
  command will override the user-installed or core plugin implementation. This is useful for development work.

EXAMPLES
  $ s plugins:link myplugin
```

## `s plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ s plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ s plugins unlink
  $ s plugins remove
```

## `s plugins update`

Update installed plugins.

```
USAGE
  $ s plugins update [-h] [-v]

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Update installed plugins.
```
<!-- commandsstop -->
