const chromium = require('chrome-aws-lambda');
const puppeteer = require("puppeteer")

async function app() {
    const browser = await puppeteer.launch({ 
        args: [...chromium.args, 
            "--hide-scrollbars", 
            "--disable-web-security",
            "--no-sandbox",
            "--disable-setui-sandbox"
        ],
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath,
        headless: false,
        ignoreHTTPSErrors: true,
        // headless: false,
        // executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome'
     })
    const page = await browser.newPage();
    // await page.goto('https://v.vrv.co/evs1/2b13b4b4dfb247a5394c62e62c54177a/assets/5b00a15f49fbfc2c5c0eaf8c5b0d9dee_,3758182.mp4,3758184.mp4,3758180.mp4,3758178.mp4,3758176.mp4,.urlset/master.m3u8?Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cCo6Ly92LnZydi5jby9ldnMxLzJiMTNiNGI0ZGZiMjQ3YTUzOTRjNjJlNjJjNTQxNzdhL2Fzc2V0cy81YjAwYTE1ZjQ5ZmJmYzJjNWMwZWFmOGM1YjBkOWRlZV8sMzc1ODE4Mi5tcDQsMzc1ODE4NC5tcDQsMzc1ODE4MC5tcDQsMzc1ODE3OC5tcDQsMzc1ODE3Ni5tcDQsLnVybHNldC9tYXN0ZXIubTN1OCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTYyNDgyOTU5N319fV19&Signature=N8hNHXlKYQPb9ArTKNo9Ws8sgq4TcCBniltn1E7Oh~tD6KtLyfXS3Jp7RWugsGnu-QWjeqHj8IKWuX681OZAQPjnkjX-dZKQQDqgmUjqcvt82J86Gjy79shDhbXQHMX~pCg6FaOf9Q1xvdjjpRDB9QQBvTkDgKQ3qPn4j~eeXbO25nrMNaC0tNyCYz6J77enuyACY0Ief7yit1E0pf3ZLAJHNjoeVvEcyBd0uN-ehDsqeJT45mMs7wOlYIyKiIsZGpsCN3vTpA~Gu~MKnNk0NjVsZNCWISBu13X0Z9S6yuMHMmoqYhz7SruUTxu0Up-7Lj3NnlkArS-QJjTWH2QFvA__&Key-Pair-Id=APKAJMWSQ5S7ZB3MF5VA', { waitUntil: 'domcontentloaded', timeout: 0 })
    // await page.goto('https://streamani.net/loadserver.php?id=MTY0MDIy&title=Zombieland+Saga%3A+Revenge+Episode+12')
    // page.on("response", async(response) => {
    //     if(response.url().includes("master.m3u8")) {
    //         console.log( await response.url())
    //     }
    //     if(response.url().includes("storage.googleapi")) {
    //         console.log( await response.url())
    //     }
        
    // })
    await page.goto("https://asianload.cc/download?id=MjY5OTg0&typesub=dramacool-SUB&title=Kingdom%3A+Ashin+of+the+North+%282021%29+Episode+1", { waitUntil: 'networkidle2'})
   
    // await page.click("video");
    // await page.waitFor(1000)
    // await page.click(".plyr__video-wrapper");
    // await page.waitFor(3000)
    // await page.waitForSelector(".plyr")
    // await page.waitForNavigation({ waitUntil: 'load' })
    // await page.click("video");
    
    let hd = await page.$$eval('a', el => el.map( x => {
        if( x.getAttribute("href").includes("storage.googleapis.com") ) {
            return x.getAttribute("href")
        }
    } ))
    console.log(hd)
 
    await browser.close()
}

app();