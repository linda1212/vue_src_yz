(function(w, $, d, _) {

    "use strict";

    function CardTable(value) {

        this.cfg = $.extend(true, {}, {
            m: "#modal",
            d: "#detail",
            editTitle: "编辑",
            detailTitle: '详情',
            addTitle: "增加",
            confirmMsg: "确定删除此条数据?",
            cardView: '#view_container',
            paginatorView: '',
            addBtn: "#add",
            editBtn: ".card_edit",
            delBtn: ".card_del",
            serBtn: "#ser",
            refBtn: "#ref",
            queryUrl: "",
            addUrl: "",
            editUrl: "",
            delUrl: "",
            uuid: 'id',
            stateField: 'state',
            hideCols: ['id'],
            urlGetType: 'list',
            dataSourceType: 'server',
            method: 'get',
            pageSize: 12,
            inputBar: "#inputBox",
            params: {
                params: {}
            }
        }, value);

        this.addFlag = true;

        this.$v = $(this.cfg.cardView);
        this.$t = null;
        this.$m = null;
        this.$d = null;
        this.handlers = {};

        this.currentPageIndex = 1;

        eBase.debug('[CardTable.js][CardTable][构造器]');
    }

    CardTable.prototype = {

        /**
         * 初始化函数
         * */
        init: function() {

            eBase.debug('[CardTable.js][init]');

            this.urlParams = this.parserUrl(location.href, this.cfg.urlGetType || 'obj').params;

            this.initModal();
            this.addListeners();
            this.initValidate();
            this.sendRequst(this.currentPageIndex, this.cfg.pageSize);
        },

        /**
         * 初始化所有组件的监听函数
         * */
        addListeners: function() {
            this.addModalListeners();
            this.addButtonListeners();
        },

        initModal: function() {
            this.$m = $(this.cfg.m).modal({
                show: false,
                backdrop: 'static',
                keyboard: true
            });

            this.inputFileInput();
        },

        inputFileInput: function() {
            var self = this;
            self.$m.find('input[type="file"]').each(function() {
                var name = $(this).data('field');
                var self_el = $(this);

                self_el.fileinput('destroy');
                self_el.fileinput({
                    language: 'zh',
                    uploadUrl: '/zuul/oss/putObject',
                    showUpload: false,
                    showCaption: true,
                    overwriteInitial: false,
                    dropZoneEnabled: false,

                    allowedFileTypes: ['image'],
                    allowedFileExtensions: ['jpg', 'png', 'gif'],
                    maxFileSize: 2000,
                    maxFileCount: 1
                }).on("filebatchselected", function(event, files) {
                    var tokenUrl = _.has(self.cfg, 'tokenUrl') ? self.cfg.tokenUrl : '/auth/token/oss';
                    var params = {
                        filename: files[0].name,
                        filesize: files[0].size
                    };
                    eBase.debug('[CardTable.js][inputFileInput][filebatchselected]');
                    eBase.send({
                        url: tokenUrl,
                        data: JSON.stringify(params)
                    }, 'post').done(function(resp) {
                        if (resp['code'] == '0') {
                            self_el.fileinput("upload", {
                                Athorization: resp['data']
                            });
                        } else {
                            self_el.fileinput("upload");
                        }
                    }).fail(function(resp) {
                        self_el.fileinput("upload");
                    });
                }).on("fileuploaded", function(event, data) {
                    self.$m.find("input[name='" + name + "']").val(data.response.data.filePath);
                }).on("filecleared", function(event, data) {
                    self.$m.find("input[name='" + name + "']").val('');
                });
            });
        },

        sendRequst: function(index, pageSize, params) {
            params = params || {};
            var self = this;
            var sendObj, params = {
                pageSize: pageSize,
                pageIndex: index,
                params: params
            };

            if (_.has(self.cfg, 'dataSourceType') && self.cfg.dataSourceType == 'local') {
                sendObj = {
                    url: self.cfg.queryUrl
                }
            } else {
                sendObj = {
                    url: self.cfg.queryUrl,
                    data: JSON.stringify(params)
                }
            }
            eBase.send(sendObj, self.cfg.method || 'get').done(function(resp) {
                self.renderOnePage(resp.rows);
                parseInt(resp.total) > 0 && self.loadpage(resp.total, self.cfg.pageSize);
            }).fail(function(resp) {
                self.renderDefaultTips(resp.msg);
            });
        },

        renderOnePage: function(list) {

            var self = this;
            eBase.debug('[CardTable.js][renderOnePage][enter]');

            self.$v.empty();
            _.each(list, function(item, index) {
                var template = _.has(self.cfg, 'getTemplate') && _.isFunction(self.cfg.getTemplate) ? self.cfg.getTemplate(item) : '';
                if (template == '') {
                    w.layer.msg("请配置渲染模板函数getTemplate");
                    return;
                }
                var one = $(template);
                self.$v.append(one);
            });

            if (list && list.length == 0) {
                this.renderDefaultTips('暂无数据');
            }

            this.addButtonListeners();
        },

        renderDefaultTips: function(tips) {
            this.$v.empty();
            var default_tips = `<div class="default_box">
                                <img src="img/pcdpi/default_tips.png" alt="${tips}">
                                <p>${tips}</p>
                            </div>`;

            this.$v.append(default_tips);
        },

        getValuesByPanel: function(panel) {

            var result = {};
            var id = panel.parent().parent('.item').data('id');
            var obj_str = panel.parent().parent('.item').data('content');

            result = obj_str; //JSON.parse(obj_str);
            result['id'] = id;

            return result;
        },

        loadpage: function(total, pageSize) {
            var self = this;
            var countindex = total % pageSize > 0 ? (total / pageSize) + 1 : (total / pageSize);
            $("#countindex").val(countindex);
            $.jqPaginator(this.cfg.paginatorView, {
                totalPages: parseInt($("#countindex").val()),
                visiblePages: parseInt($("#visiblePages").val()),
                currentPage: self.currentPageIndex,
                first: '<li class="first"><a href="javascript:;">«</a></li>',
                prev: '<li class="prev"><a href="javascript:;"><i class="arrow arrow2"></i>‹</a></li>',
                next: '<li class="next"><a href="javascript:;">›<i class="arrow arrow3"></i></a></li>',
                last: '<li class="last"><a href="javascript:;">»</a></li>',
                page: '<li class="page"><a href="javascript:;">{{page}}</a></li>',
                onPageChange: function(num, type) {
                    if (type == "change") {
                        self.currentPageIndex = num;
                        self.sendRequst(self.currentPageIndex, self.cfg.pageSize);
                    }
                }
            });
        },

        clearModal: function() {
            var self = this;
            self.$m.find('textarea').val("");
            self.$m.find('input').val("");
            self.$m.find('input[type="text"]').val("");
            self.$m.find('input[type="password"]').val("");
            self.$m.find('input[type="email"]').val("");
            self.$m.find('input[type="file"]').fileinput('clear');
            self.$m.find('select').val("");
        },

        showAddModal: function(row) {

            var self = this;
            var row, title, def = {};

            if (self.addFlag) {
                row = {};
                title = self.cfg.addTitle;
            } else {
                title = self.cfg.editTitle;
            }

            row = row || def;

            self.$m.find('.modal-title').text(title);
            self.$m.modal('show');
        },

        showEditModal: function(panel) {
            var self = this;
            var row, title, def = {};

            title = self.cfg.editTitle;

            self.$m.find('.modal-title').text(title);
            self.$m.modal('show');
            self.setModalValues(self.getValuesByPanel(panel), self.$m);
        },

        setModalValues: function(row, el) {
            var self = this;

            for (var key in row) {
                el.find('input[name="' + key + '"]').val(row[key]);
                el.find('textarea[name="' + key + '"]').val(row[key]);

                el.find("select[name]").each(function() {
                    var data = $(this).attr('name');

                    if (key === data) {
                        $(this).val(row[key]);
                        return false;
                    }
                });

                el.find('img[name="' + key + '"]').each(function() {
                    $(this).attr('src', row[key]);
                });

                el.find("select[multiple]").each(function() {
                    var data = $(this).attr('name');

                    if (key === data) {
                        $(this).val(row[key]);
                        $(this).trigger("chosen:updated");
                        return false;
                    }
                });
                el.find('input[type="file"]').each(function() {
                    var self_el = $(this);
                    var name = self_el.data('field');
                    var name1 = name + '1';
                    var thisImage = row[name1] || undefined;
                    if (thisImage) {
                        self_el.fileinput('destroy');
                        self_el.fileinput({
                            language: 'zh',
                            uploadUrl: '/zuul/oss/putObject',
                            showUpload: false,
                            showCaption: true,
                            overwriteInitial: true,
                            dropZoneEnabled: false,
                            allowedFileTypes: ['image'],
                            allowedFileExtensions: ['jpg', 'png', 'gif'],
                            maxFileSize: 2000,
                            maxFileCount: 1,
                            initialPreviewAsData: true,
                            layoutTemplates: {
                                actionDelete: '',
                                actionUpload: '',
                                actionZoom: '',
                                footer: ''
                            },
                            initialCaption: row[name],
                            initialPreview: [
                                thisImage
                            ]
                        }).on("filebatchselected", function(event, files) {
                            var tokenUrl = _.has(self.cfg, 'tokenUrl') ? self.cfg.tokenUrl : '/auth/token/oss';
                            var params = {
                                filename: files[0].name,
                                filesize: files[0].size
                            };
                            eBase.debug('[CardTable.js][setModalValues][filebatchselected]');
                            eBase.send({
                                url: tokenUrl,
                                data: JSON.stringify(params)
                            }, 'post').done(function(resp) {
                                if (resp['code'] == '0') {
                                    self_el.fileinput("upload", {
                                        Athorization: resp['data']
                                    });
                                } else {
                                    self_el.fileinput("upload");
                                }
                            }).fail(function(resp) {
                                self_el.fileinput("upload");
                            });
                        }).on("fileuploaded", function(event, data) {
                            console.log('file path:' + data.response.data.filePath);
                            el.find("input[name='" + name + "']").val(data.response.data.filePath);
                        }).on("filecleared", function(event, data) {
                            el.find("input[name='" + name + "']").val('');
                        });
                    }
                }); //end each
            } //end for 
        },

        setDetailValues: function() {

        },

        initValidate: function() {
            $(this.cfg.m).find('form').bootstrapValidator({
                // trigger: 'blur keyup change'
                trigger: 'change'
            });
        },

        setRowValues: function(row) {

            var self = this;
            var row, title, def = {};

            row = self.selections[0] || def;

            if (self.addFlag) row = def;

            for (var key in row) {
                self.$m.find('input[name="' + key + '"]').val(row[key]);

                self.$m.find('select[name="' + key + '"]').each(function() {
                    var data = $(this).attr('name');

                    if (key === data) {
                        $(this).val(row[key]);
                        return false;
                    }
                });

                self.$m.find("select[multiple]").each(function() {
                    var data = $(this).attr('name');

                    if (key === data) {
                        $(this).val(row[key]);
                        $(this).trigger("chosen:updated");
                        return false;
                    }
                });
            }
        },

        editClickHandler: function(id) {
            var self = this;
            eBase.debug('[CardTable.js][editClickHandler][editBtn click handler]');
        },

        delClickHandler: function(panel) {
            var self = this;
            eBase.debug('[CURDTable.js][delClickHandler][del button click handler]');

            var ids = [panel.parent().parent('.item').data('id')];

            var delIndex = w.layer.confirm(self.cfg.confirmMsg, {
                btn: ['删除', '取消'],
                shade: false
            }, function() {
                eBase.debug('[CURDTable.js][delClickHandler][删除 click handler]');

                self.delItem(ids);

                w.layer.close(delIndex);

            }, function() {
                eBase.debug('[CURDTable.js][delClickHandler][取消 click handler]');
            });
        },

        checkDataSource: function() {
            var result = true;
            if (this.cfg.dataSourceType && this.cfg.dataSourceType != 'server') {
                w.layer.msg("静态数据");
                result = false;
            }
            return result;
        },

        addButtonListeners: function() {
            var self = this;

            $(self.cfg.addBtn).length > 0 && $(self.cfg.addBtn).off('click').on('click', function() {

                if (!self.checkDataSource()) {
                    return;
                }

                self.addFlag = true;
                self.clearModal();
                self.showAddModal();
            });

            $(self.cfg.editBtn).off('click').on('click', function() {

                if (!self.checkDataSource()) {
                    return;
                }
                var singlePanel = $(this);
                eBase.debug('[CardTable.js][addButtonListeners][editClickHandler]');
                self.addFlag = false;
                self.clearModal();
                self.showEditModal(singlePanel);
            });

            $(self.cfg.delBtn).off('click').on('click', function() {
                self.checkDataSource() && self.delClickHandler($(this));
            });

            self.$m && self.$m.find('.submit').off('click').on('click', function() {
                var row = {};

                self.$m.find('input[name]').each(function() {
                    row[$(this).attr('name')] = $.trim($(this).val());
                });

                self.$m.find('select[name]').each(function() {
                    row[$(this).attr('name')] = $.trim($(this).val());
                });

                self.$m.find('textarea[name]').each(function() {
                    row[$(this).attr('name')] = $.trim($(this).val());
                });

                $(self.cfg.m).find('form').data("bootstrapValidator").validate();

                if ($(self.cfg.m).find('form').data("bootstrapValidator").isValid()) {
                    self.addItem(row);
                }
            });

            self.$d && self.$d.find('.submit').off('click').on('click', function() {});

            _.has(self.cfg, 'search_params') && $(self.cfg.search_params.field_select).find('a').off('click').on('click', function() {
                var text = $(this).text() + '\
                                <span class="caret"></span>';
                $(self.cfg.search_params.field_select).find('button').html(text);
                $(self.cfg.search_params.field_input).data('field', $(this).data('field'));
                $(self.cfg.search_params.field_input).attr('placeholder', $(this).data('placeholder'));
                $(self.cfg.search_params.field_input).val('');
            });

            var searchHandler = function() {

                if (!self.checkDataSource()) {
                    return;
                }

                var params = {};

                $(self.cfg.inputBar).find("input[data-field]").each(function() {
                    var key = $(this).data('field');
                    var value = $(this).val();
                    if ('' != value && '' != key) {
                        params[key] = value;
                    }
                });

                var newp = self.urlParams ? $.extend({}, self.urlParams, (self.cfg.params && self.cfg.params.params ? self.cfg.params.params : {}), params) :
                    $.extend({}, (self.cfg.params && self.cfg.params.params ? self.cfg.params.params : {}), params);


                self.sendRequst(self.currentPageIndex, self.cfg.pageSize, newp);

            };

            $(self.cfg.inputBar).find("input[data-field]").off('keyup').on('keyup', function(event) {
                if (event.keyCode == 13) {
                    searchHandler();
                }
            });

            $(self.cfg.serBtn) && $(self.cfg.serBtn).length > 0 && $(self.cfg.serBtn).off('click').on('click', searchHandler);

            $(self.cfg.refBtn) && $(self.cfg.refBtn).length > 0 && $(self.cfg.refBtn).off('click').on('click', function() {

            });
        },

        /**
         * 增加,修改
         * */
        addItem: function(row) {
            var self = this;

            var url = self.addFlag ? self.cfg.addUrl : self.cfg.editUrl;
            var msg = self.addFlag ? "添加--参数为：" : "编辑--口参数为：";

            eBase.send({
                'url': url,
                data: JSON.stringify(row)
            }).done(function(resp) {
                eBase.debug('[CURDTable.js][addItem][send success]');
                w.layer.msg('保存成功');
                self.$m.modal('hide');
                self.sendRequst(self.currentPageIndex, self.cfg.pageSize);
            }).fail(function() {
                eBase.debug('[CURDTable.js][addItem][send failed]');
                self.$m.modal('hide');
                $(self.cfg.m).find('form').bootstrapValidator('resetForm', true);
            });
        },

        delItem: function(ids) {
            var self = this;
            eBase.debug('[CURDTable.js][delItem]');
            eBase.send({
                'url': self.cfg.delUrl,
                data: JSON.stringify(ids)
            }).done(function() {
                eBase.debug('[CURDTable.js][delItem][send success]');
                self.sendRequst(self.currentPageIndex, self.cfg.pageSize);
                w.layer.msg('删除成功');
            }).fail(function() {
                eBase.debug('[CURDTable.js][delItem][send failed]');
            });
        },

        addModalListeners: function() {

            var self = this;

            if ("undefined" == self.$m) return;

            self.$m.on('hide.bs.modal', function() {

                eBase.debug('[CardTable.js][addModalListeners][hide.bs.modal click]');

                $(this).find('form').bootstrapValidator('resetForm', true);
            });
        },

        checkDataSource: function() {
            var result = true;
            if (this.cfg.dataSourceType && this.cfg.dataSourceType != 'server') {
                w.layer.msg("静态数据");
                result = false;
            }
            return result;
        },

        trace: function(msg, row) {
            eBase.debug(msg + ":" + JSON.stringify(row));
        },

        on: function(type, handler) {

            if (this.handlers[type] == undefined) {
                this.handlers[type] = [];
            }

            this.handlers[type].push(handler);
        },
        fire: function(type, data) {
            if (this.handlers[type] instanceof Array) {
                var handlers = this.handlers[type];
                for (var i = 0; i < handlers.length; i++) {
                    handlers[i](data);
                }
            }
        },
        parserUrl: function(url, type) {

            type = type || 'obj';

            if (!url || "" == url) return false;

            var result = {};
            var params = {};
            if (url.indexOf("?") != -1) {
                var str = url.split("?")[1];
                var strs = str.split("&");
                for (var i = 0; i < strs.length; i++) {

                    if ('obj' == type) {
                        params[strs[i].split("=")[0]] = strs[i].split("=")[1];
                    } else {
                        var list = strs[i].split("=")[1].split(",");
                        params[strs[i].split("=")[0]] = list;
                    }
                }

                result.url = url.split("?")[0];
                result.params = params;
            } else {
                result.url = url;
            }

            return result;
        }

    };

    w.card = CardTable;

})(window, jQuery, laydate, _);