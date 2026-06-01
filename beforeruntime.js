import dotenv from "dotenv";
import XLSX from "xlsx";




dotenv.config();


async function run() {
    const cityLoc = XLSX.readFile("datas/서울시 주요 121장소 목록.xlsx");

    const firstSheetName = cityLoc.SheetNames[0];
    const firstSheet = cityLoc.Sheets[firstSheetName];
    const JSONdata = XLSX.utils.sheet_to_json(firstSheet);

    // Use Promise.all to fetch data concurrently and wait for all updates
    await Promise.all(JSONdata.map(async (element) => {
        const queryName = element.NM_ALTER !== "NONE" ? element.NM_ALTER : element.KOR_NM;
        try {
            const ret = await getLocData(queryName);
            element.ADDRESS = ret.address;
            element.LONGITUDE = ret.longitude;
            element.LATITUDE = ret.latitude;
        } catch (err) {
            console.error(`Failed to get data for ${queryName}:`, err);
        }
    }));

    //write xlsx doc at output.xlsx.

    const newWorkSheet = XLSX.utils.json_to_sheet(JSONdata);
    const newWorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(newWorkBook, newWorkSheet, "Sheet1");
    XLSX.writeFile(newWorkBook, "datas/output.xlsx");


}


async function getLocData(loc_name) {
    const kakao_api_url = `https://dapi.kakao.com/v2/local/search/keyword?query=${loc_name}&size=1`
    const data = await fetch(kakao_api_url, {
        headers: {
            "content-type": "application/json;charset=UTF-8",
            "Authorization": `KakaoAK ${process.env.KAKAO_REST_API_KEY}`
        }
    });
    const json = await data.json();

    if (!json.documents[0]?.address_name) {
        console.log(`NO RESULT! ${loc_name}`);
        return {
            name: loc_name,
            address: "",
            longitude: "",
            latitude: ""
        }
    }


    const address = json.documents[0].address_name;
    const longitude = json.documents[0].x;
    const latitude = json.documents[0].y;
    //console.log(JSON.stringify(json, null, 2));
    //console.log(loc_name, address, longitude, latitude);
    return {
        name: loc_name,
        address: address,
        longitude: longitude,
        latitude: latitude
    }
}








run();