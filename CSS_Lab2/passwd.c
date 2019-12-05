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
    long line_start = ftell(fp);
    while((bytesNum = getline(&line, &n, fp)) != -1)
    {
        if(strlen(line) == 0)
        {
            continue;
        }
        char* currentLineUser = strsep(&line, " ");
        if(strcmp(username, currentLineUser) == 0)
        {
            char after[1024] = {0};
            int c = 0;
            while(!feof(fp))
            {
                after[c] = fgetc(fp);
                c ++;
            }
            if(c != 0)
            {
                after[c - 1] = '\0';
            }
            fseek(fp, line_start, SEEK_SET);
            fprintf(fp, "%s %s\n", username, password);
            if(c != 0)
            {
                fprintf(fp, "%s", after);
            }
            long total_length = ftell(fp);
            int fd = fileno(fp);
            if(ftruncate(fd, total_length))
            {
                perror("passwd");
            }
            fclose(fp);
            return;
        }
        line_start = ftell(fp);
    }
    printf("passwd: No such user!");
    return;
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
