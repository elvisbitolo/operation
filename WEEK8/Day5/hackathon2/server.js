const express = require('express');
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Nodemailer Transporter Configuration
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: 'elvisbitolo11@gmail.com',
        pass: 'pbvp roah eruh ezxz'
    }
});

// Verify connection configuration
transporter.verify(function (error, success) {
    if (error) {
        console.log("Email Transporter Error:", error);
    } else {
        console.log("Email Server is ready to take our messages");
    }
});

// API endpoint to send emails
app.post('/api/send-mail', async (req, res) => {
    const { to, subject, text } = req.body;

    if (!to || !subject || !text) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        await transporter.sendMail({
            from: '"Chat Admin" <elvisbitolo11@gmail.com>',
            to: to,
            subject: subject,
            text: text,
            html: `<h3>${subject}</h3><p>${text}</p>`
        });
        console.log(`Email sent to ${to}`);
        res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ error: 'Failed to send email' });
    }
});

// Fallback route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
