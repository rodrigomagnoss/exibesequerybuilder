#!/bin/sh

DOCUMENT_ROOT=${DOCUMENT_ROOT:-"/var/www/localhost/htdocs"}
LOG=${LOG:-"/var/log/exibesequerybuilder/access.log"}

/usr/bin/exibesequerybuilder $DOCUMENT_ROOT --log $LOG --port 8081 --no-server-id