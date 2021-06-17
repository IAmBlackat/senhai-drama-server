const express = require("express");
const ai = express.Router()
const cheerio = require("cheerio");
const rs = require("request");

const base = 'https://ww3.kissasian.ai/'
const api = '/api/v1/drama'

ai.get(`${api}`, (req, res) => res.send(" This is the index api from v1"))

ai.get(`${api}/popular/:page`, (req, res) => {
    const page = req.params.page
    let results = []
    let url = `${base}drama-list/most-popular.html?page=${page}`
    rs( url, (err, resp, html) => {
        if (!err) {
            try {
                const $ = cheerio.load(html)
                $(".item").each( function (index, element) {
                    let title = $(this).children("a").children("span").text().trim();
                    let id = $(this).children("a").attr().href;
                    let img = $(this).children("a").children("div").children("div").children("img").attr().src;

                    results[index] = { title, id, img };
                });
              
                res.status(200).json({ success: true, results: results });

            } catch(e) {
                res.json({ success: false, error: 'something went wrong' })
            }
        } else {
            res.json({ success: false, error: err })
        }
    })
})

ai.post('/kdramaSearch', (req, res ) => {
    const { title } = req.body
    console.log(title)
    let results = [];
    let searchUrl = `${base}/search.html?keyword=${title}`
    rs( searchUrl, (err, resp, html) => {
        if (!err) {
            try {
                const $ = cheerio.load(html)
                $(".item").each( function (index, element) {
                    let title = $(this).children("a").children("span").text().trim();
                    let id = $(this).children("a").attr().href;
                    let img = $(this).children("a").children("div").children("div").children("img").attr().src;

                    results[index] = { title, id, img };
                });
              
                res.status(200).json({ results: results });

            } catch(e) {
                res.status(404).json({ error: 'something went wrong' })
            }
        } else {
            res.json({ error: err })
        }
    })
})

ai.post('/kdramaInfo', (req,res) => {
    const { id } = req.body
    let url = `${base}${id}`
    let episode = []
    rs(url, (err, resp, html) => {
        if(!err) {
            try {
                const $ = cheerio.load(html)
                $(".listing").children("li").children("a").each(function(index, element) {
                    let epID = $(this).attr().href;
                    let name = $(this).attr().title;
                    episode[index] = { epID, name }
                })
                res.status(200).json({ results: episode });
            } catch(e) {
                res.status(404).json({ error: "something went wrong" })
            }
        } else {
            res.json({ error: err })
        }
    })
})

ai.post("/kdramaWatch", (req, res) => {
    const { epID } = req.body
    let watch = [];
    let url = `${base}${epID}`
    rs(url, (err, resp, html) => {
        if(!err) {
            try {
                const $ = cheerio.load(html)
                let videoUrl = $(".play-video").children("iframe").attr().src
                let dlPage = "https:"+videoUrl.replace("streaming.php","download")
                console.log(dlPage)
                // go to dl page
                rs(dlPage, (err, resp, html) => {
                    if(!err) {  
                        try {
                            const $ = cheerio.load(html)
                            $("a").each(function(index, element) {
                                if(element.attribs.download === "") {
                                    watch.push({
                                        link: element.attribs.href,
                                        name: $(this).text().replace("Download\n","").trim()
                                    })
                                }
                            })
                            res.json({ watch: watch })

                        } catch(e) {
                            res.status(404).json({ error: err })
                        }
                    } else {
                        res.json({ error: "can't load dlPage" })
                    }
                })

            } catch(e) {
                res.status(404).json({ error: "something went wrong" })
            }
        } else {
            res.json({ error: err })
        }     
    })
})

module.exports = ai