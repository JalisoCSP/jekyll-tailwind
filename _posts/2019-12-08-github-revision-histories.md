---
layout: posts
title:  "GitHub revision histories"
date:   2019-12-08 09:00:00 +0100
categories: [article]
tags: [github]
backgroundurl: https://images.unsplash.com/photo-1556075798-4825dfaaf498
time: 1 min
lang: en
---

Watching the youtube video *[A Branch in Time (a story about revision histories)](https://www.youtube.com/watch?v=1NoNTqank_U)* by Tekin Süleyman provided invaluable insight on how to `git better`. 
<br><br>
Git commit histories can be revised to better organise repos and to easily find details on why choices were made. 

> Your software is more than the code — Tekin Süleyman

**The commands to use to edit commit messages are summarised below**
<br><br>
To revise commit history:
```
git rebase -i master
```
<br>
When editing commit messages:

- pick, p use commit
- squash, s use commit but meld into previous commit
- fixup, f like squash but discard commit log message
- reword, r edit commit message

Change previous commit, add changes, use `--no-edit` to use without new commit message:
```
git commit --amend
```
<br>
To force push to branch:
```
git push --force-with-lease
```

# Tips on writing good commit messages:

1. Configure an environment for good commit messages (getting out of using `git commit -m 'Message'`)
<br>
Use `git config --global core.editor "subl -w"` and turn verbose on `git config --global commit.verbose true`
2. Capture the **why**, not the **what**
3. Shape each commit
Keep the story simple and easy to follow
    - Create small atomic commits
    - Shape as you go, not at the end
    - `git add --patch / -p`
4. Treat (local) commits as mutable
```
git commit —amend
—fixup / —autosquash
git rebase —interactive
git rebase —abort
```
5. Build your instincts; search your histories
```
git log -S "some_code"
git annotate file
```

# Kerry attempts `squash`

1. Run `git rebase -i master`
2. Change top commit message to be `reword` or `pick`
3. Squash the rest of the commits
4. When saved and closed, prompt to update commit messages:
    1. Comment out squashed messages
    2. Update (or leave) top commit
5. Check messages with `git log --oneline`
6. Push `git push --force-with-lease` 🥳