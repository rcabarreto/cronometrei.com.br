#!/bin/bash

domain=cronometrei.com.br
rootpass=asdfasdf
mysqldb=cronometrei
mysqluser=cronometrei
mysqlpass=AnBwcm4a5z89589x
compassfolder=/vagrant/

if [ -f /vagrant/sql/mysqldump.sql ]; then
	mysql -u root -p$rootpass $mysqldb < /vagrant/sql/mysqldump.sql
fi

cd $compassfolder
compass watch --poll -q &
