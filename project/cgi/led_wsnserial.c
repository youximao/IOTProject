#include <sys/types.h>
#include <sys/stat.h>
#include <sys/time.h>
#include <sys/mman.h>
#include <sys/ioctl.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <signal.h>
#include <errno.h>
#include <fcntl.h>
#include <termios.h>
#include <errno.h>
#include <ctype.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <syslog.h>
#include <time.h>
#include <unistd.h>
#include"pthread.h"

#include <stddef.h>

#include "wsnserial.h"
#include"cgic.h"


#define LED 1
#define PWM 0
#define SEG 0
#define STEPPER_START 0
#define STEPPER_STOP 1
#define DCMOTOR_START	0
#define DCMOTOR_STOP 0

int nread=0;
char Recbuff[1024];
int sRecDataLen = 0;

char save_byte4;
char save_byte5;

pthread_mutex_t mutex;
int buffer_has_item =0;
int buffer_has_send =0;
int SendNum = 0;
static int ligvalue=0;//STORE THE VALUE OF WSN
static int csbvalue=0;
int num;

struct serial_config serialread;

static int serial_fd;

int speed_arr[] = {B230400, B115200, B57600, B38400, B19200, B9600, B4800, B2400, B1200, B300,
		   B38400, B19200, B9600, B4800, B2400, B1200, B300};

int name_arr[] = {230400, 115200, 57600, 38400, 19200, 9600, 4800, 2400, 1200, 300,
		  38400, 19200, 9600, 4800, 2400, 1200, 300};

//-----------------------------------------------

void set_speed(int fd,int speed)
{
	int i;
	int status;
	struct termios Opt;
	//struct termios oldOpt;
	tcgetattr(fd, &Opt);
//	printf("serialread.speed is %d\n",serialread.serial_speed);
	for( i = 0; i < sizeof(speed_arr)/sizeof(int); i++)
	{
		if(speed == name_arr[i])
		{
			tcflush(fd, TCIOFLUSH);
			cfsetispeed(&Opt, speed_arr[i]);
			cfsetospeed(&Opt, speed_arr[i]);
			status = tcsetattr(fd, TCSANOW, &Opt);
			if(status != 0)
				perror("tcsetattr fd1");
				return;
		}
		tcflush(fd, TCIOFLUSH);
	}
}

int set_Parity(int fd,int databits,int stopbits,int parity)
{
	struct termios options;
	//struct termios oldoptions;
	if(tcgetattr(fd, &options) != 0)
	{
		perror("SetupSerial 1");
		return(FALSE);
	}

	//options.c_cflag |= (CLOCAL|CREAD);
	options.c_cflag &=~CSIZE;
//	printf("serialread.databits is %d\n",serialread.databits);
	switch(databits)
	{
		case 7:
			options.c_cflag |= CS7;
			break;
		case 8:
			options.c_cflag |= CS8;
			break;
		default:
			fprintf(stderr,"Unsupported data size\n");
			return(FALSE);
	}
//	printf("serialread.parity is %c\n",serialread.parity);
	switch(parity)
	{
		case 'n':
		case 'N':
			options.c_cflag &= ~PARENB;
			options.c_iflag &= ~INPCK;
			break;
		case 'o':
		case 'O':
			options.c_cflag |= (PARODD | PARENB);
			options.c_iflag |= INPCK;
			break;
		case 'e':
		case 'E':
			options.c_cflag |= PARENB;
			options.c_cflag &= ~PARODD;
			options.c_iflag |= INPCK;
			break;
		case 'S':
		case 's':  /*as no parity*/
			options.c_cflag &= ~PARENB;
			options.c_cflag &= ~CSTOPB;
			break;
		default:
			fprintf(stderr, "Unsupported parity\n");
			return(FALSE);
	}
//	printf("serialread.stopbits is %d\n",serialread.stopbits);
	switch(stopbits)
	{
		case 1:
			options.c_cflag &= ~CSTOPB;
			break;
		case 2:
			options.c_cflag |= CSTOPB;
			break;
		default:
			fprintf(stderr,"Unsupported stop bits\n");
			return(FALSE);
	}
	if(parity != 'n'&& parity != 'N')
		options.c_iflag |= INPCK;

	options.c_cflag &= ~CRTSCTS;
	options.c_iflag &= ~IXOFF;
	options.c_iflag &= ~IXON;
	if(parity != 'n'&& parity != 'N')
                options.c_iflag |= INPCK;
	tcflush(fd, TCIOFLUSH);
	
//	options.c_iflag |= IGNPAR|ICRNL;
	options.c_lflag &= ~(ICANON|ECHO|ECHOE|ISIG);
//	options.c_oflag |= OPOST; 
	options.c_oflag &= ~OPOST;
	options.c_iflag &= ~(ICRNL|IGNCR); 
//	options.c_iflag &= ~(IXON|IXOFF|IXANY);
	options.c_cc[VTIME] = 0;        //150;                  //15 seconds
        options.c_cc[VMIN] = 0;

	tcflush(fd, TCIFLUSH);
	if(tcsetattr(fd, TCSANOW, &options) != 0)
	{
		perror("SetupSerial 3");
		return(FALSE);
	}
	return(TRUE);
}

int OpenDev(char *Dev)
{
	int fd = open(Dev, O_RDWR);
	if(-1 == fd)
	{
		perror("Can't Open Serial Port");
		return -1;
	}
	else
		return fd;
}
int serial_init(void)
{
	char *Dev = "/dev/s3c2410_serial1";

	int i;

	serial_fd = OpenDev(Dev);

	if(serial_fd > 0)
		set_speed(serial_fd,115200);
	else
	{
		printf("Can't Open Serial Port!\n");
		exit(0);
	}
	if(set_Parity(serial_fd,8,1,'N') == FALSE)
	{
		printf("Set parity Error\n");
		exit(1);
	}
	return 0;
}

float ScanADdata(char byte9)
{
	float ADdata;
	if(byte9 > 0xf0)
		ADdata = 0;
	else if(byte9 > 0x80)
		ADdata = 3.3;
	else 
		ADdata = (3.3/127)*byte9;
	
	return ADdata;
}


int ultrasonicData(char byte11)
{
	int ultrasonicData;
	
	ultrasonicData = 5.44*byte11;
	
	return ultrasonicData;
}

void * fbl_malloc(int len, char * str)
{
	void * ptr = malloc(len);
	if(ptr == 0)
		printf("%s Failed (len = %d)!!!\n", str, len);
	return ptr;
}

char XorVerify(char BytesCMD[])
{
	char checksum = BytesCMD[1];
	int i;
	for (i = 1; i < BytesCMD[1]+1; i++)
	{
		checksum ^= BytesCMD[i+1];
	}
	return checksum;
}
	
void scan()
{
	int source_addr,father_addr;
	char byte4,byte5,byte6,byte7,byte8,byte9,byte10,byte11,byte12,byte13,byte14,byte15,byte16,byte17,byte18,byte19;
	char test,byteCheck;
	char PacketBuff[50];
	int PacketLen;
	
	struct wsn_comm_pkg *pkt = 0;
	if(sRecDataLen > 0)
	{
		//printf("sRecDataLen : %d\n",sRecDataLen);
		int sFirstPosition = 0;
		while(sFirstPosition < sRecDataLen)
		{
			//printf("sFirstPosition: %d\n",sFirstPosition);
			if(Recbuff[sFirstPosition] == 0x2)
			{
				PacketLen = Recbuff[sFirstPosition + 1]+3;
				//printf("PacketLen : %d\n",PacketLen);
				if(PacketLen <= sRecDataLen -sFirstPosition)
				{
					
					printf("PacketBuff=");
					int i;
					
					for(i = 0; i < PacketLen; i++){
						PacketBuff[i] = Recbuff[sFirstPosition + i];
						printf("%02x ",PacketBuff[i]);
					}
					printf("\n");
					
					if(PacketBuff[7]==0x1){		
						byte10 = PacketBuff[10];
	
						byte11 = PacketBuff[11];
						byte12 = PacketBuff[12];
						byte13 = PacketBuff[13];
						byte14 = PacketBuff[14];
						byte15 = PacketBuff[15];
						byte16 = PacketBuff[16];
						byte17 = PacketBuff[17];
						byte18 = PacketBuff[18];
	
						if((byte10 & 0x7)==0x0)
						{
							ligvalue=byte16;
							printf("light=%d\n ",ligvalue);
						}
						num=0;
	
	if(ligvalue<45)
		num=1;
	else if(ligvalue<50)
			num=2;
		else if(ligvalue<55)
				num=3;
			else if(ligvalue<65)
					num=4;
				else if(ligvalue<80)
						num=5;
					else if(ligvalue<95)
							num=6;
						else num=7;
					
					}
					int fd_cled=-1;
	fd_cled=OpenDev("/dev/cled");
	switch(num)
	{
		case 1:
			ioctl(fd_cled,0,0x3F);break;	//6
		case 2:
			ioctl(fd_cled,0,0x1F);break;	//5
		case 3:
			ioctl(fd_cled,0,0x0F);break;	//4
		case 4:
			ioctl(fd_cled,0,0x07);break;
		case 5:
			ioctl(fd_cled,0,0x03);break;
		case 6:
			ioctl(fd_cled,0,0x01);break;
		default:
			ioctl(fd_cled,0,0x00);break;
	}	
					
					for(i = 0; i < sRecDataLen - sFirstPosition - PacketLen; i++)
					{
						Recbuff[i] = Recbuff[sFirstPosition + PacketLen+i];
					}
					sRecDataLen -= PacketLen + sFirstPosition;
				}
				
				return;
			}
			else
			{
				sFirstPosition++;
			}
		}
		sRecDataLen = 0;
	}
}

void serial_rw()
{
	int i;
	char buff[1024];
	
	
	while(1){
		pthread_mutex_lock(&mutex);
		if((nread = read(serial_fd,buff,1024))>0)
		{
			buff[nread] = '\0';			

			//printf("\nrecv:%d\n",nread);
			//printf("nread=");
			for(i=0;i<nread;i++)
			{
				//printf("0x%02x ",buff[i]);
				Recbuff[sRecDataLen + i] = buff[i];
			}
			printf("\n");
			sRecDataLen = sRecDataLen + nread;
			scan();
		}
		pthread_mutex_unlock(&mutex);
	
	}
}




int main()
{
	serial_init();
	serial_rw();
	return 0;
}
