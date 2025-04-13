// ... all your previous logic and functions remain unchanged ...

function compareParagraphs() {
  // 🟡 Existing comparison logic here...

  // Final computed values:
  var keystrokesCount = document.getElementById('paragraphB').value.length;
  var errorPercentage = paragraphA.length > 0 ? Math.min(100, ((numHalfDiff / 2) + numFullDiff) / paragraphA.length * 100) : 0;
  var accuracyPercentage = Math.max(0, 100 - errorPercentage);

  var endTime = new Date();
  var typingTimeSeconds = startTime ? (endTime - startTime) / 1000 : 60;
  var typingTimeMinutes = typingTimeSeconds / 60;
  var wordsTyped = paragraphB.length;
  var wpm = typingTimeMinutes > 0 ? Math.round(wordsTyped / typingTimeMinutes) : 0;

  // 🟢 Save result to Firestore if login is active
  if (typeof saveTestResultToFirestore === 'function' && window.currentUser) {
    const testName = document.getElementById("test-select").value;
    saveTestResultToFirestore({
      test: "Test " + testName,
      accuracy: accuracyPercentage.toFixed(2),
      errors: errorPercentage.toFixed(2),
      keystrokes: keystrokesCount,
      wpm: wpm,
      timestamp: new Date().toISOString()
    });
  }

  // ✅ Display results as before
  var tableContent = `
    <h2>Analysis:</h2>
    <table>
      <tr>
        <th>Total Words (Original)</th>
        <th>Total Words (Yours)</th>
        <th>Half Mistakes</th>
        <th>Full Mistakes</th>
        <th>Keystrokes</th>
        <th>Typing Speed (WPM)</th>
        <th>Accuracy</th>
        <th>Errors</th>
      </tr>
      <tr>
        <td>${paragraphA.length}</td>
        <td>${paragraphB.length}</td>
        <td>${numHalfDiff}</td>
        <td>${numFullDiff}</td>
        <td>${keystrokesCount}</td>
        <td>${wpm}</td>
        <td>${accuracyPercentage.toFixed(2)}%</td>
        <td>${errorPercentage.toFixed(2)}%</td>
      </tr>
    </table>
  `;

  var aiAnalysis = generateAIAnalysis(paragraphA, paragraphB, numHalfDiff, numFullDiff, wpm, accuracyPercentage);

  document.getElementById('textBoxC').innerHTML = '<h2>Result Sheet:</h2>' +
    comparedText +
    tableContent +
    '<div style="margin-top: 30px; border-top: 2px solid #4361ee; padding-top: 20px;">' +
    '<h2 style="color: #4361ee;">AI-Powered Feedback</h2>' +
    aiAnalysis +
    '</div>';

  document.getElementById('textBoxC').style.display = 'block';
  document.getElementById('textBoxC').style.border = '2px solid green';

  startTime = null;
  clearTimeout(typingTimer);
}

// (keep the rest of your existing utility functions below)
