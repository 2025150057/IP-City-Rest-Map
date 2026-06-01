import dotenv from "dotenv";

dotenv.config();
async function test() {
    const kakao_api_url = `https://dapi.kakao.com/v2/local/search/keyword?query=왕십리역`
    const data = await fetch(kakao_api_url, {
        headers: {
            "content-type": "application/json;charset=UTF-8",
            "Authorization": `KakaoAK ${process.env.KAKAO_REST_API_KEY}`
        }
    });
    const json = await data.json();
    console.log(JSON.stringify(json, null, 2));
}
test();

