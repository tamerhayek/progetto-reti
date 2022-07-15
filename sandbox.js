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


// GOOGLE CALENDAR

const { google } = require('googleapis');
const { OAuth2 } = google.auth;

var refreshtoken; 
var punteggio = req.cookies('punteggio');

const oAuth2Client = new OAuth2(
  '400602995888-1mahacb0tva92ebq47gpstup807k1p4n.apps.googleusercontent.com',
  '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'
)

oAuth2Client.setCredentials({
  refresh_token: refreshtoken,
});

const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

const eventStartTime = new Date();
eventStartTime.setDate(eventStartTime.getDay());
const eventEndTime = new Date();
eventEndTime.setDate(eventEndTime.getDay());
eventEndTime.setMinutes(eventEndTime.getMinutes()+45);

const event = {
  summary: `Nuova partita`,
  description: `Hai fatto `+ punteggio +` punti a questa partita`,
  colorId: 1,
  start: {
    dateTime: eventStartTime,
    timeZone: 'Europe/Rome',
  },
  end: {
    dateTime: eventEndTime,
    timeZone: 'Europe/Rome',
  },
}

// Check if we a busy and have an event on our calendar for the same time.
calendar.freebusy.query(
  {
    resource: {
      timeMin: eventStartTime,
      timeMax: eventEndTime,
      timeZone: 'Europe/Rome',
      items: [{ id: 'primary' }],
    },
  },
  (err, res) => {
    // Check for errors in our query and log them if they exist.
    if (err) return console.error('Free Busy Query Error: ', err)

    // Create an array of all events on our calendar during that time.
    const eventArr = res.data.calendars.primary.busy;

    // Check if event array is empty which means we are not busy
    if (eventArr.length === 0)
      // If we are not busy create a new calendar event.
      return calendar.events.insert(
        { calendarId: 'primary', resource: event },
        err => {
          // Check for errors and log them if they exist.
          if (err) return console.error('Error Creating Calender Event:', err)
          // Else log that the event was created.
          return console.log('Calendar event successfully created.')
        }
      )

    // If event array is not empty log that we are busy.
    return console.log(`Sorry I'm busy...`);
  }
)
