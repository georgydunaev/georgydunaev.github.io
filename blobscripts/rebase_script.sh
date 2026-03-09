#!/bin/bash
# git rebase -i 9c64ac35c66ad5c2cff064f3543a77dea67dadbf

set -e

./get_resources.sh

cd ../../variousreleases/

git add CV_DE.pdf
# git add CV_EN.pdf
# git add foundations_001.pdf
git add output.html
git add output.pdf
git add .gitignore
git add -u

ls -a
git status

function ask_yes_or_no() {
    read -p "$1 ([y]es or [N]o): "
    case $(echo $REPLY | tr '[A-Z]' '[a-z]') in
        y|yes) echo "yes" ;;
        *)     echo "no" ;;
    esac
}

if false;
then

if [[ "no" == $(ask_yes_or_no "Automatic rebase will be done. Are you sure?") || \
      "no" == $(ask_yes_or_no "Are you *really* sure?") ]]
then
    echo "Skipped."
    exit 0
fi

fi

git add --all

#######
# blob autoupdate
#git commit -m"fixup!Initial commit (frequently forced push commit)"

#git commit --fixup="Initial commit" -m"blob"
#echo $(git log --grep="Initial commit" --format="%H")
hashinitcommit=$(git log --grep="Initial commit" --format="%H")

#git commit --fixup=HEAD -m"blob"
git diff-index --quiet HEAD || (git commit --fixup=$hashinitcommit -m"blob update")

# git rebase --autosquash --root

# git rebase -i --autosquash --root

git -c sequence.editor=true rebase -i --autosquash --root 

# git -c sequence.editor=cat rebase -i --autosquash --root



# git rebase -i --root

# pick Initial commit
# f ...

# r Initial commit
# f ...

# ...


git push -f


