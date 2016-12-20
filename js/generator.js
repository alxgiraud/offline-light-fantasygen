var app = angular.module('generator', ['ngAnimate', 'ui.bootstrap-slider', 'ui.bootstrap']);

app.factory('markovChainGenerator', [function() {
    'use strict';

    var capitalize = function(str) {
        var i,
            previousChar;

        str = str.charAt(0).toUpperCase() + str.slice(1);

        if (str.length === 1) {
            return str;
        }

        for (i = 1; i < str.length; i += 1) {
            if (!str.charAt(i - 1).match(/[a-zÆÐƎƏƐƔĲŊŒẞÞǷȜæðǝəɛɣĳŋœĸſßþƿȝĄƁÇĐƊĘĦĮƘŁØƠŞȘŢȚŦŲƯY̨Ƴąɓçđɗęħįƙłøơşșţțŧųưy̨ƴÁÀÂÄǍĂĀÃÅǺĄÆǼǢƁĆĊĈČÇĎḌĐƊÐÉÈĖÊËĚĔĒĘẸƎƏƐĠĜǦĞĢƔáàâäǎăāãåǻąæǽǣɓćċĉčçďḍđɗðéèėêëěĕēęẹǝəɛġĝǧğģɣĤḤĦIÍÌİÎÏǏĬĪĨĮỊĲĴĶƘĹĻŁĽĿʼNŃN̈ŇÑŅŊÓÒÔÖǑŎŌÕŐỌØǾƠŒĥḥħıíìiîïǐĭīĩįịĳĵķƙĸĺļłľŀŉńn̈ňñņŋóòôöǒŏōõőọøǿơœŔŘŖŚŜŠŞȘṢẞŤŢṬŦÞÚÙÛÜǓŬŪŨŰŮŲỤƯẂẀŴẄǷÝỲŶŸȲỸƳŹŻŽẒŕřŗſśŝšşșṣßťţṭŧþúùûüǔŭūũűůųụưẃẁŵẅƿýỳŷÿȳỹƴźżžẓ]/i) && str.length > (i + 1)) {
                str = str.slice(0, i) + str.charAt(i).toUpperCase() + str.slice(i + 1);
            }
        }

        return str;
    };

    function Node(char) {
        this.character = char;
        this.neighbors = [];
    }

    function TrieNode() {
        this.children = [];
    }

    var privateMethods = {
            addToDuplicatesTrie: function(word, duplicates) {
                if (word.length > 1) {
                    privateMethods.addToDuplicatesTrie(word.substr(1), duplicates);
                }

                var currentNode = duplicates,
                    i,
                    childNode;

                for (i = 0; i < word.length; i += 1) {
                    childNode = currentNode.children[word[i]];
                    if (!childNode) {
                        childNode = new TrieNode();
                        currentNode.children[word[i]] = childNode;
                    }
                    currentNode = childNode;
                }
            },
            isDuplicate: function(word, duplicates) {
                word = word.toLowerCase();
                var currentNode = duplicates,
                    i,
                    childNode;

                for (i = 0; i < word.length; i += 1) {
                    childNode = currentNode.children[word[i]];
                    if (!childNode) {
                        return false;
                    }

                    currentNode = childNode;
                }

                return true;
            }
        },

        order = 3,
        duplicates = new TrieNode(),
        start = new Node(''),
        map = {};

    return {
        refresh: function() {
            order = 3;
            duplicates = new TrieNode();
            start = new Node('');
            map = {};
        },

        setOrder: function(o) {
            order = o;
        },

        addWordsToChain: function(words) {
            var i;
            for (i = 0; i < words.length; i += 1) {
                this.addWordToChain(words[i]);
            }
        },

        addWordToChain: function(word) {
            privateMethods.addToDuplicatesTrie(word.toLowerCase(), duplicates);

            var previous = start,
                key = '',
                i,
                char,
                newNode;

            for (i = 0; i < word.length; i += 1) {
                char = word[i];
                key += char;
                if (key.length > order) {
                    key = key.substr(1);
                }
                newNode = map[key];

                if (!newNode) {
                    newNode = new Node(char);
                    map[key] = newNode;
                }

                previous.neighbors.push(newNode);
                previous = newNode;
            }

            previous.neighbors.push(null);
        },

        generateWord: function(minLength, maxLength, startWith, endWith, contains, doesntContains, allowDuplicates, maxAttempts) {
            if (typeof startWith === 'undefined') {
                startWith = '';
            }
            if (typeof endWith === 'undefined') {
                endWith = '';
            }
            if (typeof minLength === 'undefined' || minLength < startWith.length || minLength < endWith.length) {
                minLength = (startWith.length > endWith.length) ? startWith.length : endWith.length;
            }
            if (typeof allowDuplicates === 'undefined') {
                allowDuplicates = false;
            }
            if (typeof maxLength === 'undefined') {
                maxLength = -1;
            }
            if (typeof maxAttempts === 'undefined') {
                maxAttempts = 100;
            }

            var word = '',
                repeat = true,
                attempts = 0,
                nextNodeIndex,
                currentNode;

            while (!word.length) {
                attempts += 1;
                if (attempts >= maxAttempts) {
                    return;
                }

                nextNodeIndex = Math.floor(Math.random() * start.neighbors.length);
                currentNode = start.neighbors[nextNodeIndex];
                word = '';

                while (currentNode && (maxLength < 0 || word.length <= maxLength)) {
                    word += currentNode.character;
                    nextNodeIndex = Math.floor(Math.random() * currentNode.neighbors.length);
                    currentNode = currentNode.neighbors[nextNodeIndex];
                }

                if (word.substr(0, startWith.length) !== startWith ||
                    word.substr(word.length - endWith.length) !== endWith ||
                    (typeof contains !== 'undefined' && word.indexOf(contains) === -1) ||
                    (typeof doesntContains !== 'undefined' && doesntContains.length > 0 && word.indexOf(doesntContains) > -1) ||
                    word.length > maxLength || word.length < minLength ||
                    (!allowDuplicates && privateMethods.isDuplicate(word, duplicates))) {
                    word = '';
                }
            }


            return capitalize(word);
        }
    };

}]);

app.directive('slideable', function () {
    'use strict';
    return {
        restrict: 'C',
        compile: function (element, attr) {
            // wrap tag
            var contents = element.html();
            element.html('<div class="slideable_content" style="margin:0 !important; padding:0 !important" >' + contents + '</div>');

            return function postLink(scope, element, attrs) {
                // default properties
                attrs.duration = (!attrs.duration) ? '0.5s' : attrs.duration;
                attrs.easing = (!attrs.easing) ? 'ease-in-out' : attrs.easing;
                element.css({
                    'overflow': 'hidden',
                    'height': '0px',
                    'transitionProperty': 'height',
                    'transitionDuration': attrs.duration,
                    'transitionTimingFunction': attrs.easing
                });
            };
        }
    };
});

app.directive('slideToggle', function () {
    'use strict';
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var target = document.querySelector(attrs.slideToggle);
            attrs.expanded = false;
            element.bind('click', function () {
                var content = target.querySelector('.slideable_content'),
                    y;
                if (!attrs.expanded) {
                    content.style.border = '1px solid rgba(0,0,0,0)';
                    y = content.clientHeight;
                    content.style.border = 0;
                    target.style.height = y + 'px';
                } else {
                    target.style.height = '0px';
                }
                attrs.expanded = !attrs.expanded;
            });
        }
    };
});

app.directive('totalSelector', function() {
    'use strict';
    return {
        restrict: 'E',
        scope: {
            selectedValue: '=selectedValue',
            values: '=values',
            selectTotalItems: '&selectTotalItems'
        },
        template: "<div class='btn-group totalitems-dropdown' uib-dropdown><button id='single-button' type='button' class='btn btn-default btn-sm' uib-dropdown-toggle>{{ selectedValue }} <span class='caret'></span></button><ul class='dropdown-menu totalitems-dropdown-menu' uib-dropdown-menu role='menu' aria-labelledby='single-button'><li role='menuitem' ng-repeat='value in values'><a href ng-click='onUpdateTotal(value)'>{{ value }}</a></li></ul></div>",
        link: function(scope, element, attrs) {
            scope.onUpdateTotal = function(total) {
                scope.selectTotalItems({
                    total: total
                });
            };
        }
    };
});

app.controller('markovChainCtrl', ['$scope', '$window', 'markovChainGenerator', function($scope, $window, markovChainGenerator) {
    'use strict';

    var previousLength,
        previousOrder;

    /* Settings management */
    $scope.onClickSettings = function() {
        $window.document.activeElement.blur();
        $scope.hasSettingsDisplayed = ($scope.hasSettingsDisplayed) ? false : true;
    };

    $scope.sliderLength = {
        min: 3,
        max: 15,
        value: [4, 11],
        step: 1
    };

    $scope.sliderOrder = {
        min: 1,
        max: 5,
        value: 3,
        step: 1
    };

    previousLength = $scope.sliderLength.value;
    previousOrder = $scope.sliderOrder.value;

    $scope.onSlideLength = function(value) {
        if (value[0] !== previousLength[0] || value[1] !== previousLength[1]) {
            previousLength = value;
            $scope.generateMarkovChains();
        }
    };

    $scope.onSlideOrder = function(value) {
        if (value !== previousOrder) {
            previousOrder = value;
            $scope.generateMarkovChains();
        }
    };

    $scope.startWith = '';
    $scope.endWith = '';
    $scope.contains = '';
    $scope.doesntContains = '';
    /* */

    $scope.onChangeDictionary = function() {
        $scope.generateMarkovChains();
    };

    $scope.generateMarkovChains = function() {
        var i,
            j,
            maxAttemps = 1000,
            result;

        if ($window.document.activeElement.tagName !== 'INPUT' && window.document.activeElement.tagName !== 'TEXTAREA') {
            $window.document.activeElement.blur();
        }

        markovChainGenerator.refresh();
        markovChainGenerator.setOrder($scope.sliderOrder.value);
        markovChainGenerator.addWordsToChain($scope.dictionary.toLowerCase().split(' '));

        $scope.names = [];

        for (i = 0, j = 0; j < $scope.totalNames; i += 1) {
            if (i > maxAttemps) {
                j = $scope.totalNames;
            }

            result = markovChainGenerator.generateWord(
                $scope.sliderLength.value[0],
                $scope.sliderLength.value[1],
                $scope.startWith.toLowerCase(),
                $scope.endWith.toLowerCase(),
                $scope.contains.toLowerCase(),
                $scope.doesntContains.toLowerCase()
            );
            if (typeof result !== 'undefined' && $scope.names.indexOf(result) === -1) {
                j += 1;
                $scope.names.push(result);
            }
        }
    };

    $scope.totalNames = 30;
    $scope.onSelectTotalItems = function(total) {
        $scope.totalNames = total;
        $scope.generateMarkovChains();
    };

    $scope.generatorReady = true;
    $scope.dictionary = "abaddon abathar adriel ahriman ambriel amesha anael arariel archangel ariel azazel azrael azraiel barachiel camael cassiel cherub cherubim daniel dardail dominions dumah elohim eremiel gabriel gadreel grigori hadraniel hahasiah hamalat haniel haniel harut hashmal hesediel imamiah israfel israfel israfil jegudiel jehoel jequn jerahmeel jibril jophiel kamael kemuel kerubiel khamael kiraman kushiel kyriotetes leliel lucifer maalik marut mebahiah metatron michael mikail moroni muaqqibat munkar muriel nakir nanael netzach nithael nuriel pahaliah penemue phanuel poyel puriel qaphsiel raguel raphael raziel remiel sachiel samael sandalphon sariel schemhampharae selaphiel seraph seraphiel seraphim shamsiel simiel temeluchus tennin thrones tzadkiel tzaphkiel tzaphqiel uriel uzziel vehuel virtues wormwood zachariel zadkiel zadkiel zaphkiel zephon zophiel";
    $scope.generateMarkovChains();

}]);
