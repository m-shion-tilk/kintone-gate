export default {
  async fetch(request, env, ctx) {
    // CORS用の共通ヘッダー
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*", // 本番はVercelのURLが決まったらここに絞るとより安全
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    // プレフライトリクエスト（事前確認）への対応
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== "GET") {
      return new Response(JSON.stringify({ message: "Method Not Allowed" }), {
        status: 405,
        headers: corsHeaders,
      });
    }

    // URLからcaseNo（案件番号）を取得
    const { searchParams } = new URL(request.url);
    const caseNo = searchParams.get("caseNo");

    if (!caseNo) {
      return new Response(JSON.stringify({ message: "案件番号が必要です" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    // 🔐 Cloudflareの管理画面で後から登録する設定値
    const SUBDOMAIN = env.KINTONE_SUBDOMAIN;
    const APP_ID = env.KINTONE_APP_ID;
    const API_TOKEN = env.KINTONE_API_TOKEN;

    const BASE_URL = `https://${SUBDOMAIN}.cybozu.com/k/v1`;
    const query = encodeURIComponent(`case_no = "${caseNo}" limit 1`);
    const url = `${BASE_URL}/records.json?app=${APP_ID}&query=${query}`;

    try {
      const kintoneResponse = await fetch(url, {
        method: "GET",
        headers: { "X-Cybozu-API-Token": API_TOKEN },
      });
      const data = await kintoneResponse.json();

      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (error) {
      return new Response(
        JSON.stringify({ message: "kintoneとの通信に失敗しました" }),
        { status: 500, headers: corsHeaders },
      );
    }
  },
};
