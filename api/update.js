// api/update.js
export default async function handler(req, res) {
  if (req.method !== "PUT") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { recordId, mode, tyosaStaff, targetDateTime } = req.body;

  if (!recordId || !mode || !tyosaStaff || !targetDateTime) {
    return res.status(400).json({ message: "必要な入力項目が足りません" });
  }

  const SUBDOMAIN = process.env.KINTONE_SUBDOMAIN;
  const APP_ID = process.env.KINTONE_APP_ID;
  const API_TOKEN = process.env.KINTONE_API_TOKEN;

  const url = `https://${SUBDOMAIN}.cybozu.com/k/v1/record.json`;

  // kintoneの更新データを組み立てる
  const recordData = {
    tyosa_staff: { value: tyosaStaff },
  };

  // 入館か退館かで、書き込む日時フィールドコードを切り替える
  if (mode === "入館") {
    recordData["tyosa_entry_datetime"] = { value: targetDateTime };
  } else if (mode === "退館") {
    recordData["tyosa_exit_datetime"] = { value: targetDateTime };
  }

  const body = {
    app: APP_ID,
    id: recordId,
    record: recordData,
  };

  try {
    const kintoneResponse = await fetch(url, {
      method: "PUT",
      headers: {
        "X-Cybozu-API-Token": API_TOKEN,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (kintoneResponse.ok) {
      return res.status(200).json({ message: "正常に更新しました" });
    } else {
      const errData = await kintoneResponse.json();
      return res
        .status(500)
        .json({ message: `kintoneの更新に失敗しました: ${errData.message}` });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "kintoneとの通信に失敗しました" });
  }
}
