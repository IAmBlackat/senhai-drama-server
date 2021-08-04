const express = require("express");
const router = express.Router()
const cheerio = require("cheerio");
const rs = require("request");

const base = 'https://watchasian.in'
const api = '/drama'

router.get(`${api}/recent/:page/part/:part`, (req, res) => {
    let results = []
    let url = `${base}/recently-added-kshow?page=${req.params.page}`
    rs(url, (err, resp, html) => {
        if(err) return res.json({ success: false, error: err })
        try {
            const $ = cheerio.load(html)

            $(".tab-content, .left-tab-1, .selected")
            .children(".switch-block ,.list-episode-item")
            .children("li").children("a").each( function(index, e) {
                let title = $(this).children(".title").text()
                let img = $(this).children("img").attr("data-original")
                let ep = $(this).children(".ep").text().replace("EP", "").trim()
                let time = $(this).children(".time").text()
                let id = $(this).attr("href")
                .replace('/','').replace(`-episode-${ep}`,"")
                .replace(".html","")

                results[index] = { title, img, ep, time, id }
            })

            res.json({ success: true, results: results })
        } catch (e) {
            res.json({ success: false, error: "Something went wrong" })
        }
    })
})

router.get(`${api}/upcoming`, (req, res) => {
    let results = []
    rs( base, (err,resp,html) => {
        if(err) return res.json({ success: false, error: err })
        try {
            const $ = cheerio.load(html)
            $(".block ,.tab-container, .list-right")
            .children(".tab-content, .right-tab-2, .selected")
            .children("ul").children("li").children("h3").each(function(index, e) {
                let title = $(this).children("a").text()
                let time = $(this).next(".time").text()
                if (time !== "") results[index] = { title, time }
            })
            res.json({ success: true, results: results })

        } catch (e) {
            res.json({ success: false, error: "Something went wrong" })
        }
    })
})

router.get(`${api}/popular/:page/part/:part`, (req, res) => {
    let results = []
    let url = `${base}/most-popular-drama?page=${req.params.page}`
    rs(url, (err, resp, html) => {
        if(err) return res.json({ success: false, error: err, results: results  })
        try {
            const $ = cheerio.load(html)
            // let a = $(".switch-block, .list-episode-item").children("li")
            // .children("a").hasClass('li::before')
            // console.log(a)
            $(".img").each(function(index, e) {
                let id = $(this).attr().href.replace("/drama-detail/","")
                let title = $(this).children("h3").text()
                let img = $(this).children("img").attr("data-original")
                results[index] = { id, title, img }
            })
            
            if(Number(req.params.part) === 1) {
                res.json({ success: true, results: results.slice(0,12) })
            }
            else if(Number(req.params.part) === 2) {
                res.json({ success: true, results: results.slice(12,24) })
            } else if(Number(req.params.part) === 3) {
                res.json({ success: true, results: results.slice(24,36) })
            }
            // let part1 = results.slice(0,12)
            // let part2 = results.slice(13,24)
            // let part3 = results.slice(25,36)

          
        } catch (e) {
            res.json({ success: false, error: "Something went wrong", results: results  })
        }
    }) 
})

router.get(`${api}/search/:query/part/:part`, (req, res) => {
    let results = []
    url = `${base}/search?keyword=${req.params.query}`
    rs(url, (err,resp, html) => {
        if(err) return res.json({ success: false, error: err, results: results  })
        try {
            const $ = cheerio.load(html)
            $(".img").each(function(index, e) {
                let id = $(this).attr().href.replace("/drama-detail/","")
                let title = $(this).children("h3").text()
                let img = $(this).children("img").attr("data-original")
                results[index] = { id, title, img }
            })
            res.json({ success: true, results: results })
          
        } catch (e) {
            res.json({ success: false, error: "Something went wrong", results: results  })
        }
    })
})

router.get(`${api}/info/:id`, (req, res) => {
    let results = []
    // let details = []
    url = `${base}/drama-detail/${req.params.id}`
    rs(url, (err, resp, html) => {
        if(err) return res.json({ success: false, error: err })
        try {
            const $ = cheerio.load(html)
            let img = $(".img").children("img").attr("src")
            let title = $(".info").children("h1").text()
            let othername = $(".other_name").children("a").first().attr("title")
            
            let country
            let status;
            let released
            let genre = []
            $(".info").children("p").each(function(index, e) {
                switch ($(this).children("span").text()) {
                    case "Country:":
                        country = $(this).children("a").text()
                        break;
                    case "Status:":
                        status = $(this).children("a").text()
                        break;
                    case "Released:":
                        released = $(this).children("a").text()
                        break;
                    case "Genre:":
                        $(this).children("a").each(function(index, e) {
                            genre.push(`${$(this).text()}, `)
                        })
                        break;
                    default:
                        break;
                }
            })

            let trailer = $(".trailer").children("iframe").attr("src")

            let ep = []
            $(".list-episode-item-2").children("li").children("a")
            .each(function(index, e) {
                let episode = $(this).children("h3").text().trim().replace(title, "").replace("Episode","").trim()
                let epName = $(this).children("h3").text().trim()
                let sub = $(this).children(".type").text()
                let id = $(this).attr("href")
                .replace(".html","").replace("/","")
                .replace(`-episode-${episode}`,"")

                ep[index] = { id, episode, sub, epName }
            })

            let lastEp = $(".list-episode-item-2, .all-episode")
            .children("li").first().children("a").children(".title").text()
            .replace(title, "").replace("Episode", "").trim()
   
            results = { img, title, othername, trailer, country, status, released, genre, ep, lastEp }
            res.json({ success: true, results: results })
          
        } catch (e) {
            res.json({ success: false, error: "Something went wrong" })
        }
    })
})

const alt = ( res, url, title, lastEp, ep, mainId   ) => {
    rs(url, (err, resp, html) => {
        if(!err) {
            try {
                const $ = cheerio.load(html)
                let script = $(".wrapper").children(".videocontent").children("script").html().match(/\[(.*?)\]/gm)
                let result = script[0].split("'")[1]
                res.json({ success: true, results: result, title: title, lastEp: Number(lastEp), ep, mainId: mainId }) 

            } catch (e) {
                res.json({ e: e })
            }
        }
    })
}

// watching/:id/:episode/:number
router.get(`${api}/watching/:id/episode/:number`, (req, res) => {
    let results = []
    url = `${base}/${req.params.id}-episode-${req.params.number}.html`
    rs(url, (err,resp,html) => {
        if(err) return res.status(404).json({ success: false, error: err })
        try {
            const $ = cheerio.load(html)
            let title = $(".block, .watch-drama").children("h1").text()
            let src = $("iframe").attr("src")
            // let streamUrl = src.replace("streaming.php", "download")
            let streamUrl = $('.download').children("a").attr("href")
            let mainTitle = $(".category").children("a").text()
            let mainId = $(".category").children("a").attr("href").replace("/drama-detail/","")
            let lastEp = $(".list-episode-item-2, .all-episode")
            .children("li").first().children("a").children(".title").text()
            .replace(mainTitle, "").replace("Episode", "").trim()

            let ep = []
            $(".list-episode-item-2").children("li").children("a")
            .each(function(index, e) {
                let episode = $(this).children("h3").text().trim().replace(mainTitle, "").replace("Episode","").trim()
                let epName = $(this).children("h3").text().trim()
                let sub = $(this).children(".type").text()
                let id = $(this).attr("href")
                .replace(".html","").replace("/","")
                .replace(`-episode-${episode}`,"")

                ep[index] = { id, episode, sub, epName }
            })


            const getAllAttributes = function (node) {
                return node.attributes || Object.keys(node.attribs).map(
                    name => ({ name, value: node.attribs[name] })
                );
            };

            let asianload = getAllAttributes($(".kvid").get(0))[2].value

            // console.log(asianload)
            alt( res, asianload, title, lastEp, ep, mainId  )
            
            // let asianload = ""
            // $(".anime_muti_link").children('ul').children('li').each( (index, element) => {
            //     if( element.attribs.class === "kvid" ) {
                    
            //         // console.log( element.attribs.data-video )
            //     }
            //     // asianload.push({
            //     //     a: el.attribs.class
            //     // })
            // })
            
            // getEpisodeUrl(streamUrl, res, title, lastEp, ep, mainId)
            // let id = req.params.id.replace(/-20\d\d/gm,"")
            // let episode = req.params.number
            
            // newUrl( res, id, episode, title, lastEp, ep, mainId )
          
        } catch (e) {
            res.status(404).json({ success: false, error: "Something went wrong" })
        }
    })
})

module.exports = router