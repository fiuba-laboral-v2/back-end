#!/bin/bash

declare -a arr=("1" "2" "3" "4" "5" "6" "7")

for i in "${arr[@]}"
do
   curl --request POST \
  --url http://0.0.0.0:5006/graphql \
  --header 'content-type: application/json' \
  --data '{
    "operationName": null,
    "variables": {},
    "query": "mutation {\n  saveRoot(title: \"test curl 2\") {\n    id\n    title\n  }\n}\n"
  }'
done
