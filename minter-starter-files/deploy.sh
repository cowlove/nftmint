#!/bin/bash
git add -u; git commit -m "deploy"; git push; ssh -A ls git -C nftmint pull
