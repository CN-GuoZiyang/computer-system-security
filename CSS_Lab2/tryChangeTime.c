#include <stdio.h>
#include <unistd.h>
#include <sys/time.h>
#include <sys/types.h>
#include <sys/wait.h>

int main()
{
    pid_t pid;
    while(1)
    {
        sleep(1);
        
        if((pid = fork()) == 0)
        {
            execlp("date", "date", "-s", "2020-6-9", (int *)0);
            return 0;
        } else 
        {
            int stat_val;
            waitpid(pid, &stat_val, 0);
        }
    }
}
