let getSentences = (function(set = false, sentences = "") {
  let mySentences = "";
  let sentenceArray = [];
  return function(setInner = false, sentencesInner = "") {
    if (setInner) {
      mySentences = sentencesInner;
      // split into sentences. may end in . ? ! ' " \n etc.
      sentenceArray = mySentences.match(/[^.?!\r\n]+[.!?\r\n]+[\])'"`’”]*/g);
      console.log("length? " + sentenceArray.length);
    }
    return sentenceArray;
  }
})();

let getNextSentence = (function(getNumber = -1) {
  let currentIndex = 0;
  return function(getNumberInner = -1) {
    if (getNumberInner != -1) { currentIndex = getNumberInner; }
    if (currentIndex < getSentences().length) {
      return getSentences()[currentIndex++];
    } else {
      return "(end of document)";
    }
  }
})();

function configureElements() {
  const taButton = document.getElementById("taButton");
  const textArea = document.getElementById("fullText");
  const hideButton = document.getElementById("hideButton");
  const checkButton = document.getElementById("checkButton");
  const userSentence = document.getElementById("userText");

  // reset text areas if page has been refreshed
  textArea.value = "";
  userSentence.value = "";
  checkButton.hidden = true;
  hideButton.hidden = true;

  taButton.addEventListener('click', function() {
    getSentences(true, textArea.value);
    checkButton.hidden = false;
    hideButton.hidden = false;
    taButton.hidden = true;
  }, false);

  hideButton.addEventListener('click', function() {
    if (textArea.hidden == false) {
      textArea.hidden = true;
      hideButton.innerHTML = "Show Text";
    } else {
      textArea.hidden = false;
      hideButton.innerHTML = "Hide Text";
    }
  }, false);

  checkButton.addEventListener('click', function() {
    compareValues();
  }, false);

  // TESTING
  // textArea.value = "This is the first sentence.";
  // userSentence.value = "This is the sentence.";

}
configureElements();

function compareValues() {
  // start with offset 0. assume first words will match. update offset if mismatch found. allow max offset of 10 or so
  let keyIndex = 0;
  let userIndex = 0;

  const test = document.getElementById("test");

  const keySentenceElmnt = document.getElementById("keySentence");
  const userElmnt = document.getElementById("comparedSentence");
  let userSentence = document.getElementById("userText").value;
  let keySentence = getNextSentence();
  keySentenceElmnt.innerHTML = keySentence;

  let userWords = userSentence.split(' ');
  let keyWords = keySentence.split(' ');

  /*
  compare at current indices
    if match found, compare next pair
    if no match found
      look ahead for match: indexOf.
        check for current word of key in user sentence
        check for current word of user sentence in key
        if found, adjust offset
      if not found, skip this index
  */

  while (keyIndex < keyWords.length && userIndex < userWords.length) {
    let keyCurrent = keyWords[keyIndex], userCurrent = userWords[userIndex];
    console.log("start of while, comparing " + keyCurrent + " & " + userCurrent);
    // compare at current indices. if match found, compare next pair.
    if (keyCurrent === userCurrent) {
      console.log("found a match. no lookahead.");
      test.innerHTML += " " + keyCurrent + "|" + userCurrent;
    } else {
      // if no match found, look ahead for match in user sentence
      let matchInUser = userWords.indexOf(keyCurrent);
      // test.innerHTML += " matchInUser at:" + matchInUser;

      // if no match found, look ahead for match in key sentence
      let matchInKey = keyWords.indexOf(userCurrent);
      // test.innerHTML += " matchInKey at:" + matchInKey;

      // pick the match that is closest to the current index
      let closestMatch = Math.min(matchInKey, matchInUser);
      let farthestMatch = Math.max(matchInKey, matchInUser);

      if ((matchInKey == -1) && (matchInUser == -1)) {
        console.log("both -1. no matching word found. aligned mismatch.");
        // aligned mismatch
        test.innerHTML += " " + keyCurrent + "|" + userCurrent;
      } else if (matchInKey == -1) {
        // unaligned mismatch. user added words.
        console.log("matchInKey is -1. user added words.");
        while (userIndex < matchInUser) {
          test.innerHTML += " " + "\[" + userCurrent + "\]";
          userIndex++;
          userCurrent = userWords[userIndex];
        }
        test.innerHTML += " " + keyCurrent + "|" + userCurrent;
      } else if (matchInUser == -1) {
        // unaligned mismatch. user missed words.
        console.log("matchInUser is -1. user missed words.");
        while (keyIndex < matchInKey) {
          test.innerHTML += " " + "\[" + keyCurrent + "\]";
          keyIndex++;
          keyCurrent = keyWords[keyIndex];
        }
        test.innerHTML += " " + keyCurrent + "|" + userCurrent;
      } else {
        console.log("found match ahead");
        if (userWords[userIndex] == keyWords[keyIndex+1]) {
          test.innerHTML += " " + "\[" + keyCurrent + "\]";
          keyIndex++;
          keyCurrent = keyWords[keyIndex];
          test.innerHTML += " " + keyCurrent + "|" + userCurrent;
        } else if (keyWords[keyIndex] == userWords[userIndex+1]) {
          test.innerHTML += " " + "\[" + userCurrent + "\]";
          userIndex++;
          userCurrent = userWords[userIndex];
          test.innerHTML += " " + keyCurrent + "|" + userCurrent;
        } else {
          test.innerHTML += " " + keyCurrent + "|" + userCurrent;
        }

        // test.innerHTML += " " + keyCurrent + "|" + userCurrent;
        // if (matchInUser > matchInUser) {
        //   while (userIndex < matchInUser) {
        //     test.innerHTML += " " + "\[" + userCurrent + "\]";
        //     userIndex++;
        //     userCurrent = userWords[userIndex];
        //   }
        // } else if (matchInUser > matchInKey) {
        //   while (keyIndex < matchInKey) {
        //     test.innerHTML += " " + "\[" + keyCurrent + "\]";
        //     keyIndex++;
        //     keyCurrent = keyWords[keyIndex];
        //   }
        // } else {
        //   console.log("mIK = mIU?");
        // }
        // console.log("neither are -1");
        // if (matchInKey > matchInUser) {
        //   console.log("mIK > mIU, setting uI to mIU");
        //   userIndex = matchInUser;
        // } else if (matchInUser > matchInKey) {
        //   console.log("mIU > mIK. setting kI to mIK");
        //   keyIndex = matchInKey;
        // } else {
        //   console.log("unknown. mIK = mIU?");
        // }
      }
    }
    keyIndex++;
    userIndex++;
  }

  // print any remaining words
  console.log("printing remaining words");
  // if (keyWords.length > userWords.length) {
    while (keyIndex < keyWords.length) {
      test.innerHTML += " " + "\[" + keyWords[keyIndex] + "\]";
      keyIndex++;
    }
  // } else if (userWords.length > keyWords.length) {
    while (userIndex < userWords.length) {
      test.innerHTML += " " + "\[" + userWords[userIndex] + "\]";
      userIndex++;
    }
  // }

}
