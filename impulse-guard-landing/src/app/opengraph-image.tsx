import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "ImpulseGuard - Beat Cravings in 10 Minutes";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#F2F2F7",
          backgroundImage:
            "radial-gradient(circle at 25% 25%, #ADC8FF 0%, transparent 50%), radial-gradient(circle at 75% 75%, #4784FF 0%, transparent 50%)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 20,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 24,
            }}
          >
            <div
              style={{
                width: 100,
                height: 100,
                backgroundColor: "#4784FF",
                borderRadius: 20,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 50,
              }}
            >
              🛡️
            </div>
            <div
              style={{
                fontSize: 72,
                fontWeight: 700,
                color: "#000000",
              }}
            >
              ImpulseGuard
            </div>
          </div>

          <div
            style={{
              fontSize: 36,
              fontWeight: 600,
              color: "#000000",
              marginTop: 20,
              textAlign: "center",
              maxWidth: 900,
            }}
          >
            Beat Cravings in 10 Minutes
          </div>

          <div
            style={{
              fontSize: 24,
              color: "#666666",
              marginTop: 10,
              textAlign: "center",
              maxWidth: 800,
            }}
          >
            Pause before you act. Get through cravings with 10-minute sessions.
          </div>

          <div
            style={{
              display: "flex",
              gap: 20,
              marginTop: 30,
            }}
          >
            <div
              style={{
                backgroundColor: "#328BFE",
                color: "white",
                padding: "16px 32px",
                borderRadius: 12,
                fontSize: 20,
                fontWeight: 600,
              }}
            >
              Download Now
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
