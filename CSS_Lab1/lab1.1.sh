# /bin/sh

echo "请在源文件所在目录执行此脚本"
echo "获取root密码"
sudo echo "获取成功"

chmod 644 流星雨.txt

gcc cal.c -o cal.exe
chmod a+x cal.exe

chmod 664 demo.txt

cp ./cal.exe ./netmonitor.exe
chmod 4711 netmonitor

gcc main1.c -o main1
gcc fork.c -o fork

sudo gcc setuid.c -o setuid
sudo chmod 4711 setuid

sudo gcc httpService.c -o httpService
sudo chmod 700 httpService

gcc echo.c -o ./echo

sudo gcc kill.c -o ./kill
sudo chmod 700 ./kill

echo "各文件编译完成，请在本目录下执行main1"