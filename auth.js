
$(document).ready(function () {


    $('#signin').click(function () {
        console.log("click!");
        navigator.id.get(gotAssertion);
        return false;
    });

});    


function loggedIn(email) {
    setSessions([{
        email: email
    }]);
    var sign = $("#signin");
    sign.text("Signed in as " + email);
    sign.unbind("click");
}


function setSessions(val) {
    if (navigator.id) {
        navigator.id.sessions = val ? val : [];
    }
}

function loggedOut() {
    console.log("logged out");
}

//browserID assertion
function gotAssertion(assertion) {
    // got an assertion, now send it up to the server for verification  
    if (assertion !== null) {
        $.ajax({
            type: 'POST',
            url: 'signin.php',
            data: {
                assertion: assertion
            },
            success: function (res, status, xhr) {
                if (res === null) {
                    loggedOut();
                } else {
                    loggedIn(res);
                }
            },
            error: function (res, status, xhr) {
                alert("login failure" + res);
            }
        });
    } else {
        loggedOut();
    }
}
