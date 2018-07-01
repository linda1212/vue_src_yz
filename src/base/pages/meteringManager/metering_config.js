G_TIME_LINE_SELECT = {
	'-1': {
		'to': [{
			value: '0',
			text: '出厂'
		}]
	},
	'0': {
		'to': [{
			value: '1',
			text: '首检'
		}]
	},
	'1': {
		'to': [{
			value: '2',
			text: '安装'
		}]
	},
	'2': {
		'to': [{
			value: '3',
			text: '检定'
		}, {
			value: '4',
			text: '校准'
		}, {
			value: '5',
			text: '维修'
		}, {
			value: '6',
			text: '报废'
		}]
	},
	'3': {
		'to': [{
			value: '4',
			text: '校准'
		}, {
			value: '5',
			text: '维修'
		}, {
			value: '6',
			text: '报废'
		}]
	},
	'4': {
		'to': [{
			value: '3',
			text: '检定'
		}, {
			value: '5',
			text: '维修'
		}, {
			value: '6',
			text: '报废'
		}]
	},
	'5': {
		'to': [{
			value: '3',
			text: '检定'
		}, {
			value: '4',
			text: '校准'
		}, {
			value: '6',
			text: '报废'
		}]
	},
	'6': {
		'to': []
	}
}


//`maintain_type` int(10) DEFAULT NULL COMMENT '全生命维护状态0出厂1首检2安装3检定4校准5维修6报废',
G_METERING_CONFIG = [{
	type: '0',
	title: '出厂',
	fields: [{
		name: 'data_time',
		label: '生产日期',
		type: 'date'
	}, {
		name: 'manufacturer',
		label: '生产厂家',
		type: 'text'
	}, {
		name: 'range',
		label: '测量范围',
		type: 'text'
	}, {
		name: 'life',
		label: '设计年限',
		type: 'text'
	}, {
		name: 'Instructions',
		label: '规格说明书',
		type: 'file'
	}]
}, {
	type: '1',
	title: '首检',
	fields: [{
		name: 'data_time',
		label: '首检日期',
		type: 'date'
	}, {
		name: 'check_mechanism',
		label: '检定机构',
		type: 'text'
	}, {
		name: 'check_result',
		label: '检定结果',
		type: 'select',
		list: [{
			label: '--请选择--',
			value: ''
		}, {
			label: '合格',
			value: 1
		}, {
			label: '不合格',
			value: 0
		}]
	}, {
		name: 'check_report',
		label: '检定报告',
		type: 'file'
	}, {
		name: 'check_certificate',
		label: '检定证书',
		type: 'file'
	}]
}, {
	type: '2',
	title: '安装',
	fields: [{
		name: 'data_time',
		label: '安装日期',
		type: 'date'
	}, {
		name: 'setting_mechanism',
		label: '安装机构',
		type: 'text'
	}, {
		name: 'setting_postion',
		label: '安装位置',
		type: 'text'
	}, {
		name: 'setting_time',
		label: '安装时长',
		type: 'text',
		tail: '小时'
	}]
}, {
	type: '3',
	title: '检定',
	fields: [{
		name: 'data_time',
		label: '检定日期',
		type: 'date'
	}, {
		name: 'check_mechanism',
		label: '检定机构',
		type: 'text'
	}, {
		name: 'check_result',
		label: '检定结果',
		type: 'select',
		list: [{
			label: '--请选择--',
			value: ''
		}, {
			label: '合格',
			value: 1
		}, {
			label: '不合格',
			value: 0
		}]
	}, {
		name: 'check_report',
		label: '检定报告',
		type: 'file'
	}, {
		name: 'check_certificate',
		label: '检定证书',
		type: 'file'
	}]
}, {
	type: '4',
	title: '校准',
	fields: [{
		name: 'data_time',
		label: '校准日期',
		type: 'date'
	}, {
		name: 'review_mechanism',
		label: '校准机构',
		type: 'text'
	}, {
		name: 'review_result',
		label: '校准结果',
		type: 'select',
		list: [{
			label: '--请选择--',
			value: ''
		}, {
			label: '合格',
			value: 1
		}, {
			label: '不合格',
			value: 0
		}]
	}, {
		name: 'review_report',
		label: '校准报告',
		type: 'file'
	}]
}, {
	type: '5',
	title: '维修',
	fields: [{
		name: 'data_time',
		label: '维修日期',
		type: 'date'
	}, {
		name: 'repair_mechanism',
		label: '维修机构',
		type: 'text'
	}, {
		name: 'repair_report',
		label: '维修报告',
		type: 'file'
	}]
}, {
	type: '6',
	title: '报废',
	fields: [{
		name: 'data_time',
		label: '报废日期',
		type: 'date'
	}, {
		name: 'dead_mechanism',
		label: '报废机构',
		type: 'text'
	}, {
		name: 'dead_record',
		label: '报废记录',
		type: 'file'
	}]
}]