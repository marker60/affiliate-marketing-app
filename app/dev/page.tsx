"use client"

import * as React from "react"
import { DayPicker } from "react-day-picker"
import "react-day-picker/dist/style.css"

import { Button } from "@/components/ui/button"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable"
import { Carousel, CarouselItem } from "@/components/ui/carousel"

// --- Brief Tester ---
function BriefTester() {
  const [url, setUrl] = React.useState("https://example.com")
  const [out, setOut] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(false)
  const [err, setErr] = React.useState<string | null>(null)

  async function run() {
    setLoading(true)
    setErr(null)
    setOut(null)
    try {
      const res = await fetch(`/api/brief?url=${encodeURIComponent(url)}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json?.message || json?.error || "Failed")
      setOut(json)
    } catch (e: any) {
      setErr(String(e.message || e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="space-y-2">
      <h2 className="font-medium">Brief Tester</h2>
      <div className="flex gap-2">
        <input
          className="w-full rounded-md border bg-transparent px-3 py-2"
          placeholder="https://…"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button
          onClick={run}
          disabled={loading}
          className="rounded-md border px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-zinc-800 disabled:opacity-50"
        >
          {loading ? "Loading…" : "Fetch"}
        </button>
      </div>
      {err && <div className="text-red-500 text-sm">Error: {err}</div>}
      {out && (
        <pre className="max-h-80 overflow-auto rounded-md border p-3 text-xs">
          {JSON.stringify(out, null, 2)}
        </pre>
      )}
    </section>
  )
}

export default function DevPage() {
  const [otp, setOtp] = React.useState("")

  return (
    <main className="mx-auto w-full max-w-6xl space-y-8 px-6 py-8">
      <h1 className="text-2xl font-semibold">UI Sanity — Dev</h1>

      {/* OTP */}
      <section className="space-y-2">
        <h2 className="font-medium">OTP</h2>
        <InputOTP maxLength={6} value={otp} onChange={setOtp}>
          <InputOTPGroup>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <InputOTPSlot key={i} index={i} />
            ))}
          </InputOTPGroup>
        </InputOTP>
        <div className="text-sm text-muted-foreground">Value: {otp || "—"}</div>
      </section>

      {/* Resizable */}
      <section className="space-y-2">
        <h2 className="font-medium">Resizable</h2>
        <ResizablePanelGroup
          direction="horizontal"
          className="min-h-[120px] rounded-md border"
        >
          <ResizablePanel defaultSize={50} className="p-3">
            Left
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={50} className="p-3">
            Right
          </ResizablePanel>
        </ResizablePanelGroup>
      </section>

      {/* Calendar */}
      <section className="space-y-2">
        <h2 className="font-medium">Calendar</h2>
        <DayPicker mode="single" />
      </section>

      {/* Carousel */}
      <section className="space-y-2">
        <h2 className="font-medium">Carousel</h2>
        <Carousel className="w-full max-w-none">
          {[1, 2, 3].map((n) => (
            <CarouselItem key={n} className="basis-full">
              <div className="rounded-lg border p-10 text-center">
                Slide {n}
              </div>
            </CarouselItem>
          ))}
        </Carousel>
      </section>

      {/* Brief Tester */}
      <BriefTester />
    </main>
  )
}
