export default async (req, context) => {
  try {
    const token = process.env.IG_TOKEN;
    const userId = process.env.IG_USER_ID;

    if (!token || !userId) {
      return new Response(
        JSON.stringify({ error: "Faltan IG_TOKEN o IG_USER_ID en variables de entorno." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Trae la lista de posts (media) del usuario
    const url = new URL(`https://graph.instagram.com/${userId}/media`);
    url.searchParams.set("fields", "id,caption,media_type,media_url,permalink,thumbnail_url,timestamp");
    url.searchParams.set("access_token", token);

    const r = await fetch(url.toString());
    const data = await r.json();

    if (!r.ok) {
      return new Response(JSON.stringify({ error: "IG API error", details: data }), {
        status: r.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        // cachea 5 min para no pegarle a IG todo el tiempo
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Server error", message: String(e) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
