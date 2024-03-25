import logo from "./logo.svg";
import "./App.css";
import fileQuotes from "./quotes.json";
import fileQuoteRecord from "./tracking-used-quotes.json";

// TODO: switch to 60 seconds
// const sixtySecondsInMilliseconds = 60 * 1000;
const twoSecondsInMilliseconds = 2 * 1000;

// TODO: export functions to make things cleaner

// WORKS
function getQuote(id) {
  var allQuotes = fileQuotes["quotes"];
  var myQuoteObj = allQuotes.find((item) => item.id === id);
  var quote = myQuoteObj.description;

  console.log("Quote: " + quote);
  return quote;
}

// WORKS
function getAuthor(id) {
  var allQuotes = fileQuotes["quotes"];
  var myQuoteObj = allQuotes.find((item) => item.id === id);
  var author = myQuoteObj.author;

  console.log("Author: " + author);
  return author;
}

function getCurrentDate() {
  const dateObj = new Date();
  const month = dateObj.getUTCMonth() + 1; // months from 1-12
  const day = dateObj.getUTCDate();
  const year = dateObj.getUTCFullYear();

  return `${day}/${month}/${year}`;
}

function buildJSONObject(
  previousId,
  previousDate,
  currentId,
  currentDate,
  quoteIds
) {
  let jsonData = {
    previousQuote: {
      id: previousId,
      date: previousDate,
    },
    currentQuote: {
      id: currentId,
      date: currentDate,
    },
    quoteIdsUsed: {
      ids: quoteIds,
    },
  };
  return jsonData;
}

// NOT FINISHED
function getAppropriateQuote() {
  // This function should get ONE quote with its author, but NEVER get a blank quote and NEVER get a repeat quote until all quotes have been used

  // Get current date
  let now = getCurrentDate(); // String
  let quoteIdsUsed = fileQuoteRecord["quoteIdsUsed"].ids;

  if (fileQuoteRecord["currentQuote"].date !== now) {
    for (var id = 1; id < 366; id++) {
      if (quoteIdsUsed.find((item) => item === id) === undefined) {
        // append any id to this list variable that is NOT found in our list of used Ids
        quoteIdsUsed.push(id);

        let quote = getQuote(id);
        let author = getAuthor(id);

        if (quote !== "") {
          let previousId = fileQuoteRecord["currentQuote"].id;
          let previousDate = fileQuoteRecord["currentQuote"].date;

          // build object
          var data = buildJSONObject(
            previousId,
            previousDate,
            id,
            now,
            quoteIdsUsed
          );

          // TODO: POST quote and author to API
          // TODO: Also, POST data object to the same API, since we cannot writeToFile from the browser
          break;
        }
      }
    }
  }
}

// WORKS
function startOneMinuteTimer() {
  setTimeout(() => {
    getAppropriateQuote();

    // call this function within itself again. So we have a recurring function
    startOneMinuteTimer();
  }, twoSecondsInMilliseconds);
}

function App() {
  return (
    <div className="App" onLoad={startOneMinuteTimer}>
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
