const request = require('request');

const optionsVOICE = {
  method: 'POST',
  url: 'https://voicerss-text-to-speech.p.rapidapi.com/',
  qs: {key: 'b71e9afdbb5b479fa192c92dd8fd9e9f'},
  headers: {
    'content-type': 'application/x-www-form-urlencoded',
    'X-RapidAPI-Key': '3a280afaa7mshbfb05807eb47cb9p1f0696jsnadcd57690913',
    'X-RapidAPI-Host': 'voicerss-text-to-speech.p.rapidapi.com',
    useQueryString: true
  },
  form: {f: '8khz_8bit_mono', c: 'mp3', r: '0', hl: 'it-it', src: 'Ciao mondo'}
};

request(optionsVOICE, function (error, response, body) {
	if (error) throw new Error(error);

	console.log(body);
});
