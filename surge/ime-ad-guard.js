// iMe 广告守卫（Surge http-response 脚本）
// 命中 api.imem.me/api/ad/getAd 时：把 payload.ad 置空，让客户端认为"无广告可投"，
// 同时推一条通知，方便确认广告接口到底有没有被调用。
// 需要配合 MITM（api.imem.me）使用。

(function () {
    var body = $response && $response.body ? $response.body : "";

    try {
        var json = JSON.parse(body);
        var payload = json && json.payload;
        var ad = payload && payload.ad;

        if (ad && (ad.title || ad.mediaUrl)) {
            var title = ad.title || "(无标题)";
            var desc = ad.description || "";
            var land = (ad.clickAction && ad.clickAction.url) || ad.domain || "";

            // 清空广告对象，保持结构合法：{"status":"ok","payload":{}}
            json.payload = {};

            $notification.post(
                "iMe 广告已拦截",
                title,
                desc ? desc + "\n" + land : land
            );

            $done({ body: JSON.stringify(json) });
            return;
        }

        // 本来就没广告，原样放行
        $done({});
    } catch (e) {
        // 解析失败就放行，避免把 App 搞坏
        console.log("iMe ad guard parse error: " + e);
        $done({});
    }
})();
