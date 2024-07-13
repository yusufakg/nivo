import { positionFromAngle, useTheme } from '@nivo/core'
import { SVGProps } from 'react'
import { RadarGridLabels } from './RadarGridLabels'
import { RadarGridLevels } from './RadarGridLevels'
import { GridLabelComponent, RadarCommonProps, RingIndex, SectorIndex } from './types'

interface RadarGridProps<RawData> {
    sectorIndices: SectorIndex[]
    ringIndices: RingIndex[]
    shape: RadarCommonProps<RawData>['gridShape']
    radius: number
    rotation: number
    angleStep: number
    label: GridLabelComponent
    labelOffset: number
    radii: number[]
    angles: number[]
    labelAngles: number[]
}

export const RadarGrid = <RawData,>({
    sectorIndices,
    ringIndices,
    shape,
    radius,
    rotation,
    angleStep,
    label,
    labelOffset,
    radii,
    angles,
    labelAngles,
}: RadarGridProps<RawData>) => {
    const theme = useTheme()

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
            {radii.slice(1).map((radius, i) => (
                <RadarGridLevels
                    key={`level.${i + 1}`}
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
