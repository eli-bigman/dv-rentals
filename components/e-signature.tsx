"use client"

import type React from "react"

import { useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface ESignatureProps {
  onSign: (signatureData: string) => void
  onCancel: () => void
  isLoading?: boolean
}

export function ESignature({ onSign, onCancel, isLoading }: ESignatureProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasSignature, setHasSignature] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    canvas.width = 400
    canvas.height = 150

    // Set drawing styles
    ctx.strokeStyle = "#000000"
    ctx.lineWidth = 2
    ctx.lineCap = "round"
    ctx.lineJoin = "round"

    // Fill with white background
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }, [])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.beginPath()
    ctx.moveTo(x, y)
    setIsDrawing(true)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.lineTo(x, y)
    ctx.stroke()
    setHasSignature(true)
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    setHasSignature(false)
  }

  const handleSign = () => {
    const canvas = canvasRef.current
    if (!canvas || !hasSignature) return

    const signatureData = canvas.toDataURL("image/png")
    onSign(signatureData)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Please Sign Below</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <canvas
            ref={canvasRef}
            className="border border-input rounded-md cursor-crosshair mx-auto"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
          />
          <p className="text-xs text-muted-foreground mt-2">
            Draw your signature in the box above using your mouse or touch device
          </p>
        </div>

        <Separator />

        <div className="flex gap-2 justify-center">
          <Button variant="outline" onClick={clearSignature} disabled={!hasSignature || isLoading}>
            Clear
          </Button>
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSign} disabled={!hasSignature || isLoading}>
            {isLoading ? "Signing..." : "Sign Agreement"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
