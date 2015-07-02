#!/bin/bash

php_config_file="/etc/php5/fpm/php.ini"
nginx_config_file="/etc/nginx/nginx.conf"
mysql_config_file="/etc/mysql/my.cnf"

domain=cronometrei.com.br
rootpass=asdfasdf
mysqldb=cronometrei
mysqluser=cronometrei
mysqlpass=AnBwcm4a5z89589x
compassfolder=/vagrant/

# Update the server
apt-get update
apt-get -y upgrade

if [[ -e /var/lock/vagrant-provision ]]; then
    exit;
fi

################################################################################
# Everything below this line should only need to be done once
# To re-run full provisioning, delete /var/lock/vagrant-provision and run
#
#    $ vagrant provision
#
# From the host machine
################################################################################

IPADDR=$(/sbin/ifconfig eth0 | awk '/inet / { print $2 }' | sed 's/addr://')
sed -i "s/^${IPADDR}.*//" /etc/hosts
echo $IPADDR ubuntu.localhost >> /etc/hosts			# Just to quiet down some error messages

sudo debconf-set-selections <<< "mysql-server mysql-server/root_password password $rootpass"
sudo debconf-set-selections <<< "mysql-server mysql-server/root_password_again password $rootpass"

# Install basic tools
apt-get -y install build-essential binutils-doc git
apt-get -y install nginx
apt-get -y install mysql-server
apt-get -y install php5-fpm php5-mysql php5-cli
apt-get -y install unzip
apt-get -y install ruby-compass

# install phpmyadmin
if [ ! -d /vagrant/pma ]; then
	cd /tmp
	wget -O ./pma.zip -q http://downloads.sourceforge.net/project/phpmyadmin/phpMyAdmin/4.3.11.1/phpMyAdmin-4.3.11.1-all-languages.zip
	unzip *.zip
	mv ./phpMyAdmin-4.3.11.1-all-languages /vagrant/pma
fi

# config pma to access dbase
echo "<?php
\$cfg['blowfish_secret'] = '';
\$i = 0;
\$i++;
\$cfg['Servers'][\$i]['auth_type'] 	= 'config';
\$cfg['Servers'][\$i]['user']         = '$mysqluser';  
\$cfg['Servers'][\$i]['password']     = '$mysqlpass';
\$cfg['Servers'][\$i]['host'] 		= 'localhost';
\$cfg['Servers'][\$i]['connect_type'] = 'tcp';
\$cfg['Servers'][\$i]['compress'] 	= false;
\$cfg['Servers'][\$i]['AllowNoPassword'] = false;
\$cfg['UploadDir'] = '';
\$cfg['SaveDir'] = '';
?>" > /vagrant/pma/config.inc.php

sed -i "s/;cgi.fix_pathinfo=1/cgi.fix_pathinfo=0/g" ${php_config_file}
sed -i "s/sendfile on/sendfile off/g" ${nginx_config_file}

sed -i "s/bind-address\s*=\s*127.0.0.1/bind-address = 0.0.0.0/" ${mysql_config_file}

# Allow root access from any host
echo "GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' IDENTIFIED BY 'root' WITH GRANT OPTION" | mysql -u root --password=$rootpass
echo "GRANT PROXY ON ''@'' TO 'root'@'%' WITH GRANT OPTION" | mysql -u root --password=$rootpass

# setup mysql user
echo "CREATE USER '$mysqluser'@'localhost' IDENTIFIED BY '$mysqlpass'" | mysql -uroot -p$rootpass
echo "CREATE DATABASE $mysqldb" | mysql -u root -p$rootpass
echo "GRANT ALL ON $mysqldb.* TO '$mysqluser'@'localhost'" | mysql -uroot -p$rootpass
echo "flush privileges" | mysql -u root -p$rootpass

mkdir /etc/nginx/global

echo "
listen 80;
index index.php index.html index.htm;

location = /favicon.ico {
	log_not_found off;
	access_log off;
}

location = /robots.txt {
	allow all;
	log_not_found off;
	access_log off;
}

# ESSENTIAL : Configure 404 Pages
error_page 404 /404.html;

# ESSENTIAL : Configure 50x Pages
error_page 500 502 503 504 /50x.html;
location = /50x.html {
	root /usr/share/nginx/www;
}

# SECURITY : Deny all attempts to access hidden files .abcde
location ~ /\. {
	deny all;
}

# PERFORMANCE : Set expires headers for static files and turn off logging.
location ~* ^.+\.(js|css|swf|xml|txt|ogg|ogv|svg|svgz|eot|otf|woff|woff2|mp4|ttf|rss|atom|jpg|jpeg|gif|png|ico|zip|tgz|gz|rar|bz2|doc|xls|exe|ppt|tar|mid|midi|wav|bmp|rtf)\$ {
	access_log off; log_not_found off; expires 30d;
	add_header Access-Control-Allow-Origin *;
}" > /etc/nginx/global/common.conf


echo "#SIMPLE php site
location / {
	try_files \$uri \$uri/ =404;
}
location ~ \.php\$ {
	fastcgi_split_path_info ^(.+\.php)(/.+)\$;
	fastcgi_pass unix:/var/run/php5-fpm.sock;
	fastcgi_index index.php;
	include fastcgi_params;
}" > /etc/nginx/global/simple.conf


echo "# CODEIGNITER : Rewrite rules, sends everything through index.php and keeps the appended query string intact
location / {
	try_files \$uri \$uri/ /index.php;
}
location ~ \.php\$ {
	fastcgi_split_path_info ^(.+\.php)(/.+)\$;
	fastcgi_pass unix:/var/run/php5-fpm.sock;
	fastcgi_index index.php;
	include fastcgi_params;
}" > /etc/nginx/global/codeigniter.conf


echo "# WORDPRESS : Rewrite rules, sends everything through index.php and keeps the appended query string intact
location / {
	try_files \$uri \$uri/ /index.php?q=\$uri&\$args;
}

# SECURITY : Deny all attempts to access PHP Files in the uploads directory
location ~* /(?:uploads|files)/.*\.php\$ {
	deny all;
}

# REQUIREMENTS : Enable PHP Support
location ~ \.php\$ {

	# SECURITY : Zero day Exploit Protection
	try_files \$uri =404;

	# ENABLE : Enable PHP, listen fpm sock
	fastcgi_split_path_info ^(.+\.php)(/.+)\$;
	fastcgi_pass unix:/var/run/php5-fpm.sock;
	fastcgi_index index.php;
	include fastcgi_params;
}

# PLUGINS : Enable Rewrite Rules for Yoast SEO SiteMap
rewrite ^/sitemap_index\.xml\$ /index.php?sitemap=1 last;
rewrite ^/([^/]+?)-sitemap([0-9]+)?\.xml\$ /index.php?sitemap=\$1&sitemap_n=\$2 last;
" > /etc/nginx/global/wordpress.conf


echo "# WORDPRESS MULTISITE Rewrite rules.
if (!-e \$request_filename) {
	rewrite /wp-admin\$ \$scheme://\$host\$uri/ permanent;
	rewrite ^/[_0-9a-zA-Z-]+(/wp-.*) \$1 last;
	rewrite ^/[_0-9a-zA-Z-]+(/.*\.php)\$ \$1 last;
}" > /etc/nginx/global/wpmultisite.conf



# CREATING WEB SITES

echo "server {
	server_name db.$domain;
	root /vagrant/pma;
	access_log /var/log/nginx/pma.access.log;
	error_log /var/log/nginx/pma.error.log;
	include global/common.conf;
	include global/simple.conf;
}" > /etc/nginx/sites-available/pma

echo "server {
	server_name $domain dev.$domain;
	root /vagrant/app;
	access_log /var/log/nginx/cronometrei.access.log;
	error_log /var/log/nginx/cronometrei.error.log;
	include global/common.conf;
	include global/simple.conf;
}" > /etc/nginx/sites-available/application


ln -s /etc/nginx/sites-available/pma /etc/nginx/sites-enabled/pma
ln -s /etc/nginx/sites-available/statics /etc/nginx/sites-enabled/statics
ln -s /etc/nginx/sites-available/application /etc/nginx/sites-enabled/application


# Restart Services
service nginx restart
service mysql restart


# if mysqldump file exists, run it
if [ -f /vagrant/sql/mysqldump.sql ]; then
    mysql -u root -p$rootpass $mysqldb < /vagrant/sql/mysqldump.sql
fi

# OPTIONAL: uncomment to dump mysql every 10 minutes
echo "*/10 * * * * mysqldump --user=$mysqluser -p$mysqlpass $mysqldb > /vagrant/sql/mysqldump.sql" | crontab

# Install Composer and run it
cd ~
curl -s http://getcomposer.org/installer | php
mv composer.phar /usr/local/bin/composer

cd /vagrant/app
composer update

cd /vagrant/static
composer update

touch /var/lock/vagrant-provision
