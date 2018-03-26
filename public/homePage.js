
$(document).ready(function () {
  showhide();

  //keyword navigation
  document.getElementById("key-back-but").style.display = 'none';
  document.getElementById("key-stat-but").style.display = 'none';

  //username navigation
  document.getElementById("stat-but").style.display = 'none';
  document.getElementById("back-but").style.display = 'none';



  //When user clicks search
  $("#btnSubmit").click(function () {
    var word = document.getElementById("search");
    if (usernameSet()) {
      getUser(word, true);
    } else {
      getKeyword(word);
    }
  });


  /*
  $('#search').keypress(function (event) {
      var word = document.getElementById("search");
      if (usernameSet()) {
          var url = "/user/" + word.value;
          $.get(url, function (data) {
              var obj = data;
              parseUser(obj);
          });
      }
      else {
          var url = "/search/" + word.value;
          $.get(url, function (data) {
              var obj = data;
              parseKeyword(obj);
          });
      }
  });
  */

  //only display number of results selector when the user is searching for keywords
  $("#s1").click(function () {
    showhide();
  });

});

function getUser(word, isFromUsername) {
  var url = "/user/";

  if (isFromUsername) {
    url += word.value;
  } else {
    url += word;
  }

  $.get(url, function (data) {
    var obj = data;
    if (isFromUsername) {
      parseUser(obj, word.value);
      drawChart(obj);
    } else {
      parseUser(obj, word);
      document.getElementById("stat-but").style.display = 'none';
      document.getElementById("back-but").style.display = 'none';

    }
  });
}

function getKeyword(word) {
  var url = "/search/" + word.value;
  $.get(url, function (data) {
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

//parse the incoming JSON
function parseJSON(obj) {
  console.log(obj.flagged);
}

//parse the incoming JSON
function parseUser(obj, username) {
  document.getElementById("m1").style.display = 'none';
  document.getElementById("sb").style.display = 'none';

  //construct results table
  var txt = "";
  console.log(obj);
  var row = 1;

  if (obj.flagged.length !== 0) {
    for (let x in obj.flagged) {
      txt += "<tr>" +
        "<th scope='row'>" + row + "</th>" +
        "<td>" + obj.flagged[x].text + "</td>" +
        "</tr>";
      row++;
    }
  } else {
    txt += "<tr>" +
      "<th scope='row'></th>" +
      "<td>No tweets on this users profile have been flagged</td>" +
      "</tr>";
  }

  //popuulate table and display
  document.getElementById("body").innerHTML = txt;
  document.getElementById("userResults").style.display = 'block';

  console.log(txt);
  //set threat meter
  document.getElementById("threat").style.width = obj.totalRisk + "%";
  document.getElementById("threat").innerHTML = obj.totalRisk;

  //set image
  document.getElementById("img1").src = "https://twitter.com/" + username + "/profile_image?size=original";

  //set link to profile
  document.getElementById("link").href = "https://twitter.com/" + username + "?lang=en";
  document.getElementById("username").innerText = "Username: " + username;
  //display back-but
  document.getElementById("back-but").style.display = 'block';
  document.getElementById("stat-but").style.display = 'none';
}

function backToHomepage() {
  document.getElementById("userResults").style.display = 'none';
  document.getElementById("keyResults").style.display = 'none';
  document.getElementById("m1").style.display = 'block';
  document.getElementById("sb").style.display = 'block';
  document.getElementById("back-but").style.display = 'none';
  document.getElementById("stat-but").style.display = 'none';
  document.getElementById("key-stat-but").style.display = 'none';

}

function backToKeywords() {
  document.getElementById("keyResults").style.display = 'block';
  document.getElementById("stats").style.display = 'none';
}

function parseKeyword(obj) {
  document.getElementById("m1").style.display = 'none';
  document.getElementById("sb").style.display = 'none';

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
      let t = "\"" + "t" + row + "\"";
      txt += "<tr>" +
        "<th scope='row'>" + row + "</th>" +
        "<td id = 't" + row + "'>" + "<a onclick='getUser(document.getElementById(" + t + ").innerText, false)'>" + obj.tweets.statuses[row - 1].user.screen_name + "</a></td>" +
        "<td>" + obj.tweets.statuses[x].text + "<br>" + + "</td>" +
        "</tr>";
      row++;
    }
  } else {
    txt += "<tr>" +
      "<th scope='row'></th>" +
      "<td></td>" +
      "<td>No tweets on this users profile have been flagged</td>" +
      "</tr>";
  }

  //popuulate table and display
  document.getElementById("kbody").innerHTML = txt;
  document.getElementById("keyResults").style.display = 'block';

  //display back button
  document.getElementById("key-back-but").style.display = 'block';
  document.getElementById("key-stat-but").style.display = 'block';
}

function drawShortStats() {
  document.getElementById("stats").style.display = 'block';

  document.getElementById("keyResults").style.display = 'none';
}

google.charts.load("current", { packages: ["corechart"] });
google.charts.load('current', { 'packages': ['treemap'] });

function drawChart(obj) {

  //draw piechart
  var flagged = obj.flagged.length;
  var nonFlagged = obj.tweets.statuses.length;
  var data = google.visualization.arrayToDataTable([
    ['Tweets', 'Number of tweets'],
    ['Non-flagged', nonFlagged],
    ['Flagged', flagged]
  ]);

  var options = {
    title: 'Flagged Vs Non-Flagged tweets',
    backgroundColor: '#b3b3b3',
    width: 400,
    height: 400,
    colors: ['#b185e0', '#f2ebfa']
  };

  var chart = new google.visualization.PieChart(document.getElementById('piechart'));
  chart.draw(data, options);

  //draw treemap
  var flags = [];
  flags[0] = ['Flag', 'Parent', 'Threat level', '(color)'];
  flags[1] = ['Flags', null, 0, 0];
  var flagsEntry;
  var count = 2;
  for (let x in obj.flagged) {
    var flag = obj.flagged[count - 2].flags[0];
    var threat = obj.flagged[count - 2].threatLevel;
    flagsEntry = [flag, "Flags", threat, 50 - threat];
    flags[count] = flagsEntry;
  }

  var data = google.visualization.arrayToDataTable(flags);
  tree = new google.visualization.TreeMap(document.getElementById('treechart'));

  var optionsTree = {
    minColor: '#FFF',
    midColor: '#ddd',
    maxColor: '#0d0',
    headerHeight: 15,
    fontColor: 'black',
    showScale: true
  };

  tree.draw(data, optionsTree);
}


