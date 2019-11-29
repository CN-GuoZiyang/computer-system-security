#define _GNU_SOURCE

#include <stdio.h>
#include <unistd.h>
#include <sys/types.h>
#include <errno.h>

int main()
{
    extern int errno;
    uid_t ruid, euid, suid;
    getresuid(&ruid, &euid, &suid);
    printf("Process fork, pid=%d\nruid=%d\neuid=%d\nsuid=%d\n", 
        getpid(), ruid, euid, suid);
}