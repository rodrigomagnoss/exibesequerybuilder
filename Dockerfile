FROM alpine:3.3
MAINTAINER Rodrigo Magno Santos Souza <rodrigo.santos@castgroup.com.br> - Cast group - DCSP
LABEL Rodrigo Magno Santos Souza <rodrigo.santos@castgroup.com.br> - Cast group - DCSP

run apk add --update darkhttpd && rm -rf /var/cache/apk/*

ADD index.html /var/www/localhost/htdocs/index.html


EXPOSE 80
