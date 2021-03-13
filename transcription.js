// get text from text area. split into sentences.
let getSentences = (function(set = false, sentences = "") {
  let mySentences = "";
  let sentenceArray = [];
  return function(setInner = set, sentencesInner = sentences) {
    if (setInner) {
      mySentences = sentencesInner;
      mySentences = mySentences.replace(/\.com/g, "\~com");
      sentenceArray = mySentences.match(/[^.?!\r\n]+[.!?\r\n]+[\])'"`’”]*/g);
      for (let i = 0; i < sentenceArray.length; i++) {
          sentenceArray[i] = sentenceArray[i].trim();
      }

      // remove any blank lines
      let filtered = sentenceArray.filter(function (elem) {
        return elem != "";
      });
      sentenceArray = filtered;
    }
    return sentenceArray;
  }
})();

// get the next sentence in the array
let getNextSentence = (function(noIncrement = false, getNumber = -1) {
  let currentIndex = 0;
  return function(noIncrementInner = noIncrement, getNumberInner = getNumber) {
    if (noIncrementInner == true && currentIndex < getSentences().length) {
      return getSentences()[currentIndex];
    }
    if (getNumberInner != -1) { currentIndex = getNumberInner; }
    if (currentIndex < getSentences().length) {
      return getSentences()[currentIndex++];
    } else {
      return "(end of document)";
    }
  }
})();

// shift+tab to indent; leave tab default for navigating
function configureTab() {
  let textareas = document.getElementsByTagName('textarea');
  let count = textareas.length;
  let map = {};

  function shiftTab(e) {
    map[e.key] = e.type == 'keydown'; //
    for (let key in map) {
      console.log(key + ": " + map[key]);
    }

    if (map["Tab"] && !(map["Shift"])) {
      console.log("just tab");
      map["Tab"] = false;
    } else if (map["Shift"] && !(map["Tab"])) {
      console.log("just shift");
    } else if (map["Tab"] && map["Shift"]) {
      e.preventDefault();
      let s = this.selectionStart;
      this.value = this.value.substring(0, this.selectionStart) + "\t" + this.value.substring(this.selectionEnd);
      this.selectionEnd = s + 1;
    }
  }

  for (let i = 0; i < count; i++) {
    textareas[i].addEventListener('keyup', shiftTab, false);
    textareas[i].addEventListener('keydown', shiftTab, false);
  }
}
configureTab();

// set up buttons, event listeners, etc.
function configureElements() {
  const taButton = document.getElementById("taButton");
  const puncButton = document.getElementById("puncButton");
  const textArea = document.getElementById("fullText");
  const hideButton = document.getElementById("hideButton");
  const checkButton = document.getElementById("checkButton");
  const userSentence = document.getElementById("userText");
  const printedKeySent = document.getElementById("keySentence");
  const printedUserSent = document.getElementById("comparedSentence");
  const puncPractice = document.getElementById("puncPractice");

  // reset text areas if page has been refreshed
  textArea.value = "";
  userSentence.value = "";
  checkButton.style.display = 'none';
  hideButton.style.display = 'none';
  printedKeySent.hidden = true;
  printedUserSent.hidden = true;
  puncPractice.hidden = true;

  taButton.addEventListener('click', function() {
    getSentences(true, textArea.value);
    checkButton.style.display = 'inline-block';
    hideButton.style.display = 'inline-block';
    taButton.style.display = 'none';
    puncButton.style.display = 'none';
    userSentence.hidden = false;
    textArea.style.display = 'none';
    userSentence.focus();
  }, false);

  puncButton.addEventListener('click', function() {
    getSentences(true, textArea.value);
    let nextSentence = getNextSentence(true);
    document.getElementById("puncPractice").textContent = nextSentence.replace(/[.,!?;:()]/g,"");
    puncPractice.hidden = false;
    checkButton.style.display = 'inline-block';
    hideButton.style.display = 'inline-block';
    taButton.style.display = 'none';
    puncButton.style.display = 'none';
    userSentence.hidden = false;
    textArea.style.display = 'none';
    userSentence.focus();
  }, false);

  hideButton.addEventListener('click', function() {
    if (textArea.style.display == 'block') {
      textArea.style.display = 'none';
      hideButton.textContent = "Show Key";
    } else {
      textArea.style.display = 'block';
      hideButton.textContent = "Hide Key";
    }
  }, false);

  checkButton.addEventListener('click', function() {
    document.getElementById("test").textContent = "";
    compareValues();
    userSentence.value = "";
    if (puncPractice.hidden == false) {
      let nextSentence = getNextSentence(true);
      document.getElementById("puncPractice").textContent = nextSentence.replace(/[.,!?;:()]/g,"");
    }
    userSentence.focus();
  }, false);
}
configureElements();

// compare word in user sentence to word in answer key
function compareValues() {
  // start with offset 0. assume first words will match. update offset if mismatch found.
  let keyIndex = 0;
  let userIndex = 0;

  const test = document.getElementById("test");
  const keySentenceElmnt = document.getElementById("keySentence");
  const userElmnt = document.getElementById("comparedSentence");

  let userSentence = document.getElementById("userText").value;
  let keySentence = getNextSentence();
  if (keySentence == "(end of document)") {
    document.getElementById("test").textContent = "end of document";
    return;
  }
  keySentenceElmnt.textContent = keySentence;
  userSentence = userSentence.replace(/\.com/g, "\~com");
  let userWordsPunc = userSentence.split(' ');
  let keyWordsPunc = keySentence.split(' ');
  const punctuation = [".", "?", "!", ",", ";", ":"];

  let keyUnpunc = keySentence.replace(/[.,!?;:()]/g,"");
  let keyWords = keyUnpunc.split(' ');
  let userUnpunc = userSentence.replace(/[.,!;:()]/g,"");
  let userWords = userUnpunc.split(' ');

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

    // compare at current indices. if match found, compare next pair.
    if (keyCurrent === userCurrent) {
      // match found. no lookahead
    } else {
      // if no match found, look ahead for match in user sentence
      let matchInUser = userWords.indexOf(keyCurrent, userIndex);

      // if no match found, look ahead for match in key sentence
      let matchInKey = keyWords.indexOf(userCurrent, keyIndex);

      if ((matchInKey == -1) && (matchInUser == -1)) {
        // aligned mismatch
      } else if (matchInKey == -1) {
        // unaligned mismatch. user added words.
        while (userIndex < matchInUser) {
          test.textContent += " " + "\{" + "\-" + "\}" + '<span class="added">' + userWordsPunc[userIndex] + '</span>';
          userIndex++;
          userCurrent = userWords[userIndex];
        }
      } else if (matchInUser == -1) {
        // unaligned mismatch. user missed words.
        while (keyIndex < matchInKey) {
          test.textContent += " " + "\{" + "\+" + "\}" + '<span class="missed">' + keyWordsPunc[keyIndex] + '</span>';
          keyIndex++;
          keyCurrent = keyWords[keyIndex];
        }
      } else {
        // match found ahead
        if (userWords[userIndex] == keyWords[keyIndex+1]) {
          test.textContent += " " + "\{" + "\+" + "\}" + '<span class="missed">' + keyWordsPunc[keyIndex] + '</span>';
          keyIndex++;
          keyCurrent = keyWords[keyIndex];
        } else if (keyWords[keyIndex] == userWords[userIndex+1]) {
          test.textContent += " " + "\{" + "\-" + "\}" + '<span class="added">' + userWordsPunc[userIndex] + '</span>';
          userIndex++;
          userCurrent = userWords[userIndex];
        } else {
        }
      }
    }

    // get index of keyCurrent and userCurrent. use index to print puncutated forms
    let keyCurrentPunc = keyWordsPunc[keyWords.indexOf(keyCurrent, keyIndex)];
    let userCurrentPunc = userWordsPunc[userWords.indexOf(userCurrent, userIndex)];

    keyCurrentPunc = keyCurrentPunc.replace(/\~com/g, "\.com");
    userCurrentPunc = userCurrentPunc.replace(/\~com/g, "\.com");

    test.textContent += " " + (keyCurrentPunc == userCurrentPunc ? keyCurrentPunc : keyCurrentPunc + "|" + userCurrentPunc);
    keyIndex++;
    userIndex++;
  }

  // print any remaining words
    while (keyIndex < keyWords.length) {
      test.textContent += " " + "\{" + "\+" + "\}" + '<span class="missed">' + keyWordsPunc[keyIndex] + '</span>';
      keyIndex++;
    }
    while (userIndex < userWords.length) {
      test.textContent += " " + "\{" + "\-" + "\}" + '<span class="added">' + userWordsPunc[userIndex] + '</span>';
      userIndex++;
    }
}
