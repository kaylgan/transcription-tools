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
    console.log("start of while, comparing " + keyCurrent + " & " + userCurrent);

    let userPunctuation = punctuation.indexOf(userCurrent.slice(-1));
    let keyPunctuation = punctuation.indexOf(keyCurrent.slice(-1));

    let keyPlusPunc = keyCurrent + ((userPunctuation != -1) ? punctuation[userPunctuation] : "");
    let keyMinusPunc = ((keyPunctuation != -1) ? keyCurrent.slice(0,-1) : keyCurrent);

    let userPlusPunc = userCurrent + ((keyPunctuation != -1) ? punctuation[keyPunctuation] : "");
    let userMinusPunc = ((userPunctuation != -1) ? userCurrent.slice(0,-1) : userCurrent);

    function printPunctuation() {
      test.innerHTML += " " + ((keyPunctuation != -1) ? keyMinusPunc : keyCurrent);
      test.innerHTML += "|" + ((userPunctuation != -1) ? userMinusPunc : userCurrent);
      test.innerHTML += " " + ((keyPunctuation != -1) ? punctuation[keyPunctuation] : "");
      test.innerHTML += ((keyPunctuation != -1 && userPunctuation != -1) ? "|" : "");
      test.innerHTML += ((userPunctuation != -1) ? punctuation[userPunctuation] : "");
    }

    function printKeyPunctuation() {
      test.innerHTML += " " + "\[" + ((keyPunctuation != -1) ? keyMinusPunc : keyCurrent);
      test.innerHTML += ((keyPunctuation != -1) ? punctuation[keyPunctuation] : "") + "\]";
    }

    // test.innerHTML += " " + "\[" + userCurrent + "\]";
    function printUserPunctuation() {
      test.innerHTML += " " + "\[" + ((userPunctuation != -1) ? userMinusPunc : userCurrent);
      test.innerHTML += ((userPunctuation != -1) ? punctuation[userPunctuation] : "") + "\]";
    }

    // compare at current indices. if match found, compare next pair.
    if (keyCurrent === userCurrent) {
      console.log("found a match. no lookahead.");
      // test.innerHTML += " " + keyCurrent + "|" + userCurrent;
      printPunctuation();
    } else if (keyCurrent === userPlusPunc || keyCurrent === userMinusPunc || userMinusPunc === keyMinusPunc ) {
      console.log("match, only differ in punctuation");
      printPunctuation();
    } else {
      // if no match found, look ahead for match in user sentence
      // look ahead for match as is, with punctuation, without punctuation
      let matchInUser = -1;
      let matchInKey = -1;
      let matches = [];

      // let matchInUser = userWords.indexOf(keyCurrent);
      // console.log("user match at " + matchInUser);
      if (Math.max(userWords.indexOf(keyCurrent), userWords.indexOf(keyPlusPunc), userWords.indexOf(keyMinusPunc)) == -1) {
        console.log("checking user.index(key) values are -1: " + userWords.indexOf(keyCurrent) + userWords.indexOf(keyPlusPunc) + userWords.indexOf(keyMinusPunc));
        console.log("user.index(key) words (c+-): " + keyCurrent + " " + keyPlusPunc + " " + keyMinusPunc);
        matchInUser = userWords.indexOf(keyCurrent);
      } else {
        console.log("found non -1 values for user.index(key)");
        let comparisons = [userWords.indexOf(keyCurrent), userWords.indexOf(keyPlusPunc), userWords.indexOf(keyMinusPunc)];
        for (let i = 0; i < comparisons.length; i++) {
          if (comparisons[i] != -1) {
            matches.push(comparisons[i]);
          }
        }
        matchInUser = Math.min(...matches);
      }

      // if no match found, look ahead for match in key sentence
      // let matchInKey = keyWords.indexOf(userCurrent);
      // console.log("key match at " + matchInKey);
      if (Math.max(keyWords.indexOf(userCurrent), keyWords.indexOf(userPlusPunc), keyWords.indexOf(userMinusPunc)) == -1) {
        console.log("checking key.index(user) values are -1: " + keyWords.indexOf(userCurrent) + keyWords.indexOf(userPlusPunc) + keyWords.indexOf(userMinusPunc));
        console.log("key.index(user) words (c+-): " + userCurrent + " " + userPlusPunc + " " + userMinusPunc);
        matchInKey = keyWords.indexOf(userCurrent);
      } else {
        console.log("found non -1 values for key.index(user)");
        let comparisons = [keyWords.indexOf(userCurrent), keyWords.indexOf(userPlusPunc), keyWords.indexOf(userMinusPunc)];
        for (let i = 0; i < comparisons.length; i++) {
          if (comparisons[i] != -1) {
            matches.push(comparisons[i]);
          }
        }
        matchInKey = Math.min(...matches);
      }



      // both neither one
      // key, user  key user, key, user;  Xkey, user,  Xkey user
      // key, vs user = key, key, key VS user user user
      // key vs user, = key key, key VS user, user, user
      // key, vs user; = key, key; key VS user; user, user
      // let puncMatchInUser = (())
      // test.innerHTML += " matchInUser at:" + matchInUser;



      if ((matchInKey == -1) && (matchInUser == -1)) {
        console.log("both -1. no matching word found. aligned mismatch.");
        // aligned mismatch
        // test.innerHTML += " " + keyCurrent + "|" + userCurrent;
        printPunctuation();
      } else if (matchInKey == -1) {
        // unaligned mismatch. user added words.
        console.log("matchInKey is -1. user added words.");
        while (userIndex < matchInUser) {
          // test.innerHTML += " " + "\[" + userCurrent + "\]";
          printUserPunctuation();
          userIndex++;
          userCurrent = userWords[userIndex];
          console.log("printing words, increasing index. (user). userCurrent is now " + userCurrent);
        }
        // test.innerHTML += " " + keyCurrent + "|" + userCurrent;
        printPunctuation();
      } else if (matchInUser == -1) {
        // unaligned mismatch. user missed words.
        console.log("matchInUser is -1. user missed words.");
        while (keyIndex < matchInKey) {
          // test.innerHTML += " " + "\[" + keyCurrent + "\]";
          printKeyPunctuation();
          keyIndex++;
          keyCurrent = keyWords[keyIndex];
          console.log("printing words, increasing index. (key). keyCurrent is now " + keyCurrent);
        }
        // test.innerHTML += " " + keyCurrent + "|" + userCurrent;
        printPunctuation();
      } else {
        console.log("found match ahead");
        if (userWords[userIndex] == keyWords[keyIndex+1]) {
          // test.innerHTML += " " + "\[" + keyCurrent + "\]";
          printKeyPunctuation();
          keyIndex++;
          keyCurrent = keyWords[keyIndex];
          // test.innerHTML += " " + keyCurrent + "|" + userCurrent;
          printPunctuation();
        } else if (keyWords[keyIndex] == userWords[userIndex+1]) {
          // test.innerHTML += " " + "\[" + userCurrent + "\]";
          printUserPunctuation();
          userIndex++;
          userCurrent = userWords[userIndex];
          // test.innerHTML += " " + keyCurrent + "|" + userCurrent;
          printPunctuation();
        } else {
          // test.innerHTML += " " + keyCurrent + "|" + userCurrent;
          printPunctuation();
        }

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
