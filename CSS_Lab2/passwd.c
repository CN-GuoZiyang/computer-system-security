#define _GNU_SOURCE

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <errno.h>
#include <pwd.h>
#include <sys/types.h>
#include <sys/stat.h>

void changePassword(const char* username, const char* password)
{
    extern int errno;
    printf("change %s's password to %s\n", username, password);
    FILE* fp;

    fp = fopen("aaa", "r+");
    if(errno != 0)
    {
        perror("aaa");
        return;
    }

    ssize_t bytesNum;
    size_t n = 0;
    char* line;

    while((bytesNum = getline(&line, &n, fp)) != -1)
    {
        
    }
}

int main(int argc, char const *argv[]) {
    extern int errno;

    uid_t ruid, euid, suid;
    struct passwd* userStruct;

    getresuid(&ruid, &euid, &suid);
    userStruct = getpwuid(ruid);

    printf("The user name of the ruid is %s\n", userStruct->pw_name);

    switch(argc)
    {
        case 2:
            changePassword(userStruct->pw_name, argv[1]);
            break;
        case 3:
            printf("argc = 3\n");
            if(strcmp("root", userStruct->pw_name) == 0)
            {
                changePassword(argv[1], argv[2]);
            } else
            {
                errno = EPERM;
                perror("passwd");
            }
            break;
        default:
            errno = EINVAL;
            perror("passwd");
    }

}
