#!/bin/bash

echo "请在源文件所在目录执行此脚本"
echo "获取root密码"
sudo echo "获取成功"

sudo gcc passwd.c -o passwd
sudo chmod 4711 ./passwd

sudo chown root:root aaa
sudo chmod 600 ./aaa

sudo gcc capset.c -o capset -lcap
sudo chmod 4711 capset
