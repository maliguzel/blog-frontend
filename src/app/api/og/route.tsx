import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
    return new ImageResponse(
        <div
            style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#111827",
                color: "white",
                fontSize: 64,
                fontWeight: 700,
            }}
        >
            Nedir Bunlar
        </div>,
        {
            width: 1200,
            height: 630,
        },
    );
}
