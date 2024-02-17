const puppeteerExtra = require('puppeteer-extra');
const pluginStealth = require('puppeteer-extra-plugin-stealth');

async function run() {
  console.log('inside puppeteer function');
  puppeteerExtra.use(pluginStealth());
  const browser = await puppeteerExtra.launch({ headless: false, defaultViewport: false});
  const page = await browser.newPage();

  const url = 'https://www.zillow.com/homes/Plano,-TX_rb/';

  await page.goto(url);

  const housesList = await page.$$(`[data-test="property-card"]`);
  // await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
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
  
  await page.click(`[title="Next page"]`)
  await page.waitForNavigation();
  await page.screenshot({ path: `${new Date()}.jpg` });
  await page.close();

  await browser.close();
  console.log('housesListArray', housesListArray)
return housesListArray;

}
function formatHouseDetails(details: string) {
  return {
    bedRooms: details.split(' ')[0],
    baths: details.split(' ')[1].replace(/^\D+/g, ''),
    size: details.split(' ')[2].replace(/^\D+/g, ''),
  }
}

// Run the function
run();
