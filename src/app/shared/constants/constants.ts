export class Constants {
    public static readonly FIREBASE_TOKEN = 'fb-token';
    public static readonly OBJECT_ID_EMPTY = '000000000000000000000000';
    public static readonly TABLE_PARAM = {
        PAGE_SIZE: 40,
    };
    public static readonly ACTIONS = {
        EDIT: 0,
        DELETE: 1,
    };
    public static readonly Roles = [
        { label: 'Admin', value: 'Admin' },
        { label: 'Cán bộ quản lý', value: 'Manager' },
        { label: 'Cán bộ nhập liệu', value: 'Editor' },
    ];

    public static readonly VALUE_OPERATION = [
        { label: 'OR', value: 1 },
        { label: 'AND', value: 2 },
    ];
    public static readonly COMMON_STATE = [
        {name:'Chưa duyệt',value:'new'},
        {name:'Đã duyệt',value:'verified'}
    ];
    public static readonly DISABLE_STATUS = [
        {name:'Ẩn',value:false},
        {name:'Hiển thị',value:true}
    ];
    public static readonly DATA_TYPES = [
        { name: 'Number', code: 'NUM', keyValue: 1 },
        { name: 'Range', code: 'RAG', keyValue: 2 },
        { name: 'Boolean', code: 'BOOL', keyValue: 3},
        { name: 'String', code: 'STR', keyValue: 4 },
        { name: 'Time', code: 'TIME', keyValue: 5 },
        { name: 'Date', code: 'DATE', keyValue: 6 },
        { name: 'DateTime', code: 'DATETI', keyValue: 7 },
        { name: 'SingleChoice', code: 'SINGC', keyValue: 8 },
        { name: 'MultipleChoice', code: 'MULC', keyValue: 9 },
        { name: 'Image', code: 'IMAGE', keyValue: 12},
    ];
    public static readonly VALUE_TYPES = [
        {
            label: 'Áp dụng chung', value: 1
        },
        {
            label: 'Áp dụng cho nhóm', value: 2
        },
    ];
    public static readonly VALUE_TIME = [
        { label: 'hôm nay', value: '1' },
        { label: '3 ngày trước', value: '3' },
        { label: '7 ngày trước', value: '7' },
        { label: 'Tháng này', value: '10' },
    ];
    public static readonly BACK_UP_RESTORE_TYPE = [
        {name:'Hàng ngày',value:'hang_ngay'},
        {name:'Hàng tuần',value:'hang_tuan'},
        {name:'Hàng tháng',value:'hang_thang'},
    ];

    public static readonly TIME_RANGE_FILTER = [
        { label: 'Hôm nay', value: '1' },
        { label: '3 ngày trước', value: '3' },
        { label: '7 ngày trước', value: '7' },
        { label: 'Tháng này', value: '10' },
    ];

    public static readonly FILTER_TYPES = {
        DROPDOWN: 'dropdown',
        STRING: 'string',
        NUMBER: 'number',
    };

    public static readonly VALUE_SORT = [
        { label: 'Tăng dần', value: 'asc' },
        { label: 'Giảm dần', value: 'desc' }
    ];

}
export class Roles {
    public static readonly ADMIN = 'Admin';
    public static readonly MANAGER = "Manager";
    public static readonly Editor = "Editor";
}

export class StorageKeys {
    public static readonly TOKEN = 'token';
    public static readonly USER = 'user';
    public static readonly ADMIN_DASHBOARD = 'admin';
    public static readonly LOGIN_FAIL = 'Incorrect username and/or password.';
}

