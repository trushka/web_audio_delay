let heading = document.querySelector('h1');
heading.textContent = 'Click para iniciar el micrófono'
document.body.addEventListener('click', init);


function init() {
  heading.textContent = 'Micrófono Activo';
  document.body.removeEventListener('click', init)

  //Los navegadores antiguos no tienen implementación de mediaDevices, así que asignamos los objetos vacios
  if (navigator.mediaDevices === undefined) {
    navigator.mediaDevices = {};
  }
  // Algunos navegadores lo implementan a media. Se define el getUserMedia por si no está definido.
  if (navigator.mediaDevices.getUserMedia === undefined) {
    navigator.mediaDevices.getUserMedia = function(constraints) {

      // Primero se elige entre el GetUserMedia dependiendo del navegador.
      var getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
      // Algunos navegadores simplemente no lo implementan - 
      // Se devuelve una promesa de rechazo para mantener una interfaz consistente.
      if (!getUserMedia) {
        return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
      }
      return new Promise(function(resolve, reject) {
        getUserMedia.call(navigator, constraints, resolve, reject);
      });
    }
  }
  // Se instancia el AudioContext y las variables principales

  var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  var source;
  var stream;

  // Elementos interactivos del HTML

  var mute = document.querySelector('.mute');
  let volumeControl = document.querySelector('[data-action="volume"]');
  let delayControl = document.querySelector('[data-action="delay"]');
  let delayFeedback = document.querySelector('[data-action="delay_feedback"]');


  
    
  

  //Se definen los nodos que se van a utilizar en el AudioContext
  var gainNode = audioCtx.createGain();
  var delayNode = audioCtx.createDelay();
  var delayFeedbackNode = audioCtx.createGain();

  gainNode.gain.value = 0;
  delayFeedbackNode.gain.value = 0;
  delayNode.delayTime.value = 0;





  //Bloque para capturar entrada del micrófono y ruta de conexiones

  if (navigator.mediaDevices.getUserMedia) {
     console.log('getUserMedia supported.');
     var constraints = {audio: true}
     navigator.mediaDevices.getUserMedia (constraints)
        .then(
          function(stream) {
             source = audioCtx.createMediaStreamSource(stream);//Routing de nodos
             source.connect(gainNode);
             source.connect(delayNode);
             delayNode.connect(delayFeedbackNode);
             delayFeedbackNode.connect(delayNode);
             delayNode.connect(gainNode);
             gainNode.connect(audioCtx.destination);
        })
        .catch( function(err) { console.log('The following gUM error occured: ' + err);})
  } else {
     console.log('getUserMedia not supported on your browser!');
  }

 
  // Función de elementos interáctivos
  mute.onclick = voiceMute;
  volumeControl.addEventListener('input', function() {
  gainNode.gain.value = this.value;
  }, false);
  delayControl.addEventListener('input', function(){
    delayNode.delayTime.value = this.value;
    }, false);
  delayFeedback.addEventListener('input', function(){
    delayFeedbackNode.gain.value = this.value;
    }, false);


  function voiceMute() {
    if(mute.id === "") {
      gainNode.gain.value = 0;
      mute.id = "activated";
      mute.innerHTML = "Unmute";
    } else {
      gainNode.gain.value = 0.5;
      mute.id = "";
      mute.innerHTML = "Mute";
    }
  }
}
