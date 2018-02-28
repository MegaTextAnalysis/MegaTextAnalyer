$(document).ready(function () {
    showhide();


    $("#btnSubmit").click(function () {
        var word = document.getElementById("search");
        var url = "/" + word.value;
        console.log("2");
        $.get(url, function (data) { 
            parseJSON(data);
        });
    });

    $('#search').keypress(function (event) {
        var keycode = (event.keyCode ? event.keyCode : event.which);
        if (keycode == '13') {
            alert('You pressed a "enter" key in textbox, here submit your form');
        }
    });

    $("#s1").click(function () {
        showhide();
    });

});


function showhide() {
    var e = document.getElementById("sel-1");
    var numDiv = document.getElementById("s2");
    var searchType = e.options[e.selectedIndex].text;
    console.log(searchType);
    if (searchType == "Username") {
        numDiv.style.display = "none";
        console.log("hi");
    }
    else {
        numDiv.style.display = "block";
    }
}

function parseJSON(obj)
{
    var file = JSON.parse(obj);
    console.log(file);
}