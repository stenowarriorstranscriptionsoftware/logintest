var numMissedButMatched = 0;
var startTime;
var typingTimer;

window.onload = function () {
  document.getElementById("paragraphB").addEventListener("input", function () {
    if (!startTime) startTime = new Date();
  });
};

function checkForMatchingWords(word, paragraph, startIndex) {
  for (let i = 0; i < 1 && startIndex + i < paragraph.length; i++) {
    if (word === paragraph[startIndex + i]) return true;
  }
  return false;
}

function isSimilar(wordA, wordB) {
  const minLength = Math.min(wordA.length, wordB.length);
  const maxLength = Math.max(wordA.length, wordB.length);
  let similarCount = 0;
  for (let i = 0; i < minLength; i++) {
    if (wordA[i] === wordB[i]) similarCount++;
  }
  return (similarCount / maxLength) * 100 >= 50;
}

function arraysAreEqual(arr1, arr2) {
  if (arr1.length !== arr2.length) return false;
  return arr1.every((v, i) => v === arr2[i]);
}

function compareParagraphs() {
  const paragraphA = document
    .getElementById("paragraphA")
    .value.replace(/<[^>]*>/g, "")
    .replace(/[\u2018\u2019]/g, "'")
    .trim()
    .split(/\s+/);

  const paragraphB = document
    .getElementById("paragraphB")
    .value.replace(/<[^>]*>/g, "")
    .replace(/[\u2018\u2019]/g, "'")
    .trim()
    .split(/\s+/);

  let comparedText = "";
  let numHalfDiff = 0;
  let numFullDiff = 0;
  let wordAIndex = 0;
  let wordBIndex = 0;

  comparedText += `<div class="legend-box">
    <div><span class="legend red">■</span> Addition</div>
    <div><span class="legend blue">■</span> Omission</div>
    <div><span class="legend orange">■</span> Spelling Mistake</div>
    <div><span class="legend purple">■</span> Capitalization Mistake</div>
  </div>`;

  if (paragraphB.length === 0) {
    comparedText += paragraphA.map(w => `<span class="blue">${w}</span>`).join(" ");
    numFullDiff = paragraphA.length;
  } else if (paragraphA.length === 0) {
    comparedText += paragraphB.map(w => `<span class="red strike">${w}</span>`).join(" ");
    numFullDiff = paragraphB.length;
  } else {
    while (wordAIndex < paragraphA.length || wordBIndex < paragraphB.length) {
      let wordA = paragraphA[wordAIndex] || "";
      let wordB = paragraphB[wordBIndex] || "";
      let cleanA = wordA.replace(/[,\?\-\s]/g, "");
      let cleanB = wordB.replace(/[,\?\-\s]/g, "");

      if (cleanA === cleanB) {
        comparedText += `<span class="green">${wordA}</span> `;
        wordAIndex++;
        wordBIndex++;
      } else if (cleanA.toLowerCase() === cleanB.toLowerCase()) {
        comparedText += `<span class="purple">${wordA}</span> <span class="strike purple">${wordB}</span> `;
        wordAIndex++;
        wordBIndex++;
        numHalfDiff++;
      } else if (!wordA) {
        comparedText += `<span class="red strike">${wordB}</span> `;
        wordBIndex++;
        numFullDiff++;
      } else if (!wordB) {
        comparedText += `<span class="blue">${wordA}</span> `;
        wordAIndex++;
        numFullDiff++;
      } else if (isSimilar(wordA, wordB)) {
        comparedText += `<span class="orange">${wordA}</span> <span class="strike orange">${wordB}</span> `;
        wordAIndex++;
        wordBIndex++;
        numHalfDiff++;
      } else {
        comparedText += `<span class="red strike">${wordB}</span> <span class="blue">${wordA}</span> `;
        wordAIndex++;
        wordBIndex++;
        numFullDiff++;
      }
    }
  }

  const totalWords = paragraphA.length;
  const incorrect = numHalfDiff + numFullDiff;
  const correct = totalWords - incorrect;
  const accuracyPercentage = (correct / totalWords) * 100;
  const errorPercentage = 100 - accuracyPercentage;

  const endTime = new Date();
  const elapsedMinutes = (endTime - startTime) / (1000 * 60);
  const totalChars = paragraphB.join(" ").length;
  const wordsTyped = totalChars / 5;
  const wpm = Math.round(wordsTyped / elapsedMinutes);

  // Append result summary
  comparedText += `<div class="summary">
    <table>
      <tr><th>Total Words</th><td>${totalWords}</td></tr>
      <tr><th>Correct</th><td>${correct}</td></tr>
      <tr><th>Errors</th><td>${incorrect}</td></tr>
      <tr><th>Accuracy</th><td>${accuracyPercentage.toFixed(2)}%</td></tr>
      <tr><th>WPM</th><td>${wpm}</td></tr>
    </table>
  </div>`;

  const resultBox = document.getElementById("textBoxC");
  resultBox.innerHTML = comparedText;
  resultBox.classList.remove("hidden");

  // Save to Firestore
  const user = firebase.auth().currentUser;
  if (user) {
    firebase.firestore()
      .collection("users")
      .doc(user.uid)
      .collection("tests")
      .add({
        test: document.getElementById("test-select").value,
        wpm,
        accuracy: accuracyPercentage.toFixed(2),
        errors: errorPercentage.toFixed(2),
        keystrokes: totalChars,
        timestamp: new Date().toISOString()
      })
      .then(() => console.log("Test saved to Firestore"))
      .catch(err => console.error("Firestore save error", err));
  }
}
