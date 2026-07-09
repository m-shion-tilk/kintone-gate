// api/search.js
export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { caseNo } = req.query;
  if (!caseNo) {
    return res.status(400).json({ message: "案件番号が必要です" });
  }

  const SUBDOMAIN = process.env.KINTONE_SUBDOMAIN;
  const APP_ID = process.env.KINTONE_APP_ID;
  const API_TOKEN = process.env.KINTONE_API_TOKEN;

  const BASE_URL = `https://${SUBDOMAIN}.cybozu.com/k/v1`;
  const query = encodeURIComponent(`case_no = "${caseNo}" limit 1`);
  const url = `${BASE_URL}/records.json?app=${APP_ID}&query=${query}`;

  try {
    const kintoneResponse = await fetch(url, {
      method: "GET",
      headers: { "X-Cybozu-API-Token": API_TOKEN },
    });
    const data = await kintoneResponse.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "kintoneとの通信に失敗しました" });
  }
}
