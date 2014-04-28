//  config.js
//  Andy Zhang
//  the number-theorist game 2014

config = {
    'fundament' : {
        'lvup' : function (lv) {
            return lv * 100 + 1;
        }
    },
    'skill' : {
        'number' : 4,
        'Enter' : {
            'CD' : function (lv) {
                return 1000 + lv * 100;
            }
        },
        'Auto' : {
            'interval' : function (lv) {
                return 1000 + 5000 / lv;
            },
            'repeat' : function (lv) {
                return 2 + lv;
            }
        }
    }
};
