
# GitBugs

Mini issue tracker using git as a backend.

## Description


A little cli tool to manage your issues from the cli, locally and in a
distibuted way.

**how it works (actually figuring out how to do this)**

* gitbugs is meant to be used from within git repo
* when init'd (`gitbugs init`), gitbugs will create a new local
  git repo (it won't touch the original repo history) in `.gitbugs/`
* Issues are stored as a markdown `.md` file, following the
  `issue-:num-:title.md` where `:num` is the issue number, and `:title`
  is the slug of the issue title
* Closed issues are moved from `.gitbugs/*.md` to `.gitbugs/closed`
* Comments are attached to a given issue using git commits in the
  `.gitbugs` repo. The commit message is actually the comment message.
  They may use the markdown syntax and should adhere to [these
  guidelines](http://tbaggery.com/2008/04/19/a-note-about-git-commit-messages.html).
* Each realated commit is shown up in the related bug file, a new
  comment adds the commit sha1 followed by the issue title, a newline
  and the commit message.

This is very alpha, gitbugs should be full of bugs.

## Commands

`gitbugs` allone should output the following help.

    » gitbug <command> <options>

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

Note tha `gitbugs` binary is also alliased as `gb` for shorter commands.

* `gitbugs init`
Initializes a new gitbugs repository, tracking the git
repository it was created from. If a gitbug repository already exists,
the command is a noop.

* `gitbugs hook`
Enables the post-commit hook to catch up specific patterns in commit
messages and hook in the issue management.

* `gitbugs list`
Lists all the open issues. Closed issues may be listed using the `gimme
list close` subcommand (`closed` works too).

* `gitbugs create <title>`
Creates a new issue with the given title. The command will prompt for
title (default to provided `<title>`) and a description. If the
description is left blank, the default text editor is used to edit the
issue content.

* `gitbugs close <id ...>`
Closes an issue. Multiple issue id may be provided using a command like
`gitbugs close 3 7 15`.

* `gitbugs view <id>`
Display informations on an issue, such as the id, title, status and content.

* `gitbugs edit <id>`
Opens the default text editor for the given issue. If the first
line heading is changed, the id and/or title are updated accordingly.

This is the very most basic commands gitbugs provides.

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


