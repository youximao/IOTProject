var clock = null; // 定时器操作句柄
var state = 0; // 0初始化,1进行中, 2 暂停, 3失败
var speed = 4;

/*
* 初始化
*/
function init() {
    for(var i=0; i<4; i++) {
        crow();
    }

    $('main').onclick = function (ev) {
        judge(ev);
    }
}

function judge(ev) {
    if(state == 3) {
        alert('失败者禁入');
        return;
    }
    if(ev.target.className.indexOf('black') == -1) {

    } else {
        ev.target.className = 'cell';
        ev.target.parentNode.pass = 1;
        score();
    }
        //console.log(ev.target);
}

/*
* start() 启动
*/
function start(){
    clock = window.setInterval('move()' , 40);
}

/*
* 动画
*/
function move() {
    var con = $('container');
    var top = parseInt(window.getComputedStyle(con , null)['top']);

    if(speed + top > 0) { //一步会走过头,直接top=0
        top = 0;
    } else {
        top += speed; //调节每次下降的像素
    }

    con.style.top = top + 'px';

    // 

    if(top == 0) {
        crow();
        con.style.top = '-100px';
        drow();
    } else if(top == (-100 + speed)) {
        //console.log(con.lastChild);
        var rows = con.childNodes;
        if( (rows.length == 5) && (rows[rows.length-1].pass !== 1)) {
            fail();
        } 
    }
}

/*
* 加速函数
*/
function jiasu() {
    speed +=2;
    if(speed == 20) {
        alert('你的电脑太卡了');
    }
}

/*
* 输,结束
*/
function fail() {
    clearInterval(clock);
    state = 3;
    alert('结束');
}

/*
* 计分
*/
function score() {
    var newscore = parseInt($('score').innerHTML)+1;
    $('score').innerHTML = newscore;
    if(newscore % 10 == 0) {
        jiasu();
    }
    //var bestscore=0;
    if(localStorage.bestscore){
        bestscore = parseInt(localStorage.bestscore)
        if(bestscore<newscore){
            bestscore=newscore;
            localStorage.bestscore=bestscore;
        }
    }
    else {
    localStorage.bestscore=newscore;
    }
    $('bestscore').innerHTML ='bestscore: '+localStorage.bestscore;
}


/*
* 创建div.row
*/
function crow(){
    var con = $('container');
    var row = cdiv('row');
    var classes = createSn();

    for(var i=0; i<4; i++) {
        row.appendChild(cdiv(classes[i]));
    }


    if(con.firstChild == null) {
        con.appendChild(row);
    } else {
        con.insertBefore(row , con.firstChild);
    }
}

/*
* 删除最后一行
*/
function drow(){
    var con = $('container');
    if(con.childNodes.length == 6) {
        con.removeChild(con.lastChild);
    }
}

/**
* 创建div,className是其类名
*/
function cdiv(className) {
    var div = document.createElement('div');
    div.className = className;
    return div;
}

/**
* 返回1个数组,随机其中1个单元,值为'cell black',其他3个,皆为cell
**/
function createSn() {
    var arr = ['cell','cell','cell','cell'];
    var i = Math.floor(Math.random()*4);
    arr[i] = 'cell black';

    return arr; 
}

/*
* 按id获取对象
*/
function $(id) {
    return document.getElementById(id);
}

init();
start();