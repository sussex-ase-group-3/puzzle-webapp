# style guide

this style guide is a living document. any disagreements with the style guide are welcome to be discussed by any member of the team. entries should only be added to the style guide if they are very important overarching components of our development strategy or if they have been found to cause issues in our development.

## repo management

anything that pertains to general management of the repository goes here.

### one issue = one branch

we are using a `one issue = one branch` strategy for branching. this means that most branches are created from an existing github issue, will only receive commits that reflect this issue and will be merged to main as soon as it resolves the issue.

some branches may still be created separately, i.e. documentation won't necessarily need to have issues associated with it's branches.

this approach is intended to aid in focused development and simple task allocation.

### testing branch

once effective testing is set up, we will be introducing a testing branch. this is a branch that goes between the main branch and other branches to ensure that main always remains in a working state.

## code styling

we only want minimal restrictions here, just enough to ensure development can go smoothly.

### formatting

before creating a pull request with code, an autoformatter should be run. this can be set up to happen automatically very easily and makes it immediately a lot easier to read code.

### comments

comments are important, but not always necessary. add them when you feel your code isn't easy to understand. if somebody asks for a comment, assume this is because they couldn't understand the code easily and add comments.

### descriptive variable names

a variable name should communicate what it holds effectively. in some cases, where consistent standards exist (e.g. for loops using i) a single letter variable name is fine, but in general this adds unnecessary difficulty when reading code.
