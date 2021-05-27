#!/bin/bash

cwd=$(pwd)

check_beta(){
  local check=$(ls "$cwd/beta")
  if [ check == "$cwd/beta" ]
  then
    return 1
  fi
  return 0
}

copy_www(){
  cp -r "$cwd/wwwroot" "../SoftEtherVPN/src/bin/hamcore/"
}

recompile(){
  if [ $? == "1" ]
  then
    cd "../SoftEtherVPN"
    #git submodule init git submodule update
    #./configure
    make -C build
  else
    cd "../SoftEtherVPN"
    #./configure
    make
    # make install
  fi
}

case $1 in
"stable")
  git clone "https://github.com/SoftEtherVPN/SoftEtherVPN_Stable.git" ../SoftEtherVPN
  cd "../SoftEtherVPN"
  ./configure
  make
  # make install
  cd -
  copy_www
  recompile
  ;;

"beta")
  git clone "https://github.com/SoftEtherVPN/SoftEtherVPN.git" ../SoftEtherVPN
  touch "$cwd/beta"
  cd "../SoftEtherVPN"
  git submodule init && git submodule update
  ./configure
  make -C build
  # make -C build install
  cd -
  copy_www
  recompile
  ;;

"edit")
  check_beta
  cd "../SoftEtherVPN"
  if [ $? == "1" ]
  then
    sudo ./"build/vpnserver" "stop"
  else
    sudo ./"bin/vpnserver/vpnserver" "stop"
  fi
  cd $cwd
  cd "wwwroot/admin/default/"
  dir=$(pwd)
  ls_dir=$(ls "$dir" | grep "node_modules")
  if [ "$ls_dir" != "" ]
  then
    npm run build
    cd -
    copy_www
    recompile
    cd "../SoftEtherVPN"
    if [ $? == "1" ]
    then
      sudo ./"build/vpnserver" "start"
    else
      sudo ./"bin/vpnserver/vpnserver" "start"
    fi
  else
    npm i
    npm run build
    cd -
    copy_www
    recompile
    cd "../SoftEtherVPN"
    if [ $? == "1" ]
    then
      sudo ./"build/vpnserver" "start"
    else
      sudo ./"bin/vpnserver/vpnserver" "start"
    fi
  fi
  ;;

*)
  echo "usage: $0 <stable|beta|edit>"
  ;;
esac
