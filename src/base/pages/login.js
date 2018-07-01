(function() {

    setText('title', trimText($('title').text()) + '-' + G_CONFIG['app_title']);
    setText('#main_title', G_CONFIG['app_title']);
    setText('.sub_title', G_CONFIG['login_sub_title']);
    setText('.en_title', G_CONFIG['login_en_title']);
    setText('.footer', G_CONFIG['footer']);

    $('input').on('focus', function() {
        $(this).parent().parent().addClass('active').siblings().removeClass('active');
    });

    $('input').on('blur', function() {
        $(this).parent().parent().removeClass('active');
    });

    $('#loginBtn').click(function() {
        var username = $('#username').val();
        var password = $('#userpsw').val();
        var autoLogin = false;
        if($("input[name='autoLogin']").is(':checked')){
            autoLogin = true;
        }else{
            autoLogin = false
        }
        eBase.checkAuthentication('login', username, password, autoLogin);
    });

    $('#forgetPwd').click(function(){
        $('#container01').addClass('hidden-em');
        $('#container02').removeClass('hidden-em');
    })

    $("#reusername").on('input propertychange',function(){
        $('#submit').removeClass('btn-disable').addClass('btn-primary').removeAttr('disabled');
    });

    $('#submit').click(function(){
        var username = $('#reusername').val();
        eBase.send({
            url: '/auth/account/findPwd/'+ username,
        }, 'get').done(function(resp) {
            $('#container02').addClass('hidden-em'); 
            $('#container03').removeClass('hidden-em'); 
            $('#container03 p').html('重置密码的链接已发送至你'+ resp.data +'的邮箱账户，请查收邮件以重置密码。');
        }).fail(function() {
            console.log('获取数据失败');
        });
    });

})();