



//17.4.2目前问题，触摸屏按错不gameover，待改
//17.4.3目前问题，已加入audio函数，需导入更多声音
    var bBlocks=[];
    var isPC=false;
    var blocks=[];  //获取16个div Dom 对象
      //记录黑块位置
    var startTime;  //记录开始时间
    var time;       //记录剩余时间
    var isStart=false;
    var hasFailed=false;
    var msg;  //msgbox显示内容
    var maxTime=1000;
    var score;
    var touchtogo;   //辅助触摸重新开始

$(document).ready(function(){

    setInterval("testLunXun()",2000);
    resize();
    init();
    listenAction();
    // 添加的

});
    //


//----------------------------------------------------
function resize(){  //下次用百分比写试试 (body width =100% , height=100%)
    //blocks position
    var width=document.body.clientWidth;
    var height=screen.availHeight;
    var cw,ch,cdw,cdh;  //container width; container height; container div width;
    var cmt;  //container margin-top
    //time position
    var tx,ty;  //time x ,time y
    //score position
    var sx,sy;
    //msgbox
    var mx,my,mw,mh;  //msgbox x,y,width,height

    //电脑 cdw=60/110*cdh
    if(width>height){
        isPC=true;
        console.log(isPC);
        //blocks position
        cdh=height*0.8/4;
        cdw=60/110*cdh;
        cw=cdw*4.2;
        cmt=height*0.03; 
        //time position
        tx=width/2-0.5*parseInt($("#time").css("width"));
        ty=cmt+0.3*cdh;
        //score position
        sx=width/2-0.5*parseInt($("#score").css("width"));
        sy=cmt+0.6*cdh;
        //msgbox position
        mw=6*cdw;
        mh=1.5*cdh;
        mx=width/2-0.5*mw;
        my=cmt+1.25*cdh;
        msg="QWER控制，任意键开始"

    }

    $("#container").css({
        "width":cw,
        "margin-top":cmt
    });
    $("#container div").css({
        "width":cdw,
        "height":cdh,
    })
    $("#time").css({
        "left":tx,
        "top":ty
    })
    $("#score").css({
        "left":sx,
        "top":sy
    })
    $("#msgbox").css({
        "left":mx,
        "top":my,
        "width":mw,
        "height":mh,
    })

}
function init(){
    score=0;
    showscore();
    //全白
    $(blocks).each(function(){$(this).css("backgroundColor","white")})
    bBlocks=[];
    //重置时间
    $("#time").html("time: 0.0");
    startTime=undefined;
    //生成4行黑块，记录黑块位置
    blocks=$("#container").children(); //blocks:JQ对象，数组形式可用，blocks[0]为第一个div
    for(var i=0,j=0;i<16;i=i+4){
        j=Math.floor(Math.random()*4);
        $(blocks[i+j]).css({"background":"black"});
        bBlocks[i+j]=true;
    }
    //showMsgbox
    if(isPC){
        showMsgbox("按“任意键”开始");
    }
    else{
        showMsgbox("摸一下开始");
    }
    
}
function listenAction(){
    //电脑,键盘QWER
    var pressedBlock=16;
    $(document).keyup(function(e){
        // 首次任意键开始
        if(!isStart && !hasFailed){
            isStart=true;
            hasFailed=false;
            hideMsgbox();
            showtime(); //开始计时
            return;
        }
        //如果输了，enter开始
        if(!isStart && hasFailed && (e.which===13)){
            isStart=false;   //尚未开始，在准备阶段
            hasFailed=false;
            init();
            return;
        }
        //判断有效案件
        if(!isStart || hasFailed){
            return;
        }

        switch(e.which){
            case 13:init();break;
            case 81:pressedBlock=12;break;
            case 87:pressedBlock=13;break;
            case 69:pressedBlock=14;break;
            case 82:pressedBlock=15;break;
        }
        if(bBlocks[pressedBlock]===true){move()}
        else if(pressedBlock<16){gameover(pressedBlock)};
    });
    //手机
    $(document).on("touchstart",function(e){
        e.preventDefault;
        //首次触摸开始
        if(!isStart && !hasFailed){
            isStart=true;
            hasFailed=false;
            hideMsgbox();
            startTime=undefined;
            showtime(); //开始计时
            //e.stopPropagation()  取消事件捕获
            return;
        }
        //输后重开
        if(!isStart && hasFailed && touchtogo){
            touchtogo=false;
            isStart=false;
            hasFailed=false;
            init();
            return;
        }
    })
    for(var i=0;i<16;i++){
        blocks[i].id=i;
        $(blocks[i]).on("touchstart",function(){
            if(!isStart){return}; //趁着还没冒上去，取消动作 [JQ的冒泡怎么改成捕获呢？]
            if(this.style.backgroundColor==="black" && this.id>11){ //为黑色或者在最后一行
                move();
            }
            else{
                gameover(this.id);
            }
        })
    }
}
function showtime(){
    if(!startTime && isStart){
        startTime=Date.now();
    }
    if(hasFailed){return};
    //else if(!isStart){return;}
    var now=Date.now();
        time=maxTime-(now-startTime)/1000;
        time=time.toFixed(2);
        if(time<=0){time=0}
        if(time<3){$("#time").css("color","red")}
        else if(time<7){$("#time").css("color","orange")}
        else if(time<100){$("#time").css("color","green")};
    //console.log("maxTime:"+maxT) 
    $("#time").html("time: " + time);
    //TIME UP
    
    if(time<=0){
        gameover()
    }
    
    if(isStart && !hasFailed){
        requestAnimationFrame(showtime);
    }
}

function showscore(){
    $("#score").html("score: " + score);
}

function move(){
    bBlocks.splice(12,4);
    bBlocks.splice(0,0,null,null,null,null);
    var j=Math.floor(Math.random()*4);
    bBlocks[j]=true;
    for(var i=0;i<16;i++){
        if(bBlocks[i]===true){
            $(blocks[i]).css({"background":"black"});
        }
        else{
            $(blocks[i]).css({"background":"white"});
        }
    }
    score+=1;
    showscore()
    audio(0);
}
function gameover(n){
    $(blocks[n]).css("background","red");
    //alert("gameover");
    isStart=false;
    hasFailed=true;
    startTime=undefined; //重置时间    
    $("#time").html("time: 0.0");  
    if(isPC){
        msg="Game OVER,回车键RESTART";
    }
    else{
        msg="you lose，touch <b>me</b> to continue";
        $("#msgbox").on("touchstart",function(){touchtogo=true;console.log("touchtogo="+touchtogo)})
    }
    msg+="<br>time: "+ time;
    msg+="<br>score: "+ score ;
    showMsgbox(msg);
    audio(1);
}
function showMsgbox(t){
    $("#msgbox").show();
    $("#msgbox span").html(t);
}
function hideMsgbox(){
    $("#msgbox").hide();
    $("#msgbox span").html();
}
function audio(n){
    var s=[];
    s[0]=new Audio("duang.wav");
    s[1]=new Audio("fail.wav");
    s[n].play();
}

function testLunXun(){


        var length;

        $.get("/cgi-bin/cgi.cgi",{},function(data){
            //  data 为完成的数值 轮询完成的 默认length分为9级 0-7 是功能控制
           length=parseInt(data);
           $("#testChangeId").val("zhi--"+length);


            var pressedBlock = 16;
                           if(length === 0){
                            init();
                           }else if(length === 1){
                           pressedBlock=12;
                           }else if(length === 2){
                           pressedBlock = 13;
                           }else if (length === 3){
                           pressedBlock=14;
                           }else if(length == 4){
                           pressedBlock=15;
                           }
                          // alert(length+"f" +pressedBlock+"--"+bBlocks[pressedBlock]);

                            if(bBlocks[pressedBlock]==true){

                            move();

                            }

         });



                 //else if(pressedBlock<16){gameover(pressedBlock)};


 }




