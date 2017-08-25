# Dr. Processor (Doc Processor)

![dr. processor icon](https://user-images.githubusercontent.com/837211/29552552-25ad0ec8-8718-11e7-8020-b1d85c12c872.png)

![docker status](https://img.shields.io/docker/build/cismet/doc-processor.svg)

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

or (with docker-compose)
```bash
echo '{}' > localConfig.json
mkdir servicetmp
wget https://raw.githubusercontent.com/cismet/doc-processor/dev/docker-compose.yml
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
    "server": "http://localhost:8081",
    "workers": 10,
    "tmpFolder": "./tmp/",
    "keepFilesForDebugging": false,
    "processors": ["zip", "pdfmerge"],
    "targetWhitelist": "",
    "corsAccessControlAllowOrigins": ["http://localhost:*"]

}
```

```

    "port": The port where the service is listening (ignore if you are doing docker)
    "host": The host where the service is listening (ignore if you are doing docker)
    "server": The url prefix how you can reach the server (in production != localhost) With thois property there is a `href` prop build in the status which can be used to retrieve the result file.
    "workers": The numer of parallel workers
    "tmpFolder": The tmp folder (ignore if you are doing docker)
    "keepFilesForDebugging": set to true if you are a keeper ;-)
    "targetWhitelist": a regex to match all allowed download locations. all downloads allowed if empty. Example: "^(http|https):\\/\\/localhost:\\d*\\/.*"
    "corsAccessControlAllowOrigins": An array(!!!) of the allowed origins [more](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Origin)

```

## start

```bash
npm start
```

or (with docker-compose)
```bash
docker-compose up -d 
```


## check
Now it should look like this:


![dr processor hello world](https://user-images.githubusercontent.com/837211/29609790-807f3eb2-87f8-11e7-98ef-cb819c917236.png)



## update with docker-compose

```bash
docker pull cismet/doc-processor
docker-compose down && docker-compose up -d 
````

## usage

you have 2 options:
1. `POST /api/[processor]/and/wait/for/download` will start the process and return the result when it is ready

2.1 `POST /api/[processor]]/and/wait/for/status` will start the process and (if it is done) return a status with an id

you can then 

2.2 `GET /api/download/[pdfmerge]/1337/nameOfTheOutput`to get the result

## examples
```bash 
# direct download
curl -H "Content-Type: application/json" \
-X POST -d '{"name":"simpleMergeDemo","files":[{"uri":"https://raw.githubusercontent.com/cismet/doc-processor/dev/testresources/1.pdf","folder":"first"},{"uri":"https://raw.githubusercontent.com/cismet/doc-processor/dev/testresources/2.pdf","folder":"second"}]}' \
http://localhost:8081/api/pdfmerge/and/wait/for/download > mergeDemo.pdf

curl -H "Content-Type: application/json" \
-X POST -d '{"name":"simpleMergeDemo","files":[{"uri":"https://raw.githubusercontent.com/cismet/doc-processor/dev/testresources/1.pdf","folder":"first"},{"uri":"https://raw.githubusercontent.com/cismet/doc-processor/dev/testresources/2.pdf","folder":"second"}]}' \
http://localhost:8081/api/zip/and/wait/for/download > zipDemo.zip

# pdf-merge: get the status
curl -H "Content-Type: application/json" \
-X POST -d '{"name":"simpleMergeDemo","files":[{"uri":"https://raw.githubusercontent.com/cismet/doc-processor/dev/testresources/1.pdf","folder":"first"},{"uri":"https://raw.githubusercontent.com/cismet/doc-processor/dev/testresources/2.pdf","folder":"second"}]}' \
http://localhost:8081/api/pdfmerge/and/wait/for/status 

# pdf-merge: and then get the file (change the id accordingto the output of the last result)
curl -v http://localhost:8081/api/download/pdfmerge/eefab7c1c3d72e0004f3b98440f5b13c-27xxx/name --output x2.pdf

# zip: get the status

curl -H "Content-Type: application/json" \
-X POST -d '{"name":"simpleMergeDemo","files":[{"uri":"https://raw.githubusercontent.com/cismet/doc-processor/dev/testresources/1.pdf","folder":"first"},{"uri":"https://raw.githubusercontent.com/cismet/doc-processor/dev/testresources/2.pdf","folder":"second"}]}' \
http://localhost:8081/api/zip/and/wait/for/status

# zip: and then get the file (change the id accordingto the output of the last result)
curl -v http://localhost:8081/api/download/zip/eefab7c1c3d72e0004f3b98440f5b13c-27xxx/name --output x2.zip

```



-----------
Dr. Processor icon from http://www.kameleon.pics/free-icons-pack.html 
