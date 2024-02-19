const puppeteerExtra = require('puppeteer-extra');
const pluginStealth = require('puppeteer-extra-plugin-stealth');
import express from 'express';

const zillowScrapApp = express();


zillowScrapApp.get('/', async (request, response) => {
    puppeteerExtra.use(pluginStealth());
    const browser = await puppeteerExtra.launch({ headless: true, defaultViewport: false });
    const page = await browser.newPage();

    const url = 'https://www.zillow.com/homes/Plano,-TX_rb/';

    await page.goto(url);

    const housesList = await page.$$(`[data-test="property-card"]`);
    let housesListArray = [];
    for (const house of housesList) {
        const price = await page.evaluate((el: HTMLElement) => el.querySelector(`[data-test="property-card-price"]`)?.textContent, house);
        const address = await page.evaluate((el: HTMLElement) => el.querySelector(`[data-test="property-card-addr"]`)?.textContent, house);
        const bedRooms = await page.evaluate((el: HTMLElement) => el.querySelector(`[class="StyledPropertyCardHomeDetailsList-c11n-8-84-3__sc-1xvdaej-0 eYPFID"]`)?.textContent, house);
        const sizeDetails = formatHouseDetails(bedRooms)
        housesListArray.push({
            Address: address || '',
            baths: sizeDetails.baths || '',
            bedRooms: sizeDetails.bedRooms || '',
            size: sizeDetails.size + ' sq.fts' || '',
            price: price || '',
        })
    }

    await browser.close();
    response.send(housesListArray)
    
});

function formatHouseDetails(details: string) {
    return {
        bedRooms: details.split(' ')[0],
        baths: details.split(' ')[1].replace(/^\D+/g, ''),
        size: details.split(' ')[2].replace(/^\D+/g, ''),
    }
}

const port = process.env.PORT || 3000;

zillowScrapApp.listen(port, () => console.log(`App listening on PORT ${port}`))
