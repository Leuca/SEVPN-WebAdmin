# SotEtherVPN AJAX-based web interface
## Installing the web UI
It is possible to try this UI by copying the wwwroot folder into a previously cloned SoftEtherVPN source code and by compliling it.<br>
In a UNIX environment should be something like this:
```
git clone *this repo*
git clone https://github.com/SoftEtherVPN/SoftEtherVPN_Stable.git
cp *this repo*/wwwroot/admin/default/ SoftEtherVPN_Stable/src/bin/hamcore/wwwroot/admin
cd SoftEtherVPN_Stable
./configure
make
sudo make install
```

or like this:

```
git clone *this repo*
git clone https://github.com/SoftEtherVPN/SoftEtherVPN.git
cp *this repo*/wwwroot/admin/default/ SoftEtherVPN/src/bin/hamcore/wwwroot/admin
cd SoftEtherVPN
./configure
make -C tml
sudo make -C tmp install
```
