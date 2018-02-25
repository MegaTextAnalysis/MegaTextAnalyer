$(document).ready(function () {
    showhide();


    $("#btnSubmit").click(function () {
    var word = document.getElementById("search");
    var url = "radical.nguyenhi.eu/" + word.value;
    console.log("2");
    $.get(url, function (data) {console.log(33)});
});

});


$('#another-location').keypress(function (event) {
    var keycode = (event.keyCode ? event.keyCode : event.which);
    if (keycode == '13') {
        alert('You pressed a "enter" key in textbox, here submit your form');
    }
});

$("#s1").click(function () {
    showhide();
});

function showhide() {
    var e = document.getElementById("sel-1");
    var numDiv = document.getElementById("s2");
    var  searchType = e.options[e.selectedIndex].text;
    console.log(searchType);
    if (searchType == "Username") {
        numDiv.style.display = "none";
        console.log("hi");
    }
    else {
        numDiv.style.display = "block";
    }
}