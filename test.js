import dotenv from "dotenv";

dotenv.config();
async function test() {
    const kakao_api_url = `https://dapi.kakao.com/v2/local/search/keyword?query=덕수궁길&size=5`
    const data = await fetch(kakao_api_url, {
        headers: {
            "content-type": "application/json;charset=UTF-8",
            "Authorization": `KakaoAK ${process.env.KAKAO_REST_API_KEY}`
        }
    });
    const json = await data.json();

    const address = json.documents[0].address_name;
    const longitude = json.documents[0].x;
    const latitude = json.documents[0].y;


    console.log(JSON.stringify(json, null, 2));
    console.log(address, longitude, latitude);
}
test();

