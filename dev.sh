#!/bin/bash

get_curr_window() {
    tmux display-message -p '#I'
}

start_dev() {
    index=$(( $1 + 2 ))
    start_client $index
    index=$(( index + 1 ))
    start_server $index
}

shutdown_dev() {
    echo "Shutting down client and server..."
    tmux kill-window -t client 2>/dev/null
    tmux kill-window -t server 2>/dev/null
    exit 0
}

start_client() {
    tmux new-window -t $1 -n client "cd frontend && bun run dev"
}

start_server() {
    tmux new-window -t $1 -n server "cd backend && air"
}

start_nvim() {
    tmux select-window -t 1
    tmux new-window -t $(( $(get_curr_window) + 1 )) -n frontend "cd frontend && nvim ."

    cd backend && nvim .
}

while getopts "s" opt; do
    case ${opt} in
        s ) shutdown_dev ;;
        \? ) echo "Usage: $0 [-s]"; exit 1 ;;
    esac
done

start_dev $(get_curr_window)
start_nvim
