//  main.js
//  Andy Zhang
//  the number-theorist game 2014

(function () {
    'use strict';

    var now;
    if (typeof window.performance !== 'undefined' && window.performance.now) {
        now = window.performance.now;
    }
    else {
        now = Date.now;
    }


    // Event processor
    // events are identified simply by its name
    // objects that generate an event use **fireEvent**
    // function
    // objects that answer an event use **registerListener**
    // to provide a callback
    // ---------------

    function EventProcessor() {
        /*jshint validthis:true */
        var listeners = {};
        var count = 0;

        // each event could be associated with a series of callerbacks
        // returns a function to remove this listener
        this.registerListener = function (eventName, callback) {
            var id = count++;
            var ename = '_' + eventName;
            if (typeof listeners[ename] === 'undefined') {
                listeners[ename] = {};
            }
            listeners[ename][id] = callback;

            return function () {
                if (listeners[ename].hasOwnProperty(id)) {
                    delete listeners[ename][id];
                }
            };
        };

        // when fireing an event, one can optionally supply an argument
        this.fireEvent = function (eventName, arg) {
            var id, ename;
            ename = '_' + eventName;
            if (typeof listeners[ename] !== 'undefined') {
                for (id in listeners[ename]) {
                    listeners[ename][id](arg);
                }
            }
        };
    }


    // Prime generator
    // use **get** to get the next prime
    // ---------------

    function PrimeGenerator () {
        /*jshint validthis:true */
        var next;
        var generated;
        var unvisited;

        // init state
        this.initState = function () {
            next = 3;
            generated = [2];
            unvisited = [2];
        };

        // save current state
        this.getState = function () {
            return generated.length;
        };

        // set current state to
        this.setState = function (stat) {
            initState();
            generate(stat - 1);
            unvisited = [];
        };

        // use a sieve method
        function generate (toGenerate) {
            var nGenerated = 0;
            function nextMod (p) {
                return next % p;
            }
            while (nGenerated < toGenerate) {
                if (generated.every(nextMod)) {
                    nGenerated++;
                    generated.push(next);
                    unvisited.push(next);
                }
                next++;
            }
        }

        this.get = function () {
            if (unvisited.length < 4) {
                setTimeout(function () {generate(10);}, 3);
            }
            return unvisited.shift();
        };

        this.current = function () {
            return generated[generated.length - unvisited.length];
        };

        this.count = function () {
            return generated.length - unvisited.length;
        };

        this.initState();
        // generate 10 primes before start
        generate(10);
    }


    // Timer
    // countdown
    // -----
    function Timer () {
        /*jshint validthis:true */
        this.setTimeout = function (t) {
            this.timeout = t;
        };

        this.ready = function () {
            return now() - this.last >= this.timeout;
        };

        this.touch = function () {
            this.last = now();
        };

        this.getWait = function () {
            var timeToWait = this.timeout - now() + this.last;
            if (timeToWait < 0) {
                timeToWait = 0;
            }
            return timeToWait;
        };

        this.getTimeout = function () {
            return this.timeout;
        };

        // init state
        this.initState = function () {
            this.last = 0;
            this.timeout = 0;
        };

        // save current state
        this.getState = function () {
            return [now() - this.last, this.timeout];
        };

        // set current state to
        this.setState = function (stat) {
            this.last = now() - stat[0];
            this.timeout = stat[1];
        };

        this.initState();
    }

    // In the game there are 2 types of information to display
    // state : info that persists on the screen
    // prompt : info that appears then disappears

    // DisplayStatus
    // manage status information
    // --------------
    function IOHandler () {
        /*jshint validthis:true */
        var i, fire, name, obj;
        var stringOrInt;

        // input
        this.setFirer = function (x) {
            fire = x;
        };
        // handle enter
        $(document).keypress(function(e) {
            if (e.which == 13) {
                fire('EnterUse');
            }
        });

        stringOrInt = ['lv', 'skp'];
        // display status
        function defineStringOrInt (name) {
            Object.defineProperty(this, name, {
                get: function () {return $('#' + name).html();},
                set: function (x) {$('#' + name).html(x);}
            });
        }

        function defineMeter (name) {
            Object.defineProperty(this, name, {
                get: function () {
                     },
                set: function (x) {
                         $('#' + name + ' .tag').html(x[0] + ' / ' + x[1]);
                         $('#' + name + ' .progress').css('width', x[0] / x[1] * 100 + '%');
                     }
            });
        }

        function defineCD (name) {
            var t, timeout, start, timerID, on = false, half, i, j;
            var arr = [
                [' > .CDne', 'Bottom', 'Left', 'Right'],
                [' > .CDse', 'Left', 'Top', 'Bottom'],
                [' > .CDsw', 'Top', 'Right', 'Left'],
                [' > .CDnw', 'Right', 'Bottom', 'Top']
            ];
            for (i = 0; i < 4; i++) {
                for (j = 1; j < 4; j++) {
                    arr[i][j] = 'border' + arr[i][j] + 'Width';
                }
            }
            function init () {
                var i;
                $('#' + name).css('display', 'block');
                half = $('#' + name).css('pixelWidth') / 2;
                for (i = 0; i < 4; i++) {
                    $('#' + name + arr[i][0]).css(arr[i][1], half);
                    $('#' + name + arr[i][0]).css(arr[i][2], 0);
                    $('#' + name + arr[i][0]).css(arr[i][3], half);
                }
                if (t === 0) {
                    for (i = 0; i < 4; i++) {
                        $('#' + name + arr[i][0]).css(arr[i][1], 0);
                    }
                }
            }
            function render () {
                function pxFromPercentRad (percent, rad) {
                    return Math.tan(percent * Math.PI / 4) * rad;
                }

                var elap = t - now() + start, phase, stage, px, ch;
                if (elap < 0) {
                    on = false;
                    clearInterval(timerID);
                    for (i = 0; i < 4; i++) {
                        $('#' + name + arr[i][0]).css(arr[i][1], 0);
                    }
                    return;
                }
                ch = 8 - elap / timeout * 8;
                phase = Math.floor(ch) >> 1;
                stage = Math.floor(ch) & 1;
                px = pxFromPercentRad(ch - Math.floor(ch), half);
                if (stage === 0) {
                    $('#' + name + arr[phase][0]).css(arr[phase][2], px);
                    $('#' + name + arr[phase][0]).css(arr[phase][3], half - px + 1);
                    if (phase !== 0) {
                        $('#' + name + arr[phase - 1][0]).css(arr[phase - 1][1], 0);
                    }
                }
                else {
                    $('#' + name + arr[phase][0]).css(arr[phase][2], half);
                    $('#' + name + arr[phase][0]).css(arr[phase][3], 0);
                    $('#' + name + arr[phase][0]).css(arr[phase][1], half - px);
                }
            }
            Object.defineProperty(this, name, {
                get: function () {
                     },
                set: function (x) {
                         t = x[0];
                         timeout = x[1];
                         if (timeout === 0) {
                             timeout = 1;
                         }
                         if (t > timeout) {
                             t = timeout;
                         }
                         if (!on) {
                             init();
                             start = now();
                             timerID = setInterval(render, config.IO.CD.renderInterval);
                         }
                     }
            });
        }

        obj = this;
        $('div, p').each(function(){
            // display information
            switch ($(this).attr('data-display')) {
                case 'int':
                case 'string':
                    defineStringOrInt.apply(obj, [this.id]);
                    break;
                case 'meter':
                    defineMeter.apply(obj, [this.id]);
                    break;
                case 'CD':
                    defineCD.apply(obj, [this.id]);
                    break;
            }

            // trigger event
            if ($(this).attr('data-trigger')) {
                $(this).click(function () {
                    fire($(this).attr('data-trigger'));
                });
                $(this).css('cursor', 'pointer');
            }
        });

        this.showSkill = function (n, name) {
            $('div#skill' + n).append($('div#skill' + name));
        };

        this.toggleUpdate = function (name, b) {
            if (b) {
                $('div#skill' + name + ' div.update-button').removeClass('hidden');
            }
            else {
                $('div#skill' + name + ' div.update-button').addClass('hidden');
            }
        };

        // append to event area
        this.append = function (s) {
            var ta = $('#eventarea');
            ta.append(s + '\t\t');
            ta.scrollTop(ta.prop('scrollHeight') - ta.prop('clientHeight'));
        };

        // display prompt
        this.dPrompt = function (name, arg) {
        };
    }

    // LogicHandler
    // the game's main logic
    // --------------
    function LogicHandler (dp, config) {
        /*jshint validthis:true */
        var processor = new EventProcessor();
        var regLogic = processor.registerListener;
        var fireLogic = processor.fireEvent;

        dp.setFirer(processor.fireEvent);

        // prime generator
        var primeGen = new PrimeGenerator();
        // basic properties
        var fund = new Fundament();
        // skill manager
        var skillMan = new SkillManager();

        // init state
        this.initState = function () {
            primeGen.initState();
            fund.initState();
            skillMan.initState();
        };

        // save current state
        this.getState = function () {
            return [primeGen.getState(), fund.getState(), skillMan.getState];
        };

        // set current state to
        this.setState = function (stat) {
            primeGen.setState(stat);
            fund.setState(stat);
            skillMan.setState(stat);
        };

        // basic properties
        function Fundament () {
            // experience
            var exp;
            // level
            var lv;
            // skill point
            var skp;
            // exp to next level
            var lvup;

            // getters
            this.getExp = function () {return exp;};
            this.getLv = function () {return lv;};
            this.getSkp = function () {return skp;};
            this.getLvup = function () {return lvup;};
            // refresh display
            this.refresh = function () {
                dp.expBar = [exp, lvup];
                dp.lv = lv;
                dp.skp = skp;
            };

            // listener for gaining experience
            this.gainExp = function (e) {
                exp += e;
                while (exp >= lvup) {
                    lvUp();
                }
                dp.expBar = [exp, lvup];
            };

            // handler for level up
            function lvUp () {
                exp -= lvup;
                lv++;
                lvup = config.fundament.lvup(lv);
                dp.lv = lv;
                fireLogic('lvChangeTo', lv);
                gainSkp(1);
            }

            // handler for gaining skill point
            function gainSkp (n) {
                skp += n;
                dp.skp = skp;
                fireLogic('skpChangeTo', skp);
            }

            // handler for consuming skill point
            this.consumeSkp = function (n) {
                if (skp < n) {
                    throw "not enough skp.";
                }
                skp -= n;
                dp.skp = skp;
                fireLogic('skpChangeTo', skp);
            };

            // the fundamental way to gain exp
            regLogic('newPrime', function (p) {
                dp.append(p);
                this.gainExp(1);
            });

            // init state
            this.initState = function () {
                exp = 0;
                lv = 0;
                skp = 0;
                lvup = config.fundament.lvup(lv);
                this.refresh();
            };

            // save current state
            this.getState = function () {
                return [exp, lv, skp, lvup];
            };

            // set current state to
            this.setState = function (stat) {
                exp = stat[0];
                lv = stat[1];
                skp = stat[2];
                lvup = stat[3];
                this.refresh();
            };

            this.initState();
        }

        // skills
        // each skill listens to several events
        // <name>Use -- for active skills -- use a skill
        // <name>Up -- level up a skill
        // and passive skills listen to their trigger events
        // <name> is passed to the `constructor'

        // the `Enter' skill
        function SkillEnter (name) {
            var lv;
            var t = new Timer();
            var removals = [];

            removals.push(regLogic('EnterUse', function () {
                var prime;
                if (!t.ready()) {
                    return;
                }
                prime = primeGen.get();
                t.touch();
                dp.EnterCD = [t.getWait(), t.getTimeout()];
                fireLogic('newPrime', prime);
            }));

            removals.push(regLogic('lvChangeTo', function (v) {
                lv = v;
                dp.EnterLv = lv;
                t.setTimeout(config.skill.Enter.CD(lv));
            }));

            this.name = 'Enter';

            // init state
            this.initState = function () {
                lv = 0;
                t.setTimeout(config.skill.Enter.CD(lv));
                this.refresh();
            };

            // save current state
            this.getState = function () {
                return [lv, t.getState()];
            };

            // set current state to
            this.setState = function (stat) {
                lv = stat[0];
                t.setState(stat[1]);
                t.setTimeout(config.skill.enter.CD(lv));
                this.refresh();
            };

            // refresh display
            this.refresh = function () {
                dp.EnterLv = lv;
                dp.EnterCD = [t.getWait(), t.getTimeout()];
                dp.EnterDescription = 1;
            };

            // remove
            this.remove = function () {
                removals.forEach(function (f) {
                    f();
                });
            };

            this.initState();
        }

        // the `Auto' skill
        // each time a new prime is generated
        // an auto generator which generates
        // a prime every **interval** and in
        // total **repeat** primes
        function SkillAuto () {
            var lv = 0;
            var on = 0;
            var repeat = 0;
            var remain = 0;
            var timerId = 0;
            var interval = 0;
            var removals = [];

            function tick () {
                var prime;
                if (remain === 0) {
                    clearInterval(timerId);
                    on = 0;
                    return;
                }
                remain--;
                prime = primeGen.get();
                fireLogic('newPrime', prime);
            }

            // listen to newPrime
            removals.push(regLogic('newPrime', function () {
                if (on) {
                    return;
                }
                on = 1;
                remain = repeat;
                timerId = setInterval(tick, interval);
                if (lv !== 0) {
                    dp.AutoCD = [repeat * interval, repeat * interval];
                }
            }));

            // skill update event
            removals.push(regLogic('AutoUpdate', function () {
                try {
                    fund.consumeSkp(1);
                }
                catch (err) {
                    if (err === 'not enough skp.') {
                        return;
                    }
                    throw err;
                }
                lv += 1;
                dp.AutoLv = lv;
                interval  = config.skill.Auto.interval(lv);
                repeat = config.skill.Auto.repeat(lv);
            }));

            removals.push(regLogic('skpChangeTo', function (skp) {
                dp.toggleUpdate('Auto', skp);
            }));

            this.name = 'Auto';

            // init state
            this.initState = function () {
                lv = 0;
                on = 0;
                remain = 0;
                clearInterval(timerId);
                interval  = config.skill.Auto.interval(lv);
                repeat = config.skill.Auto.repeat(lv);
                this.refresh();
            };

            // save current state
            this.getState = function () {
                return [lv, on, remain];
            };

            // set current state to
            this.setState = function (stat) {
                this.initState();
                lv = stat[0];
                on = stat[1];
                remain = stat[2];
                this.refresh();
                if (on) {
                    setInterval(tick, remain * interval);
                }
            };

            // refresh display
            this.refresh = function () {
                dp.AutoLv = lv;
                dp.AutoDiscription = repeat.toString() + interval;
                if (lv !== 0) {
                    dp.AutoCD = [0, repeat * interval];
                }
                dp.toggleUpdate('Auto', fund.getSkp());
            };

            // remove
            this.remove = function () {
                removals.forEach(function (f) {
                    f();
                });
            };

            this.initState();
        }

        // the `PrimeTheoremSkill' theorem
        // according to the prime number theorem
        // \pi(x) \sim x / \ln x
        // this skill earns you extra exp
        // if current \pi(x) and x / \ln x
        // are closer enough
        
        function SkillPrimeTheorem () {
            var removals = [], lv;
            this.name = 'PrimeTheorem';

            removals.push(regLogic('newPrime', function (x) {
                var pi = primeGen.count(), extra;
                extra = config.skill.PrimeTheorem.extra(lv, pi / (x / Math.log(x)));
                fund.gainExp(extra);
            }));

            removals.push(regLogic('PrimeTheoremUpdate', function () {
                try {
                    fund.consumeSkp(1);
                }
                catch (err) {
                    if (err === 'not enough skp.') {
                        return;
                    }
                    throw err;
                }
                lv++;
                dp.PrimeTheoremLv = lv;
            }));

            removals.push(regLogic('skpChangeTo', function (skp) {
                dp.toggleUpdate('PrimeTheorem', skp);
            }));

            // init state
            this.initState = function () {
                lv = 0;
            };

            // save current state
            this.getState = function () {
                return lv;
            };

            // set current state to
            this.setState = function (stat) {
                lv = stat;
            };

            this.initState();
        }

        // skill manager
        function SkillManager () {
            var nSkills = 0;
            var skills = [];

            setUpSkill(0, 'Enter');
            setUpSkill(1, 'Auto');
            setUpSkill(2, 'PrimeTheorem');
            function setUpSkill(n, skillName, stat) {
                /*jshint evil:true */
                // use eval here to avoid classification
                var SkillConstructor = eval('Skill' + skillName);
                if (typeof skills[n] !== 'undefined') {
                    skills[n].remove();
                }
                dp.showSkill(n, skillName);
                skills[n] = new SkillConstructor();
                if (typeof stat !== 'undefined')
                    skills[n].setState(stat);
            }

            // init state
            this.initState = function () {
                var i;
                nSkills = config.skill.number;
                if (typeof skills !== 'undefined') {
                    skills.forEach(function (s) {
                        if (typeof s !== 'undefined') {
                            s.remove();
                        }
                    });
                }
                skills = new Array(nSkills);
                for (i = 0; i < nSkills; i++) {
                    dp.clearSkill(i);
                }
                setUpSkill(0, 'Enter');
                setUpSkill(1, 'Auto');
            };

            // save current state
            this.getState = function () {
                var i;
                var res = [];
                for (i = 0; i < nSkills; i++) {
                    res.push(skills[i] && [skills[i].name, skills[i].getState()]);
                }
                return res;
            };

            // set current state to
            this.setState = function (stat) {
                var i;
                this.initState();
                for (i = 0; i < nSkills; i++) {
                    if (typeof stat[i] != 'undefined') {
                        skills[i].remove();
                        setUpSkill(i, stat[i][0], stat[i][1]);
                    }
                    else {
                        skills[i] = undefined;
                    }
                }
            };
        }
    }

    $(document).ready(function () {
        var io = new IOHandler();
        var lo = new LogicHandler(io, config);
    });
})();
