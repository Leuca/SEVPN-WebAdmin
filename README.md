# SotEtherVPN AJAX-based web interface
## Installing the web UI
It is possible to try this UI by copying the ```wwwroot``` folder into a previously cloned SoftEtherVPN source code and by compliling it.<br>
In a UNIX environment should be something like this:
```bash
git clone https://github.com/Leuca/SotEtherVPN-Web-UI.git
git clone https://github.com/SoftEtherVPN/SoftEtherVPN_Stable.git
cp SotEtherVPN-Web-UI/wwwroot/admin/default/ SoftEtherVPN_Stable/src/bin/hamcore/wwwroot/admin
cd SoftEtherVPN_Stable
./configure
make
sudo make install
```

or like this:

```bash
git clone https://github.com/Leuca/SotEtherVPN-Web-UI.git
git clone https://github.com/SoftEtherVPN/SoftEtherVPN.git
cp SotEtherVPN-Web-UI/wwwroot/admin/default/ SoftEtherVPN/src/bin/hamcore/wwwroot/admin
cd SoftEtherVPN
git submodule init && git submodule update
./configure
make -C tml
sudo make -C tmp install
```
