"use client"

import * as React from "react"
import { toast } from "sonner"
import { DayPicker } from "react-day-picker"
import "react-day-picker/dist/style.css"

import { Drawer } from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import { Carousel, CarouselItem } from "@/components/ui/carousel"


export default function DevPage() {
  const [open, setOpen] = React.useState(false)
  const [otp, setOtp] = React.useState("")

  return (
    <main className="mx-auto max-w-3xl space-y-8 p-6">
      <h1 className="text-2xl font-semibold">UI Sanity — Dev</h1>

      {/* Toast */}
      <section className="space-y-2">
        <h2 className="font-medium">Toast</h2>
        <Button onClick={() => toast.success("Toasty!")}>Show Toast</Button>
      </section>

      {/* Drawer */}
      <section className="space-y-2">
        <h2 className="font-medium">Drawer</h2>
        <Button onClick={() => setOpen(true)}>Open Drawer</Button>
        <Drawer open={open} onOpenChange={setOpen}>
          <div className="p-6">
            <p className="mb-4">Hello from Drawer.</p>
            <Button onClick={() => setOpen(false)}>Close</Button>
          </div>
        </Drawer>
      </section>

      {/* OTP */}
      <section className="space-y-2">
        <h2 className="font-medium">OTP</h2>
        <InputOTP maxLength={6} value={otp} onChange={setOtp}>
          <InputOTPGroup>
            {[0,1,2,3,4,5].map((i) => <InputOTPSlot key={i} index={i} />)}
          </InputOTPGroup>
        </InputOTP>
      </section>

      {/* Resizable */}
      <section className="space-y-2">
        <h2 className="font-medium">Resizable</h2>
        <ResizablePanelGroup direction="horizontal" className="min-h-[120px] rounded-md border">
          <ResizablePanel defaultSize={50} className="p-3">Left</ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={50} className="p-3">Right</ResizablePanel>
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
  <Carousel className="w-full max-w-xl">
    {[1, 2, 3].map((n) => (
      <CarouselItem key={n} className="basis-3/4">
        <div className="rounded-lg border p-10 text-center">
          Slide {n}
        </div>
      </CarouselItem>
    ))}
  </Carousel>
</section>
    </main>
  )
}
