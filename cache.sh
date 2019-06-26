#!/usr/bin/env bash

set -xeo pipefail

CACHE_FILE=npm-cache-$(md5sum package-lock.json | awk '{print $1}').tar.gz
if [[ ! -f "$CACHE_FILE" ]]; then
    tar cf "$CACHE_FILE" ./node_modules
    jx step stash -c default -p "$CACHE_FILE" --to-path jenkins-x/jx-node-app-npm-cache
fi
