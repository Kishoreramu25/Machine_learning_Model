'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import * as tmImage from '@teachablemachine/image'

export interface Detection {
  class: string
  score: number
  bbox: [number, number, number, number]
}

// Custom model URL from user
const MODEL_URL = 'https://teachablemachine.withgoogle.com/models/4DqFOIhth/'

export function useDetectionModel() {
  const modelRef = useRef<tmImage.CustomMobileNet | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load model on mount
  useEffect(() => {
    const loadModel = async () => {
      try {
        setLoading(true)
        const modelURL = MODEL_URL + 'model.json'
        const metadataURL = MODEL_URL + 'metadata.json'

        const model = await tmImage.load(modelURL, metadataURL)
        modelRef.current = model
        setLoading(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load model')
        setLoading(false)
      }
    }

    loadModel()

    return () => {
      // Cleanup if needed
    }
  }, [])

  // Predict function
  const predict = useCallback(
    async (imageData: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement): Promise<Detection[]> => {
      if (!modelRef.current) {
        return []
      }

      try {
        // TM predict returns probabilities for all classes
        const predictions = await modelRef.current.predict(imageData)

        // Log top prediction for debugging
        const topPrediction = predictions.reduce((prev, current) => (prev.probability > current.probability) ? prev : current)
        console.log('Top prediction:', topPrediction.className, topPrediction.probability)

        // Filter predictions with high probability (e.g., > 60%)
        // standard TM models don't return bbox, so we'll mock it or handle it differently in UI
        // For now, we return valid high-confidence predictions
        return predictions
          .filter((p) => p.probability > 0.6)
          .map((pred) => ({
            class: pred.className,
            score: pred.probability,
            bbox: [0, 0, 0, 0], // TM classification doesn't provide bbox
          }))
      } catch (err) {
        console.error('Detection error:', err)
        return []
      }
    },
    []
  )

  return {
    loading,
    error,
    predict,
    model: modelRef.current,
  }
}
