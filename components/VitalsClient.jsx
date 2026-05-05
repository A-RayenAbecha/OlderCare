"use client";

import { useEffect, useState } from "react";

export default function VitalsClient() {
  const [heart, setHeart] = useState(72);
  const [spo2, setSpo2] = useState(97);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const rates = [68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79];
    const oxygen = [95, 96, 97, 98, 99];
    const timer = setInterval(() => {
      setHeart((current) => {
        const target = rates[Math.floor(Math.random() * rates.length)];
        return current + Math.sign(target - current) * Math.min(Math.abs(target - current), 3);
      });
      setSpo2((current) => {
        const target = oxygen[Math.floor(Math.random() * oxygen.length)];
        return current + Math.sign(target - current) * Math.min(Math.abs(target - current), 1);
      });
      setTick((current) => current + 1);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="live-vitals-grid">
      <article className="live-vital-card heart">
        <div className="live-vital-top"><span className="live-vital-icon">♥</span><strong>EN DIRECT</strong></div>
        <div className="live-vital-value"><span id="dashboardHeartRate">{heart}</span><small>BPM</small></div>
        <div className="heart-bars" aria-hidden="true">
          {[30, 44, 66, 52, 78, 46].map((height, index) => {
            const wave = Math.sin(tick + index) * 16;
            const nextHeight = Math.max(26, Math.min(88, heart - 34 + wave + (height - 52)));
            return <i key={index} className={index === 4 || nextHeight > 70 ? "is-peak" : ""} style={{ "--h": `${nextHeight}%` }} />;
          })}
        </div>
      </article>
      <article className="live-vital-card oxygen">
        <div className="live-vital-top"><span className="live-vital-icon">✹</span><strong>SpO2</strong></div>
        <div className="live-vital-value"><span id="dashboardSpo2">{spo2}</span><small>%</small></div>
        <div className="oxygen-meter" aria-hidden="true"><span id="dashboardSpo2Meter" style={{ width: `${spo2}%` }} /></div>
      </article>
    </div>
  );
}
