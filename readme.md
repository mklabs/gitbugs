
# GitBugs

A little tool to manage your issues from the CLI, locally and in a
distributed way.

## Description

**how it works (actually figuring out how to do this)**

* gitbugs is meant to be used from within git repos

* when init'd (`gitbugs init`), gitbugs will create a new local git
  repository (it won't touch the original repo history) in `.gitbugs/`

* Issues are stored as a markdown `.md` file, following the
  `issue-:num-:title.md` where `:num` is the issue number, and `:title`
  is the slug of the issue title.

* Closed issues are moved from `.gitbugs/*.md` to `.gitbugs/closed`

* Related commits can be shown up in the related bug file, or can
  eventually close the issue. A new comment adds the commit sha1
  followed by the commit message. The may use markdown syntax and should
  adhere to [these
  guidelines](http://tbaggery.com/2008/04/19/a-note-about-git-commit-messages.html).


This is very alpha, gitbugs should be full of bugs. It uses itself to
store and track its feature request and (multiple) issues.

## Usage

`gitbugs` alone should output the following help.

    » gitbugs <command> <options>

    init      Initialize a new git bugs repo, relative $cwd
    create    Create a new issue
    close     Close the given issue
    list      List all open issues
    view      Display issue's id, title, status and content
    edit      Open the default text editor for the given issue
    hook      Enable post-commit hook for the current git repo

    ls, ll  → list
    new     → create
    info    → view

Note that the `gitbugs` binary is also alliased as `gb` for shorter commands.

* **init**
Initializes a new gitbugs repository, tracking the git
repository it was created from. If a gitbug repository already exists,
the command is a noop.

* **hook**
Enables the post-commit hook to catch up specific patterns in commit
messages and hook in the issue management.

* **list**
Lists all the open issues. Closed issues may be listed using the
`gitbugs list close` subcommand (`closed` works too).

* **create**
Creates a new issue with the given title. The command will prompt for
title (default to provided `<title>`) and a description. If the
description is left blank, the default text editor is used to edit the
issue content.

* **close**
Closes an issue. Multiple issue id may be provided using a command like
`gitbugs close 3 7 15`.

* **view**
Display informations on an issue, such as the id, title, status and content.

* **edit**
Opens the default text editor for the given issue. If the first
line heading is changed, the id and/or title are updated accordingly.

This is the very most basic commands gitbugs provides.

## Synopsis

The first time any command in `gitbugs` is used, it'll check that the
`.gitbugs` directory is there.

    $ gitbugs list
    Error:  Unable to find `./gitbugs`, `gitbugs init` may help
    Try gitbugs --help

The bug tracking repo needs to be created first.

    $ gitbugs init
    Initialized empty Git repository in /path/to/my/repo/.gitbugs/.git/

First time `gitbugs list` is used, it'll show basically nothing cause
there are no open issue to display.

    $ gitbugs list
    # same as gitbugs ls
    # same as gitbugs ll

To add a new issue, the `gitbugs create Title of the ticket` command may
be used.

    $ gitbugs create Title of the issue
    » Enter a title for this issue: (Title of the issue) 

    Leave blank to write this in your text editor
    » Enter a description: Some description, if left the default text editor is used. (vim for posix, notepad for windows)
    [master (root-commit) 44ab1dd] Some description, if left the default text editor is used. (vim for posix, notepad for windows)
     1 files changed, 3 insertions(+), 0 deletions(-)
     create mode 100644 1-title-of-the-issue.md

It should now be displayed by the `list` command.

    $ gitbugs list
    ┏━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
    ┃ Id       ┃ Title                                            ┃
    ┣━━━━━━━━━━╋━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
    ┃ #1       ┃  Title of the issue                              ┃
    ┗━━━━━━━━━━┻━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛


To show details of a specific ticket, `view` (or `info`) command may help:

    $ gitbugs view 1
    ┏━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━┓
    ┃ id       ┃ title                           ┃ status         ┃
    ┣━━━━━━━━━━╋━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╋━━━━━━━━━━━━━━━━┫
    ┃ 1        ┃ Title of the issue              ┃ open           ┃
    ┗━━━━━━━━━━┻━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┻━━━━━━━━━━━━━━━━┛

    Some description, if left the default text editor is used. (vim for posix, notepad for windows)

The `edit` command may be handy to tweak the bug file content, either it
is for changing the issue number, its title or body content.

    $ gitbugs edit 1

Will launch the default text editor with the raw markdown content.
Something like:

    ## #1 - Title of the issue

    Some description, if left the default text editor is used. (vim for posix, notepad for windows)

If the `#1` id or `Title of the issue` are changed to something else,
the issue number is updated and the file is renamed and comitted
appropriately. If the body content is changed, the file is updated and
committed. In both case, prompts will confirm for file renaming and for
a commit message.

    Rename: [Y]es/[N]o (Y)
    Commit message: Edited issue #1
    [master afd662e] Edited issue #1
     2 files changed, 6 insertions(+), 2 deletions(-)
     rename 1-title-of-the-issue.md => 2-new-title-of-the-issue.md (65%)

To close an issue:

    $ gitbugs close 1
    [master 3e6c855] Close #1
     1 files changed, 0 insertions(+), 0 deletions(-)
     rename 1-title-of-the-issue.md => closed/1-title-of-the-issue.md (100%)

`close` command is able to take a set of issues' id to lookup and close.

To enable a commit-msg hook in the current repository, the `gitbugs`
command may be used.

    $ gitbugs hook
    Initialized post commit hook in  /path/to/my/repo/.git/hooks/commit-msg

It'll copy and chmod appropriately the commit-msg hook which may be
found in `bin/commit-msg` in this repository.

Original commits happens in the original repository (not gitbugs' one),
this executes the `commit-msg` hook. It then uses the package
programmatically to add references to issues or to close them if the
commit messages contain specific patterns like:

    git commit -m "Add notes on issue #8"
    git commit -m "Actually fixing. This closes #8"

## Hooks

GitHub has realy a nice integration of their awesome issue tracker in
commit messages.

    git commit -am 'Fix things - This relates to #7'

Will add a reference to the given commit directly in the #7 issue
thread.

    git commit -am 'Fix things for real - This closes #7'

Will automatically close the issue when pushed to the remote repository.

These are just a few examples of the commit semantics regarding issue
management.

`gitbugs` has a built-in post-commit hook you may wish to enable this
kind of functionnality in the original repo gitbugs is tracking.

Currently, the following semantic should be supported:

    git commit -m "Commit message with an issue id like #8"
    git commit -m "Actually fixing. This closes #8"

## Install

Not on npm yet (will it be? I dunno!). To install:

    git clone git://github.com/mklabs/gitbugs.git
    cd gitbugs && npm link

Or install globally from the `tar.gz` github provides:

    npm install https://github.com/mklabs/gitbugs/tarball/master -g

## Tests

May be run using

    npm test

which then simply runs `node test`

The assertions also happens to be a good place to look at to learn more
about API usage, until the documentation is written.

