(function($, w) {
    window.CONSTE = {
        OPERATE: {
            ALL: 'ALL_OPERATE',
            SHENHE_ALL: 'SHENHE_ALL',
            EDIT: 'EDIT_OPERATE',
            METERING_MANAGER: 'METERING_MANAGER',
            SONGJIAN: 'SONGJIAN',
            INVESTMENT_TRACK: 'INVESTMENT_TRACK',
            DETAIL:'INVESTMENT_DETAIL'
        }
    };
    window.eBase = {

        isDebug: 0,
        OK_CODE: 0,
        ERROR_CODE: 101,
        /*database error*/
        DEL_CODE: 103,
        /*delete database failed*/
        NO_AUTH: 6,
        NOT_LOGIN_CODE: 3,

        gotoLoginPage: function() {
            this.debug('[eBase.js][gotoLoginPage][enter]');

            window.location.href = '././login.html';
        },

        gotoHomePage: function(url) {
            this.debug('[eBase.js][gotoHomePage][enter]');
            if (!url) {
                url = "gov/index.html"
            }
            var currentUrl = window.location.pathname;
            var pathnameIndex = currentUrl.indexOf("/", 1);
            var url = currentUrl.substring(0, pathnameIndex + 1) + url;
            window.location.href = url;
        },

        checkAuthentication: function(currentpage, username, password, autoLogin) {

            var self = this;

            if ('' == username || '' == password) {
                self.debug('[login.js][checkAuthentication][username or password is null]');
                return;
            }

            self.debug('[login.js][checkAuthentication][begin send request]');

            var dfd = $.Deferred();

            var loginData = {};
            loginData["username"] = username;
            loginData["password"] = password;
            loginData["autoLogin"] = autoLogin;

            self.send({
                "url": '/auth/account/login',
                data: JSON.stringify(loginData)
            }).done(function(resp) {
                sessionStorage.setItem('username', username);
                self.loginSuccessHandler(currentpage, resp);
                dfd.resolve(resp);
            }).fail(function(resp) {
                self.loginFailedHandler(currentpage, resp);
                dfd.reject(resp);
            });

            return dfd;
        },

        initPages: function() {
            this.debug('[eBase.js][initPages]');
        },

        loginSuccessHandler: function(currentpage, resp) {

            if ('login' == currentpage) {
                this.gotoHomePage(resp.data);
            }
        },

        loginFailedHandler: function(currentpage, resp) {
            if ('login' == currentpage) {
                this.debug('[eBase.js][loginFailedHandler][login failed]');
            } else {
                this.gotoLoginPage();
            }
        },

        send: function(ajaxData, type) {

            var self = this;
            var _type = type || 'post';
            var defaultParams = {
                type: _type,
                dataType: 'json',
                contentType: "application/json; charset=utf-8"
            };
            var newParams = $.extend(defaultParams, ajaxData);
            var dfd = $.Deferred();
            $.ajax(newParams).success(function(resp) {
                if (resp) {
                    self.debug('[login.js][send][code is:]' + resp['code']);
                    switch (resp['code']) {
                        case self.OK_CODE:
                            dfd.resolve(resp);
                            break;
                        case self.NOT_LOGIN_CODE:
                            self.gotoLoginPage();
                            break;
                        case self.NO_AUTH:
                        case self.ERROR_CODE:
                        case self.DEL_CODE:
                        default:
                            w.layer.msg(resp.msg);
                            dfd.reject(resp);
                            break;
                    }
                } else {
                    dfd.reject(resp);
                }
            }).fail(function(resp) {
                dfd.reject(resp);
            });
            return dfd;
        },

        debug: function(string) {
            this.isDebug && console.log(string);
        }
    };

})(jQuery, window);