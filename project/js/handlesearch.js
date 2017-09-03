/**
 * Created by Administrator on 2017/7/2.
 */

var oTimer = null;

jQuery(document).ready(function(){

    $("#jia").click(function () {
        alert("jia");
    });


    oTimer = setInterval("queryHandle()",5000);
});

function queryHandle(){
    jQuery.getJSON("data.json", {}, function(json){
        var status = json.status;
        if(status==='0'){
            alert('状态代码 '+status+':'+json.message);
        }else{
            alert('处理成功！');
            window.clearInterval(oTimer);
        }
    });
}