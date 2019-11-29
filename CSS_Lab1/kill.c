#include <stdio.h>
#include <unistd.h>
#include <string.h>
#include <stdlib.h>

int main(int argc, char* argv[])
{
    printf("Process kill, kill httpService\n");
    char cmd[100];
    strcpy(cmd, "kill -9 ");
    strcat(cmd, argv[1]);
    printf("Invoke command: ");
    printf(cmd);
    printf("\n");
    system(cmd);
    return 0;
}