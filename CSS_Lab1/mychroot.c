#define _GNU_SOURCE

#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <sys/types.h>
#include <sys/stat.h>

int main()
{
    uid_t ruid, euid, suid;
    getresuid(&ruid, &euid, &suid);
    printf("Before chroot:\nruid=%d\neuid=%d\nsuid=%d\n", ruid, euid, suid);
    printf("change dir\n");
    chdir("/home/ziyang/chroot");
    printf("Change root\n");
    if(chroot("/home/ziyang/chroot") == 0) {
        printf("change root succeed!\n");
    } else
    {
        printf("Change root error!\n");
        return 1;
    }
    printf("After chroot:\nruid=%d\neuid=%d\nsuid=%d\n", ruid, euid, suid);
    setresuid(ruid, ruid, ruid);
    getresuid(&ruid, &euid, &suid);
    printf("After cancel permission:\nruid=%d\neuid=%d\nsuid=%d\n", ruid, euid, suid);
    execlp("ls", "ls", (char*)0);
    return 0;
}