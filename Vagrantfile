# -*- mode: ruby -*-
# vi: set ft=ruby :

# All Vagrant configuration is done below. The "2" in Vagrant.configure
# configures the configuration version (we support older styles for
# backwards compatibility). Please don't change it unless you know what
# you're doing.

Vagrant.configure("2") do |config|

  config.vm.box = "ubuntu/trusty64"

  config.vm.synced_folder "./", "/vagrant", id: "vagrant-root", owner: "www-data", group: "www-data", mount_options: ["dmode=775,fmode=664"]

  config.vm.provider "virtualbox" do |vb|
    vb.name = "Cronometrei"
    vb.gui = false
    vb.customize ["modifyvm", :id, "--memory", "1024"]
  end

  config.vm.define :web do |web_config|
    web_config.vm.network "private_network", ip: "192.168.33.133"
    web_config.vm.hostname = "dev.cronometrei.com.br"
    web_config.vm.provision "shell", path: "provision.sh"
    web_config.vm.provision "shell", run: "always", path: "startup.sh"
  end

end
