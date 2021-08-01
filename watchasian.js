const express = require("express");
const router = express.Router()
const cheerio = require("cheerio");
const rs = require("request");
const chromium = require('chrome-aws-lambda');
const puppeteer = require("puppeteer")

const base = 'https://watchasian.cc'
const api = '/api/v3/drama'

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

const getEpisodeUrl = async (url, res, title, lastEp, ep, mainId) => {
    let results = []
    // console.log(url)
    const browser = await puppeteer.launch({ 
        args: [...chromium.args, 
            "--hide-scrollbars", 
            "--disable-web-security",
            "--no-sandbox",
            "--disable-setui-sandbox"
        ],
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath,
        headless: true,
        ignoreHTTPSErrors: true,
        // headless: false,
        // executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome'
     })
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle0' })
    // await page.waitForNavigation({ waitUntil: 'load' })
    let hd = await page.$$eval('a', el => el.map( x => {
        // if( x.getAttribute("href").includes("storage.googleapis.com") ) {
            return x.getAttribute("href")
        // }
    } ))
    await res.json({ success: hd, results: results, title: title, lastEp: Number(lastEp), ep, mainId: mainId })
    await page.close()
    await browser.close()
    // rs(url, (err,resp,html) => {
    //     if(err) return res.status(404).json({ success: false, error: err })
    //     try {
    //         const $ = cheerio.load(html)
    //         $(".download").children('a').each(function(index, e) {
    //             // if(e.attribs.download === "") {
    //                 results.push({
    //                     link: e.attribs.href,
    //                     // name: $(this).text().replace('Download\n', "").trim()
    //                 })
    //             // }
    //         }) 
    //         res.json({ success: html, results: results, title: title, lastEp: Number(lastEp), ep, mainId: mainId })
    //     } catch (e) {
    //         res.status(404).json({ success: false, error: "Something went wrong", get: "getUrl" })
    //     }
    // })
}   

const newUrl = ( res, id, episode, title, lastEp, ep, mainId ) => {
    console.log(id)
    let results = []
    let subtitle = ''
    let endpoint = `${id}-ep-${episode}`
    let url = `https://kdramahood.com/nt/${endpoint}`
    rs(url, (err,resp,html) => {
        if(err) return res.status(404).json({ success: false, error: err })
        try {
            const $ = cheerio.load(html)
            // let src = $('.jw-media .jw-reset').children('video').attr("src")
            $('.linkstv').children('div').children('li').children('a').each( (i,el) => {
                if(el.attribs.download === endpoint) {
                    results.push(el.attribs.href)
                }
                if(el.attribs.download === "english.srt") {
                    subtitle = el.attribs.href
                }   
            })

            res.json({ success: true, results: results, subtitle: subtitle, title: title, lastEp: Number(lastEp), ep, mainId: mainId })            
        } catch (e) {
            res.status(404).json({ success: false, error: "Something went wrong", get: "getUrl" })
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
            
            // getEpisodeUrl(streamUrl, res, title, lastEp, ep, mainId)
            let id = req.params.id.replace(/-20\d\d/gm,"")
            let episode = req.params.number
            
            newUrl( res, id, episode, title, lastEp, ep, mainId )
          
        } catch (e) {
            res.status(404).json({ success: false, error: "Something went wrong" })
        }
    })
})

const https = require("https")
const fs = require("fs");

router.post('/download', (req,res) => {
    const { subtitle } = req.body
    // const file = https.get("https:\kdramahood.com\Subtitle\the-devil-judge\the-devil-judge-ep-2.srt")
    // let name = subtitle.split('/')[3]
    let ep = subtitle.split('/')[4]
    const file = fs.createWriteStream(__dirname + "/tmp/" + ep )
    // url = `https:/kdramahood.com/Subtitle/the-devil-judge/the-devil-judge-ep-2.srt`

    https.get(subtitle, (response) => {
        response.pipe(file)
        // console.log(response.pipe(file))
        file.on('finish', () => {
            file.close()
        })
    } )
    // const stream = fs.createReadStream(__dirname + "/tmp/" + "subs.srt")
    // stream.pipe(res)
    // res.send({ s: stream })
    fs.readFile(__dirname + "/tmp/" + ep , (err, data) => {
        if(err) res.json({ e: "error reading file" })
        res.send(data)
    })
    // const stream = __dirname + "/tmp/subs.srt"
    // res.download(stream)
} )

module.exports = router