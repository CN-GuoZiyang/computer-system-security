#define _GNU_SOURCE

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <errno.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <sys/capability.h>
#include <sys/socket.h>

extern int errno;

void listCaps()
{
    cap_t caps = cap_get_proc();
    ssize_t y = 0;
    printf("The process was given capabilities %s\n", cap_to_text(caps, &y));
    fflush(0);
    cap_free(caps);
}

void bindSocket(int port)
{

    int server_socket = socket(AF_INET, SOCK_STREAM, 0);
    if(server_socket < 0) 
    {
        printf("Error running http service!\n");
        return;
    }

    struct sockaddr_in server_sockaddr;
    memset(&server_sockaddr, 0, sizeof(server_sockaddr));
    server_sockaddr.sin_family = AF_INET;
    server_sockaddr.sin_port = htons(port);
    server_sockaddr.sin_addr.s_addr = inet_addr("127.0.0.1");
    if ((bind(server_socket, (struct sockaddr *)&server_sockaddr, sizeof(server_sockaddr))) < 0)
    {
        printf("Error bind port %d\n", port);
    } else
    {
        printf("Bind port %d successfully!\n", port);
    }
}

int main(int argc, char const *argv[]) {
    uid_t ruid, euid, suid;
    getresuid(&ruid, &euid, &suid);
    printf("ruid=%d\neuid=%d\nsuid=%d\n", ruid, euid, suid);

    bindSocket(80);

    cap_t caps = cap_init();
    cap_value_t capList[4] = {CAP_NET_BIND_SERVICE, CAP_NET_BROADCAST, CAP_NET_ADMIN, CAP_NET_RAW};

    cap_set_flag(caps, CAP_EFFECTIVE, 4, capList, CAP_SET);
    cap_set_flag(caps, CAP_INHERITABLE, 4, capList, CAP_SET);
    cap_set_flag(caps, CAP_PERMITTED, 4, capList, CAP_SET);

    if(cap_set_proc(caps) != 0)
    {
        perror("capset");
        return -1;
    }

    listCaps();

    bindSocket(81);

    printf("dropping caps\n");
    cap_clear(caps);
    if(cap_set_proc(caps) != 0)
    {
        perror("capset");
        return -1;
    }
    listCaps();
    cap_free(caps);

    bindSocket(82);

    return 0;
}
