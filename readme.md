
# GitBugs

Mini issue tracker using git as a backend.

## Description


A little cli tool to manage your issues from the cli, locally and in a
distibuted way.

**how it works (actually figuring out how to do this**

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

## Hooks

GitHub as realy nice integration of their awesome issue tracker in
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

* `Commit message with an issue id like #8`
* `Commit message with a match for /closes?\s\#(\d+)/i`


## Commands

`gitbugs` allone should output the following help.

Note tha `gitbugs` binary is also alliased as `gb` for shorter commands.

* `gitbugs init`
Initializes a new gitbugs repository, tracking the git
repository it was created from. If a gitbug repository already exists,
the command is a noop.

* `gitbugs hook`
Enables the post-commit hook to catch up specific patterns in commit
messages and hook in the issue management.

* `gitbugs list`
Lists all the open issues. The `--all` flag allows the display of closed
issues as well. `github list some search term` should filter the results
based on issue titles and the provided term.

* `gitbugs create`
Creates a new issue, behaves pretty much the same as `git commit`. If a
`-m "message"` option is provided, the issue is created right away. For
further details on the issue to create, ommitting the `-m` or
(`--message`) option will use the configured git text editor. This
command is also aliased to `gitbugs new`

* `gitbugs close`
Closes an issue. Multiple issue id may be provided using a command like
`gitbugs close 3 7 15`. If no positional arguments are provided, the
command should list the opened issue with related ids and prompt for ids
and close the appropriate issues.


This is the very most basic command gitbugs provide.




