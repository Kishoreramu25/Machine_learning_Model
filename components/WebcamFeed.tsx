'use client'

import React, { useRef, useEffect, useState } from 'react'
import Webcam from 'react-webcam'
import { useDetectionModel, type Detection } from '@/hooks/useDetectionModel'
import { drawDetections, filterWeaponDetections } from '@/lib/detectionAnalysis'

interface WebcamFeedProps {
  onDetections?: (detections: Detection[]) => void
  enabled?: boolean
}

export function WebcamFeed({ onDetections, enabled = true }: WebcamFeedProps) {
  const webcamRef = useRef<Webcam>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number | null>(null)
  const { predict, loading, error } = useDetectionModel()
  const [detections, setDetections] = useState<Detection[]>([])
  const [fps, setFps] = useState(0)
  const frameCountRef = useRef(0)
  const lastTimeRef = useRef(Date.now())

  useEffect(() => {
    if (!enabled || loading || !predict) return

    const runDetection = async () => {
      if (!webcamRef.current?.video || !canvasRef.current) return

      const video = webcamRef.current.video
      const canvas = canvasRef.current

      // Set canvas size to match video
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
      }

      // Get canvas context and clear
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Run predictions
      const predictions = await predict(video)
      const weaponDetections = filterWeaponDetections(predictions)

      setDetections(weaponDetections)
      onDetections?.(weaponDetections)

      // Draw detections on canvas
      drawDetections(ctx, weaponDetections, canvas.width, canvas.height)

      // Calculate FPS
      frameCountRef.current++
      const now = Date.now()
      const elapsed = now - lastTimeRef.current
      if (elapsed >= 1000) {
        setFps(frameCountRef.current)
        frameCountRef.current = 0
        lastTimeRef.current = now
      }

      // Continue animation
      animationFrameRef.current = requestAnimationFrame(runDetection)
    }

    animationFrameRef.current = requestAnimationFrame(runDetection)

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [enabled, loading, predict, onDetections])

  if (error) {
    return (
      <div className="flex items-center justify-center w-full h-96 bg-red-50 border-2 border-red-200 rounded-lg">
        <div className="text-center">
          <p className="text-red-600 font-semibold mb-2">Model Loading Error</p>
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full bg-black rounded-lg overflow-hidden">
      <Webcam
        ref={webcamRef}
        className="w-full"
        screenshotFormat="image/jpeg"
        videoConstraints={{
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
        }}
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ display: enabled ? 'block' : 'none' }}
      />

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
            <p className="text-white font-semibold">Loading Detection Model...</p>
          </div>
        </div>
      )}

      {enabled && !loading && (
        <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-2 rounded text-sm font-mono z-50">
          <div>FPS: {fps}</div>
          <div className="mb-2 font-bold">Detections: {detections.length}</div>
          {detections.map((d, i) => (
            <div key={i} className="text-green-400 whitespace-nowrap">
              {d.class} ({(d.score * 100).toFixed(0)}%)
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
