import logo from "./logo.svg";
import "./App.css";

import { useState, useEffect } from "react";

const sixtySecondsInMilliseconds = 60 * 1000;

function getQuote(lexicons, id) {
  var myQuoteObj = lexicons.find((item) => item.id === id);
  var quote = myQuoteObj.quote;

  console.log("Quote: " + quote);
  return quote;
}

function getAuthor(lexicons, id) {
  var myQuoteObj = lexicons.find((item) => item.id === id);
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
    previous: {
      id: previousId,
      quote: previousQuote,
      author: previousAuthor,
      date: previousDate,
    },
    current: {
      id: currentId,
      quote: currentQuote,
      author: currentAuthor,
      date: currentDate,
    },
    idsUsed: quoteIds,
  };
  return jsonData;
}

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

function App() {
  const [previousQuote, setPreviousQuote] = useState("");
  const [previousAuthor, setPreviousAuthor] = useState("");
  const [currentQuote, setCurrentQuote] = useState("");
  const [currentAuthor, setCurrentAuthor] = useState("");
  const [dateCheckedSecondsAgo, setDateCheckedSecondsAgo] = useState(0);
  const [apiCalledSecondsAgo, setApiCalledSecondsAgo] = useState(0);
  const [dateChecked, setDateChecked] = useState(false);
  const [apiCalled, setApiCalled] = useState(false);

  async function loadStart() {
    getAppropriateQuote();
    startOneHourTimer();
  }

  async function getAppropriateQuote() {
    // GET from API
    let apiData = await getFromAPI();
    let quoteIdsUsed = [];
    let cQuoteDate = "";
    let pId = 0;
    let pQuote = "";
    let pAuthor = "";
    let cQuote = "";
    let cAuthor = "";
    let pDate = "";
    let lexicons = {};

    // Get current date
    let now = getCurrentDate(); // String

    // set date checked seconds ago to zero
    setDateChecked(true);
    setDateCheckedSecondsAgo(0);

    if (apiData !== null) {
      quoteIdsUsed = apiData["idsUsed"];
      cQuoteDate = apiData["current"].date;

      pQuote = apiData["previous"].quote;
      pAuthor = apiData["previous"].author;

      cQuote = apiData["current"].quote;
      cAuthor = apiData["current"].author;

      lexicons = apiData["lexicons"];

      if (cQuoteDate !== now) {
        pQuote = cQuote;
        pAuthor = cAuthor;

        for (var id = 1; id < 366; id++) {
          if (quoteIdsUsed.find((item) => item === id) === undefined) {
            // append any id to this list variable that is NOT found in our list of used Ids
            quoteIdsUsed.push(id);

            cQuote = getQuote(lexicons, id);
            cAuthor = getAuthor(lexicons, id);

            // update call api seconds ago to zero
            setApiCalled(true);
            setApiCalledSecondsAgo(0);

            if (cQuote !== "") {
              // build object
              var data = buildJSONObject(
                pId,
                pQuote,
                pAuthor,
                pDate,
                id,
                cQuote,
                cAuthor,
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
      // update state
      setPreviousQuote(pQuote);
      setPreviousAuthor(pAuthor);
      setCurrentQuote(cQuote);
      setCurrentAuthor(cAuthor);
    }
  }

  function startOneHourTimer() {
    setTimeout(() => {
      getAppropriateQuote();

      // call this function within itself again. So we have a recurring function
      startOneHourTimer();
    }, sixtySecondsInMilliseconds * 60); // we call once per hour now
  }

  // timer function
  useEffect(() => {
    const interval = setInterval(() => {
      if (!dateChecked || dateCheckedSecondsAgo === 0) {
        setDateCheckedSecondsAgo(dateCheckedSecondsAgo + 1);
        setDateChecked(false);
      }
      if (!apiCalled || apiCalledSecondsAgo === 0) {
        setApiCalledSecondsAgo(apiCalledSecondsAgo + 1);
        setApiCalled(false);
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  });

  return (
    <div className="App" onLoad={loadStart}>
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />

        <h1 className="title">Motivational Quotes</h1>

        <h1>Today's Quote:</h1>
        <p className="quote">"{currentQuote}"</p>
        <p className="author">{currentAuthor}</p>

        <br />

        <h1>Yesterday's Quote:</h1>
        <p className="quote">"{previousQuote}"</p>
        <p className="author">{previousAuthor}</p>

        <br />

        <p className="tiny">
          Checked current date{" "}
          {(Math.round((dateCheckedSecondsAgo / 60) * 100) / 100).toFixed(0)}{" "}
          minutes ago
        </p>
        <p className="tiny">
          Called API{" "}
          {(Math.round((apiCalledSecondsAgo / 60) * 100) / 100).toFixed(0)}{" "}
          minutes ago
        </p>

        <p className="tiny">
          React Web Application by{" "}
          <em className="developer-name">Joshua van Niekerk</em>
        </p>
      </header>
    </div>
  );
}

export default App;
