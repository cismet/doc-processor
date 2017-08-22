# Dr. Processor (Doc Processor)

![dr. processor icon](https://user-images.githubusercontent.com/837211/29552552-25ad0ec8-8718-11e7-8020-b1d85c12c872.png)


Once in a while there is a need for a tiny service that collect downloads and process them the way you want to. (ZIP and PDF-merge in a first step).

## What it is not
It is no general purpose api action framework. Atm only for zipping and merging remote files with a service.

## What can you do with it

You can say: "Hey, get me the files `A.pdf`, `B.pdf`, `C.pdf` and `D.pdf` and merge them into `super.pdf`"

or:

"Please download the files X,Y,Z and put them into a ZIP File"

## Prerequisites
node, npm and a tool to zip and merge

or docker 


## installation with

```bash
git clone git@github.com:cismet/doc-processor.git
#or
git clone https://github.com/cismet/doc-processor.git

cd doc-processor

npm install
```

or (with docker)

```bash
TBD
```

## configure

```json
TBD
```

## start
```bash
npm start
```

or (with docker)
```bash
TBD
````


## examples
```bash 
curl -H "Content-Type: application/json" \
-X POST -d '{"name":"simpleMergeDemo","files":[{"uri":"https://raw.githubusercontent.com/cismet/doc-processor/dev/testresources/1.pdf","folder":"first"},{"uri":"https://raw.githubusercontent.com/cismet/doc-processor/dev/testresources/2.pdf","folder":"second"}]}' \
http://localhost:8081/api/pdfmerge/and/wait > mergeDemo.pdf

curl -H "Content-Type: application/json" \
-X POST -d '{"name":"simpleMergeDemo","files":[{"uri":"https://raw.githubusercontent.com/cismet/doc-processor/dev/testresources/1.pdf","folder":"first"},{"uri":"https://raw.githubusercontent.com/cismet/doc-processor/dev/testresources/2.pdf","folder":"second"}]}' \
http://localhost:8081/api/zip/and/wait > zipDemo.zip

```



-----------
Dr. Processor icon from http://www.kameleon.pics/free-icons-pack.html 