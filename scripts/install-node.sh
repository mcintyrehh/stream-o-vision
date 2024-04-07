#!/bin/bash

# update package managers
echo "Installing Package Managers"
sudo apt-get -y update
sudo apt-get -y upgrade
sudo apt-get -y upgrade --fix-missiong

# install git
echo "Installing git"
sudo apt install -y git

# make sure we have packages to access NodeSource repository
echo "Installing NodeJS"
sudo apt install -y ca-certificates curl gnupg

# set up NodeSource repository
curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | sudo gpg --dearmor -o /usr/share/keyrings/nodesource.gpg

# set node version ENV
NODE_MAJOR=20

# add NodeJS repo to raspi sources list
echo "deb [signed-by=/usr/share/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_MAJOR.x nodistro main" | sudo tee /etc/apt/sources.list.d/nodesource.list

# update sources list as it has been changed
sudo apt update

# install nodejs
sudo apt install nodejs

# confirm install
echo "NodeJS version installed: " node -v

# install add'l dev tools, necessary for npm modules that need
# compiling to support native hardware
sudo apt install build-essential