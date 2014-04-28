//  prime.js
//  Andy Zhang
//  the prime game 2014

// Event processor
// events are identified simply by its name
// objects that generate an event use **fireEvent**
// function
// objects that answer an event use **registerListener**
// to provide a callback
// ---------------

(function () {
    'use strict';

    function EventProcessor() {
        /*jshint validthis:true */
        var listeners = {};

        // each event could be associated with a series of callerbacks
        // returns a function to remove this listener
        this.registerListener = function (eventName, callback) {
            var id = count++;
            var ename = '_' + eventName;
            if (typeof this.listeners[ename] === 'undefined') {
                this.listeners[ename] = {};
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
            var id;
            ename = '_' + eventName;
            if (typeof listeners[ename] !== 'undefined') {
                for (id in listeners[ename]) {
                    listeners[ename][id](eventName, arg);
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
            return this.generated.length;
        };

        // set current state to
        this.setState = function (stat) {
            this.initState();
            generate(stat - 1);
            this.unvisited = [];
        };

        // use a sieve method
        function generate (toGenerate) {
            var nGenerated = 0;
            function nextMod (p) {
                return this.next % p;
            }
            while (nGenerated < toGenerate) {
                if (this.generated.every(nextMod)) {
                    nGenerated++;
                    this.generated.push(this.next);
                    this.unvisited.push(this.next);
                }
                this.next++;
            }
        }

        this.get = function () {
            if (this.unvisited.length < 4) {
                setTimer(function () {generate(10);}, 3);
            }
            return this.unvisited.shift();
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
        var now;

        if (typeof window.performance !== 'undefined' && window.performance.now) {
            now = window.performance.now;
        }
        else {
            now = Date.now;
        }

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


    // InputHandler
    // transform low-level input signals to meaningful events
    // ------------
    function InputHandler () {
        /*jshint validthis:true */
        // contain an event processor and expose its listener
        var processor = new EventProcessor();
        this.registerListener = this.processor.registerListener;
    }


    // DisplayHandler
    // deal with low-level display details according to internal status change
    // --------------
    function DisplayHandler () {
        /*jshint validthis:true */
        // contain an event processor and expose its firer
        var processor = new EventProcessor();
        this.fireEvent = this.processor.fireEvent;
    }


    // LogicHandler
    // the game's main logic
    // --------------
    function LogicHandler (inputHandler, displayHandler, config) {
        /*jshint validthis:true */
        // get event from the input handler
        var regIn = this.iHdl.regesterListener;
        // change display through the display handler
        var fireDis = this.dHdl.fireEvent;
        // contains a event processor for game logic
        var processor = new EventProcessor();
        var regLogic = this.processor.regesterListener;
        var fireLogic = this.processor.fireEvent;

        // prime generator
        var primeGen = new PrimeGenerator();
        // basic properties
        var fund = new Fundament();
        // skill manager
        var skillMan = new SkillManager();
        // prompts
        promptDisplay();

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

            // refresh display
            this.refresh = function () {
                fireDis('expBar', [exp, lvup]);
                fireDis('lvTag', lv);
                fireDis('skpTag', skp);
            };

            // listener for gaining experience
            regLogic('gainExp', function (e) {
                exp += e;
                while (exp >= lvup) {
                    fireLogic('lvUp');
                }
                fireDis('expBar', [exp, lvup]);
            });

            // listener for level up
            regLogic('lvUp', function () {
                exp -= lvup;
                lv++;
                lvup = config.fundament.lvup(lv);
                fireDis('lvTag', lv);
                fireLogic('lvChangeTo', lv);
                fireLogic('gainSkp', 1);
            });

            // listener for gaining skill point
            regLogic('gainSkp', function (n) {
                skp += n;
                fireDis('skpTag', skp);
                fireLogic('skpChangeTo', skp);
            });

            // listener for consuming skill point
            regLogic('consumeSkp', function (n) {
                skp -= n;
                fireDis('skpTag', skp);
                fireLogic('skpChangeTo', skp);
            });

            // the fundamental exp gaining way
            regLogic('newPrime', function () {
                fireLogic('gainExp', 1);
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

            removals.push(regLogic(name + 'Use', function () {
                var prime;
                if (!t.ready()) {
                    return;
                }
                prime = primeGen.get();
                t.touch();
                fireDis(name + 'CD', [t.getWait(), t.getTimeout()]);
                fireLogic('newPrime', prime);
            }));

            removals.push(regLogic('lvUp', function () {
                lv++;
                fireDis(name + 'Lv', lv);
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
                fireDis(name, 'Enter');
                fireDis(name + 'Lv', lv);
                fireDis(name + 'CD', [t.getWait(), t.getTimeout()]);
                fireDis(name + 'Description', [t.getTimeout()]);
            };

            // remove
            this.remove = function () {
                removals.forEach(function (f) {
                    f();
                });
            };
        }

        // the `Auto' skill
        // each time a new prime is generated
        // an auto generator which generates
        // a prime every **interval** and in
        // total **repeat** primes
        function SkillAuto (name) {
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
                    return;
                }
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
                fireDis(name + 'CD', [repeat * interval, repeat * interval]);
            }));

            this.name = 'Auto';

            // init state
            this.initState = function () {
                lv = 0;
                on = 0;
                remain = 0;
                clearInterval(timerID);
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
                    fireDis(name + 'CD', [remain * interval, repeat * interval]);
                }
            };

            // refresh display
            this.refresh = function () {
                fireDis(name, 'Auto');
                fireDis(name + 'Lv', lv);
                fireDis(name + 'Discription', [repeat, interval]);
            };

            // remove
            this.remove = function () {
                removals.forEach(function (f) {
                    f();
                });
            };
        }

        // In the game there are 2 types of infomation to display
        // state : info that is always on the screen
        // prompt : info that appears then disappears
        // state display is managed in objects that contain the state
        // while prompt display is managed altogether here
        function promptDisplay () {
            var prompts = ['gainExp', 'lvUp', 'newPrime'];
            prompts.forEach(function (name) {
                regLogic(name, function (arg) {
                    fireDis(name, arg);
                });
            });
        }

        // skill manager
        function SkillManager () {
            var nSkills;
            var skills;

            function setUpSkill(n, skillName, stat) {
                /*jshint evil:true */
                // a little metaprogramming here to simplify polymorphism
                var SkillConstructor = eval('Skill' + skillName);
                if (typeof skills[n] !== 'undefined') {
                    skills[n].remove();
                }
                skills[n] = new SkillConstructor();
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
                    fireDis('skill' + i + 'Clear');
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
                var skillConstructor;
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
})();
