/**
 *
 *  日期处理函数
 *  author:panshuwei
 *
 */
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

/**
 * @description 返回某年某月最大天数
 * @date 2018-06-25
 * @param {String} year 默认今年
 * @param {String} month 默认当月
 * @returns 
 */
function getMaxDayByMonth(year, month) {
    year = year || getThisYear();
    month = month || new Date().getMonth() + 1;
    var d = new Date(year, month, 0);
    return d.getDate();
}

function getToday() {
    return new Date().Format('yyyy-MM-dd');
}

function getYesterday() {
    return new Date(new Date().getTime() - 24 * 60 * 60 * 1000).Format('yyyy-MM-dd');
}

function getLastMonth() {
    var now = new Date();
    return new Date(now.getTime() - (now.getDate() + 1) * 24 * 60 * 60 * 1000).Format('yyyy-MM-dd');
}

function getThisMonth() {
    return new Date().Format('yyyy-MM');
}

function getThisYear() {
    return new Date().Format('yyyy');
}

function getLastYear() {
    return new Date().Format('yyyy') - 1;
}

function getLastMonthNum() {
    var m = (new Date).getMonth() + 1;
    return (new Date).getFullYear() + '-' + ('0' + m).slice(-2);
}

function initDateInputForDay(el, chooseFun) {
    laydate.render({
        elem: el,
        event: "focus",
        isclear: true,
        istoday: true,
        format: 'yyyy-MM-dd',
        done: function(value, date, endDate) {
            eBase.debug('[common.js][initLayerDate][done event handler]');
            chooseFun && _.isFunction(chooseFun) && chooseFun(value, date, endDate);
            $(el).trigger('change');
        },
        choose: function(dates) {
            // chooseFun();
        }
    });
}

function initDateInputForMonth(el, chooseFun) {
    laydate.render({
        elem: el,
        event: "focus",
        type: 'month',
        format: 'yyyy-MM',
        done: function(value, date, endDate) {
            eBase.debug('[common.js][initLayerDate][done event handler]');
            chooseFun && _.isFunction(chooseFun) && chooseFun(value, date, endDate);
            $(el).trigger('change');
        },
        choose: function(dates) {
            // chooseFun();
        }
    });
}

function initDateInputForYear(el, chooseFun) {
    laydate.render({
        elem: el,
        type: 'year',
        format: 'yyyy',
        done: function(value, date, endDate) {
            eBase.debug('[common.js][initLayerDate][done event handler]');
            chooseFun && _.isFunction(chooseFun) && chooseFun(value, date, endDate);
            $(el).trigger('change');
        },
        change: function(value, date, endDate) {
            // chooseFun && _.isFunction(chooseFun) && chooseFun(value, date, endDate);
        }
    });
}

function initDateInputForRange(el, chooseFun) {
    laydate.render({
        elem: el,
        event: "focus",
        range: true,
        format: 'yyyy-MM-dd',
        done: function(value, date, endDate) {
            eBase.debug('[common.js][initLayerDate][done event handler]');
            chooseFun && _.isFunction(chooseFun) && chooseFun(value, date, endDate);
            $(el).trigger('change');
        },
        choose: function(dates) {
            //chooseFun();
        }
    });
}

function formatTimeByType(str, type) {
    var result = str + '';

    switch (type) {
        case 'time':
            var date = new Date(result.substr(0, 4) + '-' + result.substr(4, 2) + '-' + result.substr(6, 2) + ' ' + result.substr(8, 2) + ':' + result.substr(10, 2) + ':' + result.substr(12, 2));
            result = date.Format('hh:mm')
            break;
        default:
            break;
    }

    return result;
}

/**
 *
 *  不涉及到内部处理的Table fomatter函数
 *  author:panshuwei
 *  date:2018-04-20
 *
 */

function DateFormatter(value, row, index) {
    return new Date(value).Format('yyyy-MM-dd');
}

function YearFormatter(value, row, index) {
    return new Date(value).Format('yyyy');
}

function CodeFormatte(value, row, index) {
    var arr = [20000, 10000, 9000, 8000, 7000, 5000, 2000, 800, 500, 200];
    return `${arr[index%arr.length]}`;
}

/**
 *
 *  从数组到折线图的数据处理函数
 *  author:panshuwei
 *  date:2018-04-09
 *
 */
function parser_proxy(arr, params) {

    var result = {};

    var time_f = _.has(params, 'tf') ? params.tf : 'getTime';
    var filter = _.has(params, 'filter') ? params.filter : [];
    var names = _.has(params, 'names') ? params.names : [];
    var field = _.has(params, 'field') ? params.field : '';
    var type = _.has(params, 'type') ? params.type : '';
    var yzTitle = _.has(params, 'yzTitle') ? params.yzTitle : '';
    var title = '';

    if ('' == field) {
        throw new Error('no Filed');
        return;
    }

    var lines = [],
        categorys = [];

    var one_line_arr = [];

    _.each(filter, function(one_filter, index) {
        var one_line = {};
        one_line['name'] = names[index];
        one_line['data'] = [];
        one_line_arr = _.where(arr, one_filter);
        one_line_arr = one_line_arr.sort(function(a, b) {
            return a[time_f] - b[time_f];
        });;

        _.each(one_line_arr, function(one_line_item) {
            var one_data = _.has(one_line_item, field) ? one_line_item[field] : null;
            one_line['data'].push(one_data);
        });

        lines.push(one_line);
    });

    _.each(one_line_arr, function(item, index) {
        var time_text = formatTimeByType(item[time_f], 'time');
        categorys.push(time_text);
    });

    result['categories'] = categorys;
    result['series'] = lines;

    result['title'] = title;
    result['yzTitle'] = yzTitle;

    return 'array' == type ? {
        'chartData': [result]
    } : {
        'chartData': result
    };
}

function getChartsDataFromArray(arr, params) {

    var fields = _.has(params, 'fields') ? params.fields : [];
    var names = _.has(params, 'names') ? params.names : [];
    var categories_field = _.has(params, 'categories_field') ? params.categories_field : 'getTime';
    var categories_field_type = _.has(params, 'categories_field_type') ? params.categories_field_type : 'time';
    var type = _.has(params, 'type') ? params.type : 'object';
    var obj = _.has(params, 'obj') ? params.obj : {};
    var yzTitle = _.has(params, 'yzTitle') ? params.yzTitle : '';
    var title = '';

    var result = {};
    result['categories'] = [];
    result['series'] = [];

    arr = _.where(arr, obj);
    arr = arr.sort(function(a, b) {
        return a[categories_field] - b[categories_field];
    });

    _.each(arr, function(list_item) {
        var str = list_item[categories_field] + '';
        result['categories'].push(formatTimeByType(str, categories_field_type));
    });

    _.each(fields, function(one, i) {
        var one_series = {};
        one_series['data'] = [];
        one_series['name'] = names[i];
        _.each(arr, function(item, index) {
            var one_data = _.has(item, one) ? item[one] : null;
            one_series['data'].push(one_data);
        });

        result['series'].push(one_series);
    });

    result['title'] = title;
    result['yzTitle'] = yzTitle;

    return 'array' == type ? {
        'chartData': [result]
    } : {
        'chartData': result
    };
}

function changeToChartsData2(arr, fields, names, categories, type, yzTitle) {

    var result = {};
    result['categories'] = categories;
    result['series'] = [];

    _.each(fields, function(one, i) {
        var one_series = {};
        one_series['data'] = [];
        one_series['name'] = names[i];
        _.each(arr, function(item, index) {
            if (item == null) {
                one_series['data'].push(null);
            } else {
                one_series['data'].push(item[one]);
            }
        });

        result['series'].push(one_series);
    });

    // result['title'] = '日用能趋势';
    result['yzTitle'] = yzTitle;

    return 'array' == type ? {
        'chartData': [result]
    } : {
        'chartData': result
    };
}

function changeToTableData(rows, fields, dynamicName) {
    var arr = [];
    for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        var map = {};
        var returnObject = {};
        for (var i = 0; i < fields.length; i++) {
            map[fields[i]] = 1;
        }
        for (field in row) {
            if (map[field] == 1) {
                returnObject[field] = row[field][dynamicName];
            } else {
                returnObject[field] = row[field];
            }
        }
        arr.push(returnObject);
    }
    return arr;
}

function changeToChartsData3(data, categories, maps, yzTitle) {
    var series = []
    for (var i of maps['maps']) {
        Object.keys(i).forEach(function(item) {
            if (data.hasOwnProperty(item)) {
                series.push({
                    name: i[item],
                    data: data[item]
                })
            }
        })
    }
    return {
        chartData: {
            categories: categories,
            series: series,
            title: 'title',
            yzTitle: yzTitle || ''
        }
    }
}

function initSelectByUrl(el, url, completeHandler, selector) {
    var childSls = {};

    if (!window.cur) return;

    if (selector) {
        childSls['#' + el] = {
            url: url,
            type: 'GET',
            selector: selector
        };
    } else {
        childSls['#' + el] = {
            url: url,
            type: 'GET'
        };
    }

    var sc = new cur({
        childSls: childSls
    });

    sc.initSelect();

    sc.on('select:render.complete', function() {
        if (selector) {
            _.each(selector, function(one, index) {
                $(one).length > 0 && $(one).each(function() {
                    checkFirstAsDefault($(this));
                });
            });
        } else {
            checkFirstAsDefault($('#' + el));
        }
        completeHandler && _.isFunction(completeHandler) && completeHandler();
    });
}

function initCompanySelectByElementId(e_id) {

    var childSls = {};
    childSls['#' + e_id] = {
        url: '/energy/enterprise/getNameList?key=company',
        type: 'GET'
    };

    var sc = new cur({
        childSls: childSls
    });

    sc.initSelect();

    sc.on('select:render.complete', function() {
        checkFirstAsDefault($('#' + e_id));
    });
}

function initDSMCompanySelectByElementId(e_id, completehandler) {

    var childSls = {};
    childSls['#' + e_id] = {
        url: '/energy/monitor/list?key=' + e_id,
        type: 'GET'
    };

    var sc = new cur({
        childSls: childSls
    });

    sc.initSelect();

    sc.on('select:render.complete', function(v) {
        checkFirstAsDefault($('#' + e_id));
        completehandler && completehandler();
    });
}

function checkFirstAsDefault(el) {
    el.find('option:first').prop("selected", 'selected');
}

/**
 *
 *  设置文本
 *  author:panshuwei
 *  date:2018-05-11
 *
 */

function setText(el, text) {
    text = text || '未配置';
    $(el).text(text);
}

function trimText(value) {
    return value.split('\n').join('').split(' ').join('');
}

function setStaticTexts(data) {
    for (var key in data) {
        var root = $('#' + key);
        if (root.length > 0) {
            var obj = data[key];
            for (var child_key in obj) {
                if ($(child_key).length > 0) {
                    var varnew = obj[child_key];
                    if (_.isString(varnew)) {
                        $(child_key).text(varnew);
                    } else {
                        setAtrByObj($(child_key), varnew);
                    }
                }
            }
        }
    }
}

function setAtrByObj(el, obj) {
    for (var k in obj) {
        el.attr(k, obj[k]);
    }
}

$(function() {

    $('.energyType').length > 0 && initSelectByUrl('enengyType', '/energy/enengyType/getEnergyTypeList?key=enengyType', function() {
        if (window.initedEnergyType) {
            window.initedEnergyType && _.isFunction(window.initedEnergyType) && window.initedEnergyType();
        }
    }, ['.energyType']);

    $('.area').length > 0 && initSelectByUrl('area', '/energy/sys/getArea?key=area', function() {
        if (window.initedArea) {
            window.initedArea && _.isFunction(window.initedArea) && window.initedArea();
        }
    }, ['.area']);

    var code = G_CONFIG.industry_parent_code || '000020001';

    $('.industry').length > 0 && initSelectByUrl('industry', '/energy/sys/getList?code=' + code + '&key=industry', function() {
        if (window.initedIndustry) {
            window.initedIndustry && _.isFunction(window.initedIndustry) && window.initedIndustry();
        }
    }, ['.industry']);


    setStaticTexts(G_STATIC_TEXTS);
});
