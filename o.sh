#!/bin/bash
DATE="`date`"
LABEL="`printf "$DATE\n$DATE\n$DATE\n$DATE"`"
/usr/bin/convert /tmp/unnamed.png -background none -fill red -size 600x600 -gravity center -pointsize 110 -interline-spacing 100 caption:"$LABEL" -composite /tmp/o.jpg

