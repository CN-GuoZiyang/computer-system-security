#define _GNU_SOURCE

#include <stdio.h>
#include <unistd.h>
#include <sys/types.h>

// 该程序仅允许root用户执行
int main()
{
    uid_t ruid, euid, suid;
    getresuid(&ruid, &euid, &suid);
    printf("Process http，pid=%d\nruid=%d\neuid=%d\nsuid=%d\n", 
        getpid(), ruid, euid, suid);
    while(1)
    {
        printf("a root-only http service...\n");
        sleep(2);
    }
    return 0;
}