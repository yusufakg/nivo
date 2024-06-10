import { positionFromAngle, radiansToDegrees, useMotionConfig } from '@nivo/core'
import { useSprings } from '@react-spring/web'
import { createElement } from 'react'
import { GridLabelComponent, RingIndex, SectorIndex } from './types'

const textAnchorFromAngle = (_angle: number) => {
    const angle = radiansToDegrees(_angle) + 90

    if (angle <= 10 || angle >= 350 || (angle >= 170 && angle <= 190)) return 'middle' as const
    if (angle > 180) return 'end' as const
    return 'start' as const
}

interface RadarGridLabelsProps {
    radii: number[]
    radius: number
    angles: number[]
    sectorIndices: SectorIndex[]
    ringIndices: RingIndex[]
    label: GridLabelComponent
    labelOffset: number
}

export const RadarGridLabels = ({
    radii,
    radius,
    angles,
    sectorIndices,
    ringIndices,
    label: labelComponent,
    labelOffset,
}: RadarGridLabelsProps) => {
    const { animate, config: springConfig } = useMotionConfig()

    const sectorLabels = sectorIndices.map((sector, i) => {
        const position = positionFromAngle(angles[i], radius + labelOffset)
        const textAnchor = textAnchorFromAngle(angles[i])

        return {
            id: sector.index,
            name: sector.data,
            angle: radiansToDegrees(angles[i]),
            anchor: textAnchor,
            ...position,
        }
    })

    const sectorSprings = useSprings(
        sectorLabels.length,
        sectorLabels.map(label => ({
            transform: `translate(${label.x}, ${label.y})`,
            config: springConfig,
            immediate: !animate,
        }))
    )

    const ringLabels = ringIndices.map((ring, i) => {
        const position = positionFromAngle(0, radii[i] - 6)

        return {
            id: ring.index,
            name: ring.data,
            angle: 0,
            anchor: 'end' as const,
            ...position,
        }
    })

    const ringSprings = useSprings(
        ringLabels.length,
        ringLabels.map(label => ({
            transform: `translate(${label.x}, ${label.y})`,
            config: springConfig,
            immediate: !animate,
        }))
    )

    return (
        <>
            {sectorSprings.map((animatedProps, index) => {
                const label = sectorLabels[index]

                return createElement(labelComponent, {
                    key: label.id,
                    id: label.id,
                    name: label.name,
                    anchor: label.anchor,
                    angle: label.angle,
                    x: label.x,
                    y: label.y,
                    animated: animatedProps,
                })
            })}
            {ringSprings.map((animatedProps, index) => {
                const label = ringLabels[index]

                return createElement(labelComponent, {
                    key: label.id,
                    id: label.id,
                    name: label.name,
                    anchor: label.anchor,
                    angle: label.angle,
                    x: label.x,
                    y: label.y,
                    animated: animatedProps,
                })
            })}
        </>
    )
}
