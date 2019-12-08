#define _GNU_SOURCE

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <errno.h>
#include <pwd.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <sys/capability.h>

extern int errno;

void listCaps()
{
    cap_t caps = cap_get_proc();
    ssize_t y = 0;
    printf("The process was given capabilities %s\n", cap_to_text(caps, &y));
    fflush(0);
    cap_free(caps);
}

int main(int argc, char const *argv[]) {
    uid_t ruid, euid, suid;
    getresuid(&ruid, &euid, &suid);
    printf("ruid=%d\neuid=%d\nsuid=%d\n", ruid, euid, suid);

    cap_t caps = cap_init();
    cap_value_t capList[5] = {CAP_NET_RAW, CAP_NET_BIND_SERVICE, CAP_SETUID, CAP_SETGID, CAP_SETPCAP};

    cap_set_flag(caps, CAP_EFFECTIVE, 5, capList, CAP_SET);
    cap_set_flag(caps, CAP_INHERITABLE, 5, capList, CAP_SET);
    cap_set_flag(caps, CAP_PERMITTED, 5, capList, CAP_SET);

    if(cap_set_proc(caps) != 0)
    {
        perror("capset");
        return -1;
    }

    listCaps();

    printf("dropping caps\n");
    cap_clear(caps);
    if(cap_set_proc(caps) != 0)
    {
        perror("capset");
        return -1;
    }
    listCaps();
    cap_free(caps);

    return 0;
}
