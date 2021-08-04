const express = require("express");
const app = express();
const cors = require("cors");
const la = require('./kissasian.la')
const ai = require('./kissasian.ai')
const v3 = require('./watchasian')
const v4 = require('./version4')
const cdn = require('./xtream')

const port = process.env.PORT || 5000;

// var whitelist = ['http://localhost:3000', 'https://sh-drama.vercel.app', 'https://sh-drama.netlify.app']
// var corsOptionsDelegate = function (req, callback) {
//   var corsOptions;
//   if (whitelist.indexOf(req.header('Origin')) !== -1) {
//     corsOptions = { origin: true } // reflect (enable) the requested origin in the CORS response
//   } else {
//     corsOptions = { origin: false } // disable CORS for this request
//   }
//   callback(null, corsOptions) // callback expects two parameters: error and options
// }

// app.use(cors(corsOptionsDelegate))
// app.use(cors({
//     origin: ['http://localhost:3000*', 'https://sh-drama.vercel.app*']
// }))
app.use(cors())

app.use(express.json())
app.use(express.urlencoded({ extended: false }));
app.use('/', la)
app.use('/ai', ai)
app.use('/', v3)
app.use('/', cdn)

// new version
app.use('/api/v4', v4)


app.get("/", (req, res) => res.send(" The app is running "))

app.listen(port, () => console.log(`Listening at ${port}`) )