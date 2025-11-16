#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>

int main() {
    setuid(0);   // escalate to root
    system("/bin/echo 'Running as root! Check PATH...'");
    system("check");
    return 0;
}
