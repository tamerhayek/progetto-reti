'use strict';

const amqplib = require('amqplib/callback_api');
const nodemailer = require('nodemailer');

const transport = nodemailer.createTransport({
	service: 'gmail',
	auth: {
	    user: 'triviastack@gmail.com',
	    pass: 'oceq atgs lajc hmfp'
	}
});

transport.verify((error, success) => {
	if (error) {
    		console.error(error);
    	} 
    	else {
    		console.log('Nodemailer pronto ad inviare email!');
	}
})

amqplib.connect('amqp://guest:guest@rabbitmq', (err, connection) => {
    if (err) {
        console.error(err.stack);
        return process.exit(1);
    }
    connection.createChannel((err, channel) => {
        if (err) {
            console.error(err.stack);
            return process.exit(1);
        }
        
        var queue = 'queue';

        channel.assertQueue(queue, {
            durable: true
        }, err => {
            if (err) {
                console.error(err.stack);
                return process.exit(1);
            }

            channel.prefetch(1);

            channel.consume(queue, data => {
                if (data === null) {
                    return;
                }

                let message = JSON.parse(data.content.toString());
                
                let email = message.email;
                let username = message.username;
                
                var mailOptions = {
                	from: 'triviastack@gmail.com',
                	to: email,
                    subject: "Conferma avvenuta registrazione",
                	text: 'Benvenuto/a ' + username + '!\n\n La tua registrazione all\'applicazione Trivia Stack è andata a buon fine!\n Ti basterà accedere per iniziare a giocare.\n\n Trivia Stack Team'
                }

                transport.sendMail(mailOptions, (err, info) => {
                    if (err) {
                        console.error(err.stack);
                        return channel.nack(data);
                    }
                    channel.ack(data);
                }); 
            }, { noAck: false });
        });
    });
});