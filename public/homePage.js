$(document).ready(function () {
    showhide();

    //When user clicks search
    $("#btnSubmit").click(function () {
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

    $('#search').keypress(function (event) {
        var keycode = (event.keyCode ? event.keyCode : event.which);
        if (keycode == '13') {
            alert('You pressed a "enter" key in textbox, here submit your form');
        }
    });

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
function parseUser(obj) {
    console.log(obj.tweets);
    myObj = JSON.parse(obj);

    txt += "<table border='1'>"
    for (x in myObj) {
        txt += "<tr><td>" + myObj.flagged[x] + "</td></tr>";
    }
    txt += "</table>"
    console.log(txt);
    document.getElementById("demo").innerHTML = txt;
}
