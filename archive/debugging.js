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
  textArea.value = "This sentence here.";
  userSentence.value = "This second sentence, here.";

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
  const punctuation = [".", "?", "!", ",", ";", ":"];

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
    console.log(keyCurrent + " vs " + userCurrent);

    let userPunctuation = punctuation.indexOf(userCurrent.slice(-1));
    let keyPunctuation = punctuation.indexOf(keyCurrent.slice(-1));
    let userMinusPunc = "noword", userPlusPunc = "noword", keyMinusPunc = "noword", keyPlusPunc = "noword";
    if (userPunctuation != -1) {
      userMinusPunc = userCurrent.slice(0,-1);
      keyPlusPunc = keyCurrent + punctuation[userPunctuation];
      console.log("user has punc: " + userCurrent + " / " + keyPlusPunc + " / " + userMinusPunc);
    }
    if (keyPunctuation != -1) {
      keyMinusPunc = keyCurrent.slice(0,-1);
      userPlusPunc = userCurrent + punctuation[keyPunctuation];
      console.log("key has punc: " + keyCurrent + " / " + userPlusPunc + " / " + keyMinusPunc);
    }


    if (keyCurrent === userCurrent) {
      // compare at current indices. if match found, compare next pair.
      test.innerHTML += " " + keyCurrent + "|" + userCurrent;
    } else if ((keyCurrent === userMinusPunc)) {
      // check if words at current indices only differ by ending punctuation
      test.innerHTML += " " + keyCurrent + "|" + userMinusPunc + " " + punctuation[userPunctuation];
    } else if ((keyMinusPunc === userCurrent)) {
      // check if words at current indices only differ by ending punctuation
      test.innerHTML += " " + keyMinusPunc + " " + punctuation[keyPunctuation] + "|" + userCurrent;
    } else {
      // if no match found, look ahead for match in user sentence
      // look ahead for current word
      let matchInUser = userWords.indexOf(keyCurrent);
      console.log("looking for " + keyCurrent + " in user");
      // look ahead for current word but without punctuation
      if (userPunctuation != -1) {
        console.log("looking for " + keyPlusPunc + " in user");
        matchInUser = userWords.indexOf(keyPlusPunc);
      }
      // look ahead for current word but with punctuation
      else if (keyPunctuation != -1) {
        matchInUser = userWords.indexOf(keyMinusPunc);
        console.log("looking for " + keyMinusPunc + " in user");
      }

      // if no match found, look ahead for match in key sentence
      let matchInKey = keyWords.indexOf(userCurrent);
      console.log("looking for " + userCurrent + " in key");
      // look ahead for current word but without punctuation
      if (keyPunctuation != -1) {
        console.log("looking for " + userPlusPunc + " in key");
        matchInKey = keyWords.indexOf(userPlusPunc);
      }
      // look ahead for current word but with punctuation
      else if (userPunctuation != -1) {
        console.log("looking for " + userMinusPunc + " in key");
        matchInKey = keyWords.indexOf(userMinusPunc);
      }


      function lookAhead() {
        // pick the match that is closest to the current index
        let closestMatch = Math.min(matchInKey, matchInUser);
        let farthestMatch = Math.max(matchInKey, matchInUser);

        if ((matchInKey == -1) && (matchInUser == -1)) {
          console.log("both -1. no matching word found.");
          // aligned mismatch
          test.innerHTML += " " + "\[" + keyCurrent + "\]" + "|" + "\[" + userCurrent + "\]";
        } else if (matchInKey == -1) {
          console.log("matchInKey is -1");
          while (userIndex < matchInUser) {
            test.innerHTML += " " + "\[" + userCurrent + "\]";
            userIndex++;
            userCurrent = userWords[userIndex];
          }
          test.innerHTML += " " + keyCurrent + "|" + userCurrent;
        } else if (matchInUser == -1) {
          console.log("matchInUser is -1");
          while (keyIndex < matchInKey) {
            test.innerHTML += " " + "\[" + keyCurrent + "\]";
            keyIndex++;
            keyCurrent = keyWords[keyIndex];
          }
          test.innerHTML += " " + keyCurrent + "|" + userCurrent;
        } else {
          console.log("neither are -1");
          if (matchInKey > matchInUser) {
            userIndex = matchInUser;
          } else if (matchInUser > matchInKey) {
            keyIndex = matchInKey;
          } else {
            console.log("matching indices?");
          }
        }
      }


    }


    keyIndex++;
    userIndex++;
  }

  // print any remaining words
  console.log("printing remaining words");
  if (keyWords.length > userWords.length) {
    while (keyIndex < keyWords.length) {
      test.innerHTML += " " + "\[" + keyWords[keyIndex] + "\]";
      keyIndex++;
    }
  } else if (userWords.length > keyWords.length) {
    while (userIndex < userWords.length) {
      test.innerHTML += " " + "\[" + userWords[userIndex] + "\]";
      userIndex++;
    }
  }

}
