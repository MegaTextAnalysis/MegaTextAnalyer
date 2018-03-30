$(document).ready(function() {
  showhide();

  //personality analysis navigation
  document.getElementById("personality-but").style.display = "none";
  document.getElementById("personRes").style.display = "none";
  document.getElementById("personality-back").style.display = "none";

  //keyword navigation
  document.getElementById("key-back-but").style.display = "none";
  document.getElementById("key-stat-but").style.display = "none";

  //username navigation
  document.getElementById("back-but").style.display = "none";

  //search input
  var input = document.getElementById("search");
  //When user hits enter
  input.addEventListener("keyup", function(event) {
    event.preventDefault();
    if (event.keyCode === 13) {
      buttonClick();
    }
  });

  //When user clicks search
  $("#btnSubmit").click(function() {
    buttonClick();
  });

  //checking what type of search is set
  function buttonClick() {
    var word = document.getElementById("search");
    if (usernameSet()) {
      getUser(word, true);
    } else {
      getKeyword(word);
    }
  }

  //only display number of results selector when the user is searching for keywords
  $("#s1").click(function() {
    showhide();
  });
});

//get request for user
function getUser(word, isFromUsername) {
  var url = "/user/";

  if (isFromUsername) {
    url += word.value;
  } else {
    url += word;
  }

  $.get(url, function(data) {
    var obj = data;
    genPerson(obj);
    if (isFromUsername) {
      parseUser(obj, word.value);
    } else {
      parseUser(obj, word);
      document.getElementById("back-but").style.display = "block";
    }
  });
}

//get request for keyword
function getKeyword(word) {
  var url = "/search/" + word.value;
  $.get(url, function(data) {
    var obj = data;
    drawChart(obj);
    parseKeyword(obj);
  });
}

//returns if selector is set to username
function usernameSet() {
  var e = document.getElementById("sel-1");
  var searchType = e.options[e.selectedIndex].text;
  if (searchType === "Username") {
    return true;
  } else {
    return false;
  }
}

//toggles the number of results selector
function showhide() {
  var numDiv = document.getElementById("s2");
  if (usernameSet()) {
    numDiv.style.display = "none";
    console.log("hi");
  } else {
    numDiv.style.display = "block";
  }
}

//parse the incoming Juser SON
function parseUser(obj, username) {

  document.getElementById("m1").style.display = 'none';
  document.getElementById("sb").style.display = 'none';
  document.getElementById("key-back-but").style.display = 'none';
  document.getElementById("key-stat-but").style.display = 'none';
  document.getElementById("stats").style.display = 'none';

  //construct results table
  var txt = "";
  console.log(obj);
  var row = 1;

  if (obj.flagged.length !== 0) {
    for (let x in obj.flagged) {
      txt +=
        "<tr>" +
        "<th scope='row'>" +
        row +
        "</th>" +
        "<td>" +
        obj.flagged[x].text +
        "</td>" +
        "</tr>";
      row++;
    }
  } else {
    txt +=
      "<tr>" +
      "<th scope='row'></th>" +
      "<td>No tweets on this users profile have been flagged</td>" +
      "</tr>";
  }

  //popuulate table and display
  document.getElementById("body").innerHTML = txt;
  document.getElementById("userResults").style.display = "block";

  console.log(txt);
  //set threat meter
  document.getElementById("threat").style.width = obj.totalRisk + "%";
  document.getElementById("threat").innerHTML = obj.totalRisk;

  //set image
  document.getElementById("img1").src =
    "https://twitter.com/" + username + "/profile_image?size=original";

  //set link to profile
  document.getElementById("link").href =
    "https://twitter.com/" + username + "?lang=en";
  document.getElementById("username").innerText = "Username: " + username;

  //display buttons
  document.getElementById("back-but").style.display = "block";
  document.getElementById("personality-but").style.display = "block";
}

//back to homapage
function backToHomepage() {
  document.getElementById("personality-but").style.display = "none";
  document.getElementById("userResults").style.display = "none";
  document.getElementById("keyResults").style.display = "none";
  document.getElementById("m1").style.display = "block";
  document.getElementById("sb").style.display = "block";
  document.getElementById("back-but").style.display = "none";
  document.getElementById("key-stat-but").style.display = "none";
  var ul1 = document.getElementById("ul1");
  document.getElementById("personality").removeChild(ul1);
  var ul2 = document.getElementById("ul2");
  document.getElementById("needs").removeChild(ul2);
  var ul3 = document.getElementById("ul3");
  document.getElementById("values").removeChild(ul3);
  var ul4 = document.getElementById("ul4");
  document.getElementById("consumption_preferences").removeChild(ul4);
}

//back to keywords
function backToKeywords() {
  document.getElementById("keyResults").style.display = "block";
  document.getElementById("stats").style.display = "none";
}

//parse incoming keywords JSON
function parseKeyword(obj) {
  document.getElementById("m1").style.display = "none";
  document.getElementById("sb").style.display = "none";

  //construct results table
  var txt = "";
  console.log(obj);
  var row = 1;
  var n = document.getElementById("sel-2");
  var numResults = n.options[n.selectedIndex].text;

  if (obj.tweets.statuses.length !== 0) {
    for (let x in obj.tweets.statuses) {
      if (row > numResults) {
        break;
      }
      let t = '"' + "t" + row + '"';
      txt +=
        "<tr>" +
        "<th scope='row'>" +
        row +
        "</th>" +
        "<td id = 't" +
        row +
        "'>" +
        "<a onclick='getUser(document.getElementById(" +
        t +
        ").innerText, false)'>" +
        obj.tweets.statuses[row - 1].user.screen_name +
        "</a></td>" +
        "<td>" +
        obj.tweets.statuses[x].text +
        "</td>" +
        "</tr>";
      row++;
    }
  } else {
    txt +=
      "<tr>" +
      "<th scope='row'></th>" +
      "<td></td>" +
      "<td>No tweets on this users profile have been flagged</td>" +
      "</tr>";
  }

  //popuulate table and display
  document.getElementById("kbody").innerHTML = txt;
  document.getElementById("keyResults").style.display = "block";

  //display back button
  document.getElementById("key-back-but").style.display = "block";
  document.getElementById("key-stat-but").style.display = "block";
}

//displaykeywords stats when button pressed
function drawShortStats() {
  document.getElementById("stats").style.display = "block";
  document.getElementById("keyResults").style.display = "none";
}

//GOOGLE CHARTS
google.charts.load("current", { packages: ["corechart"] });
google.charts.load("current", { packages: ["treemap"] });

//draw charts
function drawChart(obj) {
  //draw piechart
  var flagged = obj.flagged.length;
  var nonFlagged = obj.tweets.statuses.length;
  var data = google.visualization.arrayToDataTable([
    ["Tweets", "Number of tweets"],
    ["Non-flagged", nonFlagged],
    ["Flagged", flagged]
  ]);

  // display options of piechart
  var options = {
    title: "Flagged Vs Non-Flagged tweets",
    backgroundColor: "#b3b3b3",
    width: 400,
    height: 400,
    fontColor: "black",
    colors: ["#b185e0", "#f2ebfa"]
  };

  var chart = new google.visualization.PieChart(
    document.getElementById("piechart")
  );
  chart.draw(data, options);

  //draw treemap
  var flags = [];
  flags[0] = ["Flag", "Parent", "Threat level", "(color)"];
  flags[1] = ["Flags", null, 0, 0];
  var flagsEntry;
  var count = 2;
  for (let x in obj.flagged) {
    var flag = obj.flagged[count - 2].flags[0];
    var threat = obj.flagged[count - 2].threatLevel;
    threat = threat + Math.floor(Math.random() * 10 + 1);
    flagsEntry = [count - 1 + ". " + flag, "Flags", threat, threat];
    flags[count] = flagsEntry;
    count++;
  }

  if (obj.flagged.length !== 0) {
    var data = google.visualization.arrayToDataTable(flags);
    tree = new google.visualization.TreeMap(
      document.getElementById("treechart")
    );

    //display options for keywords
    var optionsTree = {
      minColor: "#42413b",
      midColor: "#6c6c6c",
      maxColor: "#B3B3B3",
      headerHeight: 15,
      fontColor: "black",
      showScale: false,
      width: 600,
      height: 400
    };
    tree.draw(data, optionsTree);
  } else {
    document.getElementById("treechart").innerHTML = "";
  }
}

//show personailty analysis when button pressed
function showPersonality() {
  document.getElementById("userResults").style.display = "none";
  document.getElementById("back-but").style.display = "none";
  document.getElementById("key-stat-but").style.display = "none";
  document.getElementById("personality-but").style.display = "none";
  document.getElementById("personRes").style.display = "block";
  document.getElementById("personality-back").style.display = "block";
}

//return from personailty page
function personalityBack() {
  document.getElementById("userResults").style.display = "block";
  document.getElementById("back-but").style.display = "block";
  document.getElementById("personality-but").style.display = "block";
  document.getElementById("personRes").style.display = "none";
  document.getElementById("personality-back").style.display = "none";
}

// generate personality results
function genPerson(json) {
  if (document.getElementById("personality").childElementCount === 1) {
    let ul1 = document.createElement("ul");
    ul1.setAttribute("id", "ul1");
    for (let x in json.watsonAnalysis.personality) {
      let li = document.createElement("li");

      ul1.appendChild(li);
      let y = Math.round(
        json.watsonAnalysis.personality[x].raw_score * 100 / 1
      );
      li.innerHTML =
        li.innerHTML + json.watsonAnalysis.personality[x].name + ": " + y + "%";
    }
    document.getElementById("personality").appendChild(ul1);
  }

  if (document.getElementById("needs").childElementCount === 1) {
    let ul2 = document.createElement("ul");
    ul2.setAttribute("id", "ul2");
    for (let x in json.watsonAnalysis.needs) {
      let li = document.createElement("li");

      ul2.appendChild(li);
      let y = Math.round(json.watsonAnalysis.needs[x].raw_score * 100 / 1);
      li.innerHTML =
        li.innerHTML + json.watsonAnalysis.needs[x].name + ": " + y + "%";
    }
    document.getElementById("needs").appendChild(ul2);
  }

  if (document.getElementById("values").childElementCount === 1) {
    let ul3 = document.createElement("ul");
    ul3.setAttribute("id", "ul3");
    for (let x in json.watsonAnalysis.values) {
      let li = document.createElement("li");

      ul3.appendChild(li);
      let y = Math.round(json.watsonAnalysis.values[x].raw_score * 100 / 1);
      li.innerHTML =
        li.innerHTML + json.watsonAnalysis.values[x].name + ": " + y + "%";
    }
    document.getElementById("values").appendChild(ul3);
  }

  if (
    document.getElementById("consumption_preferences").childElementCount === 1
  ) {
    let ul4 = document.createElement("ul");
    ul4.setAttribute("id", "ul4");
    for (let x in json.watsonAnalysis.consumption_preferences) {
      for (let y in json.watsonAnalysis.consumption_preferences[x]
        .consumption_preferences) {
        let li = document.createElement("li");
        if (
          json.watsonAnalysis.consumption_preferences[x]
            .consumption_preferences[y].score === 1
        ) {
          ul4.appendChild(li);
          li.innerHTML =
            li.innerHTML +
            json.watsonAnalysis.consumption_preferences[x]
              .consumption_preferences[y].name;
        }
      }
    }
    document.getElementById("consumption_preferences").appendChild(ul4);
  }
}
