/**
 * Created by Administrator on 2017/7/1 0001.
 */
 // jquery 代码

     var length;
     var oldLength=0;
     var status=0;
     function testLunXun(){


    $.get("/cgi-bin/cgi.cgi",{},function(data){
        //  data 为完成的数值 轮询完成的 默认length分为9级 0-7 是功能控制

        var temp=parseInt(data);
        if(temp==8)location.reload();
        if(temp>4)length=temp/2;
        else length=temp;
         $("#testChangeId").val("f"+data);
     });

       if(status==0){
        //查看菜单点击事件
        mainMenuCon();
        }else if(status == 1){
            // 灯光控制
            lightCon()
        }else if(status == 2){
        // 音乐控制
            musicCon();
        }else if(status == 3){
        // 游戏控制 跳转的
        gameCon();
        }else if(status == 4){
            // 设置 或返回
            status=0;
            overTime=0;
        }
        oldLength=length;
     }

     function mainMenuCon(){
     // 一共四个按钮
     //通过length 长度进行选择按钮点击 设计4秒长安是点击
     //在轮询里面确定4秒
     if(oldLength !=length){

     // 关闭放大
        if(oldLength == 1){
                    $("#lightId").trigger("mouseleave");
                }else if(oldLength == 2){
                    $("#musicId").trigger("mouseleave");
                }else if(oldLength == 3){
                    $("#gameId").trigger("mouseleave");
                }else if(oldLength == 4){
                    $("#settingId").trigger("mouseleave");
                }
        // 开启放大
        if(length == 1){
            $("#lightId").trigger("mouseover");
        }else if(length == 2){
            $("#musicId").trigger("mouseover");
        }else if(length == 3){
            $("#gameId").trigger("mouseover");
        }else if(length == 4){
            $("#settingId").trigger("mouseover");
        }

        overTime=0;

        }else {
        overTime +=1;
        // 放置4秒 点击
        if(overTime==4){
                if(length == 1){
                            $("#lightId").trigger("click");
                            status=1;
                        }else if(length == 2){
                            $("#musicId").trigger("click");
                            status=2;
                        }else if(length == 3){
                            $("#gameId").trigger("click");
                            status=3;
                        }else if(length == 4){
                            $("#settingId").trigger("click");
                            ststus=4;
                        }
        }
        }

     }

        function lightCon(){
        var procsee=length*1440/8
         $("#lightProcessId").css("width",procsee+"px");
          // ./php/test.php 是相对的url显示 改成 led.cgi? + length
          // "led.cgi？"+length
           $.get("led.cgi?"+length,{},function(data){
                                 $("#testChangeId").val(data+i);
                             });

        }
      function musicCon(){
      // 直接调用 cgi 后面可以家参数 例如 ？num=1 num用于cgi程序中判断状态
      // ./php/test.php 是相对的url显示
      $.get("./php/test.php",{},function(data){
                        $("#testChangeId").val(data+i);
                    });

      }

      function gameCon(){
      // 调用游戏的cgi
      //跳转页面而已

      }

      function settingCon(){

      // 功能未知
      }

    function cgiRead(){
         var num=1;
         //"./php/test.php?num="+num
     $.get("/cgi-bin/cgi.cgi",{},function(data){
                      $("#testChangeId").val(data+"  --"+num);

                  });

    }

 	$(document).ready(function (){
 	//setInterval("testLunXun()",1000); // 轮询超声波1秒
    setInterval("testLunXun()",1000);


     //灯光进度条的控制
     $("#changeLightId").bind("click",function (){
          $("#lightId").trigger("mouseover");

         var wight=$("#lightProcessId").css("width");
         alert(wight);
         // 总宽度为1680px

         $("#lightProcessId").css("width",length+"px");

          // 进行控制的代码
         $.get("/cgi-bin/cgi.cgi",{},function(data){
                  $("#testChangeId").val(data+i);
              });


     });


        $("#lightId").bind("mouseover",function(){
             $("#lightId").addClass("butbig");
            });

        $("#lightId").bind("mouseleave",function(){
             $("#lightId").removeClass("butbig");
            });

            $("#musicId").bind("mouseover",function(){
                  $("#musicId").delay(1500).addClass("butbig");
              });
            $("#musicId").bind("mouseleave",function () {
                $("#musicId").removeClass("butbig");
            });

            $("#gameId").bind("mouseover",function () {
                $("#gameId").delay(1500).addClass("butbig");
            });

            $("#gameId").bind("mouseleaver",function () {
                $("#gameId").removeClass("butbig");
            });
            $("#settingId").bind("mouseover",function () {
                $("#settingId").addClass("butbig");
            });
            $("#settingId").bind("mouseleave",function () {
                $("#settingId").removeClass("butbig");
            });





 	});

 	function getClink($x,$y){

 	}


// angular 代码
var app = angular.module('myApp',[]);


app.controller('things',function($scope,$http,$interval){


    $scope.music="jjjj---1111-";


   // $interval(testJia,1000)
	
    var i=0
 var config = { headers:{"content-type":"text/html"}};


        $scope.ininAn = function (){

        $scope.first="By 刁建涛，陈丁宁，郏俊龙"
        $scope.lightFlag=false
        $scope.musicFlag=false

        }



    $scope.game = function () {

       // alert("ssss")
        //location.href ="game.html"
         window.location.href='stepBlock.html';
        //location.href="/cgi-bin/cgi.cgi"
    }
   $scope.musicBig=function(){
          $("#musicId").delay(1500).addClass("butbig");
      }
      $scope.musicSmall=function () {
        $("#musicId").removeClass("butbig");
    }

    $scope.gameBig=function () {
        $("#gameId").delay(1500).addClass("butbig");
    }

    $scope.gameSmall=function () {
        $("#gameId").removeClass("butbig");
    }
    $scope.settingBig=function () {
        $("#settingId").addClass("butbig");
    }
    $scope.settingSmall=function () {
        $("#settingId").removeClass("butbig");
    }

   $scope.lightBig=function () {
        $("#lightId").addClass("butbig");
    }
    $scope.lightSmall=function () {
        $("#lightId").removeClass("butbig");
    }
    
    
    
    
    
    
});

