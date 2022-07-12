function playAudio(id){
    var allAudio = document.getElementsByClassName("audio");
    for(var i=0; i<2; i++){
      allAudio[i].pause()
    }
    let audio = document.getElementById(id)
    audio.play()
}