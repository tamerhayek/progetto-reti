function validaForm() {
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;

    let smalls = document.getElementsByTagName("small");
    for (let element of smalls) {
        element.innerHTML = "";
        element.style.visibility = "hidden";
    }

    if (username == "") {
        document.getElementById("smallUsername").innerHTML = "Questo campo non può essere vuoto!";
        document.getElementById("smallUsername").style.visibility = "visible";
        return false;
    } else if (password == "") {
        document.getElementById("smallPassword").innerHTML = "Questo campo non può essere vuoto!";
        document.getElementById("smallPassword").style.visibility = "visible";
        return false;
    } else {
        return true;
    }
}