import logo from "./logo.svg";
import "./App.css";
import fileQuotes from "./quotes.json";

const sixtySecondsInMilliseconds = 60 * 1000;

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

// WORKS
function getCurrentDate() {
  const dateObj = new Date();
  const month = dateObj.getUTCMonth() + 1; // months from 1-12
  const day = dateObj.getUTCDate();
  const year = dateObj.getUTCFullYear();

  return `${day}/${month}/${year}`;
}

// WORKS
function buildJSONObject(
  previousId,
  previousQuote,
  previousAuthor,
  previousDate,
  currentId,
  currentQuote,
  currentAuthor,
  currentDate,
  quoteIds
) {
  let jsonData = {
    previousQuote: {
      id: previousId,
      quote: previousQuote,
      author: previousAuthor,
      date: previousDate,
    },
    currentQuote: {
      id: currentId,
      quote: currentQuote,
      author: currentAuthor,
      date: currentDate,
    },
    quoteIdsUsed: {
      ids: quoteIds,
    },
  };
  return jsonData;
}

// WORKS
async function getFromAPI() {
  // TODO: test with goalSymmetry API OR use this project and this API url in Goal Symmetry project
  const response = await fetch(
    "https://test-project-gs-db-changes-default-rtdb.firebaseio.com/all.json",
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  let respData = await response.json();
  return respData;
}

// WORKS
async function postToAPI(data) {
  // TODO: test with goalSymmetry API OR use this project and this API url in Goal Symmetry project
  const response = await fetch(
    "https://test-project-gs-db-changes-default-rtdb.firebaseio.com/all.json",
    {
      method: "PUT",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  const responseData = response.json();

  if (!response.ok) {
    throw new Error("Failed to Update data");
  }

  return responseData;
}

// WORKS
async function getAppropriateQuote() {
  // GET from API
  let apiData = await getFromAPI();
  let quoteIdsUsed = [];
  let currentQuoteDate = "";
  let previousId = 0;
  let previouQuote = "";
  let previousAuthor = "";
  let currentQuote = "";
  let currentAuthor = "";
  let previousDate = "";

  // Get current date
  let now = getCurrentDate(); // String

  if (apiData !== null) {
    quoteIdsUsed = apiData["quoteIdsUsed"].ids;
    currentQuoteDate = apiData["currentQuote"].date;
    previousId = apiData["currentQuote"].id;
    previouQuote = apiData["currentQuote"].quote;
    previousAuthor = apiData["currentQuote"].author;
    previousDate = apiData["currentQuote"].date;
  }

  if (currentQuoteDate !== now) {
    for (var id = 1; id < 366; id++) {
      if (quoteIdsUsed.find((item) => item === id) === undefined) {
        // append any id to this list variable that is NOT found in our list of used Ids
        quoteIdsUsed.push(id);

        currentQuote = getQuote(id);
        currentAuthor = getAuthor(id);

        if (currentQuote !== "") {
          // build object
          var data = buildJSONObject(
            previousId,
            previouQuote,
            previousAuthor,
            previousDate,
            id,
            currentQuote,
            currentAuthor,
            now,
            quoteIdsUsed
          );

          // POST quote and author data to API
          postToAPI(data);
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
  }, sixtySecondsInMilliseconds);
}

// TODO: create a semi-passable GUI for this project
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
