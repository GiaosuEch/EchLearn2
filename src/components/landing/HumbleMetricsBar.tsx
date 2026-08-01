import { Tilt3DCard } from '../ui/Tilt3DCard';

export function HumbleMetricsBar() {
  const metrics = [
    { label: 'ĐỘ CHÍNH XÁC PHÁT ÂM AI', value: '99.4%', color: 'text-[#FFD700]', badge: '🏛️ AI ACCURACY' },
    { label: 'BÀI HỌC VÀ KỊCH BẢN 3D', value: '120+', color: 'text-[#FFD700]', badge: '🎨 LESSON NODES' },
    { label: 'TỐC ĐỘ PHẢN HỒI REALTIME', value: '<50ms', color: 'text-[#FFD700]', badge: '⚡ LATENCY SPEED' },
    { label: 'NGÔN NGỮ ĐA QUỐC GIA', value: '13', color: 'text-[#FFD700]', badge: '🌍 GLOBAL FLAGS' },
  ];

  return (
    <section className="py-16 bg-[#0a1128] border-y-2 border-[#FFD700]/30 relative overflow-hidden">
      <div className="max-w-[92rem] mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric, index) => (
            <Tilt3DCard key={index} maxTiltDegrees={10} depthZ={18}>
              <div className="p-6 rounded-2xl border-2 border-[#FFD700]/40 bg-gradient-to-b from-[#1c2d42] to-[#0a1128] hover:border-[#FFD700] transition-all flex flex-col justify-between h-full shadow-[0_10px_30px_rgba(255,215,0,0.15)]">
                <div className="flex items-center justify-between text-xs font-serif tracking-widest text-[#FFD700] mb-3 font-bold">
                  <span>{metric.badge}</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FFD700] animate-pulse" />
                </div>
                <div className="text-4xl sm:text-5xl font-bold font-serif tracking-tight my-2 text-[#FFD700] drop-shadow-[0_0_15px_rgba(255,215,0,0.4)]">
                  {metric.value}
                </div>
                <p className="text-xs font-serif tracking-wider text-amber-100/90 uppercase mt-2 font-bold">
                  {metric.label}
                </p>
              </div>
            </Tilt3DCard>
          ))}
        </div>
      </div>
    </section>
  );
}
