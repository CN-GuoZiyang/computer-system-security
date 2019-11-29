# /bin/sh

echo "请在源文件所在目录执行此脚本"
echo "获取root密码："
sudo echo "获取成功"

gcc main1.c -o main1
gcc fork.c -o fork

sudo gcc setuid.c -o setuid
sudo chmod 4755 setuid

sudo gcc httpService.c -o httpService
sudo chmod 744 httpService

gcc echo.c -o echo

sudo gcc kill.c -o kill
sudo chmod 744 kill

echo "各文件编译完成，请在本目录下执行main1"