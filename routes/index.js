var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {

  var text = {
      pageTitle: 'Cronometrei',
      titleSep: ' - ',
      homeTitleFull: 'O tempo sob controle',
      startButton: 'Iniciar',
      pauseButton: 'Pausar',
      continueButton: 'Continuar',
      clearButton: 'Limpar',
      lapButton: 'Volta',
      startInstruction: 'Barra de Espaço',
      clearInstruction: 'Esc',
      clearMessage: 'Deseja mesmo zerar seu cronometro?'
  };

  res.render('index', { title: 'Cronometrei', text: text });
});

module.exports = router;
