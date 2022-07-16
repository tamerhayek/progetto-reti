require('dotenv').config();

// GOOGLE CALENDAR
function newEvent(refreshtoken, eventStartTime, eventEndTime, title, description){
 const { google } = require('googleapis');
 const { OAuth2 } = google.auth;
 
 const oAuth2Client = new OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
 )
 
 oAuth2Client.setCredentials({
   refresh_token: refreshtoken,
 });
 
 const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });
 
 /*const eventStartTime = new Date();
 eventStartTime.setDate(eventStartTime.getDate());
 const eventEndTime = new Date();
 eventEndTime.setDate(eventEndTime.getDate());
 eventEndTime.setMinutes(eventEndTime.getMinutes()+10);*/
 
 const event = {
   summary: title,
   description: description,
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
}

module.exports = {newEvent};
