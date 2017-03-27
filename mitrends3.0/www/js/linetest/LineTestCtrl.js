angular.module('uszapp.linetest')
        .controller('LineTestCtrl', ['$scope', '$state', 'LineTest', 'lineTests',
            function ($scope, $state, LineTest, lineTests) {

                var canvas = $('canvas.line-canvas')[0];
                var currentCategoryIdx;  // the current index in the `lineTests` array
                var lineTest;
                $scope.$on("$ionicView.beforeEnter", function () {
                    init();
                });

                /**
                 * Initialize the controller.
                 * The initialization code is wrapped in this function since
                 * the controller has to be reset whenever the user visits
                 * the linetest state again using the beforeEnter event.
                 * Somehow, angular doesn't destroy controller instances when
                 * the state is left.
                 */
                function init() {
                    $scope.debug = false;
                    currentCategoryIdx = 0;  // the current index in the linetests array
                    $scope.showSummary = false; // if the summary screen should be shown
                    $scope.canRestart = false; // if the line test can be restarted
                    $scope.canDoNext = false; // if the user can proceed to the next test
                    $scope.resultHistory = []; // saved results
                    $scope.allTestsFinished = false; // if all tests are finished
                    $scope.endMessage = ''; // success or error message
                    $scope.time = ''; // time for the current test
                    $scope.score = ''; // score for the current test
                    $scope.success = false; // if the test was successful
                    $scope.done = false; // if the test was finished (successfully or also if it failed)
                    $scope.mouseTracker = new MouseTracker(canvas);
                    loadTest(currentCategoryIdx);
                    startTest();
                }

                function loadTest(categoryIndex) {
                    var test = _.sample(lineTests[categoryIndex].tests);
                    // var test = lineTests[0].tests[0];
                    lineTest = new LineTest(canvas, test, $scope.debug, $scope.mouseTracker);
                }

                function startTest() {
                    $scope.canRestart = false;
                    $scope.success = false;
                    $scope.done = false;
                    $scope.canDoNext = false;

                    lineTest.start().then(function (result) {
                        $scope.done = true;
                        $scope.success = true;
                        $scope.score1 = result.score1;
                        $scope.score2 = result.score2;
                        $scope.time = result.time;
                        $scope.canRestart = false;
                        $scope.canDoNext = true;
                        $scope.allTestsFinished = currentCategoryIdx === lineTests.length - 1;
                        if ($scope.allTestsFinished) {
                            $scope.endMessage = 'Weiter zur Zusammenfassung.';
                        } else {
                            $scope.endMessage = 'Weiter zum nächsten Test.';
                        }

                        $scope.resultHistory.push(result);
                        $scope.mouseTracker.initialiseClicks();
                    }, function (err) {
                        $scope.done = true;
                        $scope.success = false;
                        $scope.endMessage = err;
                        $scope.canRestart = true;
                        $scope.canDoNext = false;
                    });
                }

                $scope.nextTest = function () {
                    if ($scope.allTestsFinished) {
                        _($scope.resultHistory).each(function (res) {
                            res.canvas.style.width = '400px';
                            res.canvas.style.height = '300px';
                        });
                        $scope.showSummary = true;
                    } else {
                        currentCategoryIdx += 1;
                        loadTest(currentCategoryIdx);
                        startTest();
                    }
                };

                $scope.restart = function () {
                    loadTest(currentCategoryIdx);
                    startTest();
                };

            }])
        .directive('injectElement', function () {
            return {
                restrict: 'A',
                scope: {
                    injectElement: '='
                },
                link: function (scope, element) {
                    element.append(scope.injectElement);
                }
            };
        });