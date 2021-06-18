const express = require("express");
const app = express();
const cors = require("cors");
const la = require('./kissasian.la')
const ai = require('./kissasian.ai')
const v3 = require('./watchasian')

const port = process.env.PORT || 5000;;

app.use(cors({
    origin: ['http://localhost:3000/*', 'https://sh-drama.vercel.app/*'],
    methods: ['GET', 'POST'] 
}))

app.use(express.json())
app.use(express.urlencoded({ extended: false }));
app.use('/', la)
app.use('/', ai)
app.use('/', v3)

app.get("/", (req, res) => res.send(" The app is running "))

app.listen(port, () => console.log(`Listening at ${port}`) )