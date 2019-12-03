#define _GNU_SOURCE

#include <stdio.h>
#include <unistd.h>
#include <sys/types.h>
#include <errno.h>
#include <string.h>
#include <sys/wait.h>

int main()
{
    extern int errno;

    char cwd[255];
    getcwd(cwd, sizeof(cwd));

    uid_t ruid, euid, suid;
    getresuid(&ruid, &euid, &suid);
    printf("Process Main, pid=%d\nruid=%d\neuid=%d\nsuid=%d\n", 
        getpid(), ruid, euid, suid);
    
    pid_t pid;

    // fork出一个子进程，执行fork程序
    if((pid = fork()) < 0)
    {
        char * errnoMeg = strerror(errno);
        printf("Fork fork error! %s\n", errnoMeg);
    } else if(pid == 0) 
    {
        uid_t nruid, neuid, nsuid;
        getresuid(&nruid, &neuid, &nsuid);
        printf("Process fork, pid=%d\nruid=%d\neuid=%d\nsuid=%d\n", 
            getpid(), nruid, neuid, nsuid);
        return 0;
        
    }else 
    {
        int stat_val;
        waitpid(pid, &stat_val, 0);
    }

    // fork出一个子进程，执行setuid程序
    if((pid = fork()) < 0)
    {
        char * errnoMeg = strerror(errno);
        printf("Fork process error! %s\n", errnoMeg);
    } else if(pid == 0) 
    {
        if(execl(strcat(cwd, "/setuid.o"), (char*)0) < 0)
        {
            char * errnoMeg = strerror(errno);
            printf("Invoke setuid error! %s\n", errnoMeg);
        }
    } else 
    {
        int stat_val;
        waitpid(pid, &stat_val, 0);
    }

    return 0;
}