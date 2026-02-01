"use client"

export default function Watermark() {
  return (
    <>
      {/* Centered watermark over video area */}
      <div className="fixed inset-0 pointer-events-none z-40 flex items-center justify-center">
        <div className="text-white opacity-15 text-4xl font-bold rotate-[-30deg] select-none tracking-wider">
          MrPacemakerLLC
        </div>
      </div>

      {/* Corner watermarks on video */}
      <div className="fixed top-8 left-8 text-sm text-white opacity-30 pointer-events-none z-40 select-none font-semibold">
        MrPacemakerLLC
      </div>
      <div className="fixed top-8 right-8 text-sm text-white opacity-30 pointer-events-none z-40 select-none font-semibold">
        MrPacemakerLLC
      </div>
      <div className="fixed bottom-8 left-8 text-sm text-white opacity-30 pointer-events-none z-40 select-none font-semibold">
        MrPacemakerLLC
      </div>
      <div className="fixed bottom-8 right-8 text-sm text-white opacity-30 pointer-events-none z-40 select-none font-semibold">
        MrPacemakerLLC
      </div>
    </>
  )
}
