//  config.js
//  Andy Zhang
//  the number-theorist game 2014

config = {
    'IO' : {
        'CD' : {
            'renderInterval' : 5
        }
    },
    'fundament' : {
        'lvup' : function (lv) {
            return lv * 3 + 1;
        }
    },
    'skill' : {
        'number' : 4,
        'Enter' : {
            'CD' : function (lv) {
                return 100;
            }
        },
        'Auto' : {
            'interval' : function (lv) {
                return 100 + 5000 / Math.sqrt(lv);
            },
            'repeat' : function (lv) {
                if (lv === 0) {
                    return 0;
                }
                return 2 + lv;
            }
        },
        'PrimeTheorem' : {
            'extra' : function (lv, val) {
                return Math.floor(10 * lv / (1 / Math.abs(val - 1)));
            }
        }
    }
};
