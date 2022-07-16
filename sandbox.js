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
