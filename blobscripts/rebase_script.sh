#!/bin/bash
# git rebase -i 9c64ac35c66ad5c2cff064f3543a77dea67dadbf

set -e

./get_resources.sh

cd ../../variousreleases/

git add CV_DE.pdf
# git add CV_EN.pdf
# git add foundations_001.pdf
git add htmloutput.html
git add pdfoutput.pdf
git add .gitignore
git add -u

# git add --all

#######

git commit -m"blob autoupdate"

# git rebase -i --root
# ...
# git push -f


