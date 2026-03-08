#!/bin/bash
#cp output.html ../../georgydunaev.github.io/output.html
set -e

dirpa=../../set_theory_prover/program
dirfoundations=../../foundations
dirCV=../../CV
dirreleases=../../variousreleases

cp $dirpa/htmloutput.html $dirreleases/output.html
cp $dirpa/pdfoutput.pdf $dirreleases/output.pdf

cp $dirCV/CV_DE.pdf $dirreleases/CV_DE.pdf
cp $dirCV/CV_EN.pdf $dirreleases/CV_EN.pdf
# cp $dirCV/CV_RU.pdf $dirreleases/CV_RU.pdf

cp $dirfoundations/001_foundations.pdf $dirreleases/foundations.pdf

cp releases_gitignore $dirreleases/.gitignore

