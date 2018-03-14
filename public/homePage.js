$(document).ready(function () {
    showhide();
    document.getElementById("userResults").style.display = 'none';

    //When user clicks search
    $("#btnSubmit").click(function () {
        var word = document.getElementById("search");
        if (usernameSet()) {
            var url = "/user/" + word.value;
            $.get(url, function (data) {
                var obj = data;
                parseUser(obj, word.value);
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

//returns if selector is set to username
function usernameSet() {
    var e = document.getElementById("sel-1");
    var searchType = e.options[e.selectedIndex].text;
    if (searchType == "Username") {
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
    console.log(obj.flagged)
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
        for (x in obj.flagged) {
            txt += "<tr>" +
                "<th scope='row'>" + row + "</th>" +
                "<td>" + obj.flagged[x].text + "</td>" +
                "</tr>"
            row++;
        }
    }
    else
    {
         txt += "<tr>" +
                "<th scope='row'></th>" +
                "<td>No tweets on this users profile have been flagged</td>" +
                "</tr>"
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

    

}

function backToHomepage() {
    document.getElementById("userResults").style.display = 'none';
    document.getElementById("m1").style.display = 'block';
    document.getElementById("sb").style.display = 'block';
}

function parseKeyword(obj)
{
    document.getElementById("m1").style.display = 'none';
    document.getElementById("sb").style.display = 'none';

    //construct results table
    var txt = "";
    console.log(obj);
    var row = 1;

    if (obj.flagged.length !== 0) {
        for (x in obj.flagged) {
            txt += "<tr>" +
                "<th scope='row'>" + row + "</th>" +
                "<td>" + obj.flagged[x].text + "</td>" +
                "</tr>"
            row++;
        }
    }
    else
    {
         txt += "<tr>" +
                "<th scope='row'></th>" +
                "<td>No tweets on this users profile have been flagged</td>" +
                "</tr>"
    }

    //popuulate table and display
    document.getElementById("body").innerHTML = txt;
    document.getElementById("keyResults").style.display = 'block';

}