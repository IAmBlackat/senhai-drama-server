const express = require("express");
const router = express.Router()
const axios = require("axios")
const cheerio = require("cheerio");
const rs = require("request");
const puppeteer = require("puppeteer")

let url = 'https://streamani.net/loadserver.php?id=MTY0MDI1&typesub=Gogoanime-SUB&title=Bakuten%21%21+Episode+12'
let ur = "https://animixplay.to/api/liveTVRZME1ETXpMVFhzM0dyVTh3ZTlPVFZSWk1FMUVUWG89"
router.get("/cdn", async (req,res) => {
    rs(ur, (err,resp,html) => {
        if(err) return res.json({ error: err })
        try {
            let $ = cheerio.load(html)
            // let a = $(".jw-video, .jw-reset").attr("src")
            let a = $("source").attr("src")
            res.json({ a: a })
        } catch (e) {
            res.json({ error: 'error' })
        }
    })
    // try {
    //     axios.post('https://fcdn.stream/api/source/36752cmx2g3-2q8')
    //     .then( resp => {
    //         res.json({ data: resp.data })
    //     })
    //     .catch( err => res.json({err: err}) )
    // } catch (e) {
    //     res.json({ e: e })
    // }
    // rs(url, (err,resp,html) => {
    //     if(err) return res.json({ error: err })
    //     try {
    //         let $ = cheerio.load(html, { xmlMode: false })
    //         // let a = $(".jw-video, .jw-reset").attr("src")
    //         let s = $(".wrapper").children(".videocontent").children("script").html()
    //         res.json({ s: s })
    //     } catch (e) {
    //         res.json({ error: 'error' })
    //     }
    // })
})

router.get('/p', (req, res) => {
    (async () => {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(url);
        // await page.screenshot({ path: 'example.png' });
        await page.addScriptTag({ url: 'https://streamani.net/js/jw8.9/jwplayer.js?v=8.21' })
        console.log(page)
        await browser.close();
    })();
})

module.exports = router