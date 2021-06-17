const express = require("express");
const router = express.Router()
const cheerio = require("cheerio");
const rs = require("request");

const base = 'https://kissasian.la'
const api = '/api/v2/drama'

router.get(`${api}`, (req, res) => res.send(" This is the index api from v2"))

router.get(`${api}/latest/:page`, (req, res) => {
    let results = [];
    const page = req.params.page;
    const url = `${base}/category/latest-kshow-releases/page/${page}/`
    rs(url, (err, resp, html) => {
        if(err) return res.json({ success: false, error: 'Url not responding' })
        try {
            const $ = cheerio.load(html);
            $(".mask").each(function(index, el) {
                let id = $(this).attr().href
                let title = $(this).children("h3").text()
                let ep = $(this).children(".ep").text()
                let time = $(this).children(".time").text();
                let img = "error";

                if( $(this).children("img").attr() !== undefined ) {
                    img = $(this).children("img").attr("data-original")
                }
                
                results[index] = { id, title, ep, img, time }
            })
            res.json({ success: true, results: results })
        } catch (e) {
            res.json({ success: false, error: "Something went wrong." })
        }
    })
})

router.get(`${api}/popular/:page`, (req, res) => {
    let results = []
    const page = req.params.page
    const url = `${base}/tag/most-popular/page/${page}/?country=korean`
    rs(url, (err, resp, html) => {
        if(err) return res.json({ success: false, error: "Url not responding" })
        try {
            const $ = cheerio.load(html)
            $(".mask").each(function(index, el) {
                let id = $(this).attr().href
                let title = $(this).children("h3").text()
                let img = "error";

                if( $(this).children("img").attr() !== undefined ) {
                    img = $(this).children("img").attr("data-original")
                }
                
                results[index] = { id, title, img }
            })
            res.json({ success: true, results: results })

        } catch (e) {
            res.json({ success: false, error: "Something went wrong." })
        }
    })
})

module.exports = router