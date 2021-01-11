#!/bin/sh
tmux new-session -d 'vim '
tmux split-window -v 
tmux split-window -h 'yarn start'
tmux split-window -v 'yarn chain'
tmux split-window -v 'yarn graph-run-node'
#tmux new-window 'vim'
tmux -2 attach-session -d
