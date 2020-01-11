#!/bin/bash

if [[ $(git ls-files --others --modified --exclude-standard) ]]; then
  echo ""
  echo "ERROR: There are unstaged changes."
  echo "  Run 'yarn stash', commit, and then run 'yarn unstash'."
  echo ""
  exit 1
fi
