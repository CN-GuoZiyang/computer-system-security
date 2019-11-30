#define _GNU_SOURCE

#include <stdio.h>
#include <unistd.h>
#include <sys/types.h>
#include <errno.h>
#include <string.h>
#include <sys/wait.h>

// 该程序设置了setuid位
int main()
{
    extern int errno;

    char cwd[255];
    getcwd(cwd, sizeof(cwd));

    uid_t ruid, euid, suid;
    getresuid(&ruid, &euid, &suid);
    printf("Process setuid，pid=%d\nruid=%d\neuid=%d\nsuid=%d\n", 
        getpid(), ruid, euid, suid);
    pid_t pid;
    char httpServicePid[10];
    // fork出一个子进程，执行httpService程序（root-only）
    if((pid = fork()) < 0)
    {
        char* errnoMeg = strerror(errno);
        printf("Fork process error! %s\n", errnoMeg);
    } else if(pid == 0) 
    {
        if(execl(strcat(cwd, "/httpService.o"), (char*)0) < 0)
        {
            char* errnoMeg = strerror(errno);
            printf("Invoke httpService error! %s\n", errnoMeg);
        }
    } else
    {
        sprintf(httpServicePid, "%d", pid);
    }

    //临时放弃权限
    setresuid(ruid, ruid, euid);
    printf("Revoke permission temporarily\n");
    getresuid(&ruid, &euid, &suid);
    printf("ruid=%d\neuid=%d\nsuid=%d\n", ruid, euid, suid);

    // 创建新进程用两种方式调用echo检查函数参数
    // 使用execl方式
    if((pid = fork()) < 0)
    {
        char* errnoMeg = strerror(errno);
        printf("Fork echo error! %s\n", errnoMeg);
    } else if(pid == 0) 
    {
        if(execl(strcat(cwd, "/echo.o"), "ziyang", (char*)0) < 0)
        {
            char* errnoMeg = strerror(errno);
            printf("Invoke echo error! %s\n", errnoMeg);
        }
    } else 
    {
        int stat_val;
        waitpid(pid, &stat_val, 0);
    }

    // 使用execle方式
    if((pid = fork()) < 0)
    {
        char* errnoMeg = strerror(errno);
        printf("Fork echo error! %s\n", errnoMeg);
    } else if(pid == 0) 
    {
        // 定义环境变量
        char* env[] = {"USER=ziyang", "PATH=/home/ziyang/Documents/computer-system-security", (char*)0};
        if(execle(strcat(cwd, "/echo.o"), "ziyang", (char*)0, env) < 0)
        {
            char* errnoMeg = strerror(errno);
            printf("Invoke echo error! %s\n", errnoMeg);
        }
    } else 
    {
        int stat_val;
        waitpid(pid, &stat_val, 0);
    }

    // 恢复用户权限
    setresuid(ruid, suid, suid);
    printf("Restore permission \n");
    getresuid(&ruid, &euid, &suid);
    printf("ruid=%d\neuid=%d\nsuid=%d\n", ruid, euid, suid);

    // 调用kill杀死httpService
    if((pid = fork()) < 0)
    {
        char* errnoMeg = strerror(errno);
        printf("Fork kill error! %s\n", errnoMeg);
    } else if(pid == 0) 
    {
        // 原始环境变量太长，使用较短的替换
        if(execle(strcat(cwd, "/kill.o"), "", httpServicePid, (char*)0) < 0)
        {
            char* errnoMeg = strerror(errno);
            printf("Invoke kill error! %s\n", errnoMeg);
        }
    } else 
    {
        int stat_val;
        waitpid(pid, &stat_val, 0);
    }

    // 永久放弃权限
    setresuid(ruid, ruid, ruid);
    printf("Revoke permission permanently\n");
    getresuid(&ruid, &euid, &suid);
    printf("ruid=%d\neuid=%d\nsuid=%d\n", ruid, euid, suid);

    return 0;
}