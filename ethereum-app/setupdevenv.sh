echo "not the actual setup :)"

curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
sudo apt-get install -y nodejs

sudo apt-get install -y build-essential

sudo npm install truffle@3.4.11 -g
sudo npm install ethereumjs-testrpc -g

npm install
npm install chai
