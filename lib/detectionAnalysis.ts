import type { Detection } from '@/hooks/useDetectionModel'

// Weapon-related class names from COCO-SSD
const WEAPON_CLASSES = ['person', 'knife', 'bottle', 'cup', 'backpack', 'handbag']

// Color map for bounding boxes
const COLOR_MAP: Record<string, string> = {
  knife: '#ff0000',
  person: '#00ff00',
  bottle: '#0000ff',
  cup: '#ffff00',
  backpack: '#ff00ff',
  handbag: '#00ffff',
}

export function filterWeaponDetections(detections: Detection[]): Detection[] {
  // Allow all classes from custom model with high confidence
  return detections.filter((detection) => detection.score > 0.6)
}

export function drawDetections(
  ctx: CanvasRenderingContext2D,
  detections: Detection[],
  videoWidth: number,
  videoHeight: number
): void {
  detections.forEach((detection) => {
    const [x, y, width, height] = detection.bbox
    const color = COLOR_MAP[detection.class.toLowerCase()] || '#00ff00'

    // Draw bounding box
    ctx.strokeStyle = color
    ctx.lineWidth = 3
    ctx.strokeRect(x, y, width, height)

    // Draw label background
    const label = `${detection.class} (${(detection.score * 100).toFixed(1)}%)`
    const textHeight = 20
    const textPadding = 5

    ctx.fillStyle = color
    ctx.fillRect(
      x,
      y - textHeight - textPadding * 2,
      ctx.measureText(label).width + textPadding * 2,
      textHeight + textPadding * 2
    )

    // Draw label text
    ctx.fillStyle = '#000000'
    ctx.font = 'bold 14px Arial'
    ctx.fillText(label, x + textPadding, y - textPadding)
  })
}

export function getHighestConfidenceDetection(
  detections: Detection[]
): Detection | null {
  if (detections.length === 0) return null
  return detections.reduce((prev, current) =>
    prev.score > current.score ? prev : current
  )
}
