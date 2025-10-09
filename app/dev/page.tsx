"use client"

import * as React from "react"

// [LABEL: TOP IMPORTS — TOAST]
import {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
} from "@/components/ui/toast"


// [LABEL: TOP IMPORTS — DRAWER]
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerClose,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer"

// [LABEL: TOP IMPORTS — RESIZABLE]
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable"


// [LABEL: TOP IMPORTS — OTP]
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"


// [LABEL: TOP IMPORTS — CALENDAR]
import { DayPicker } from "react-day-picker"
import "react-day-picker/dist/style.css"

// [LABEL: COMPONENT — BriefTester]
function BriefTester() {
  const [raw, setRaw] = React.useState("")
  const [msg, setMsg] = React.useState<string | null>(null)
  const [busy, setBusy] = React.useState(false)

  // [LABEL: HELPER — sanitizeUrl]
  function sanitizeUrl(input: string): string {
    let s = (input || "").trim()

    // If two URLs got jammed together, keep the *last* http(s) occurrence.
    const lastHttps = s.lastIndexOf("https://")
    const lastHttp = s.lastIndexOf("http://")
    const start = Math.max(lastHttps, lastHttp)
    if (start > 0) s = s.slice(start)

    try {
      // throws if invalid
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
        } catch {/* ignore */}
      }
    }
    return ""
  }

  async function doFetch() {
    setMsg(null)
    const url = sanitizeUrl(raw)
    if (!url) {
      setMsg("Please paste a valid product URL (starting with http:// or https://).")
      return
    }
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
    if (!url) {
      setMsg("Please paste a valid product URL before saving.")
      return
    }
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



// [LABEL: TOP IMPORTS — ADD THIS LINE]
import { Carousel, CarouselItem } from "@/components/ui/carousel"

{/* [LABEL: JSX INSERT — BRIEF TESTER START] */}
<section className="space-y-2">
  <h2 className="font-medium">Brief Tester</h2>
  {(() => {
    const [raw, setRaw] = React.useState("")
    const [msg, setMsg] = React.useState<string | null>(null)
    const [busy, setBusy] = React.useState(false)

    // [LABEL: HELPER — sanitizeUrl]
    function sanitizeUrl(input: string): string {
      let s = (input || "").trim()

      // If multiple protocol sequences were pasted back-to-back (e.g., "...comhttps://www...")
      // take the last occurrence as the intended URL.
      const lastHttps = s.lastIndexOf("https://")
      const lastHttp = s.lastIndexOf("http://")
      const start = Math.max(lastHttps, lastHttp)
      if (start > 0) s = s.slice(start)

      // Validate; if invalid, try to pull a URL-shaped token
      try {
        // throws if invalid
        // eslint-disable-next-line no-new
        new URL(s)
        return s
      } catch {
        const m = s.match(/https?:\/\/\S+/)
        if (m && m[0]) {
          try {
            // eslint-disable-next-line no-new
            new URL(m[0])
            return m[0]
          } catch {
            /* fallthrough */
          }
        }
      }
      return ""
    }

    async function doFetch() {
      setMsg(null)
      const url = sanitizeUrl(raw)
      if (!url) {
        setMsg("Please paste a valid product URL (starting with http:// or https://).")
        return
      }
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
      if (!url) {
        setMsg("Please paste a valid product URL before saving.")
        return
      }
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
      <div className="space-y-2">
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
      </div>
    )
  })()}
</section>
{/* [LABEL: JSX INSERT — BRIEF TESTER END] */}



/* --- Saved Briefs viewer (GET /api/brief/list) --- */
function SavedBriefs() {
  const [rows, setRows] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(false)
  const [err, setErr] = React.useState<string | null>(null)

  async function load() {
    setLoading(true); setErr(null)
    try {
      const res = await fetch("/api/brief/list?limit=5")
      const json = await res.json()
      if (!json.ok) throw new Error(json.error || "Failed")
      setRows(json.rows || [])
    } catch (e: any) {
      setErr(String(e.message || e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="space-y-2">
      <h2 className="font-medium">Saved Briefs</h2>
      <button
        onClick={load}
        disabled={loading}
        className="rounded-md border px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-zinc-800 disabled:opacity-50"
      >
        {loading ? "Loading…" : "Load Last 5"}
      </button>
      {err && <div className="text-red-500 text-sm">Error: {err}</div>}
      {rows.length > 0 && (
        <ul className="list-disc pl-5 text-sm">
          {rows.map((r) => (
            <li key={r.id}>
              <span className="font-medium">{r.title || "(no title)"}</span>{" "}
              — <a className="underline" href={r.url} target="_blank" rel="noreferrer">{r.url}</a>
            </li>
          ))}
        </ul>
      )}
      {rows.length === 0 && !loading && !err && (
        <div className="text-sm text-muted-foreground">No rows yet.</div>
      )}
    </section>
  )
}

/* --- DEFAULT EXPORT (required) --- */
export default function DevPage() {
  return (
    <main className="mx-auto w-full max-w-6xl space-y-8 px-6 py-8">
      <h1 className="text-2xl font-semibold">UI Sanity — Dev</h1>

{/* [LABEL: JSX INSERT — CAROUSEL START] */}
<section className="space-y-2">
  <h2 className="font-medium">Carousel</h2>
  <Carousel className="w-full max-w-none">
    {[1, 2, 3].map((n) => (
      <CarouselItem key={n} className="basis-full">
        <div className="rounded-lg border p-10 text-center">Slide {n}</div>
      </CarouselItem>
    ))}
  </Carousel>
</section>
{/* [LABEL: JSX INSERT — CAROUSEL END] */}

{/* [LABEL: JSX INSERT — CALENDAR START] */}
<section className="space-y-2">
  <h2 className="font-medium">Calendar</h2>
  <DayPicker mode="single" />
</section>
{/* [LABEL: JSX INSERT — CALENDAR END] */}

{/* [LABEL: JSX INSERT — OTP START] */}
<section className="space-y-2">
  <h2 className="font-medium">OTP</h2>
  <InputOTP maxLength={6} value={""} onChange={() => {}}>
    <InputOTPGroup>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <InputOTPSlot key={i} index={i} />
      ))}
    </InputOTPGroup>
  </InputOTP>
</section>
{/* [LABEL: JSX INSERT — OTP END] */}

{/* [LABEL: JSX INSERT — RESIZABLE START] */}
<section className="space-y-2">
  <h2 className="font-medium">Resizable</h2>
  <ResizablePanelGroup
    direction="horizontal"
    className="min-h-[140px] rounded-md border"
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
{/* [LABEL: JSX INSERT — RESIZABLE END] */}

{/* [LABEL: JSX INSERT — DRAWER START] */}
<section className="space-y-2">
  <h2 className="font-medium">Drawer</h2>

  <Drawer>
    <DrawerTrigger asChild>
      <button
        className="rounded-md border px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-zinc-800"
      >
        Open Drawer
      </button>
    </DrawerTrigger>

    <DrawerContent>
      <div className="p-6 space-y-4">
        <DrawerHeader>
          <DrawerTitle>Demo Drawer</DrawerTitle>
          <DrawerDescription>Tap Close to dismiss.</DrawerDescription>
        </DrawerHeader>

        <div className="flex items-center gap-2">
          <DrawerClose asChild>
            <button className="rounded-md border px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-zinc-800">
              Close
            </button>
          </DrawerClose>
        </div>
      </div>
    </DrawerContent>
  </Drawer>
</section>
{/* [LABEL: JSX INSERT — DRAWER END] */}

{/* [LABEL: JSX INSERT — TOAST START] */}
<section className="space-y-2">
  <h2 className="font-medium">Toast</h2>

  {/* self-contained state for this demo */}
  {(() => {
    const [open, setOpen] = React.useState(false)

    return (
      <ToastProvider>
        <div className="space-x-2">
          <button
            onClick={() => setOpen(true)}
            className="rounded-md border px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-zinc-800"
          >
            Show Toast
          </button>
        </div>

        <Toast open={open} onOpenChange={setOpen}>
          <div className="grid gap-1 p-3">
            <ToastTitle>Saved!</ToastTitle>
            <ToastDescription>Your settings were updated.</ToastDescription>
          </div>
          <div className="flex items-center gap-2 p-2">
            <ToastAction altText="Undo">Undo</ToastAction>
            <ToastClose className="rounded-md border px-2 py-1 text-xs">Close</ToastClose>
          </div>
        </Toast>

        <ToastViewport />
      </ToastProvider>
    )
  })()}
</section>
{/* [LABEL: JSX INSERT — TOAST END] */}


      <BriefTester />
      <SavedBriefs />
    </main>
  )
}
