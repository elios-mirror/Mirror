#!/bin/bash

docker stop $1; docker rm $1; docker rmi eliosmirror/$1
