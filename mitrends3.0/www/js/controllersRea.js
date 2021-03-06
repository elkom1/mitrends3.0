angular.module('starter.controllersRea', [])

  //--------------------------------------------------------//
  //---------------CONTROLLER Zahlsymbol-----------------------//
  //--------------------------------------------------------//
  .controller('SymbolDigitCtrl', function($scope, $stateParams, $state, $timeout, $interval, $ionicPopup, SymDigService, $translate, $rootScope, ownMidataService) {

    //Popup zu Beginn, das besagt das die Übungsphase nun zu ende ist
    var popTitle = $translate.instant('INFO');
    var popTemplate = $translate.instant('SDTEMPLATE_POPUP');

    var correct;
    var incorrect;
    var clickFrequency = 0;
    var counter = 0;
    var results = [];
    var lastTime;
    var intervalDuration = 15000;
    var intervalrepetitions = SymDigService.getTimeExcersise() / intervalDuration;

    console.log("intervalrep" + intervalrepetitions);

    var alertPopup = $ionicPopup.alert({
      title: popTitle,
      template: popTemplate,
    });
    alertPopup.then(function() {
      functcorrincorr();
    });

    // Function after alertPopup
    functcorrincorr = function() {

      // End excersise after 120 seconds
      $interval(functioninterval, intervalDuration, intervalrepetitions);

      // Assign the same 9 images as in the sd prepartion to the ranNums variable
      var ranNums = $rootScope.ranNums;

      console.log("Lösungstabelle vom Probelauf:" + ranNums);
      // Assign the keyTable of the sd prepartion to be also the keytable of the main excercise
      $scope.keyTable = $rootScope.keyTable;

      // Add every number of the ranNums array again to the array, because we need to have 18 images in one row in the solveTable - therefore every image is displayed twice in one row
      for (var i = 0; i < 9; i++) {
        ranNums.push(ranNums[i]);
      }
      console.log("Nummern für Bilder der Lösungstabelle:" + ranNums);
      // Generate Tables with 18 random ordered images of the ranNums array that we used to create the keytable
      $scope.solveTable = SymDigService.fillSolveTable((SymDigService.genNums(ranNums, 18)));
      $scope.solveTable2 = SymDigService.fillSolveTable((SymDigService.genNums(ranNums, 18)));
      $scope.solveTable2[0].next = false;
      //*****************************************************************************************
      var solveImgs = [1, 2, 3, 4, 5, 6, 7, 8, 9];
      console.log(solveImgs);

      // Generate the Images to add to the solveTable
      $scope.solveNumbers = SymDigService.genSolveNumbers(solveImgs);

      // *****************************************************************************************
      // Function excecuted if a digit was selected, to set it to assign it to the next symbol
      // *****************************************************************************************
      // Indicates if the next digit to assign is in the first or second table
      var solveTableOneComplete = false;
      $scope.setValueImage = function(digit) {

        if (!solveTableOneComplete) {
          var currentSolveTable = $scope.solveTable;
          console.log("Nächste Variable befindet sich in der oberen Tabelle")
        } else {
          var currentSolveTable = $scope.solveTable2;
          console.log("Nächste Variable befindet sich in der unteren Tabelle")
        }
        var length = currentSolveTable.length;
        // The imageName of the selected image
        console.log(length);
        for (var i = 0; i < length; i++) {
          // true if there is a next empty spot at the currentSolveTable
          console.log(i);
          if (currentSolveTable[i].next == true) {
            console.log("versuch");

            // Set the Symbol Image at the current position to the selected one
            currentSolveTable[i].numSrc = "img/" + digit.id + ".png";

            // Set the next empty Symbol Image to the green one
            if (i < (length - 1)) {
              console.log("hier2")
              currentSolveTable[i + 1].next = true;
              currentSolveTable[i].next = false;
            }

            // Check if the selected image is the one that corresponds to the number at the current position
            // imageSource of the symbol at the current[i] position
            var imgSrcSolveTable = currentSolveTable[i].imgSrc;
            // imageSource of the symbol assigned to the choosen digit
            var imgSrcKeyTable = $scope.keyTable[digit.id - 1].imgSrc;
            console.log(imgSrcSolveTable);
            console.log(imgSrcKeyTable);

            SymDigService.addResult(angular.equals(imgSrcKeyTable, imgSrcSolveTable));


            //True if the image for the last field was choosen
            if (i == (length - 1)) {
              console.log("letztes feld");
              //True if it's the last field of the first row
              if (SymDigService.getTrys() == 0) {
                currentSolveTable[i].next = false;
                solveTableOneComplete = true;
                $scope.solveTable2[0].next = true;
                SymDigService.addTry();
                //True if it's the last field of the second row
              } else if (SymDigService.getTrys() == 1) {
                //function to reload the lines with new values
                $scope.solveTable = SymDigService.fillSolveTable((SymDigService.genNums(ranNums, 18)), false);
                $scope.solveTable2 = SymDigService.fillSolveTable((SymDigService.genNums(ranNums, 18)), false);
                $scope.solveTable2[0].next = false;
                solveTableOneComplete = false;
                SymDigService.setTry(0);
              }
            } else {
              break;
            }

          } else {
            //should not happen
          }
        }
      };
    };

    //Initialize arrays for Midata
    var correctArray = [];
    var incorrectArray = [];
    var clickFrequencyArray = [];

    // Saving during the interval
    functioninterval = function() {
      counter++;
      var partResult = SymDigService.getPartResults();
      correct = partResult.correct;
      incorrect = partResult.incorrect;
      clickFrequency = ((correct + incorrect) / ((SymDigService.getTimeExcersise() / intervalrepetitions) / 60000));


      correctArray.push(correct);
      incorrectArray.push(incorrect);
      clickFrequencyArray.push(clickFrequency);

      console.log("Zwischenresultate" + results);
      //If the time is over the counter is equal to the intervalrepetitions and we want to save the overall results
      if (counter == intervalrepetitions) {

        //Saving data to Midata
        var symbolDigit = new mitrends.MSCogTestSD(new Date());
        symbolDigit.addNbCorrectPartResults(correctArray);
        symbolDigit.addNbIncorrectPartResults(incorrectArray);
        symbolDigit.addClickFreqPartResults(clickFrequencyArray);

        $state.go('geschafftSD');

        // Variables to store in the result file
        correct = SymDigService.getCorrect();
        incorrect = SymDigService.getIncorrect();
        clickFrequency = SymDigService.getClickFrequency();

        symbolDigit.addNbTotalCorrect(correct);
        symbolDigit.addNbTotalIncorrect(incorrect);
        symbolDigit.addClickFrequency(Math.round(clickFrequency));
        symbolDigit.addDuration(SymDigService.getTimeExcersise() / 1000);
        console.log("midata");
        ownMidataService.addToBundle(symbolDigit);
        ownMidataService.saveLocally(symbolDigit);
        SymDigService.resetCorrect();
        SymDigService.resetIncorrect();

      } else {
        //do nothing
      }
    };
  })

  //--------------------------------------------------------//
  //---------------CONTROLLER Zahlsymbol Vorbereitung-----------------------//
  //--------------------------------------------------------//
  .controller('SymbolDigitPrepCtrl', function($scope, $stateParams, $ionicPopup, $translate, $rootScope, $state, SymDigService, ownMidataService) {
    var popTitle = $translate.instant('INFO');
    var popTemplate = $translate.instant('TEMPLATEPOPUP_NEXTPREPZS');

    var alertPopup = $ionicPopup.alert({
      title: popTitle,
      template: popTemplate,
    });
    alertPopup.then(function() {
      var startTime = new Date().getTime();

      // Fill the keyTable with the images in a random way and the numbers ordered from 1 to 9
      var ranNums = SymDigService.doShuffle([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]);
      console.log("RandomOrderedNumbers:" + ranNums);

      //Remove all items after the nint one - because for the keytable only the first nine numbers were choosen to be an image
      ranNums.splice(9);

      // Add the number at position 2 of the ranNums array again to the ranNums array, because we need to have 10 images in the solveTable

      var ranNumsForSolveTable = ranNums.slice();
      ranNumsForSolveTable.push(ranNumsForSolveTable[2]);
      console.log("zehn zahlen" + ranNumsForSolveTable);
      console.log("9zahlen" + ranNums);
      $rootScope.keyTable = SymDigService.fillKeyTable(ranNums);
      $scope.solveTable = SymDigService.fillSolveTable((SymDigService.genNums(ranNumsForSolveTable, 10)));
      console.log("Zahlen für richtige Übung" + ranNums);
      $rootScope.ranNums = ranNums;
      //*****************************************************************************************
      var solveNumberImages = [1, 2, 3, 4, 5, 6, 7, 8, 9];
      console.log("Lösungszahlen" + solveNumberImages);

      // Generate the Images to add to the solveTable
      $scope.solveNumbers = SymDigService.genSolveNumbers(solveNumberImages);
      // *****************************************************************************************
      // Function excecuted if a digit was selected, to set it to assign it to the next symbol
      // *****************************************************************************************

      $scope.setValueImage = function(digit) {

        var currentSolveTable = $scope.solveTable;

        var length = currentSolveTable.length;
        // The imageName of the selected image
        console.log(length);
        for (var i = 0; i < length; i++) {
          // true if the symbol image at this position is the green image, to mark that this image is gonna be replaced with the choosen one
          console.log(i);
          if (currentSolveTable[i].next == true) {
            console.log("versuch");

            // Set the Symbol Image at the current position to the selected one
            currentSolveTable[i].numSrc = "img/" + digit.id + ".png";

            // Set the next empty Symbol Image to be the next one
            if (i < (length - 1)) {
              console.log("hier2")
              currentSolveTable[i + 1].next = true;
              currentSolveTable[i].next = false;
            }

            // Check if the selected image is the one that corresponds to the number at the current position
            // imageSource of the symbol at the current[i] position
            var imgSrcSolveTable = currentSolveTable[i].imgSrc;
            console.log("Bild" + imgSrcSolveTable);
            // imageSource of the symbol assigned to the choosen digit
            var imgSrcKeyTable = $scope.keyTable[digit.id - 1].imgSrc;
            console.log("Zahl" + imgSrcKeyTable);
            if (angular.equals(imgSrcKeyTable, imgSrcSolveTable)) {
              SymDigService.addCorrectPrep();
            } else {
              SymDigService.addIncorrectPrep();

            }
            //True if the image for the last field was choosen
            if (i == (length - 1)) {
              var endTime = new Date().getTime();
              var results = [];
              console.log("letztes feld");

              currentSolveTable[i].next = false;

              // Reset the number of Tries
              SymDigService.setTry(0);

              $state.go('symbolDigit');
              // Variables to store in the result file
              var durationExcersisePrep = (endTime - startTime) / 1000;
              correct = SymDigService.getCorrectPrep();
              incorrect = SymDigService.getIncorrectPrep();
              clickFrequency = Math.round((60 / durationExcersisePrep) * (correct + incorrect));

              //Saving results to Midata
              var symbolDigitProbe = new mitrends.MSCogTestSDPrep(new Date());
              symbolDigitProbe.addNbCorrect(correct);
              symbolDigitProbe.addNbIncorrect(incorrect);
              symbolDigitProbe.addDuration(durationExcersisePrep);
              symbolDigitProbe.addClickFrequency(clickFrequency);
              console.log("midata");
              ownMidataService.addToBundle(symbolDigitProbe);
              ownMidataService.saveLocally(symbolDigitProbe);
              SymDigService.resetCorrectPrep();
              SymDigService.resetIncorrectPrep();
            }
            break;
          } else {

          }
        }
      };
    });
  });
