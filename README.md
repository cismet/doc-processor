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
node, npm, zip and pdftk

or docker (>=17) and docker-compose (>=1.3)

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
docker pull cismet/doc-processor
```

or (build your own image with docker)

```bash
docker build -t cismet/doc-processor .
```

## configure

```json
{
    "port": 8081,
    "host": "0.0.0.0",
    "workers": 10,
    "tmpFolder": "./tmp/",
    "keepFilesForDebugging": false,
    "speechComments": false,
    "processors": ["zip", "pdfmerge"]
}```

```

    "port": The port where the service is listening (ignore if you are doing docker)
    "host": The host where the service is listening (ignore if you are doing docker)
    "workers": The numer of parallel workers
    "tmpFolder": The tmp folder (ignore if you are doing docker)
    "keepFilesForDebugging": set to true if you are a keeper ;-)
    "speechComments": if you are on a mac, set to true to hear from your app (obviously doesn't work with docker)
```


## start
```bash
npm start
```

or (with docker-compose, no installation needed)
```bash
echo '{}' > localConfig.json
mkdir servicetmp
wget https://raw.githubusercontent.com/cismet/doc-processor/dev/docker-compose.yml
docker-compose up -d 
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