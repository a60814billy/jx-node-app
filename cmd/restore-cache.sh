#!/usr/bin/env bash

CACHE_FILE=npm-cache-$(md5sum package-lock.json | awk '{print $1}').tar.gz

@jx step unstash -u "gs://hackmd-dev-lts-29a00409-d9f7-4077-b289-4caab6b75ea0/jenkins-x/jx-node-app-npm-cache/$CACHE_FILE"

if [[ -f $CACHE_FILE ]]; then
    tar xf "$CACHE_FILE"
fi
