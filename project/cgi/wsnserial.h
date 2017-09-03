#ifndef __A_H
#define __A_H
#define FALSE		0
#define TRUE		1

#define WORDLEN		32		//其他名称长度32字节（16个汉字）

struct serial_config
{
	unsigned char serial_dev[WORDLEN];
	unsigned int serial_speed;
	unsigned char databits;
	unsigned char stopbits;
	unsigned char parity;
};

void csb();
#endif
