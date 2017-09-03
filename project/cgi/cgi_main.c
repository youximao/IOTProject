#include<stdio.h>
#include<stdlib.h>
#include<string.h>
#include <signal.h>
#include <unistd.h>
#include <stdio.h>
#include <fcntl.h>
#include <stdlib.h>
#include <sys/ioctl.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <sys/time.h>
#include <sys/mman.h>
#include <signal.h>
#include <errno.h>
#include <string.h>
#include <time.h>
#include <ctype.h>
#include <termios.h>

#include <stddef.h>
#include <syslog.h>
#include"cgic.h"

#include "pthread.h"
#include "pwm_music.h"

#define      TRUE   1
#define      FALSE  0


static int led_fd;
static int pwm_fd;


int main(){
	printf("Content-Type:text/html\n\n");
	//-----LED CONTROL----//
	
	int div;
	int i;
	led_fd=open("/dev/cled",O_RDWR);//open led dev
	pwm_fd=open("/dev/pwm",O_RDWR|O_NONBLOCK);//open pwm dev
	if(led_fd<0)
	{
		printf("Can't open\n");
		return -1;
	}
	else
	{
		printf("open OK 11%d\n", led_fd);
	}
	if(pwm_fd<0)
	{
		printf("Can't open\n");
		return -1;
	}
	else
	{
		printf("open OK pwm%x\n", pwm_fd);
	}
	char *data;
	char buff[2];
	data=getenv("QUERY_STRING");
	if(sscanf(data,"%s",buff)==-1)
	{
		printf("jiajunlongshigedashabi");
		return 1;
	}
	
		switch(buff[0]){
		case '0':
			ioctl(led_fd,0,0);
			break;
                case '1':
                        ioctl(led_fd,0,1);
			break;
		case '2':
                        ioctl(led_fd,0,0x3);
			break;
		case '3':
                        ioctl(led_fd,0,0x7);
			break;
		case '4':
                        ioctl(led_fd,0,0xf);
			break;
		case '5':
                        ioctl(led_fd,0,0x1F);
			break;
		case '6':
                        ioctl(led_fd,0,0x3F);
			break;
		case '7':
                        ioctl(led_fd,0,0x7F);
			break;
		case '8':
                        ioctl(led_fd,0,0xFF);
			break;
		case '9':
			printf("newsong\n");
                        for(i = 0;i<sizeof(newsong)/sizeof(Note);i++ )
			{
			div = (PCLK/256/16)/(newsong[i].pitch);
			ioctl(pwm_fd, 1, div);
			}
			break;
		case 'a':
			printf("MumIsTheBestInTheWorld\n");
                        for(i = 0;i<sizeof(MumIsTheBestInTheWorld)/sizeof(Note);i++ )
			{
			div = (PCLK/256/16)/(MumIsTheBestInTheWorld[i].pitch);
			ioctl(pwm_fd, 1, div);
			usleep(MumIsTheBestInTheWorld[i].dimation * 50); 
			}
			break;
		case 'b':
			printf("GreatlyLongNow\n");
                        for(i = 0;i<sizeof(GreatlyLongNow)/sizeof(Note);i++ )
			{
			div = (PCLK/256/16)/(GreatlyLongNow[i].pitch);
			ioctl(pwm_fd, 1, div);
			usleep(GreatlyLongNow[i].dimation * 50); 
			}
			break;
		case 'c':
			ioctl(pwm_fd,0);
			break;
		
		default:
			printf("Please entry correct command!\n");
			return 0;
		}

	puts(data);
	printf("HELLO CGI!");
	return 0;}
