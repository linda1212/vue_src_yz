(function(w, $, d, _) {

    "use strict";

    function noop() {}

    Date.prototype.Format = function(fmt) {
        var o = {
            "M+": this.getMonth() + 1, //月份 
            "d+": this.getDate(), //日 
            "h+": this.getHours(), //小时 
            "m+": this.getMinutes(), //分 
            "s+": this.getSeconds(), //秒 
            "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
            "S": this.getMilliseconds() //毫秒 
        };
        if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)
            if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
    }

    function CURDTable(value) {

        this.cfg = $.extend(true, {}, {
            m: "#modal",
            d: "#detail",
            toolbar: "#exampleTableEventsToolbar",
            footerbar: '#footerbar',
            showAfterRender: ['#footerbar'],
            editTitle: "编辑",
            detailTitle: '详情',
            addTitle: "增加",
            confirmMsg: "确定删除此条数据?",
            confirmSSMsg: '确定审核?',
            confirmSendMsg: '确定通知送检?',
            addBtn: "#add",
            editBtn: "#edit",
            batchEditBtn: '#bedit',
            batchDelBtn: "#bdel",
            checkAllBtn: '#checkall',
            endStateBtn: '#endState',
            checkAllBox: '#checkbox',
            delBtn: "#del",
            serBtn: "#ser",
            refBtn: "#ref",
            uuid: 'id',
            stateField: 'state',
            hideCols: ['id'],
            urlGetType: 'list',
            dataSourceType: 'server',
            pageSize: 11,
            inputBar: "#inputBox",
            rowClickHandler: function() {},
            dbRowClickHandler: function() {},
            renderCompleteHandler: function(resp) {},
            getFirstRowUUID: function() {},
            beforeSend: noop, // modal中最后发请求前的处理
            params: {
                params: {}
            }
        }, value);

        this.addFlag = true;
        this.moveToolFlag = false;

        this.$t = null;
        this.$m = null;
        this.$d = null;
        this.childSls = this.cfg.childSls || {};
        this.selections = [];
        this.first_row_uuid = null;
        this.handlers = {};

        this.footerbar_father = $(this.cfg.footerbar).parent();

        eBase.debug('[CURDTable.js][CURDTable][构造器]');
    }

    CURDTable.prototype = {

        /**
         * 初始化函数
         * */
        init: function(instance) {

            w.$c = instance || null;
            eBase.debug('[CURDTable.js][init]');

            this.urlParams = this.parserUrl(location.href, this.cfg.urlGetType || 'obj').params;

            this.initModal();
            this.initOperateEvents();
            this.hideTitle();
            this.renderTable();
            this.hideBtns();
            this.addListeners();
            this.initModelData();
        },

        hideBtns: function() {
            var self = this;

            self.$t && self.$t.bootstrapTable("uncheckAll");
            self.hideStateRow();

            self.hideBatchBtns();

            $(self.cfg.batchDelBtn).length > 0 && $(self.cfg.batchDelBtn).hide();
            $(self.cfg.checkAllBtn).length > 0 && $(self.cfg.checkAllBtn).hide();
            $(self.cfg.checkAllBox).length > 0 && $(self.cfg.checkAllBox).hide();
            $(self.cfg.endStateBtn).length > 0 && $(self.cfg.endStateBtn).hide();
            $(self.cfg.batchEditBtn).length > 0 && $(self.cfg.batchEditBtn).show();
        },

        showBtns: function() {
            var self = this;
            self.showStateRow();
            self.showBatchBtns();

            $(self.cfg.batchDelBtn).length > 0 && $(self.cfg.batchDelBtn).show();
            $(self.cfg.checkAllBtn).length > 0 && $(self.cfg.checkAllBtn).show();
            $(self.cfg.checkAllBox).length > 0 && $(self.cfg.checkAllBox).show();
            $(self.cfg.endStateBtn).length > 0 && $(self.cfg.endStateBtn).show();
            $(self.cfg.batchEditBtn).length > 0 && $(self.cfg.batchEditBtn).hide();
        },

        showBatchBtns: function() {
            var self = this;
            if (_.has(self.cfg, 'batchBtns')) {
                _.each(self.cfg.batchBtns, function(value, key, list) {
                    $(value.el).show();
                });
            }
        },
        hideBatchBtns: function() {
            var self = this;
            if (_.has(self.cfg, 'batchBtns')) {
                _.each(self.cfg.batchBtns, function(value, key, list) {
                    $(value.el).hide();
                });
            }
        },

        addHideBtnListener: function() {
            var self = this;
            if (_.has(self.cfg, 'batchBtns')) {
                _.each(self.cfg.batchBtns, function(value, key, list) {
                    $(value.el).click(function() {

                    });
                });
            }
        },

        showStateRow: function() {
            try {
                this.$t && this.$t.bootstrapTable("showColumn", this.cfg.stateField);
            } catch (error) {

            }
        },

        hideStateRow: function() {
            try {
                this.$t && this.$t.bootstrapTable("hideColumn", this.cfg.stateField);
            } catch (error) {

            }
        },

        hideTitle: function() {
            $(this.cfg.t).find('tr').hide();
            if (_.has(this.cfg, 'showAfterRender')) {
                _.each(this.cfg.showAfterRender, function(item, index) {
                    $(item).hide();
                });
            }
        },

        showTitle: function() {
            $(this.cfg.t).find('tr').show();
            if (_.has(this.cfg, 'showAfterRender')) {
                _.each(this.cfg.showAfterRender, function(item, index) {
                    $(item).show();
                });
            }
        },

        renderCompleteHandler: function(resp) {

            var self = this,
                result, rows = [];
            if (_.has(resp, 'rows')) {
                rows = resp.rows;
            }
            if (_.isArray(rows) && rows.length > 0) {
                result = rows[0];
            }

            self.cfg.getFirstRowUUID(result);

        },

        initValidate: function() {
            $(this.cfg.m).find('form').bootstrapValidator({
                trigger: 'blur keyup change' //trigger: 'keyup change'
            });
        },

        /**
         * 初始化所有组件的监听函数
         * */
        addListeners: function() {
            this.addButtonListeners();
            this.addTableListeners();
            this.addModalListeners();
        },

        initModal: function() {
            this.$m = $(this.cfg.m).modal({
                show: false,
                backdrop: 'static',
                keyboard: true
            });

            this.$d = $(this.cfg.d).modal({
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
                var allowedFileTypes = _.has(self.cfg, 'fileType') ? self.cfg.fileType[name]['allowedFileTypes'] : ['image'];
                var allowedFileExtensions = _.has(self.cfg, 'fileType') ? self.cfg.fileType[name]['allowedFileExtensions'] : ['jpg', 'png', 'gif'];
                var showPreview = _.has(self.cfg, 'fileType') ? self.cfg.fileType[name]['showPreview'] : true;
                self_el.fileinput('destroy');
                self_el.fileinput({
                    language: 'zh',
                    uploadUrl: '/zuul/oss/putObject',
                    showUpload: false,
                    showCaption: true,
                    showPreview: showPreview,
                    overwriteInitial: false,
                    dropZoneEnabled: false,
                    allowedFileTypes: allowedFileTypes,
                    allowedFileExtensions: allowedFileExtensions,
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

        queryParams: function(params) {
            var result;

            result = {
                pageSize: params.pageSize,
                pageIndex: params.pageNumber
            };
            return result;
        },

        renderMultipleSelect: function() {
            var config = {
                '.chosen-select': {
                    'placeholder_text_multiple': '  --请选择--'
                },
                '.chosen-select-deselect': {
                    allow_single_deselect: true
                },
                '.chosen-select-no-single': {
                    disable_search_threshold: 10
                },
                '.chosen-select-no-results': {
                    no_results_text: '找不到数据!'
                },
                '.chosen-select-width': {
                    width: "95%"
                }
            };
            for (var selector in config) {
                $(selector).chosen(config[selector]);
            }
        },

        initDateInput: function() {
            _.has(this.cfg, 'dataInputs') && this.initDateInputByArrAndType(this.cfg.dataInputs, 'yyyy-MM-dd HH:mm:ss');
            _.has(this.cfg, 'yearInputs') && this.initDateInputByArrAndType(this.cfg.yearInputs, 'yyyy');
            _.has(this.cfg, 'monthInputs') && this.initDateInputByArrAndType(this.cfg.monthInputs, 'yyyy-MM');
            _.has(this.cfg, 'dayInputs') && this.initDateInputByArrAndType(this.cfg.dayInputs, 'yyyy-MM-dd');
        },

        initDateInputByArrAndType(arr, format) {
            var self = this;

            _.each(arr, function(item, index) {
                if ($(item).length > 0) {
                    d.render({
                        elem: item,
                        event: "focus",
                        istime: true,
                        format: format,
                        done: function() {
                            eBase.debug('[CURDTable.js][initDateInput][done event handler]');
                            $(item).trigger('change');
                        },
                        choose: function(dates) {
                            eBase.debug('[CURDTable.js][initDateInput][choose event handler]');
                            $(item).trigger('change');
                        }
                    });
                }
            });
        },

        initModelData: function() {
            eBase.debug('[CURDTable.js][initModelData][enter]');
            var self = this;
            if (!self.cfg || !self.cfg.childSls) return;

            for (var key in self.cfg.childSls) {
                var obj = self.cfg.childSls[key];
                if (obj && obj.url) {
                    self.sendOne(self, obj);
                }
            }
        },

        initSelect: function() {
            eBase.debug('[CURDTable.js][initModelData][enter]');
            var self = this;
            if (!self.cfg || !self.cfg.childSls) return;

            for (var key in self.cfg.childSls) {
                var obj = self.cfg.childSls[key];
                if (obj && obj.url) {
                    self.sendSelectOne(self, obj);
                }
            }
        },

        refreshAPI: function() {
            var self = this;

            if (_.has(self.cfg, 'childSls')) {
                var refList = _.filter(self.cfg.childSls, function(item) {
                    if (_.has(item, 'autoRef') && 'true' == item.autoRef) {
                        return true;
                    } else {
                        return false;
                    }
                });

                _.each(refList, function(item) {
                    self.sendOne(self, item);
                });
            }
        },

        sendOne: function(self, item) {
            var type = 'get';
            var sendObj = {
                url: item.url
            };
            if (_.has(item, 'params')) sendObj.data = $.extend(true, {}, {}, item.params);
            try {
                type = item.type
            } catch (err) {}
            eBase.send(sendObj, type).done(function(resp) {
                switch (resp['code']) {
                    case eBase.OK_CODE:
                        self.parserSData(resp, item);
                        self.renderMultipleSelect();
                        self.setRowValues();
                        break;
                    default:
                        break;
                }
            }).fail(function(resp) {
                //w.layer.msg("获取数据失败");
            });
        },

        sendSelectOne: function(self, item) {
            var type = 'get';
            var sendObj = {
                url: item.url
            };
            if (_.has(item, 'params')) sendObj.data = $.extend(true, {}, {}, item.params);
            try {
                type = item.type
            } catch (err) {}
            eBase.send(sendObj, type).done(function(resp) {
                switch (resp['code']) {
                    case eBase.OK_CODE:
                        self.parserSData(resp, item);
                        self.renderMultipleSelect();
                        break;
                    default:
                        break;
                }
            }).fail(function(resp) {
                //w.layer.msg("获取数据失败");
            });
        },

        parserSData: function(resp, item) {
            var self = this;

            var list = resp.data.list || [];
            var el = "#" + resp.data.typeCode;

            var els = [];

            if (item.selector && _.isArray(item.selector)) {
                els = item.selector
            } else {
                els = [el];
            }

            list = this.filter(el, list);

            _.each(els, function(single_el, index) {
                var showDef = _.has(item, 'showDef') ? item.showDef : false;

                $(single_el).length > 0 && $(single_el).each(function() {
                    self.setSelect($(this), list, item.def, showDef);
                });
            });

            this.fire('select:render.complete');

            try {
                $(el).trigger("chosen:updated.chosen");
            } catch (error) {
                eBase.debug('[CURDTable.js][setSelect][catch]');
            }
        },

        isArray: function(o) {
            return Object.prototype.toString.call(o) == '[object Array]';
        },

        filter: function(el, list) {
            var result = [];
            var self = this;
            if (self.childSls && self.childSls[el] && self.childSls[el]['filter']) {
                var f1 = self.childSls[el]['filter'];

                var fu;
                if (self.urlParams && self.urlParams.hasOwnProperty(f1)) {
                    fu = self.urlParams[f1];
                }

                if (self.isArray(fu)) {
                    result = _.filter(list, function(item) {
                        return self.isIn(item['id'], fu);
                    });
                } else {
                    if (undefined != fu) {
                        for (var i = 0; i < list.length; i++) {
                            if (list[i]['id'] == fu) {
                                result.push(list[i]);
                            }
                        }
                    } else {
                        return list;
                    }
                }
            } else {
                return list;
            }

            return result;
        },

        setSelect: function(el, list, def, showDef, keyf, valf) {
            keyf = keyf || 'code';
            valf = valf || 'name';

            this.clearSelect(el);

            if (undefined != def) {
                if (showDef == true) {
                    $(el).append("<option value=''>" + def + "</option>");
                } else {
                    $(el).append("<option style='display:none;' value=''>" + def + "</option>");
                }

            }

            if (list.length === 0) {
                eBase.debug('[CURDTable.js][setSelect][list is null]');
                return;
            }

            for (var i = 0; i < list.length; i++) {

                el.append('<option value="' + list[i][keyf] + '">' + list[i][valf] + '</option>');
            }

            el.val("");

            // this.fire('select:render.complete');

            // try {
            //     $(el).trigger("chosen:updated.chosen");
            // } catch (error) {
            //     eBase.debug('[CURDTable.js][setSelect][catch]');
            // }
        },

        clearSelect: function(el) {
            if (_.isString(el)) {
                $(el).empty();
            } else {
                el.empty();
            }
        },

        initHideCols: function(pt) {
            var self = this;
            if (_.has(self.cfg, 'hideCols')) {
                _.each(self.cfg.hideCols, function(item, index) {
                    try {
                        pt.bootstrapTable("hideColumn", item);
                    } catch (err) {

                    }
                });
            }
        },
        isIn: function(value, list) {

            for (var i = 0; i < list.length; i++) {

                if (value == list[i]) {
                    return true;
                }
            }
            return false;
        },

        renderLocalDataTable: function(cache, sidePagination, pagination) {
            var self = this;
            var colConfig = _.has(self.cfg, 'columns') ? self.cfg.columns : [];
            self.$t = $(self.cfg.t).bootstrapTable({
                data: self.cfg.data,
                search: 0,
                striped: 0,
                cache: cache,
                pagination: pagination,
                paginationLoop: true,
                showRefresh: 0,
                sortOrder: "asc",
                sortable: false,
                dataType: "json",
                uniqueId: self.cfg.uuid,
                showExport: 0,
                paginationHAlign: 'right',
                strictSearch: true,
                clickToSelect: true,
                exportDataType: "basic",
                sidePagination: sidePagination,
                toolbar: self.cfg.toolbar,
                footerbar: self.cfg.footerbar,
                queryParamsType: "undefined",
                pageNumber: 1,
                pageSize: self.cfg.pageSize,
                pageList: [12, 24, 50, 100],
                columns: colConfig,
                onPostBody: function() {
                    eBase.debug('[CURDTable.js][renderTable][lonPostBody]');
                    self.fire('render.complete');
                },
                onLoadError: function() {
                    eBase.debug('[CURDTable.js][renderTable][lonPostBody]');
                    self.fire('render.error');
                }
            });
        },
        renderLocalTable: function(cache, sidePagination) {
            var self = this;
            eBase.send({
                url: self.cfg.queryUrl
            }, 'get').done(function(data) {
                var colConfig = _.has(self.cfg, 'columns') ? self.cfg.columns : [];
                self.renderTitle(data);
                self.$t = $(self.cfg.t).bootstrapTable({
                    data: data.rows,
                    search: 0,
                    striped: 0,
                    cache: cache,
                    pagination: true,
                    paginationLoop: true,
                    showRefresh: 0,
                    sortOrder: "asc",
                    sortable: false,
                    dataType: "json",
                    uniqueId: self.cfg.uuid,
                    showExport: 0,
                    paginationHAlign: 'right',
                    strictSearch: true,
                    clickToSelect: true,
                    exportDataType: "basic",
                    sidePagination: sidePagination,
                    toolbar: self.cfg.toolbar,
                    footerbar: self.cfg.footerbar,
                    queryParamsType: "undefined",
                    pageNumber: 1,
                    pageSize: self.cfg.pageSize,
                    pageList: [12, 24, 50, 100],
                    columns: colConfig,
                    onPostBody: function() {
                        eBase.debug('[CURDTable.js][renderTable][lonPostBody]');
                        self.fire('render.complete');
                        $('.bs-checkbox').css('vertical-align', ' middle');
                    },
                    onLoadError: function() {
                        eBase.debug('[CURDTable.js][renderTable][lonPostBody]');
                        self.fire('render.error');
                    }
                });
            }).fail(function(resp) {
                //fail
            });
        },
        renderTable: function() {

            eBase.debug('[CURDTable.js][renderTable][enter]');

            var self = this;

            $(self.cfg.t).bootstrapTable('destroy');

            var method = self.cfg.method || 'post',
                pagination = true,
                sidePagination = 'server',
                cache = true;
            if (self.cfg.pagination != undefined) {
                pagination = self.cfg.pagination;
            }

            var operateFormatter = self.getOperate(self.cfg.appendOperate);
            var operate = {
                field: '',
                title: '操作',
                valign: "middle",
                align: 'right',
                events: self.operateEvents,
                formatter: operateFormatter
            };

            var defaultHeight = _.has(self.cfg, 'height') ? self.cfg.height : 732;

            var colConfig = _.has(self.cfg, 'columns') ? self.cfg.columns : [];

            if (_.has(self.cfg, 'appendOperate')) {
                colConfig.push(operate);
            }

            try {
                $(self.cfg.t).bootstrapTable('destroy');
            } catch (err) {}

            if (self.cfg.dataSourceType === 'localData') {
                self.renderLocalDataTable(cache, sidePagination, pagination);
            } else if (self.cfg.dataSourceType === 'local') {
                sidePagination = 'client';
                self.renderLocalTable(cache, sidePagination);
            } else {
                self.$t = $(self.cfg.t).bootstrapTable({
                    url: self.cfg.queryUrl,
                    dataField: "rows",
                    totalField: 'total',
                    method: method,
                    search: 0,
                    striped: 0,
                    cache: cache,
                    dataType: "json",
                    pagination: pagination,
                    paginationLoop: true,
                    showRefresh: 0,
                    height: defaultHeight,
                    sortOrder: "asc",
                    sortable: false,
                    uniqueId: self.cfg.uuid,
                    showExport: 0,
                    paginationHAlign: 'right',
                    strictSearch: true,
                    clickToSelect: true,
                    exportDataType: "basic",
                    sidePagination: sidePagination,
                    toolbar: self.cfg.toolbar,
                    footerbar: self.cfg.footerbar,
                    queryParamsType: "undefined",
                    pageNumber: 1,
                    pageSize: self.cfg.pageSize,
                    pageList: [12, 24, 50, 100],
                    columns: colConfig,
                    responseHandler: function(resp) {
                        var code = resp.code;
                        switch (code) {
                            case eBase.NOT_LOGIN_CODE:
                                eBase.gotoLoginPage();
                                break;
                            case eBase.OK_CODE:
                                self.renderTitle(resp);
                                self.showTitle();
                                self.renderCompleteHandler(resp);
                                self.moveToolFlag = resp['total'] > parseInt(self.cfg.pageSize) ? true : false;
                                break;
                            case eBase.ERROR_CODE:
                            case eBase.DEL_CODE:
                            case eBase.NO_AUTH:
                            default:
                                resp.rows = [];
                                w.layer.msg(resp.msg);
                                break;
                        }
                        return resp;
                    },
                    onPostBody: function() {
                        eBase.debug('[CURDTable.js][renderTable][onPostBody]');
                        self.moveFooterbar(self.moveToolFlag);
                        $('.bs-checkbox').css('vertical-align', ' middle');
                        self.fire('render.complete');
                    },
                    onLoadError: function() {
                        eBase.debug('[CURDTable.js][renderTable][lonPostBody]');
                        self.fire('render.error');
                    },
                    queryParams: function(params) {
                        var rst = {
                            pageIndex: params.pageNumber,
                            pageSize: params.pageSize,
                            // sortName:params.sortName, //排序功能
                            // sortOrder:params.sortOrder, //排序功能
                        };
                        self.cfg.pagination === false && (rst = {});

                        rst = $.extend(true, {}, rst, self.cfg.params);

                        if (self.urlParams) {
                            return $.extend(rst, {
                                params: self.urlParams
                            });
                        } else {
                            return rst;
                        }

                        return {};
                    }
                });
            }

            self.$t && self.$t.on('load-success.bs.table', function(data) {
                eBase.debug('[CURDTable.js][renderTable][load data success]');
            });

            self.initHideCols(self.$t);
            self.initValidate();
            self.initDateInput();
            self.initChildEvent();
        },

        renderTitle: function(resp) {
            if (_.has(this.cfg, 'ti')) {
                var ti_el = this.cfg.ti;
                if ($(ti_el).length > 0 && _.has(resp, 'title')) {
                    $(ti_el).text(resp.title);
                    $(ti_el).attr('title', resp.title);
                }
            }
        },

        getOperate: function(type, custom_fuc) {
            var result = null,
                self = this;
            switch (type) {
                case w.CONSTE.OPERATE.ALL:
                    result = self.OperatingFomatter;
                    break;
                case w.CONSTE.OPERATE.SHENHE_ALL:
                    result = self.OperatingShenAllFomatter;
                    break;
                case w.CONSTE.OPERATE.METERING_MANAGER:
                    result = self.OperatingMeteringFomatter;
                    break;
                case w.CONSTE.OPERATE.SONGJIAN:
                    result = self.SubmitForCheckFomatter;
                    break;
                case w.CONSTE.OPERATE.INVESTMENT_TRACK:
                    result = self.investmentTrackFomatter;
                    break;
                case w.CONSTE.OPERATE.DETAIL:
                    result = self.detailFomatter;
                    break;
                default:
                    if (_.isFunction(custom_fuc)) {
                        result = custom_fuc
                    }
                    break;
            }

            return result;
        },

        investmentTrackFomatter: function(value, row, index) {
            return '<span class="operate"><a href="javascript:void(0);" class="o_track">项目跟踪</a></span>';
        },

        detailFomatter: function(value, row, index) {
            return '<span class="operate"><a href="javascript:void(0);" class="o_fixed_detail">详情</a></span>'
        },

        SubmitForCheckFomatter: function(value, row, index) {
            return '<span class="operate"><a href="javascript:void(0);" class="o_submitForCheck">通知送检</a></span>';
        },
        OperatingFomatter: function(value, row, index) {
            return '<span class="operate"><a href="javascript:void(0);" class="o_edit">编辑</a>\
            |<a href="javascript:void(0);" class="o_detail">详情</a>\
            |<a href="javascript:void(0);" class="o_remove">删除</a></span>';
        },

        OperatingShenAllFomatter: function(value, row, index) {
            var b_valid = row['b_valid'];

            if (b_valid == 1) {
                return `<span class="operate"><a href="javascript:void(0);" class="o_edit">编辑</a>
                |<a href="javascript:void(0);" class="o_detail">详情</a>
                |<a href="javascript:void(0);" class="o_remove">删除</a>`;
            } else {
                return `<span class="operate"><a href="javascript:void(0);" class="o_edit">编辑</a>
                |<a href="javascript:void(0);" class="o_detail">详情</a>
                |<a href="javascript:void(0);" class="o_remove">删除</a>
                |<a href="javascript:void(0);" disabled='true' class="o_shenhe">审核</a></span>`;
            }
        },

        OperatingMeteringFomatter: function(value, row, index) {
            return '<span class="operate"><a href="javascript:void(0);" class="o_detail">详情</a>\
            |<a href="javascript:void(0);" class="o_m_manager">计量器具管理</a></span>';
        },

        moveFooterbar: function(flag) {
            var self = this;
            if (_.has(self.cfg, 'footerbar')) {
                flag && $(self.cfg.t).parent().parent().find('.fixed-table-footer').after($(self.cfg.footerbar));
                !flag && self.footerbar_father.append($(self.cfg.footerbar));
            }
        },
        clearModal: function() {
            var self = this;
            if (_.has(self.cfg, 'clearModal') && _.isFunction(self.cfg.clearModal)) {
                self.cfg.clearModal();
                return;
            }
            self.$m.find('input').val("");
            self.$m.find('input[type="text"]').val("");
            self.$m.find('input[type="password"]').val("");
            self.$m.find('input[type="email"]').val("");
            self.$m.find('input[type="file"]').fileinput('clear');
            self.$m.find('select').val("");
        },

        showModal: function(row) {

            var self = this;
            var row, title, def = {};

            if (self.addFlag) {
                row = {};
                title = self.cfg.addTitle;
            } else {
                row = self.selections[0];
                title = self.cfg.editTitle;
            }

            row = row || def;

            self.$m.data('id', row.id);
            self.$m.find('.modal-title').text(title);
            self.$m.modal('show');

            if (!self.addFlag && _.has(self.cfg, 'setEditRow') && _.isFunction(self.cfg.setEditRow)) {
                self.cfg.setEditRow(row);
                return;
            }

            self.setRowValues();
        },

        showDetailModal: function(row) {
            var self = this;
            self.$d.find('.modal-title').text(self.cfg.detailTitle);

            try {
                var opt = $("#illegal_detail").val();
                if (opt === '0') {
                    self.$d.find('.illegal').removeClass("hidden-em");
                } else {
                    self.$d.find('.illegal').addClass("hidden-em");
                }
            } catch (err) {

            }

            self.$d.modal('show');

            if (_.has(self.cfg, 'setDetailRow') && _.isFunction(self.cfg.setDetailRow)) {

                for (var key1 in row) {
                    self.$d.find('input').attr('disabled', true);
                    self.$d.find('select').attr('disabled', true);
                }

                self.cfg.setDetailRow(row);
                return;
            }

            for (var key in row) {
                self.$d.find('input[name="' + key + '"]').val(row[key]);
                self.$d.find('input[name="' + key + '"]').attr('disabled', true);
                self.$d.find('select[name="' + key + '"]').attr('disabled', true);
                // self.$d.find('select]').attr('disabled', true);

                self.$d.find("select[name]").each(function() {
                    var data = $(this).attr('name');

                    if (key === data) {
                        $(this).val(row[key]);
                        return false;
                    }
                });

                self.$d.find('img[name="' + key + '"]').each(function() {
                    $(this).attr('src', row[key]);
                });

                self.$d.find('a[name="' + key + '"]').each(function() {
                    if ('' != row[key]) {
                        $(this).attr('href', row[key]).attr("download", row[key]);
                    }
                });

                self.$d.find("select[multiple]").each(function() {
                    var data = $(this).attr('name');

                    if (key === data) {
                        $(this).val(row[key]);
                        $(this).trigger("chosen:updated");
                        return false;
                    }
                });
            }
        },

        addDownloadEvent: function(el, url) {
            el.off('click').on('click', function() {
                if (undefined != url && '' != url) {
                    var $a = $("<a></a>").attr("href", url).attr("download", url);
                    $a[0].click();
                }

                return false;
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

                self.$m.find('input[type="file"]').each(function() {
                    var self_el = $(this);
                    var name = self_el.data('field');
                    var name1 = name + '1';
                    var thisImage = row[name1] || undefined;
                    var allowedFileTypes = _.has(self.cfg, 'fileType') ? self.cfg.fileType[name]['allowedFileTypes'] : ['image'];
                    var allowedFileExtensions = _.has(self.cfg, 'fileType') ? self.cfg.fileType[name]['allowedFileExtensions'] : ['jpg', 'png', 'gif'];
                    var showPreview = _.has(self.cfg, 'fileType') ? self.cfg.fileType[name]['showPreview'] : true;
                    if (thisImage) {
                        self_el.fileinput('destroy');
                        self_el.fileinput({
                            language: 'zh',
                            uploadUrl: '/zuul/oss/putObject',
                            showUpload: false,
                            showCaption: true,
                            overwriteInitial: true,
                            dropZoneEnabled: false,
                            showPreview: showPreview,
                            allowedFileTypes: allowedFileTypes,
                            allowedFileExtensions: allowedFileExtensions,
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
                    } else {
                        self_el.fileinput('clear');
                    }
                }); //end each
            }
        },

        setDefault: function() {
            var self = this;

            if (_.has(self.cfg, 'defValues')) {
                for (var key in self.cfg.defValues) {
                    var val = self.cfg.defValues[key];
                    $('input[name="' + key + '"],select[name="' + key + '"]').val(val);
                }
            }
        },

        autoFill: function() {
            var self = this;
            if (_.has(self.cfg, 'autoIds') && _.isArray(self.cfg.autoIds)) {
                _.each(self.cfg.autoIds, function(item) {
                    self.$m.find('input[name="' + item + '"]').each(function() {
                        $(this).val(self.randomId());
                        $(this).removeAttr('disabled', 'disabled');
                        $(this).parent().find('button').length > 0 && $(this).parent().find('button').removeAttr('disabled', 'disabled');
                        $(this).parent().find('button').length > 0 && $(this).parent().find('button').click(function() {
                            $(this).parent().parent().find('input[type="text"]').val(self.randomId());
                        });
                    });
                });
            }
        },

        unuseFields: function() {
            var self = this;
            if (_.has(self.cfg, 'unEditFields') && _.isArray(self.cfg.unEditFields)) {
                _.each(self.cfg.unEditFields, function(item) {
                    self.$m.find('input[name="' + item + '"],select[name="' + item + '"]').each(function() {
                        $(this).attr('disabled', 'disabled');
                        $(this).parent().find('button').length > 0 && $(this).parent().find('button').attr('disabled', 'disabled');
                    });
                });
            }
        },

        initChildEvent: function() {
            var self = this;
            if (!self.cfg.child || self.cfg.child.length == 0) return;
            for (var i = 0; i < self.cfg.child.length; i++) {
                var item = self.cfg.child[i];
                var el = item['el'];
                $(el).change(function() {
                    var it = self.findElByID('#' + $(this).attr('id'));
                    if (it) {
                        var sv = $(it['el']).find("option:selected").val();
                        self.$m.find('input[name="' + it['keyField'] + '"]').val(sv);
                    }
                });
            }
        },

        findElByID: function(el) {
            var self = this;
            if (!self.cfg.child || self.cfg.child.length == 0) return null;
            for (var i = 0; i < self.cfg.child.length; i++) {
                var elm = self.cfg.child[i]['el'];
                if (elm === el) {
                    return self.cfg.child[i];
                }
            }

            return null;
        },

        editClickHandler: function(id) {
            var self = this;
            eBase.debug('[CURDTable.js][editClickHandler][editBtn click handler]');
            self.addFlag = false;
            self.selections = [];

            if (_.isUndefined(id)) {
                self.selections = $(self.cfg.t).bootstrapTable('getSelections');
            } else {
                self.selections.push($(self.cfg.t).bootstrapTable('getRowByUniqueId', id));
            }

            if (self.selections && self.selections.length == 0) {
                w.layer.msg("请选择一条记录");
                return;
            } else if (self.selections && self.selections.length > 1) {
                w.layer.msg("一次不能编辑多条");
                return;
            }
            self.showModal();
            var opt = $("#illegal").val();
            if (opt == 1) {
                $(".illegal").removeClass("hidden-em");
            } else {
                $(".illegal").addClass("hidden-em");
            }
            self.unuseFields();
            self.refreshAPI();
        },

        delClickHandler: function(id, batch) {
            var self = this;
            eBase.debug('[CURDTable.js][delClickHandler][del button click handler]');
            self.selections = [];

            if (_.isUndefined(id)) {
                self.selections = $(self.cfg.t).bootstrapTable('getSelections');
            } else {
                self.selections.push($(self.cfg.t).bootstrapTable('getRowByUniqueId', id));
            }

            if (self.selections && self.selections.length < 1) {
                w.layer.msg("请选择要删除的数据");
                return;
            }

            var delIndex = w.layer.confirm(self.cfg.confirmMsg, {
                btn: ['删除', '取消'],
                shade: false
            }, function() {
                eBase.debug('[CURDTable.js][delClickHandler][删除 click handler]');

                var ids = [];

                for (var i = 0; i < self.selections.length; i++) {
                    var item = self.selections[i][self.cfg.uuid];
                    item && ids.push(item);
                }

                self.delItem(ids);

                w.layer.close(delIndex);

            }, function() {
                eBase.debug('[CURDTable.js][delClickHandler][取消 click handler]');
            });
        },

        shenHeClickHandler: function(id, batch) {
            var self = this;
            eBase.debug('[CURDTable.js][shenHeClickHandler][del button click handler]');
            self.selections = [];

            if (_.isUndefined(id)) {
                self.selections = $(self.cfg.t).bootstrapTable('getSelections');
            } else {
                self.selections.push($(self.cfg.t).bootstrapTable('getRowByUniqueId', id));
            }

            if (self.selections && self.selections.length < 1) {
                w.layer.msg("请选择要审核的数据");
                return;
            }

            var delIndex = w.layer.confirm(self.cfg.confirmSSMsg, {
                btn: ['确认', '取消'],
                shade: false
            }, function() {
                eBase.debug('[CURDTable.js][shenHeClickHandler][SHENHE click handler]');

                var ids = [];

                for (var i = 0; i < self.selections.length; i++) {
                    var item = self.selections[i][self.cfg.uuid];
                    item && ids.push(item);
                }

                self.shenheItem(ids);

                w.layer.close(delIndex);

            }, function() {
                eBase.debug('[CURDTable.js][delClickHandler][取消 click handler]');
            });
        },

        submitForCheckClickHandler: function(id, batch) {
            var self = this;
            eBase.debug('[CURDTable.js][submitForCheckClickHandler][del button click handler]');
            self.selections = [];

            if (_.isUndefined(id)) {
                self.selections = $(self.cfg.t).bootstrapTable('getSelections');
            } else {
                self.selections.push($(self.cfg.t).bootstrapTable('getRowByUniqueId', id));
            }

            if (self.selections && self.selections.length < 1) {
                w.layer.msg("请选择要通知送检的数据");
                return;
            }

            var delIndex = w.layer.confirm(self.cfg.confirmSendMsg, {
                btn: ['确认', '取消'],
                shade: false
            }, function() {
                eBase.debug('[CURDTable.js][submitForCheckClickHandler][submitForCheck click handler]');

                var ids = [];

                for (var i = 0; i < self.selections.length; i++) {
                    var item = self.selections[i][self.cfg.uuid];
                    item && ids.push(item);
                }

                self.submitForCheckItem(ids);

                w.layer.close(delIndex);

            }, function() {
                eBase.debug('[CURDTable.js][delClickHandler][取消 click handler]');
            });
        },

        gotoMeteringManagerPage: function(id, row) {
            var target = this.cfg.meteringPage || 'meteringPage.html';
            window.location.href = target + '?id=' + id + '&name=' + row['name'];
        },

        gotoInvestmentOfFixedTrack: function(id, row) {
            var target = 'investmentOfFixedTrack_new.html';
            window.location.href = target + '?id=' + id;
        },

        detailClickHandler: function(id) {
            var self = this;
            eBase.debug('[CURDTable.js][detailClickHandler][editBtn click handler]');
            self.addFlag = false;
            self.selections = [];

            if (_.isUndefined(id)) {
                self.selections = $(self.cfg.t).bootstrapTable('getSelections');
            } else {
                self.selections.push($(self.cfg.t).bootstrapTable('getRowByUniqueId', id));
            }

            if (self.selections && self.selections.length == 0) {
                w.layer.msg("请选择一条记录");
                return;
            } else if (self.selections && self.selections.length > 1) {
                w.layer.msg("一次不能查看多条");
                return;
            }

            self.showDetailModal(self.selections[0]);
        },

        addButtonListeners: function() {
            var self = this;

            $(self.cfg.addBtn).length > 0 && $(self.cfg.addBtn).off('click').on('click', function() {
                if (self.isLocal()) return;
                eBase.debug('[CURDTable.js][addButtonListeners][addBtn click handler]');
                self.addFlag = true;
                self.clearModal();
                self.showModal();
                $("#illegal").val('0');
                $(".illegal").addClass("hidden-em");
                self.autoFill();
                self.setDefault();
                self.refreshAPI();

                setTimeout(function() {
                    $('.modal-body').scrollTop(0);
                }, 200);
            });

            $(self.cfg.editBtn).length > 0 && $(self.cfg.editBtn).off('click').on('click', function() {
                if (self.isLocal()) return;
                self.editClickHandler();
            });

            $(self.cfg.delBtn).length > 0 && $(self.cfg.delBtn).off('click').on('click', function() {
                if (self.isLocal()) return;
                self.delClickHandler();
            });

            $(self.cfg.batchDelBtn).length > 0 && $(self.cfg.batchDelBtn).off('click').on('click', function() {
                if (self.isLocal()) return;
                self.delClickHandler();
            });

            $(self.cfg.shenheBtn).length > 0 && $(self.cfg.shenheBtn).off('click').on('click', function() {
                if (self.isLocal()) return;
                self.shenHeClickHandler();
            });

            $(self.cfg.submitForCheckBtn).length > 0 && $(self.cfg.submitForCheckBtn).off('click').on('click', function() {
                if (self.isLocal()) return;
                self.submitForCheckClickHandler();
            });

            $(self.cfg.checkAllBtn).length > 0 && $(self.cfg.checkAllBtn).off('click').on('click', function() {

                var check = $(self.cfg.checkAllBtn).data('cked');
                if (check === 'checked') {
                    $(self.cfg.checkAllBtn).data('cked', 'unchecked');
                    self.$t && self.$t.bootstrapTable("uncheckAll");
                } else {
                    $(self.cfg.checkAllBtn).data('cked', 'checked');
                    self.$t && self.$t.bootstrapTable("checkAll");
                }
            });

            $(self.cfg.endStateBtn).length > 0 && $(self.cfg.endStateBtn).off('click').on('click', function() {
                self.hideBtns();
            });

            $(self.cfg.batchEditBtn).length > 0 && $(self.cfg.batchEditBtn).off('click').on('click', function() {
                self.showBtns();
            });

            self.$m && self.$m.find('.submit').off('click').on('click', function() {
                var row = {};

                if (_.has(self.cfg, 'getRow') && _.isFunction(self.cfg.getRow)) {
                    row = self.cfg.getRow();
                } else {
                    self.$m.find('input[name]').each(function() {
                        row[$(this).attr('name')] = $(this).val();
                    });

                    self.$m.find('select[name]').each(function() {
                        row[$(this).attr('name')] = $(this).val();
                    });
                }

                row = _.has(self.cfg, 'extendRows') ? $.extend(true, {}, self.cfg.extendRows, row) : $.extend(true, {}, {}, row);

                if (_.has(self.cfg, 'ValidateFields')) {
                    _.each(self.cfg.ValidateFields, function(item, index) {
                        $(self.cfg.m).find('form').data("bootstrapValidator").addField(item);
                    });
                }

                $(self.cfg.m).find('form').data("bootstrapValidator").validate();
                var flag = $(self.cfg.m).find('form').data("bootstrapValidator").isValid();

                if ($(self.cfg.m).find('form').data("bootstrapValidator").isValid()) {
                    self.addItem(row);
                }

            });

            self.$d && self.$d.find('.submit').off('click').on('click', function() {
                eBase.debug('[CURDTable.js][addModalListeners][detail panel submit click handler]');
            });

            _.has(self.cfg, 'search_params') && $(self.cfg.search_params.field_select).find('a').off('click').on('click', function() {
                var text = $(this).text() + '\
                                <span class="caret"></span>';
                $(self.cfg.search_params.field_select).find('button').html(text);
                $(self.cfg.search_params.field_input).data('field', $(this).data('field'));
                $(self.cfg.search_params.field_input).attr('placeholder', $(this).data('placeholder'));
                $(self.cfg.search_params.field_input).val('');
            });

            var searchHandler = function() {
                if (self.isLocal()) return;
                var params = {};

                $(self.cfg.inputBar).find("input[data-field]").each(function() {
                    var key = $(this).data('field');
                    var value = $(this).val();
                    if ('' != value && '' != key) {
                        params[key] = value;
                    }
                });

                $(self.cfg.inputBar).find("select[data-field]").each(function() {
                    var key = $(this).data('field');
                    var value = $(this).val();
                    if ('' != value && '' != key) {
                        params[key] = value;
                    }
                });

                // var newp = self.urlParams ? $.extend({}, self.urlParams, params) : params;
                var newp = self.urlParams ? $.extend({}, self.urlParams, (self.cfg.params && self.cfg.params.params ? self.cfg.params.params : {}), params) :
                    $.extend({}, (self.cfg.params && self.cfg.params.params ? self.cfg.params.params : {}), params);

                var opt = {
                    url: self.cfg.queryUrl,
                    method: 'post',
                    silent: true,
                    query: {
                        params: newp
                    }
                };

                $(self.cfg.t).bootstrapTable('refresh', opt);
            };

            $(self.cfg.inputBar).find("input[data-field]").off('keyup').on('keyup', function(event) {
                if (event.keyCode == 13) {
                    searchHandler();
                }
            });

            $(self.cfg.serBtn) && $(self.cfg.serBtn).length > 0 && $(self.cfg.serBtn).off('click').on('click', searchHandler);

            $(self.cfg.refBtn) && $(self.cfg.refBtn).length > 0 && $(self.cfg.refBtn).off('click').on('click', function() {

                var newpp = self.urlParams ? $.extend({}, self.urlParams, {}) : {};
                var opt = {
                    url: self.cfg.queryUrl,
                    method: 'post',
                    silent: true,
                    query: {
                        params: newpp
                    }
                };

                self.clearInputs();
                $(self.cfg.t).bootstrapTable('refresh', opt);
            });
        },

        isLocal: function() {
            var result = false;
            if (this.cfg.dataSourceType === 'local') {
                w.layer.msg("静态数据");
                result = true;
            }

            return result;
        },

        randomId: function() {

            var now = new Date();
            var id = '' + this.getFormatterDate(now) + '' + _.random(100000, 999999);

            return id;
        },

        getFormatterDate: function(date) {
            var result;

            if (_.isDate(date)) {

                date = new Date();
                var year = date.getFullYear(),
                    m = date.getMonth() + 1,
                    moth = m >= 10 ? m : '0' + m,
                    day = date.getDate();
                result = '' + year + moth + day;

            } else {
                throw new Error('params is not a date');
            }

            return result;
        },

        clearInputs: function() {

            var self = this;

            if (!$(self.cfg.inputBar) || $(self.cfg.inputBar).length <= 0) return;

            $(self.cfg.inputBar).find("input[data-field]").each(function() {
                var value = $(this).val('');
            });
        },

        compileHeight: function() {
            var count = 0;
            var self = this;
            $(self.cfg.t).find("th[data-field]").each(function() {
                var input_hidden = $(this).data('hidden');
                if (!input_hidden) {
                    count++;
                }
            });
            return Math.ceil(count / 2) * 49 + 42 + 40 + 50 + 30;
        },

        addModalListeners: function() {

            var self = this;

            if ("undefined" == self.$m) return;

            self.$m.on('hide.bs.modal', function() {

                eBase.debug('[CURDTable.js][addModalListeners][hide.bs.modal click]');

                $(this).find('form').bootstrapValidator('resetForm', true);
            });
        },

        addTableListeners: function() {
            var self = this;

            $(self.cfg.t).on("all.bs.table", function() {
                //eBase.debug('all.bs.table click');
            }).on("click-row.bs.table", function(row, $element, field) {
                self.cfg.rowClickHandler && self.cfg.rowClickHandler(row, $element, field);
                //eBase.debug("Event:click-row.bs.table");
            }).on("dbl-click-row.bs.table", function(row, $element, field) {
                self.cfg.dbRowClickHandler && self.cfg.dbRowClickHandler(row, $element, field);
                //eBase.debug("Event:dbl-click-row.bs.table");
            }).on("sort.bs.table", function() {
                //eBase.debug("Event:sort.bs.table");
            }).on("check.bs.table", function(row, $element, field) {
                //eBase.debug("Event:check.bs.table");
            }).on("uncheck.bs.table", function(row, $element, field) {
                //eBase.debug("Event:uncheck.bs.table");
            }).on("check-all.bs.table", function() {
                //eBase.debug("Event:check-all.bs.table");
            }).on("uncheck-all.bs.table", function() {
                //eBase.debug("Event:uncheck-all.bs.table");
            }).on("load-success.bs.table", function() {
                //eBase.debug("Event:load-success.bs.table");
            }).on("load-error.bs.table", function() {
                //eBase.debug("Event:load-error.bs.table");
            }).on("column-switch.bs.table", function() {
                //eBase.debug("Event:column-switch.bs.table");
            }).on("page-change.bs.table", function() {
                //eBase.debug("Event:page-change.bs.table");
            }).on("search.bs.table", function() {
                //eBase.debug("Event:search.bs.table");
            }).on("success.bs.table", function() {
                self.fire('render.complete');
            });
        },

        initOperateEvents: function() {
            var self = this;
            this.operateEvents = {
                'click .o_edit': function(e, value, row, index) {
                    eBase.debug('[CURDTable.js][operateEvents][edit operate click handler]');
                    self.checkDataSource() && self.cfg.uuid && self.editClickHandler(row[self.cfg.uuid]);
                },
                'click .o_detail': function(e, value, row, index) {
                    eBase.debug('[CURDTable.js][operateEvents][detail operate handler]');
                    self.cfg.uuid && self.detailClickHandler(row[self.cfg.uuid]);
                },
                'click .o_remove': function(e, value, row, index) {
                    eBase.debug('[CURDTable.js][operateEvents][remove operate click handler]');
                    self.checkDataSource() && self.cfg.uuid && self.delClickHandler(row[self.cfg.uuid]);
                },
                'click .o_shenhe': function(e, value, row, index) {
                    eBase.debug('[CURDTable.js][operateEvents][shenhe operate click handler]');
                    self.checkDataSource() && self.cfg.uuid && self.shenHeClickHandler(row[self.cfg.uuid]);
                },
                'click .o_m_manager': function(e, value, row, index) {
                    eBase.debug('[CURDTable.js][operateEvents][o_m_manager operate click handler]');
                    self.checkDataSource() && self.cfg.uuid && self.gotoMeteringManagerPage(row[self.cfg.uuid], row);
                },
                'click .o_submitForCheck': function(e, value, row, index) {
                    eBase.debug('[CURDTable.js][operateEvents][submitForCheck operate click handler]');
                    self.checkDataSource() && self.cfg.uuid && self.submitForCheckClickHandler(row[self.cfg.uuid]);
                },
                'click .o_track': function(e, value, row, index) {
                    self.cfg.investment_track_handler && self.cfg.investment_track_handler();
                },
                'click .o_fixed_detail': function(e, value, row, index) {
                    self.checkDataSource() && self.cfg.uuid && self.gotoInvestmentOfFixedTrack(row[self.cfg.uuid], row);
                }
            };
        },

        checkDataSource: function() {
            var result = true;
            if (this.cfg.dataSourceType && this.cfg.dataSourceType != 'server') {
                w.layer.msg("静态数据");
                result = false;
            }
            return result;
        },

        /**
         * 获取整个table的函数
         * */
        queryData: function() {
            var self = this;
            eBase.send({
                url: self.cfg.queryUrl
            }).done(function(result) {
                eBase.debug('[CURDTable.js][queryData][send success]');
                $(self.cfg.t).bootstrapTable('refresh');
            }).fail(function(result) {
                eBase.debug('[CURDTable.js][queryData][send fail]');
            });
        },

        trace: function(msg, row) {
            eBase.debug(msg + ":" + JSON.stringify(row));
        },

        /**
         * 增加,修改
         * */
        addItem: function(row) {
            var self = this;

            if (!_.has(self.cfg, 'addUrl') && !_.has(self.cfg, 'editUrl'))
                return;

            var url = self.addFlag ? self.cfg.addUrl : self.cfg.editUrl;
            var msg = self.addFlag ? "添加--参数为：" : "编辑--口参数为：";

            self.trace(msg, row);

            self.cfg.beforeSend(row);

            eBase.send({
                'url': url,
                data: JSON.stringify(row)
            }).done(function() {
                eBase.debug('[CURDTable.js][addItem][send success]');
                w.layer.msg('保存成功');
                self.$m.modal('hide');
                self.$t.bootstrapTable('refresh');
                $(self.cfg.m).find('form').bootstrapValidator('resetForm', true);
                self.refreshAPI();
                self.fire('modify.complete');
            }).fail(function() {
                eBase.debug('[CURDTable.js][addItem][send failed]');
                self.$m.modal('hide');
                self.$t.bootstrapTable('refresh');
                $(self.cfg.m).find('form').bootstrapValidator('resetForm', true);
                self.refreshAPI();
            });
        },

        delItem: function(ids) {
            var self = this;
            if (!_.has(self.cfg, 'delUrl'))
                return;
            self.trace("删除参数：", ids);
            eBase.debug('[CURDTable.js][delItem]');
            eBase.send({
                'url': self.cfg.delUrl,
                data: JSON.stringify(ids)
            }).done(function() {
                eBase.debug('[CURDTable.js][delItem][send success]');
                self.$t.bootstrapTable('refresh');
                self.refreshAPI();
                w.layer.msg('删除成功');
                self.fire('modify.complete');
            }).fail(function() {
                eBase.debug('[CURDTable.js][delItem][send failed]');
            });
        },

        shenheItem: function(ids) {
            var self = this;
            var url = '';
            if (_.has(self.cfg, 'shenheUrl')) {
                url = self.cfg.shenheUrl;
            }
            eBase.send({
                'url': url,
                data: JSON.stringify(ids)
            }).done(function() {
                eBase.debug('[CURDTable.js][shenheItem][send success]');
                self.$t.bootstrapTable('refresh');
                self.refreshAPI();
                w.layer.msg('审核成功');
            }).fail(function() {
                eBase.debug('[CURDTable.js][shenheItem][send failed]');
            });
        },

        submitForCheckItem: function(ids) {
            var self = this;
            var url = '';
            if (_.has(self.cfg, 'submitForCheckUrl')) {
                url = self.cfg.submitForCheckUrl;
            }
            eBase.send({
                'url': url,
                data: JSON.stringify(ids)
            }).done(function() {
                eBase.debug('[CURDTable.js][submitForCheckItem][send success]');
                self.$t.bootstrapTable('refresh');
                self.refreshAPI();
                w.layer.msg('已通知');
            }).fail(function() {
                eBase.debug('[CURDTable.js][submitForCheckItem][send failed]');
            });
        },

        unuse: function(el) {
            $(el).attr("disabled", true);
        },

        checkValue: function(el, val) {
            $(el).val(val);
        },

        checkText: function(el, txt) {
            txt = txt || '';
            $(el).find("option").each(function() {
                alert($(this).text());
                if (text && txt === $(this).text()) {
                    $(el).val($(this).val());
                }
            });
        },
        on: function(type, handler) {

            if (this.handlers[type] == undefined) {
                this.handlers[type] = [];
            }

            //在数组里面我要把需要执行的回调push到数组里面
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
        },

        refreshTable: function(newParams) {
            newParams = newParams || {};
            var self = this,
                params = {};
            if (self.isLocal()) return;

            $.extend(self.cfg.params.params, newParams)

            $(self.cfg.inputBar).find("input[data-field]").each(function() {
                var key = $(this).data('field');
                var value = $(this).val();
                if ('' != value && '' != key) {
                    params[key] = value;
                }
            });

            $(self.cfg.inputBar).find("select[data-field]").each(function() {
                var key = $(this).data('field');
                var value = $(this).val();
                if ('' != value && '' != key) {
                    params[key] = value;
                }
            });

            // var newp = self.urlParams ? $.extend({}, self.urlParams, params) : params;
            var newp = self.urlParams ? $.extend({}, self.urlParams, (self.cfg.params && self.cfg.params.params ? self.cfg.params.params : {}), params) :
                $.extend({}, (self.cfg.params && self.cfg.params.params ? self.cfg.params.params : {}), params);

            // newp = { ...newp,
            //     ...newParams
            // }
            newp = $.extend(newp, newParams);
            var opt = {
                url: self.cfg.queryUrl,
                method: 'post',
                silent: true,
                query: {
                    params: newp
                }
            };
            $(self.cfg.t).bootstrapTable('refresh', opt);
        }
    };

    w.cur = CURDTable;
    w.$c = null;

    function TFormatter(value, row, index) {

        if ("1" == value) {
            return "是";
        }

        return "否";
    }

    function EFormatter(value, row, index) {

        if ("0" == value) {
            return "启用";
        }

        return "禁用";
    }

    function DateFormatter(value, row, index) {
        return new Date(value).Format('yyyy-MM-dd');
    }

    function SubstrDateFormatter(result, row, index) {
        result += '';
        var date = new Date(result.substr(0, 4) + '-' + result.substr(4, 2) + '-' + result.substr(6, 2) + ' ' + result.substr(8, 2) + ':' + result.substr(10, 2) + ':' + result.substr(12, 2));
        date = date.Format('yyyy-MM-dd hh:mm')
        return date;
    }

    function MFormatter(value, row, index) {
        var result = ' ';
        switch (value) {
            case '2':
                result = '故障';
                break;
            case '3':
                result = '停用';
                break;
            case '1':
            default:
                result = '正常';
                break;
        }

        return result;
    }

    function EnergyAuditFormatter(value, row, index) {
        if (value == '1') {
            return '已审核';
        } else {
            return '待审核';
        }
    }

    function ImageFormatter(value, row, index) {
        var image = '';
        if (value) {
            image = '<img src = ' + value + ' width=\'50\' height=\'50\'>';
            return image;
        }
    }

    function Left16Formatter(value, row, index) {
        return '<span class="pl16">' + value + '</span>';
    }

    function RightAlignFormatter(value, row, index) {
        return '<span class="right-align">' + value + '</span>';
    }

    function IndexFormatter(value, row, index) {
        return '' + (index + 1);
    }

    function OperatingFomatter(value, row, index) {
        var uuid = window.$c.cfg.uuid;
        return '<span class="operate"><a href="javascript:void(0);" class="tedit" onclick="onEditClick(' + row[uuid] + ')">编辑</a>\
        |<a href="javascript:void(0);" class="tdetail" onclick="onDetailClick(' + row[uuid] + ')">详情</a>\
        |<a href="javascript:void(0);" class="tdel" onclick="onDelClick(' + row[uuid] + ')">删除</a></span>';
    }

    function OperatingFomatterC(value, row, index) {
        var uuid = window.$c.cfg.uuid;
        return '<span class="operate"><a href="javascript:void(0);" class="tedit" onclick="onEditClick(' + row[uuid] + ')">编辑</a>\
        |<a href="javascript:void(0);" class="tdetail" onclick="onDetailClick(' + row[uuid] + ')">详情</a></span>';
    }

    function OperatingEDFomatter(value, row, index) {
        var uuid = window.$c.cfg.uuid;
        return '<span class="operate"><a href="javascript:void(0);" class="tedit" onclick="onEditClick(' + row[uuid] + ')">编辑</a>\
        |<a href="javascript:void(0);" class="tdel" onclick="onDelClick(' + row[uuid] + ')">删除</a></span>';
    }

    function OperatingDFomatter(value, row, index) {
        var uuid = window.$c.cfg.uuid;
        return '<span class="operate"><a href="javascript:void(0);" class="tedit" onclick="onDetailClick(' + row[uuid] + ')">详情</a></span>';
    }

    function OperatingMoreFomatter(value, row, index) {
        var uuid = window.$c.cfg.uuid;
        return '<span class="operate"><a href="javascript:void(0);" class="tedit" onclick="onEditClick(' + row[uuid] + ')">修改</a>\
        |<a href="javascript:void(0);" class="tdel" onclick="onDelClick(' + row[uuid] + ')">删除</a>\
        |<a href="javascript:void(0);">设置</a>\
        |<a href="javascript:void(0);">复制</a></span>';
    }

    function OperatingExcutionFomatter(value, row, index) {
        var uuid = window.$c.cfg.uuid;
        return '<span class="operate"><a href="javascript:void(0);">执行预案</a></span>';
    }

    function OperatingAuditFomatter(value, row, index) {
        var uuid = window.$c.cfg.uuid;
        return '<span class="operate"><a href="javascript:void(0);" class="tedit" onclick="onEditClick(' + row[uuid] + ')">编辑</a>\
        |<a href="javascript:void(0);" class="tdetail" onclick="onDetailClick(' + row[uuid] + ')">详情</a>\
        |<a href="javascript:void(0);" class="tdel" onclick="onDelClick(' + row[uuid] + ')">删除</a>\
        |<a href="javascript:void(0);">审核</a></span>';
    }

    function OperatingInvestAFomatter(value, row, index) {
        var uuid = window.$c.cfg.uuid;
        return '<span class="operate"><a href="javascript:void(0);" class="tdetail" onclick="onDetailClick(' + row[uuid] + ')">详情</a>\
        |<a href="javascript:void(0);" onclick="onDetailClick(' + row[uuid] + ')">审核</a></span>';
    }

    function OperatingShenheFomatter(value, row, index) {
        var uuid = window.$c.cfg.uuid;
        return '<span class="operate"><a href="javascript:void(0);" onclick="onShenClick(' + row[uuid] + ')">审核</a>';
    }

    function onSubmitClick(id) {
        checkDataSource() && window.$c && window.$c.shenHeClickHandler(id);
    }

    function onShenClick(id) {
        checkDataSource() && window.$c && window.$c.shenHeClickHandler(id);
    }

    function onEditClick(id) {
        checkDataSource() && window.$c && window.$c.editClickHandler(id);
    }

    function checkDataSource() {
        var result = true;
        if (window.$c && window.$c.cfg.dataSourceType != 'server') {
            w.layer.msg("静态数据");
            result = false;
        }
        return result;
    }

    function onDetailClick(id) {
        $(window.$c.cfg.d).length > 0 ? window.$c.detailClickHandler(id) : window.$c.editClickHandler(id);
    }

    function onDelClick(id) {
        checkDataSource() && window.$c && window.$c.delClickHandler(id);
    }

    w.TFormatter = TFormatter;
    w.EFormatter = EFormatter;
    w.DateFormatter = DateFormatter;
    w.MFormatter = MFormatter;
    w.ImageFormatter = ImageFormatter;
    w.IndexFormatter = IndexFormatter;
    w.EnergyAuditFormatter = EnergyAuditFormatter;
    w.OperatingFomatter = OperatingFomatter;
    w.OperatingFomatterC = OperatingFomatterC;
    w.Left16Formatter = Left16Formatter;
    w.onEditClick = onEditClick;
    w.onDetailClick = onDetailClick;
    w.onShenClick = onShenClick;
    w.onDelClick = onDelClick;
    w.RightAlignFormatter = RightAlignFormatter;
    w.OperatingEDFomatter = OperatingEDFomatter;
    w.OperatingDFomatter = OperatingDFomatter;
    w.OperatingMoreFomatter = OperatingMoreFomatter;
    w.OperatingExcutionFomatter = OperatingExcutionFomatter;
    w.OperatingAuditFomatter = OperatingAuditFomatter;
    w.OperatingShenheFomatter = OperatingShenheFomatter;
    w.SubstrDateFormatter = SubstrDateFormatter;
    w.OperatingInvestAFomatter = OperatingInvestAFomatter;

})(window, jQuery, laydate, _);