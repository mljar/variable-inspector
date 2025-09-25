#!/bin/bash

[ -d dist ] && rm -f dist/*

jlpm run build

python -m build

cp dist/variable_inspector-*-py3-none-any.whl ../studio/env_installer/extras/
