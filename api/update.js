export default {
  async fetch(request, env, ctx) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "PUT, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== "PUT") {
      return new Response(JSON.stringify({ message: "Method Not Allowed" }), {
        status: 405,
        headers: corsHeaders,
      });
    }

    try {
      const { recordId, mode, tyosaStaff, targetDateTime } =
        await request.json();

      if (!recordId || !mode || !tyosaStaff || !targetDateTime) {
        return new Response(
          JSON.stringify({ message: "必要な入力項目が足りません" }),
          { status: 400, headers: corsHeaders },
        );
      }

      const SUBDOMAIN = env.KINTONE_SUBDOMAIN;
      const APP_ID = env.KINTONE_APP_ID;
      const API_TOKEN = env.KINTONE_API_TOKEN;

      const url = `https://${SUBDOMAIN}.cybozu.com/k/v1/record.json`;

      const recordData = {
        tyosa_staff: { value: tyosaStaff },
      };

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

      const kintoneResponse = await fetch(url, {
        method: "PUT",
        headers: {
          "X-Cybozu-API-Token": API_TOKEN,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (kintoneResponse.ok) {
        return new Response(JSON.stringify({ message: "正常に更新しました" }), {
          status: 200,
          headers: corsHeaders,
        });
      } else {
        const errData = await kintoneResponse.json();
        return new Response(
          JSON.stringify({
            message: `kintoneの更新に失敗しました: ${errData.message}`,
          }),
          { status: 500, headers: corsHeaders },
        );
      }
    } catch (error) {
      return new Response(JSON.stringify({ message: "通信に失敗しました" }), {
        status: 500,
        headers: corsHeaders,
      });
    }
  },
};
