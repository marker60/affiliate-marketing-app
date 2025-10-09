// app/dev/page.tsx
// [LABEL: CLIENT PAGE]
"use client"

// [LABEL: TOP IMPORTS]
import * as React from "react"
import { Drawer, DrawerContent, DrawerTrigger, DrawerClose } from "@/components/ui/drawer"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import { Calendar } from "@/components/ui/calendar"
import { Carousel, CarouselItem } from "@/components/ui/carousel"
import {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
} from "@/components/ui/toast"

// [LABEL: LOCAL COMPONENT — ToastDemo]
function ToastDemo() {
  const [open, setOpen] = React.useState(false)
  return (
    <ToastProvider swipeDirection="right">
      <button
        onClick={() => setOpen(true)}
        className="rounded-md border px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-zinc-800"
      >
        Show Toast
      </button>
      <Toast open={open} onOpenChange={setOpen}>
        <ToastTitle>Heads up</ToastTitle>
        <ToastDescription className="mt-1">This is a tiny demo toast.</ToastDescription>
      </Toast>
      <ToastViewport />
    </ToastProvider>
  )
}

// [LABEL: LOCAL COMPONENT — BriefTester]
function BriefTester() {
  const [raw, setRaw] = React.useState("")
  const [msg, setMsg] = React.useState<string | null>(null)
  const [busy, setBusy] = React.useState(false)

  // [LABEL: sanitizeUrl]
  function sanitizeUrl(input: string): string {
    let s = (input || "").trim()
    const lastHttps = s.lastIndexOf("https://")
    const lastHttp = s.lastIndexOf("http://")
    const start = Math.max(lastHttps, lastHttp)
    if (start > 0) s = s.slice(start)
    try {
      // eslint-disable-next-line no-new
      new URL(s)
      return s
    } catch {
      const m = s.match(/https?:\/\/\S+/)
      if (m?.[0]) {
        try {
          // eslint-disable-next-line no-new
          new URL(m[0])
          return m[0]
        } catch {}
      }
    }
    return ""
  }

  async function doFetch() {
    setMsg(null)
    const url = sanitizeUrl(raw)
    if (!url) return setMsg("Please paste a valid product URL (http/https).")
    try {
      setBusy(true)
      const res = await fetch(`/api/brief?url=${encodeURIComponent(url)}`, { cache: "no-store" })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.message || json?.error || "Fetch failed")
      setMsg(`OK: ${json.title || "(no title found)"}`)
    } catch (e: any) {
      setMsg(`Error: ${e?.message || e}`)
    } finally {
      setBusy(false)
    }
  }

  async function doSave() {
    setMsg(null)
    const url = sanitizeUrl(raw)
    if (!url) return setMsg("Please paste a valid product URL before saving.")
    try {
      setBusy(true)
      const res = await fetch(`/api/brief/save?url=${encodeURIComponent(url)}`)
      const json = await res.json()
      if (!res.ok || !json.ok) throw new Error(json?.error || "Save failed")
      setMsg("Saved! Check the Briefs page.")
    } catch (e: any) {
      setMsg(`Error: ${e?.message || e}`)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="space-y-2">
      <h2 className="font-medium">Brief Tester</h2>
      <input
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        placeholder="Paste a product URL (any site)"
        className="w-full rounded-md border bg-transparent px-3 py-2"
      />
      <div className="flex gap-2">
        <button
          onClick={doFetch}
          disabled={busy}
          className="rounded-md border px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-zinc-800 disabled:opacity-50"
        >
          {busy ? "Fetching…" : "Fetch"}
        </button>
        <button
          onClick={doSave}
          disabled={busy}
          className="rounded-md border px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-zinc-800 disabled:opacity-50"
        >
          {busy ? "Saving…" : "Save"}
        </button>
      </div>
      {msg && (
        <div
          className={`text-sm ${
            msg.startsWith("OK:") || msg.startsWith("Saved!") ? "text-emerald-500" : "text-red-500"
          }`}
        >
          {msg}
        </div>
      )}
    </section>
  )
}

// [LABEL: LOCAL COMPONENT — SavedBriefs]
function SavedBriefs() {
  const [rows, setRows] = React.useState<any[]>([])
  const [busy, setBusy] = React.useState(false)
  async function load() {
    try {
      setBusy(true)
      const res = await fetch("/api/brief/list?limit=5", { cache: "no-store" })
      const json = await res.json()
      if (json?.ok) setRows(json.rows || [])
    } finally {
      setBusy(false)
    }
  }
  return (
    <section className="space-y-2">
      <h2 className="font-medium">Saved Briefs</h2>
      <button
        onClick={() => void load()}
        disabled={busy}
        className="rounded-md border px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-zinc-800 disabled:opacity-50"
      >
        {busy ? "Loading…" : "Load Last 5"}
      </button>
      <ul className="list-disc pl-5 text-sm space-y-1">
        {rows.map((r) => {
          let pretty = r.url as string
          try {
            const u = new URL(r.url)
            pretty = u.origin + u.pathname
          } catch {}
          return (
            <li key={r.id} className="break-words">
              <span className="font-medium">{r.title || "(no title)"} — </span>
              <a className="underline" href={r.url} target="_blank" rel="noreferrer">
                {pretty}
              </a>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

// [LABEL: DEFAULT EXPORT — DEV PAGE]
export default function DevPage() {
  const [open, setOpen] = React.useState(false)
  const [otp, setOtp] = React.useState("")

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-8 space-y-8">
      <h1 className="text-2xl font-semibold">UI Sanity — Dev</h1>

      {/* [LABEL: TOAST] */}
      <section className="space-y-2">
        <h2 className="font-medium">Toast</h2>
        <ToastDemo />
      </section>

      {/* [LABEL: DRAWER] */}
      <section className="space-y-2">
        <h2 className="font-medium">Drawer</h2>
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerTrigger asChild>
            <button className="rounded-md border px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-zinc-800">
              Open Drawer
            </button>
          </DrawerTrigger>
          <DrawerContent className="p-4">
            <div className="space-y-3">
              <p>Hello from Drawer.</p>
              <DrawerClose asChild>
                <button className="rounded-md border px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-zinc-800">
                  Close
                </button>
              </DrawerClose>
            </div>
          </DrawerContent>
        </Drawer>
      </section>

      {/* [LABEL: OTP] */}
      <section className="space-y-2">
        <h2 className="font-medium">OTP</h2>
        <InputOTP maxLength={6} value={otp} onChange={setOtp}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      </section>

      {/* [LABEL: RESIZABLE] */}
      <section className="space-y-2">
        <h2 className="font-medium">Resizable</h2>
        <ResizablePanelGroup direction="horizontal" className="rounded-md border">
          <ResizablePanel defaultSize={60} className="p-4">
            Left
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel className="p-4">Right</ResizablePanel>
        </ResizablePanelGroup>
      </section>

      {/* [LABEL: CALENDAR] */}
      <section className="space-y-2">
        <h2 className="font-medium">Calendar</h2>
        <Calendar
          mode="single"
          selected={undefined}
          onSelect={() => {}}
          className="rounded-md border p-3"
        />
      </section>

      {/* [LABEL: CAROUSEL] */}
      <section className="space-y-2">
        <h2 className="font-medium">Carousel</h2>
        <div className="rounded-md border p-4">
          <Carousel>
            <CarouselItem>
              <div className="flex h-32 items-center justify-center rounded-md border">
                Slide 1
              </div>
            </CarouselItem>
          </Carousel>
        </div>
      </section>

      {/* [LABEL: BRIEF TESTER] */}
      <BriefTester />

      {/* [LABEL: SAVED BRIEFS] */}
      <SavedBriefs />
    </main>
  )
}
