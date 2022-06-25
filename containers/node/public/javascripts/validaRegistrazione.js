function validaForm() {
    let nome = document.getElementById("nome").value;
    let cognome = document.getElementById("cognome").value;
    let username = document.getElementById("username").value;
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;
    let confermaPassword = document.getElementById("confermaPassword").value;

    let smalls = document.getElementsByTagName("small");
    for (let element of smalls) {
        element.innerHTML = "";
        element.style.visibility = "hidden";
    }
    

    if (nome == "") {
        document.getElementById("smallNome").innerHTML = "Questo campo non può essere vuoto!";
        document.getElementById("smallNome").style.visibility = "visible";
        return false;
    } else if (cognome == "") {
        document.getElementById("smallCognome").innerHTML = "Questo campo non può essere vuoto!";
        document.getElementById("smallCognome").style.visibility = "visible";
        return false;
    } else if (username == "") {
        document.getElementById("smallUsername").innerHTML = "Questo campo non può essere vuoto!";
        document.getElementById("smallUsername").style.visibility = "visible";
        return false;
    } else if (email == "") {
        document.getElementById("smallEmail").innerHTML = "Questo campo non può essere vuoto!";
        document.getElementById("smallEmail").style.visibility = "visible";
        return false;
    } else if (password == "") {
        document.getElementById("smallPassword").innerHTML = "Questo campo non può essere vuoto!";
        document.getElementById("smallPassword").style.visibility = "visible";
        return false;
    } else if (confermaPassword == "" || confermaPassword != password) {
        document.getElementById("smallConfermaPassword").innerHTML = "Non coincide con la password inserita!";
        document.getElementById("smallConfermaPassword").style.visibility = "visible";
        return false;
    }
    return true;
}