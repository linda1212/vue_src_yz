<!-- <!DOCTYPE html>
<html>

<head>
    <title>菜单管理</title>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="icon" href="favicon.ico" type="image/x-icon" />
    <link rel="stylesheet" type="text/css" id='theme' href="css/theme-dark-blue.css" />
</head>

<body> -->
<div class="page-container">
    <a href="# " class="x-navigation-minimize menu_minimalize"><span class="arrow arrow-shrink "></span></a>
    <div class="page-sidebar page-sidebar-fixed scroll">
        <ul id='menu' class="x-navigation">
            <li class="xn-logo">
                <a href="index.html"></a>
                <a href='#' class="x-navigation-control "></a>
            </li>
        </ul>
    </div>
    <div class="page-content ">
        <h3 class="page-title">
                <ul class="x-navigation x-navigation-horizontal log-out pull-right">
                    <li class="xn-icon-button last ">
                        <a href="# "><span class="fa fa-power-off "></span></a>
                        <ul class="xn-drop-left animated zoomIn ">
                            <li><a href="# " class="mb-control " data-box="#mb-signout "><span class="fa fa-sign-out "></span> 登出</a></li>
                        </ul>
                    </li>
                </ul>
                菜单管理</h3>
        <div class="page-content-wrap ">
            <div class="page-content-box gap24">
                <div class="clearfix mytbar">
                    <div id="inputBox" class="gap-btn-group  " role="group">
                        <button type="button" title="新增客户" class="btn btn-label"><span>名称：</span></button>
                        <input id="search_input" type="text" data-field='name' class="form-control" placeholder="名称" />
                        <button id="ser" type="button" title="搜索" class="btn btn-outline btn-primary"><span>查询</span></button>
                    </div>
                    <div class="btn-group   pull-right" role="group">
                        <button id="add" data-table="TContact" type="button" title="新增客户" class="btn btn-outline btn-primary pull-right"><span>新增</span></button>
                    </div>
                </div>
                <table id="TMenu" data-height="660" data-mobile-responsive="true">
                    <thead>
                        <tr class="hide">
                            <th data-field="state" data-my="1" data-checkbox="true"></th>
                            <th data-field="id">id</th>
                            <th data-field="name">名称</th>
                            <th data-field="url">链接</th>
                            <th data-field="parent_id">父菜单id</th>
                            <th data-field="parent_name">父菜单</th>
                            <th data-field="icon">图标</th>
                            <th data-field="sort_id" data-align="right">序号</th>
                            <th data-field="b_valid" data-formatter="EFormatter">状态</th>
                            <th data-field="operate" data-formatter="OperatingEDFomatter" data-align="right">操作</th>
                        </tr>
                    </thead>
                </table>
                <div id="footerbar" class="footerbar hidden-em">
                    <div class="gap-btn-group" role="group">
                        <button id="checkall" type="button" class="btn btn-outline btn-default" data-cked="unchecked">
                            <span>全选</span>
                        </button>
                        <button id="bedit" type="button" class="btn btn-outline btn-primary">
                            <span>批量操作</span>
                        </button>
                        <button id="bdel" type="button" title="删除客户" class="btn btn-outline btn-primary">
                            <span>删除</span>
                        </button>
                        <button id="endState" type="button" title="删除客户" class="btn btn-outline btn-primary">
                            <span>完成</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
<div id="modal" class="modal fade">
    <div class="modal-dialog">
        <form action="javascript:void(0)" data-bv-message="验证未通过" data-bv-feedbackicons-valid="glyphicon glyphicon-ok" data-bv-feedbackicons-invalid="glyphicon glyphicon-remove" data-bv-feedbackicons-validating="glyphicon glyphicon-refresh">
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                    <h4 class="modal-title"></h4>
                </div>
                <div class="modal-body">
                    <div class="form-group hide">
                        <label>id</label>
                        <input type="text" class="form-control" name="id" placeholder="">
                    </div>
                    <div class="form-group">
                        <label>名称</label>
                        <input type="text" class="form-control" name="name" placeholder="" required data-bv-notempty-message="名称不能为空">
                    </div>
                    <div class="form-group">
                        <label>链接</label>
                        <input type="text" class="form-control" name="url" placeholder="">
                    </div>
                    <div class="form-group">
                        <label>上级菜单</label>
                        <select id="menu_parnet" class="form-control" name="parent_id" data-bv-notempty data-bv-notempty-message="请选择上级菜单">
                        </select>
                    </div>
                    <div class="form-group">
                        <label>图标</label>
                        <input type="text" class="form-control" name="icon" placeholder="">
                    </div>
                    <div class="form-group">
                        <label>序号</label>
                        <input type="text" class="form-control" name="sort_id" placeholder="" required data-bv-notempty-message="序号不能为空">
                    </div>
                    <div class="form-group">
                        <label>状态</label>
                        <select class="form-control" name="b_valid" data-bv-notempty data-bv-notempty-message="状态不能为空">
                            <option value="" style="display: none">--状态--</option>
                            <option value="0">启用</option>
                            <option value="1">禁用</option>
                        </select>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-default cancel" data-dismiss="modal">取&nbsp;&nbsp;消</button>
                    <button type="button" class="btn btn-primary submit">保&nbsp;&nbsp;存</button>
                </div>
            </div>
        </form>
    </div>
</div>
<script>
import global_config from '@/base/config.js'
import CURDTable from '@/components/CURDTable/CURDTable.vue'

</script>
<!-- </body> -->
<!-- <script type='text/javascript' src="js/import.js"></script>
<script type='text/javascript' src="js/pages/common.js"></script>
<script type='text/javascript' src="js/pages/CURDTable.js"></script>
<script>
var c = new cur({
    t: "#TMenu",
    m: "#modal",
    hideCols: ["id", "parent_id"],
    childSls: {
        "#menu_parnet": {
            def: '--请选择上级菜单--',
            url: '/admin/common/menu/parent?name=menu_parnet',
            autoRef: 'true',
            type: 'get'
        }
    },
    urlGetType: "obj",
    queryUrl: "/admin/menu/query",
    addUrl: "/admin/menu/add",
    editUrl: "/admin/menu/update",
    delUrl: "/admin/menu/delete"
});
c.init(c);

</script>

</html> -->
