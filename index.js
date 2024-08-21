const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios'); // Ensure Axios is installed with `npm install axios`
const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

let appointments = [];

// Function to translate text using Google Translate API
async function translateText(text, targetLang) {
    try {
        const response = await axios.post('https://translation.googleapis.com/language/translate/v2', {
            q: text,
            target: targetLang,
            key: 'YOUR_GOOGLE_TRANSLATE_API_KEY' // Replace with your actual API key
        });
        return response.data.data.translations[0].translatedText;
    } catch (error) {
        console.error('Error translating text:', error.message);
        return text; // Fallback to original text if translation fails
    }
}

// Homepage route
app.get('/', async (req, res) => {
    const lang = req.query.lang || 'en';

    const texts = {
        title: "Vaccination Booking System",
        name: "Child's Name",
        age: "Child's Age",
        date: "Appointment Date",
        bookAppointment: "Book Appointment",
        viewSchedule: "View Schedule"
    };

    // Translate texts if needed
    if (lang !== 'en') {
        for (const key in texts) {
            texts[key] = await translateText(texts[key], lang);
        }
    }

    res.send(`
        <html>
            <head>
                <title>${texts.title}</title>
            </head>
            <body>
                <h1>${texts.title}</h1>
                <form action="/appointment?lang=${lang}" method="POST">
                    <label>${texts.name}: </label>
                    <input type="text" name="name" required><br><br>
                    <label>${texts.age}: </label>
                    <input type="number" name="age" required><br><br>
                    <label>${texts.date}: </label>
                    <input type="date" name="date" required><br><br>
                    <button type="submit">${texts.bookAppointment}</button>
                </form>
                <br>
                <a href="/schedule?lang=${lang}">${texts.viewSchedule}</a>
                <br><br>
                <label for="language">Choose language:</label>
                <select id="language">
                    <option value="en" ${lang === 'en' ? 'selected' : ''}>English</option>
                    <option value="hi" ${lang === 'hi' ? 'selected' : ''}>हिन्दी</option>
                    <option value="es" ${lang === 'es' ? 'selected' : ''}>Español</option>
                    <option value="fr" ${lang === 'fr' ? 'selected' : ''}>Français</option>
                    <!-- Add more languages as needed -->
                </select>
                <button id="translateBtn">Translate</button>
                <script>
                    document.getElementById('translateBtn').addEventListener('click', () => {
                        const lang = document.getElementById('language').value;
                        window.location.href = '/?lang=' + lang;
                    });
                </script>
            </body>
        </html>
    `);
});

// Route to handle appointment booking
app.post('/appointment', async (req, res) => {
    const { name, age, date } = req.body;
    appointments.push({ name, age, date });
    const lang = req.query.lang || 'en';

    let appointmentMessage = `Appointment booked successfully for ${name} on ${date}.`;
    if (lang !== 'en') {
        appointmentMessage = await translateText(appointmentMessage, lang);
    }

    res.send(`
        <html>
            <body>
                <h2>${appointmentMessage}</h2>
                <a href="/?lang=${lang}">Back to Home</a>
            </body>
        </html>
    `);
});

// Route to view appointments
app.get('/schedule', async (req, res) => {
    const lang = req.query.lang || 'en';

    let scheduleTitle = 'Vaccination Schedule';
    if (lang !== 'en') {
        scheduleTitle = await translateText(scheduleTitle, lang);
    }

    let scheduleHTML = `<h2>${scheduleTitle}</h2>`;
    if (appointments.length === 0) {
        let noAppointmentsMessage = 'No appointments scheduled yet.';
        if (lang !== 'en') {
            noAppointmentsMessage = await translateText(noAppointmentsMessage, lang);
        }
        scheduleHTML += `<p>${noAppointmentsMessage}</p>`;
    } else {
        scheduleHTML += '<ul>';
        for (const app of appointments) {
            let appointmentInfo = `${app.name}, age ${app.age} - Date: ${app.date}`;
            if (lang !== 'en') {
                appointmentInfo = await translateText(appointmentInfo, lang);
            }
            scheduleHTML += `<li>${appointmentInfo}</li>`;
        }
        scheduleHTML += '</ul>';
    }
    scheduleHTML += `<a href="/?lang=${lang}">Back to Home</a>`;

    res.send(scheduleHTML);
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
