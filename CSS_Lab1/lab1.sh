#!/bin/sh

echo "请在源文件所在目录执行此脚本"
echo "获取root密码"
sudo echo "获取成功"

chmod 644 流星雨.txt

gcc cal.c -o cal.exe
chmod a+x cal.exe

chmod 664 demo.txt

cp cal.exe netmonitor.exe
chmod 4711 netmonitor.exe

gcc main1.c -o main1.o

sudo gcc setuid.c -o setuid.o
sudo chmod 4711 setuid.o

sudo gcc httpService.c -o httpService.o
sudo chmod 700 httpService.o

gcc echo.c -o echo.o

sudo gcc kill.c -o kill.o
sudo chmod 700 kill.o

sudo gcc mychroot.c -o mychroot.o
sudo chmod 4711 mychroot.o

echo "各文件编译完成，请在本目录下执行main1.o"
