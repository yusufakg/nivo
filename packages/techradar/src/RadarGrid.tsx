import { positionFromAngle, useTheme } from '@nivo/core'
import { SVGProps, useMemo } from 'react'
import { RadarGridLabels } from './RadarGridLabels'
import { RadarGridLevels } from './RadarGridLevels'
import { GridLabelComponent, RadarCommonProps, RingIndex, SectorIndex } from './types'

interface RadarGridProps {
    sectorIndices: SectorIndex[]
    ringIndices: RingIndex[]
    shape: RadarCommonProps['gridShape']
    radius: number
    rotation: number
    angleStep: number
    label: GridLabelComponent
    labelOffset: number
}

export const RadarGrid = ({
    sectorIndices,
    ringIndices,
    shape,
    radius,
    rotation,
    angleStep,
    label,
    labelOffset,
}: RadarGridProps) => {
    const theme = useTheme()
    const { radii, angles, labelAngles } = useMemo(() => {
        return {
            radii: Array.from({ length: ringIndices.length })
                .map((_, i) => (radius / ringIndices.length) * (i + 1))
                .reverse(),
            angles: Array.from({ length: sectorIndices.length }).map(
                (_, i) => rotation + i * angleStep - Math.PI / 2
            ),
            labelAngles: Array.from({ length: sectorIndices.length }).map(
                (_, i) => rotation + i * angleStep - Math.PI / 2 + angleStep / 2
            ),
        }
    }, [sectorIndices, ringIndices, radius, rotation, angleStep])

    return (
        <>
            {angles.map((angle, i) => {
                const position = positionFromAngle(angle, radius)
                return (
                    <line
                        key={`axis.${i}`}
                        x1={0}
                        y1={0}
                        x2={position.x}
                        y2={position.y}
                        {...(theme.grid.line as SVGProps<SVGLineElement>)}
                    />
                )
            })}
            {radii.map((radius, i) => (
                <RadarGridLevels
                    key={`level.${i}`}
                    shape={shape}
                    radius={radius}
                    rotation={rotation}
                    angleStep={angleStep}
                    dataLength={sectorIndices.length}
                />
            ))}
            <RadarGridLabels
                radii={radii}
                radius={radius}
                angles={labelAngles}
                sectorIndices={sectorIndices}
                ringIndices={ringIndices}
                labelOffset={labelOffset}
                label={label}
            />
        </>
    )
}
